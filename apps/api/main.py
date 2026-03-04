import asyncio
import io
import json
import os
import uuid

import anthropic
import pdfplumber
from apify_client import ApifyClient
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions: dict[str, dict] = {}

anthropic_client = anthropic.AsyncAnthropic()

TOOLS: list[anthropic.types.ToolParam] = [
    {
        "name": "search_google_maps",
        "description": (
            "Search Google Maps for businesses by keyword and location. "
            "Returns business name, address, rating, review count, website, phone, and Google Maps URL."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Business name or type to search for (e.g., 'Acme Corp', 'coffee shops')",
                },
                "location": {
                    "type": "string",
                    "description": "Location to search in (e.g., 'Austin, TX', 'London, UK')",
                },
            },
            "required": ["query", "location"],
        },
    }
]


def _parse_pdf(data: bytes) -> str:
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


def _run_apify_search(query: str, location: str) -> str:
    api_token = os.getenv("APIFY_API_TOKEN")
    if not api_token:
        return json.dumps({"error": "APIFY_API_TOKEN not configured"})

    client = ApifyClient(api_token)
    run = client.actor("compass/crawler-google-places").call(
        run_input={
            "searchStringsArray": [query],
            "locationQuery": location,
            "maxReviews": 5,
            "reviewsSort": "newest",
            "maxCrawledPlaces": 10,
            "language": "en",
        }
    )
    items = list(client.dataset(run["defaultDatasetId"]).iterate_items())

    if not items:
        return json.dumps({"result": "No businesses found for this search."})

    results = [
        {
            "name": item.get("title", "N/A"),
            "address": item.get("address", "N/A"),
            "rating": item.get("totalScore", "N/A"),
            "reviews": item.get("reviewsCount", 0),
            "website": item.get("website", "N/A"),
            "phone": item.get("phone", "N/A"),
            "url": item.get("url", "N/A"),
        }
        for item in items
    ]
    return json.dumps(results, indent=2)


async def _execute_tool(name: str, input: dict) -> str:
    if name == "search_google_maps":
        return await asyncio.get_event_loop().run_in_executor(
            None, _run_apify_search, input["query"], input["location"]
        )
    return json.dumps({"error": f"Unknown tool: {name}"})


def _build_system_prompt(session: dict) -> str:
    return f"""You are a lead research assistant for {session["name"]} at {session["company_name"]} ({session["company_email"]}).

Their background (from CV):
{session["cv_text"]}

Help them research potential leads and prospects using the search_google_maps tool. When asked about a company or person, search for their business details, location, review activity, website, and contact info.

Be concise and actionable. Tailor insights to {session["name"]}'s background so they can make a relevant, personalised approach."""


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/onboard")
async def onboard(
    name: str = Form(...),
    company_email: str = Form(...),
    company_name: str = Form(...),
    cv: UploadFile = File(...),
) -> dict[str, str]:
    cv_bytes = await cv.read()
    cv_text = await asyncio.get_event_loop().run_in_executor(None, _parse_pdf, cv_bytes)

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "name": name,
        "company_email": company_email,
        "company_name": company_name,
        "cv_text": cv_text,
    }
    return {"session_id": session_id}


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    session_id: str
    messages: list[ChatMessage]


@app.post("/chat")
async def chat(request: ChatRequest) -> StreamingResponse:
    session = sessions.get(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    system_prompt = _build_system_prompt(session)
    messages: list[anthropic.types.MessageParam] = [
        {"role": m.role, "content": m.content} for m in request.messages
    ]

    async def generate():
        current_messages = messages.copy()

        while True:
            stream = anthropic_client.messages.stream(
                model="claude-opus-4-6",
                max_tokens=4096,
                thinking={"type": "adaptive"},
                system=system_prompt,
                tools=TOOLS,
                messages=current_messages,
            )

            async with stream as s:
                async for event in s:
                    if (
                        event.type == "content_block_delta"
                        and event.delta.type == "text_delta"
                    ):
                        yield f"data: {json.dumps({'type': 'text', 'delta': event.delta.text})}\n\n"

                full_response = await s.get_final_message()

            if full_response.stop_reason == "end_turn":
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                break

            if full_response.stop_reason == "tool_use":
                current_messages.append(
                    {
                        "role": "assistant",
                        "content": [b.model_dump() for b in full_response.content],
                    }
                )

                tool_results: list[anthropic.types.ToolResultBlockParam] = []
                for block in full_response.content:
                    if block.type == "tool_use":
                        yield f"data: {json.dumps({'type': 'tool_call', 'tool': block.name, 'input': block.input})}\n\n"
                        result = await _execute_tool(block.name, block.input)
                        tool_results.append(
                            {
                                "type": "tool_result",
                                "tool_use_id": block.id,
                                "content": result,
                            }
                        )

                current_messages.append({"role": "user", "content": tool_results})
            else:
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                break

    return StreamingResponse(generate(), media_type="text/event-stream")
