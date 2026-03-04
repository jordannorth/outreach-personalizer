import { cn } from '@/lib/utils';
import { UserPlus, GitBranch, Mail, Zap, Star } from 'lucide-react';
import type { ActivityItem, ActivityType } from '@/types';

const config: Record<ActivityType, { icon: React.ReactNode; cls: string }> = {
  candidate_added: { icon: <UserPlus size={11} />,  cls: 'text-chart-4 bg-chart-4/15' },
  flow_created:    { icon: <GitBranch size={11} />, cls: 'text-primary bg-primary/15' },
  outreach_sent:   { icon: <Mail size={11} />,      cls: 'text-chart-3 bg-chart-3/15' },
  match_found:     { icon: <Zap size={11} />,       cls: 'text-chart-1 bg-chart-1/15' },
  score_generated: { icon: <Star size={11} />,      cls: 'text-accent-foreground bg-accent' },
};

function timeAgo(date: Date) {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  isLoading?: boolean;
}

export function ActivityFeed({ items, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-secondary animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5 pt-0.5">
              <div className="h-3 bg-secondary rounded animate-pulse w-3/4" />
              <div className="h-2.5 bg-secondary rounded animate-pulse w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const c = config[item.type];
        return (
          <div key={item.id} className="flex items-start gap-3">
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5', c.cls)}>
              {c.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground leading-relaxed">{item.description}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(item.timestamp)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
