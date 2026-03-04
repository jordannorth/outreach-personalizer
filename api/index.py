import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "api"))

from main import app  # noqa: F401  — Vercel picks up `app` as the ASGI handler
