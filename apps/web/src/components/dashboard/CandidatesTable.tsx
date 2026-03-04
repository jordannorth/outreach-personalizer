import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import type { Candidate, CandidateStatus } from '@/types';

const statusConfig: Record<CandidateStatus, { label: string; className: string }> = {
  new:          { label: 'New',        className: 'bg-chart-4/15 text-chart-4' },
  reviewing:    { label: 'Reviewing',  className: 'bg-primary/15 text-primary' },
  interviewing: { label: 'Interview',  className: 'bg-chart-1/15 text-chart-1' },
  offer:        { label: 'Offer',      className: 'bg-chart-1/25 text-chart-1' },
  rejected:     { label: 'Rejected',   className: 'bg-destructive/10 text-destructive' },
};

function scoreColor(score: number) {
  if (score >= 90) return 'text-chart-1';
  if (score >= 75) return 'text-chart-4';
  if (score >= 60) return 'text-chart-3';
  return 'text-muted-foreground';
}

function timeAgo(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

interface CandidatesTableProps {
  candidates: Candidate[];
  isLoading?: boolean;
}

export function CandidatesTable({ candidates, isLoading }: CandidatesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-secondary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[520px]">
        <thead>
          <tr className="border-b border-border">
            {['Candidate', 'Role', 'Score', 'Status', 'Applied', ''].map((h) => (
              <th
                key={h}
                className={cn(
                  'text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground pb-2.5 pr-4',
                  h === 'Role' && 'hidden sm:table-cell',
                  h === 'Status' && 'hidden md:table-cell',
                  h === 'Applied' && 'hidden lg:table-cell',
                  h === '' && 'w-8 pr-0',
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {candidates.map((c) => {
            const st = statusConfig[c.status];
            return (
              <tr key={c.id} className="group hover:bg-secondary/20 transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-primary">{c.initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.company}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 hidden sm:table-cell">
                  <p className="text-xs text-muted-foreground truncate max-w-[160px]">{c.role}</p>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-baseline gap-0.5">
                    <span className={cn('text-sm font-bold', scoreColor(c.score))}>{c.score}</span>
                    <span className="text-[10px] text-muted-foreground">/100</span>
                  </div>
                </td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', st.className)}>
                    {st.label}
                  </span>
                </td>
                <td className="py-3 hidden lg:table-cell">
                  <span className="text-xs text-muted-foreground">{timeAgo(c.appliedAt)}</span>
                </td>
                <td className="py-3">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-secondary text-muted-foreground">
                    <ExternalLink size={12} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
