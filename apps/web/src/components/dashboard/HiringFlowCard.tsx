import { cn } from '@/lib/utils';
import { Users, Calendar, MoreHorizontal } from 'lucide-react';
import type { HiringFlow } from '@/types';

const statusConfig = {
  active:  { label: 'Active',  className: 'bg-chart-1/15 text-chart-1' },
  draft:   { label: 'Draft',   className: 'bg-secondary text-muted-foreground' },
  paused:  { label: 'Paused',  className: 'bg-chart-3/15 text-chart-3' },
  closed:  { label: 'Closed',  className: 'bg-chart-5/15 text-chart-5' },
};

function shortDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface HiringFlowCardProps {
  flow: HiringFlow;
  compact?: boolean;
}

export function HiringFlowCard({ flow, compact }: HiringFlowCardProps) {
  const status = statusConfig[flow.status];

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:border-border/60 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', status.className)}>
              {status.label}
            </span>
            <span className="text-[10px] text-muted-foreground">{flow.department}</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground truncate">{flow.title}</h3>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-secondary text-muted-foreground shrink-0">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {!compact && (
        <>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground">Pipeline progress</span>
              <span className="text-[10px] font-semibold text-foreground">{flow.progress}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', flow.status === 'active' ? 'bg-primary' : 'bg-muted-foreground/40')}
                style={{ width: `${flow.progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users size={11} />
              <span>{flow.candidateCount} candidates</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={11} />
              <span>Target {shortDate(flow.targetDate)}</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
