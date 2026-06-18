import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { agents, actionLogs } from '@/lib/db/schema'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const TOOL_LABELS: Record<string, string> = {
  listEmails: 'Read emails',
  getEmail: 'Read email',
  getThread: 'Read thread',
  searchEmails: 'Search emails',
  draftReply: 'Draft reply',
  sendEmail: 'Send email',
  archiveEmail: 'Archive email',
  labelEmail: 'Label email',
  listEvents: 'Read calendar',
  getEvent: 'Read event',
  findAvailability: 'Check availability',
  createEvent: 'Create event',
  updateEvent: 'Update event',
  deleteEvent: 'Delete event',
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

const statusColors: Record<string, string> = {
  executed: 'bg-green-100 text-green-700',
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  denied: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
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
        <h1 className="text-3xl font-bold tracking-tight">Action Center</h1>
        <p className="text-muted-foreground mt-1">Every action your agent takes, logged and replayable.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity feed</CardTitle>
          <CardDescription>{logs.length} actions recorded</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">⚡</p>
              <h3 className="font-semibold mb-1">No actions yet</h3>
              <p className="text-sm text-muted-foreground">
                Your agent hasn&apos;t taken any actions yet — connect Gmail to get started.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {logs.map(log => (
                <li key={log.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">
                      {log.toolName.includes('mail') || log.toolName.includes('Email') ? '✉️' :
                       log.toolName.includes('vent') || log.toolName.includes('calendar') ? '📅' : '⚡'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {TOOL_LABELS[log.toolName] ?? log.toolName}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[log.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {log.status}
                    </span>
                    {log.policyDecision === 'ask' && (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-700 px-2 py-0.5 text-xs font-medium">
                        awaiting approval
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
