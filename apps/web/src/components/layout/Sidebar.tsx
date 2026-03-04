import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Mail,
  BarChart2,
  Sparkles,
  Settings,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  id: string;
  badge?: number;
}

const mainNav: NavItem[] = [
  { icon: <LayoutDashboard size={15} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Users size={15} />, label: 'Candidates', id: 'candidates', badge: 5 },
  { icon: <GitBranch size={15} />, label: 'Hiring Flows', id: 'flows', badge: 3 },
  { icon: <Mail size={15} />, label: 'Outreach', id: 'outreach' },
  { icon: <BarChart2 size={15} />, label: 'Analytics', id: 'analytics' },
];

const toolsNav: NavItem[] = [
  { icon: <FileText size={15} />, label: 'Templates', id: 'templates' },
  { icon: <Settings size={15} />, label: 'Settings', id: 'settings' },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenAgent: () => void;
  isAgentOpen: boolean;
  userName: string;
  userRole: string;
  userInitials: string;
}

export function Sidebar({
  currentPage,
  onNavigate,
  onOpenAgent,
  isAgentOpen,
  userName,
  userRole,
  userInitials,
}: SidebarProps) {
  return (
    <aside className="w-[220px] shrink-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Sparkles size={13} className="text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">Outreach AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {/* Workspace */}
        <div>
          <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Workspace
          </p>
          <ul className="space-y-0.5">
            {mainNav.map((item) => {
              const active = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40',
                    )}
                  >
                    <span className={cn('shrink-0', active ? 'text-sidebar-accent-foreground' : 'text-muted-foreground')}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                          active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* AI Agent CTA */}
        <button
          onClick={onOpenAgent}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm transition-all border',
            isAgentOpen
              ? 'bg-primary/15 border-primary/40 text-primary'
              : 'bg-secondary/40 border-border text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-secondary/70',
          )}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors',
              isAgentOpen ? 'bg-primary' : 'bg-muted',
            )}
          >
            <Sparkles size={12} className={isAgentOpen ? 'text-primary-foreground' : 'text-muted-foreground'} />
          </div>
          <span className="flex-1 text-left font-medium text-sm">AI Assistant</span>
          <ChevronRight size={12} className="text-muted-foreground" />
        </button>

        {/* Tools */}
        <div>
          <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Tools
          </p>
          <ul className="space-y-0.5">
            {toolsNav.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-colors"
                >
                  <span className="shrink-0 text-muted-foreground">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-sidebar-accent/40 transition-colors group">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary">{userInitials}</span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{userName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{userRole}</p>
          </div>
          <Settings
            size={12}
            className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          />
        </button>
      </div>
    </aside>
  );
}
