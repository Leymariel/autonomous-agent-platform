/**
 * Dashboard page — AgentOS
 * Stat cards with gradient borders, stepped setup checklist, prominent empty-state CTA.
 */

import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { agents, actionLogs, oauthTokens } from '@/lib/db/schema'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Bot, Zap, Link2, CheckCircle2, Circle, ArrowRight, Activity } from 'lucide-react'

export default async function DashboardPage() {
  let authUser: { userId: string; email: string; name: string | null }
  try {
    authUser = await getAuthUser()
  } catch {
    redirect('/sign-in')
  }

  const userId = authUser!.userId

  let userAgents: { id: string; name: string; status: string }[] = []
  try {
    userAgents = await db
      .select({ id: agents.id, name: agents.name, status: agents.status })
      .from(agents)
      .where(eq(agents.userId, userId))
  } catch { /* table may be empty */ }

  let recentActionCount = 0
  try {
    if (userAgents.length > 0) {
      const logs = await db
        .select({ id: actionLogs.id })
        .from(actionLogs)
        .where(eq(actionLogs.agentId, userAgents[0].id))
      recentActionCount = logs.length
    }
  } catch { /* no logs yet */ }

  let connectedIntegrations: { provider: string }[] = []
  try {
    connectedIntegrations = await db
      .select({ provider: oauthTokens.provider })
      .from(oauthTokens)
      .where(eq(oauthTokens.userId, userId))
  } catch { /* no tokens yet */ }

  const hasGmail = connectedIntegrations.some(i => i.provider === 'gmail')
  const hasCalendar = connectedIntegrations.some(i => i.provider === 'google_calendar')
  const activeAgent = userAgents.find(a => a.status === 'active') ?? userAgents[0] ?? null

  const setupChecklist = [
    {
      id: 'gmail',
      label: 'Connect Gmail',
      description: 'Let your agent read and draft emails',
      done: hasGmail,
      href: '/api/integrations/google/connect?scope=gmail',
    },
    {
      id: 'calendar',
      label: 'Connect Google Calendar',
      description: 'Schedule meetings automatically',
      done: hasCalendar,
      href: '/api/integrations/google/connect?scope=calendar',
    },
    {
      id: 'skills',
      label: 'Install your first skill',
      description: 'Activate a capability for your agent',
      done: userAgents.some(a => a.status === 'active'),
      href: '/marketplace',
    },
  ]

  const completedSteps = setupChecklist.filter(s => s.done).length
  const progressPct = Math.round((completedSteps / setupChecklist.length) * 100)

  const stats = [
    {
      label: 'Agent status',
      value: activeAgent
        ? activeAgent.status.charAt(0).toUpperCase() + activeAgent.status.slice(1)
        : 'No agent',
      sub: activeAgent ? activeAgent.name : 'Create your first agent',
      icon: Bot,
      accent: 'text-blue-500',
      bg: 'bg-blue-500/10',
      badge: activeAgent
        ? (activeAgent.status === 'active' ? 'success' : 'secondary')
        : null,
    },
    {
      label: 'Actions taken',
      value: String(recentActionCount),
      sub: 'Total logged actions',
      icon: Activity,
      accent: 'text-violet-500',
      bg: 'bg-violet-500/10',
      badge: null,
    },
    {
      label: 'Integrations',
      value: String(connectedIntegrations.length),
      sub: 'Connected services',
      icon: Link2,
      accent: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      badge: null,
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome back{authUser!.name ? `, ${authUser!.name}` : ''}. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border/60 bg-card p-5 hover:border-border transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4.5 w-4.5 ${stat.accent}`} size={18} />
                </div>
                {stat.badge && (
                  <Badge variant={stat.badge as 'success' | 'secondary'} className="text-xs">
                    {stat.badge === 'success' ? 'Active' : 'Inactive'}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Setup checklist */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border/60">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-sm">Quick setup</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete these steps to get your agent running.
              </p>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {completedSteps}/{setupChecklist.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <ul className="divide-y divide-border/40">
          {setupChecklist.map((item, idx) => (
            <li key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
              <div className="shrink-0">
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-border text-xs font-medium text-muted-foreground">
                    {idx + 1}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.done ? 'line-through text-muted-foreground' : ''}`}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
              {!item.done && (
                <Link
                  href={item.href}
                  className="shrink-0 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Set up <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* No agent CTA */}
      {!activeAgent && (
        <div className="rounded-xl border border-dashed border-border/60 bg-card p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Bot className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">No agent yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first AI agent and start delegating tasks in minutes.
          </p>
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Create your agent
          </Link>
        </div>
      )}
    </div>
  )
}
