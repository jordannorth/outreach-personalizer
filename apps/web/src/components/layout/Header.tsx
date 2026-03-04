import { Bell, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types';

interface HeaderProps {
  user: UserProfile;
  onOpenAgent: () => void;
  isAgentOpen: boolean;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Header({ user, onOpenAgent, isAgentOpen }: HeaderProps) {
  const greeting = getGreeting();

  return (
    <header className="h-[56px] shrink-0 border-b border-border bg-background px-5 flex items-center justify-between gap-4">
      <div className="min-w-0 flex items-baseline gap-2">
        <h1 className="text-sm font-semibold text-foreground whitespace-nowrap">
          {greeting}, {user.firstName}.
        </h1>
        <p className="text-xs text-muted-foreground hidden md:block truncate">
          Based on your focus on {user.personality.teamPreference.toLowerCase()} environments, 5 candidates match your open roles.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground text-xs hover:text-foreground transition-colors">
          <Search size={12} />
          <span>Search...</span>
          <kbd className="text-[9px] bg-muted px-1 py-0.5 rounded font-mono">⌘K</kbd>
        </button>

        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>

        <button
          onClick={onOpenAgent}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            isAgentOpen
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/30',
          )}
        >
          <Sparkles size={12} />
          <span>Ask AI</span>
        </button>
      </div>
    </header>
  );
}
