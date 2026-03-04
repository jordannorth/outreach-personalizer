import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { HiringFlowCard } from '@/components/dashboard/HiringFlowCard';
import { CandidatesTable } from '@/components/dashboard/CandidatesTable';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { AgentPanel } from '@/components/chat/AgentPanel';
import { useDashboard } from '@/hooks/useDashboard';
import { useAgent } from '@/hooks/useAgent';
import { currentUser } from '@/data/mockData';
import { Users, GitBranch, Mail, TrendingUp, Plus, Inbox, Workflow } from 'lucide-react';

export default function App() {
  const { candidates, hiringFlows, activityItems, metrics, isLoading } = useDashboard();
  const agent = useAgent();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const metricCards = [
    { label: 'Total Candidates', value: metrics.totalCandidates, change: metrics.candidatesChange, icon: <Users size={14} /> },
    { label: 'Active Flows',     value: metrics.activeFlows,     change: metrics.flowsChange,      icon: <GitBranch size={14} /> },
    { label: 'Outreach Sent',    value: metrics.outreachSent,    change: metrics.outreachChange,   icon: <Mail size={14} /> },
    { label: 'Response Rate',    value: metrics.responseRate,    change: metrics.rateChange,       icon: <TrendingUp size={14} />, suffix: '%' },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onOpenAgent={agent.toggleAgent}
        isAgentOpen={agent.isOpen}
        userName={currentUser.name}
        userRole={currentUser.role}
        userInitials={currentUser.initials}
      />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header user={currentUser} onOpenAgent={agent.toggleAgent} isAgentOpen={agent.isOpen} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-5 max-w-[1200px] mx-auto space-y-5">

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {metricCards.map((card) => (
                <MetricCard key={card.label} {...card} isLoading={isLoading} />
              ))}
            </div>

            {/* Hiring Flows + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Hiring Flows</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isLoading ? '—' : `${hiringFlows.filter((f) => f.status === 'active').length} active`}
                    </p>
                  </div>
                  <button
                    onClick={agent.openAgent}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-lg transition-colors"
                  >
                    <Plus size={12} />
                    New flow
                  </button>
                </div>

                {!isLoading && hiringFlows.length === 0 ? (
                  <EmptyState
                    icon={<Workflow size={20} />}
                    title="No hiring flows yet"
                    description="Create your first hiring flow to start sourcing and evaluating candidates."
                    action={{ label: 'Create hiring flow', onClick: agent.openAgent }}
                  />
                ) : (
                  <div className="space-y-3">
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />
                        ))
                      : hiringFlows.map((flow) => <HiringFlowCard key={flow.id} flow={flow} />)}
                  </div>
                )}
              </div>

              <div className="bg-card rounded-xl border border-border p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-foreground">Activity</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Recent updates</p>
                </div>
                <ActivityFeed items={activityItems} isLoading={isLoading} />
              </div>
            </div>

            {/* Candidates */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Top Candidates</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Sorted by AI match score</p>
                </div>
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  View all
                </button>
              </div>

              {!isLoading && candidates.length === 0 ? (
                <EmptyState
                  icon={<Inbox size={20} />}
                  title="No candidates yet"
                  description="Candidates appear here once your hiring flows are active and sourcing begins."
                />
              ) : (
                <CandidatesTable candidates={candidates} isLoading={isLoading} />
              )}
            </div>

            {/* Personalization card */}
            <div className="bg-accent/20 rounded-xl border border-accent/40 p-5">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{currentUser.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground mb-1">Your hiring style, reflected</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Based on your interest in{' '}
                    <span className="text-accent-foreground font-medium">
                      {currentUser.personality.hobbies.slice(0, 2).join(' and ')}
                    </span>{' '}
                    and your focus on{' '}
                    <span className="text-accent-foreground font-medium">
                      {currentUser.personality.motivations[0].toLowerCase()}
                    </span>
                    , we're surfacing candidates who thrive in{' '}
                    {currentUser.personality.teamPreference.toLowerCase()} environments.
                  </p>
                  <div className="flex gap-1.5 mt-2.5 flex-wrap">
                    {currentUser.personality.hobbies.map((h) => (
                      <span key={h} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                        {h}
                      </span>
                    ))}
                    <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full text-primary font-medium">
                      {currentUser.personality.workStyle}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      <AgentPanel
        isOpen={agent.isOpen}
        onClose={agent.closeAgent}
        messages={agent.messages}
        isProcessing={agent.isProcessing}
        onSendMessage={agent.sendMessage}
        onClearMessages={agent.clearMessages}
      />
    </div>
  )
}
