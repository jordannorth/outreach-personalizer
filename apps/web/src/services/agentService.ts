import type { ChatMessage, Candidate, HiringFlow, OutreachMessage } from '../types';
import { candidates, hiringFlows } from '../data/mockData';

type AgentIntent =
  | 'create_flow'
  | 'analyze_cv'
  | 'find_matches'
  | 'generate_score'
  | 'send_outreach'
  | 'show_metrics'
  | 'help'
  | 'unknown';

function detectIntent(input: string): AgentIntent {
  const lower = input.toLowerCase();
  if (lower.includes('create') && (lower.includes('flow') || lower.includes('hiring'))) return 'create_flow';
  if (lower.includes('analyz') || lower.includes('cv') || lower.includes('resume')) return 'analyze_cv';
  if (lower.includes('match') || lower.includes('best') || lower.includes('top candidate')) return 'find_matches';
  if (lower.includes('score') || lower.includes('rate') || lower.includes('rank')) return 'generate_score';
  if (lower.includes('outreach') || lower.includes('message') || lower.includes('email') || lower.includes('draft')) return 'send_outreach';
  if (lower.includes('metric') || lower.includes('stat') || lower.includes('performance') || lower.includes('trend')) return 'show_metrics';
  if (lower.includes('help') || lower.includes('what can') || lower.includes('how')) return 'help';
  return 'unknown';
}

type AgentResponse = Omit<ChatMessage, 'id' | 'role' | 'timestamp'>;

function createFlowResponse(): AgentResponse {
  const newFlow: HiringFlow = {
    id: 'new-' + Date.now(),
    title: 'Full-Stack Engineer — Seed Round',
    role: 'Full-Stack Engineer',
    department: 'Engineering',
    status: 'draft',
    candidateCount: 0,
    targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    progress: 0,
  };
  return {
    content:
      "I've drafted a new hiring flow for you. Based on your preference for small, high-output teams, it's pre-configured for a focused search. Activate it when ready.",
    resultType: 'flow',
    resultData: newFlow,
  };
}

function analyzeCvResponse(): AgentResponse {
  const candidate = candidates[0];
  return {
    content: `Here's my analysis of **${candidate.name}'s** profile. Their background at ${candidate.company} aligns strongly with your open roles. Key strengths: deep TypeScript expertise, open-source contributions, and proven scaling experience.`,
    resultType: 'candidates',
    resultData: [candidate],
  };
}

function findMatchesResponse(): AgentResponse {
  const topMatches = [...candidates]
    .filter((c) => c.matchRate >= 85)
    .sort((a, b) => b.matchRate - a.matchRate)
    .slice(0, 3);
  return {
    content: `Found **${topMatches.length} high-quality matches** for your active flows. All have strong async-first backgrounds — aligned with your team preference.`,
    resultType: 'candidates',
    resultData: topMatches,
  };
}

function generateScoreResponse(): AgentResponse {
  const candidate = candidates[2];
  return {
    content: `Generated a comprehensive score for **${candidate.name}**. Strong design systems expertise and a track record at high-growth companies — excellent fit for your design-forward culture.`,
    resultType: 'score',
    resultData: {
      candidate,
      breakdown: {
        'Skills Match': 94,
        'Experience Level': 88,
        'Culture Fit': 91,
        'Growth Potential': 96,
      },
    },
  };
}

function sendOutreachResponse(): AgentResponse {
  const outreach: OutreachMessage = {
    id: 'msg-' + Date.now(),
    candidateName: 'Priya Patel',
    subject: "Loved your design system work — let's talk",
    preview:
      'Hi Priya, I came across your work on Figma\'s design systems and was genuinely impressed by the depth of your component architecture...',
    personalization: 'References Figma design systems work',
    tone: 'Warm, direct, no fluff',
  };
  return {
    content:
      "Crafted a personalized outreach for **Priya Patel**. I've referenced her Figma work and open-source contributions — matching your authentic, no-fluff communication style.",
    resultType: 'outreach',
    resultData: outreach,
  };
}

function helpResponse(): AgentResponse {
  return {
    content:
      'I can help you with your hiring workflow. Try:\n\n**Create a hiring flow** — Set up a new role\n**Analyze a CV** — Deep-dive a candidate profile\n**Find best matches** — Surface top candidates\n**Generate a score** — AI-powered evaluation\n**Draft outreach** — Personalized messaging',
    resultType: 'text',
    resultData: null,
  };
}

function unknownResponse(): AgentResponse {
  return {
    content:
      "I'm your outreach and hiring AI. I can create hiring flows, analyze candidates, find matches, generate scores, and craft personalized outreach. What would you like to do?",
    resultType: 'text',
    resultData: null,
  };
}

export async function processAgentMessage(input: string): Promise<AgentResponse> {
  await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 600));
  const intent = detectIntent(input);
  switch (intent) {
    case 'create_flow':    return createFlowResponse();
    case 'analyze_cv':    return analyzeCvResponse();
    case 'find_matches':  return findMatchesResponse();
    case 'generate_score': return generateScoreResponse();
    case 'send_outreach': return sendOutreachResponse();
    case 'show_metrics':
      return {
        content:
          'Your outreach response rate is up **18% this week** — the personalized templates are clearly landing well. Senior Frontend flow is performing **2.3× above benchmark** for initial response rates.',
        resultType: 'metrics',
        resultData: { responseRate: 34, responseRateChange: 18, outreachSent: 156, matches: 43 },
      };
    case 'help':    return helpResponse();
    default:        return unknownResponse();
  }
}

// Expose hiring functions for direct use
export function createHiringFlow(title?: string): HiringFlow {
  return {
    id: 'flow-' + Date.now(),
    title: title ?? 'New Hiring Flow',
    role: 'Engineer',
    department: 'Engineering',
    status: 'draft',
    candidateCount: 0,
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    progress: 0,
  };
}

export function analyzeCV(candidateId: string): Candidate | undefined {
  return candidates.find((c) => c.id === candidateId);
}

export function matchCandidates(minMatchRate = 80): Candidate[] {
  return [...candidates]
    .filter((c) => c.matchRate >= minMatchRate)
    .sort((a, b) => b.matchRate - a.matchRate);
}

export function generateScore(candidateId: string): number {
  const candidate = candidates.find((c) => c.id === candidateId);
  return candidate?.score ?? 0;
}

export { hiringFlows };
