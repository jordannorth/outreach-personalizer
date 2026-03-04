export type CandidateStatus = 'new' | 'reviewing' | 'interviewing' | 'offer' | 'rejected';
export type FlowStatus = 'draft' | 'active' | 'paused' | 'closed';
export type MessageRole = 'user' | 'assistant';
export type ActivityType =
  | 'candidate_added'
  | 'flow_created'
  | 'outreach_sent'
  | 'match_found'
  | 'score_generated';

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  score: number;
  matchRate: number;
  status: CandidateStatus;
  skills: string[];
  location: string;
  appliedAt: Date;
}

export interface HiringFlow {
  id: string;
  title: string;
  role: string;
  department: string;
  status: FlowStatus;
  candidateCount: number;
  targetDate: Date;
  createdAt: Date;
  progress: number;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  meta?: Record<string, string>;
}

export interface OutreachMessage {
  id: string;
  candidateName: string;
  subject: string;
  preview: string;
  personalization: string;
  tone: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  resultType?: 'candidates' | 'flow' | 'outreach' | 'score' | 'metrics' | 'text';
  resultData?: unknown;
}

export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  email: string;
  role: string;
  initials: string;
  personality: {
    hobbies: string[];
    motivations: string[];
    teamPreference: string;
    workStyle: string;
  };
}
