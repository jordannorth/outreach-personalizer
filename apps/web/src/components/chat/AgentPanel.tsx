import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, Send, Sparkles, RotateCcw, Bot } from 'lucide-react';
import type { ChatMessage, Candidate, HiringFlow, OutreachMessage } from '@/types';
import { HiringFlowCard } from '@/components/dashboard/HiringFlowCard';

const SUGGESTIONS = [
  { label: 'Create a hiring flow',   icon: '🔄', prompt: 'Create a new hiring flow for a Full-Stack Engineer' },
  { label: 'Analyze top CV',         icon: '📋', prompt: 'Analyze the top candidate CV' },
  { label: 'Find best matches',      icon: '⚡', prompt: 'Find best matches for the Senior Frontend role' },
  { label: 'Generate a score',       icon: '⭐', prompt: 'Generate a score for Priya Patel' },
  { label: 'Draft outreach',         icon: '✉️', prompt: 'Write a personalized outreach message for Priya Patel' },
  { label: 'Show metrics',           icon: '📊', prompt: 'Show my outreach performance metrics' },
];

function scoreColor(score: number) {
  if (score >= 90) return 'text-chart-1';
  if (score >= 75) return 'text-chart-4';
  return 'text-chart-3';
}

function CandidateChip({ c }: { c: Candidate }) {
  return (
    <div className="bg-background rounded-lg p-2.5 flex items-center gap-2.5 border border-border">
      <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <span className="text-[9px] font-bold text-primary">{c.initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">{c.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{c.role} · {c.company}</p>
      </div>
      <span className={cn('text-sm font-bold shrink-0', scoreColor(c.score))}>{c.score}</span>
    </div>
  );
}

function ScoreCard({ data }: { data: { candidate: Candidate; breakdown: Record<string, number> } }) {
  return (
    <div className="bg-background rounded-lg p-3 space-y-2.5 border border-border">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <span className="text-[9px] font-bold text-primary">{data.candidate.initials}</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">{data.candidate.name}</p>
          <p className="text-[10px] text-muted-foreground">
            Overall: <span className="text-chart-1 font-bold">{data.candidate.score}/100</span>
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        {Object.entries(data.breakdown).map(([key, val]) => (
          <div key={key}>
            <div className="flex justify-between mb-0.5">
              <span className="text-[10px] text-muted-foreground">{key}</span>
              <span className="text-[10px] font-semibold text-foreground">{val}</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${val}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OutreachCard({ data }: { data: OutreachMessage }) {
  return (
    <div className="bg-background rounded-lg p-3 space-y-2 border border-border">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-muted-foreground">To:</span>
        <span className="text-[10px] font-semibold text-foreground">{data.candidateName}</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-foreground mb-1">{data.subject}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{data.preview}</p>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">{data.tone}</span>
        <span className="text-[9px] bg-chart-1/10 text-chart-1 px-1.5 py-0.5 rounded-full">{data.personalization}</span>
      </div>
    </div>
  );
}

function ResultBlock({ message }: { message: ChatMessage }) {
  if (!message.resultType || !message.resultData) return null;

  if (message.resultType === 'candidates') {
    const list = message.resultData as Candidate[];
    return (
      <div className="mt-2 space-y-1.5">
        {list.map((c) => <CandidateChip key={c.id} c={c} />)}
      </div>
    );
  }
  if (message.resultType === 'flow') {
    return <div className="mt-2"><HiringFlowCard flow={message.resultData as HiringFlow} compact /></div>;
  }
  if (message.resultType === 'score') {
    return <div className="mt-2"><ScoreCard data={message.resultData as { candidate: Candidate; breakdown: Record<string, number> }} /></div>;
  }
  if (message.resultType === 'outreach') {
    return <div className="mt-2"><OutreachCard data={message.resultData as OutreachMessage} /></div>;
  }
  return null;
}

function MessageContent({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part.split('\n').map((line, j, arr) => (
          <span key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ));
      })}
    </>
  );
}

interface AgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isProcessing: boolean;
  onSendMessage: (content: string) => void;
  onClearMessages: () => void;
}

export function AgentPanel({ isOpen, onClose, messages, isProcessing, onSendMessage, onClearMessages }: AgentPanelProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 320);
  }, [isOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed right-0 top-0 h-full w-[380px] bg-card border-l border-border flex flex-col z-50',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ boxShadow: '-8px 0 32px rgba(0,0,0,0.3)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles size={13} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
              <p className="text-[10px] text-muted-foreground">Outreach & hiring intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={onClearMessages}
                title="Clear conversation"
                className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw size={13} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center text-center pt-6 pb-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <Bot size={22} className="text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">What would you like to do?</h3>
                <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                  I can create hiring flows, analyze CVs, find matches, generate scores, and craft outreach.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => onSendMessage(s.prompt)}
                    className="flex flex-col items-start gap-1.5 p-3 bg-secondary hover:bg-secondary/70 border border-border hover:border-primary/30 rounded-xl text-left transition-all group"
                  >
                    <span className="text-base leading-none">{s.icon}</span>
                    <span className="text-[11px] font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={11} className="text-primary-foreground" />
                    </div>
                  )}
                  <div className={cn('max-w-[85%] flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}>
                    <div
                      className={cn(
                        'px-3 py-2.5 rounded-xl text-xs leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-secondary text-foreground rounded-tl-sm',
                      )}
                    >
                      <MessageContent text={msg.content} />
                    </div>
                    {msg.role === 'assistant' && <ResultBlock message={msg} />}
                    <span className="text-[9px] text-muted-foreground mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={11} className="text-primary-foreground" />
                  </div>
                  <div className="bg-secondary rounded-xl rounded-tl-sm px-3.5 py-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3.5 border-t border-border shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your hiring..."
              disabled={isProcessing}
              className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
            >
              <Send size={13} />
            </button>
          </form>
          <p className="text-[9px] text-muted-foreground text-center mt-2">
            AI may make errors — verify important decisions.
          </p>
        </div>
      </aside>
    </>
  );
}
