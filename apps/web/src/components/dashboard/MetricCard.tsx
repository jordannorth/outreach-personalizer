import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change: number;
  icon: ReactNode;
  isLoading?: boolean;
  suffix?: string;
}

export function MetricCard({ label, value, change, icon, isLoading, suffix }: MetricCardProps) {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3 hover:border-border/60 transition-colors group">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
      </div>

      {isLoading ? (
        <div className="h-8 w-20 bg-secondary rounded-md animate-pulse" />
      ) : (
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground tracking-tight">{value}</span>
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
          <div
            className={cn(
              'flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md shrink-0',
              isPositive && 'text-chart-1 bg-chart-1/10',
              !isPositive && !isNeutral && 'text-destructive bg-destructive/10',
              isNeutral && 'text-muted-foreground bg-secondary',
            )}
          >
            {isNeutral ? (
              <Minus size={10} />
            ) : isPositive ? (
              <TrendingUp size={10} />
            ) : (
              <TrendingDown size={10} />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
