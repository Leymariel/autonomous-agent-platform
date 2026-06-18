/**
 * Action Center — AgentOS
 * ReactBits: NoiseCard feed, BadgeGlow status, SpotlightCard empty state.
 */

import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { agents, actionLogs } from '@/lib/db/schema'
import { Zap } from 'lucide-react'
import { NoiseCard }     from '@/components/reactbits/noise-card'
import { SpotlightCard } from '@/components/reactbits/spotlight'
import { BadgeGlow }     from '@/components/reactbits/badge-glow'
import { GradientText }  from '@/components/reactbits/gradient-text'

const TOOL_LABELS: Record<string, string> = {
  listEmails:        'Read emails',
  getEmail:          'Read email',
  getThread:         'Read thread',
  searchEmails:      'Search emails',
  draftReply:        'Draft reply',
  sendEmail:         'Send email',
  archiveEmail:      'Archive email',
  labelEmail:        'Label email',
  listEvents:        'Read calendar',
  getEvent:          'Read event',
  findAvailability:  'Check availability',
  createEvent:       'Create event',
  updateEvent:       'Update event',
  deleteEvent:       'Delete event',
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

function toolEmoji(name: string): string {
  if (name.toLowerCase().includes('mail') || name.toLowerCase().includes('email')) return '✉️'
  if (name.toLowerCase().includes('event') || name.toLowerCase().includes('calendar') || name.toLowerCase().includes('availability')) return '📅'
  return '⚡'
}

function statusBadge(status: string, policyDecision: string): { color: 'green' | 'amber' | 'red' | 'blue' | 'violet'; label: string } {
  if (policyDecision === 'ask') return { color: 'amber', label: 'Awaiting approval' }
  if (status === 'executed' || status === 'approved') return { color: 'green', label: 'Done' }
  if (status === 'pending') return { color: 'amber', label: 'Pending' }
  if (status === 'denied' || status === 'failed') return { color: 'red', label: status.charAt(0).toUpperCase() + status.slice(1) }
  return { color: 'blue', label: status }
}

export default async function ActionCenterPage() {
  let authUser: { userId: string; email: string; name: string | null }
  try { authUser = await getAuthUser() } catch { redirect('/sign-in') }

  const userId = authUser!.userId

  let userAgents: { id: string }[] = []
  let logs: { id: string; toolName: string; status: string; policyDecision: string; createdAt: Date; executedAt: Date | null }[] = []

  try {
    userAgents = await db.select({ id: agents.id }).from(agents).where(eq(agents.userId, userId))
  } catch { /* no agents */ }

  if (userAgents.length > 0) {
    try {
      logs = await db
        .select({ id: actionLogs.id, toolName: actionLogs.toolName, status: actionLogs.status, policyDecision: actionLogs.policyDecision, createdAt: actionLogs.createdAt, executedAt: actionLogs.executedAt })
        .from(actionLogs)
        .where(eq(actionLogs.agentId, userAgents[0].id))
        .orderBy(desc(actionLogs.createdAt))
        .limit(50)
    } catch { /* no logs */ }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Action Center</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Every action your <GradientText>agent</GradientText> takes — logged and replayable.
        </p>
      </div>

      <NoiseCard>
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm text-white">Activity feed</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{logs.length} actions recorded</p>
          </div>
          {logs.length > 0 && (
            <BadgeGlow color="violet">{logs.length} actions</BadgeGlow>
          )}
        </div>

        {logs.length === 0 ? (
          <SpotlightCard className="m-6 flex flex-col items-center text-center py-12 border-0 bg-transparent">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Zap className="h-7 w-7 text-violet-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">No actions yet</h3>
            <p className="text-sm text-zinc-500 max-w-xs">
              Your agent hasn&apos;t taken any actions yet — connect Gmail to get started.
            </p>
          </SpotlightCard>
        ) : (
          <ul className="divide-y divide-white/5">
            {logs.map(log => {
              const badge = statusBadge(log.status, log.policyDecision)
              return (
                <li key={log.id} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-white/3 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-base shrink-0">{toolEmoji(log.toolName)}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {TOOL_LABELS[log.toolName] ?? log.toolName}
                      </p>
                      <p className="text-xs text-zinc-600">{formatDate(log.createdAt)}</p>
                    </div>
                  </div>
                  <BadgeGlow color={badge.color} className="shrink-0">
                    {badge.label}
                  </BadgeGlow>
                </li>
              )
            })}
          </ul>
        )}
      </NoiseCard>
    </div>
  )
}
