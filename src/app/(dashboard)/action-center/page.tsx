import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, agents, actionLogs } from '@/lib/db/schema'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ActionLog } from '@/types'

function formatDate(date: Date | null): string {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const statusVariant: Record<
  ActionLog['status'],
  'default' | 'success' | 'warning' | 'destructive' | 'secondary'
> = {
  pending: 'warning',
  approved: 'success',
  denied: 'destructive',
  executed: 'success',
  failed: 'destructive',
}

const policyVariant: Record<
  ActionLog['policyDecision'],
  'default' | 'success' | 'warning' | 'destructive' | 'secondary'
> = {
  allow: 'success',
  deny: 'destructive',
  ask: 'warning',
}

export default async function ActionCenterPage() {
  let authUser: { userId: string; email: string; name: string | null }
  try { authUser = await getAuthUser() } catch { redirect('/sign-in') }

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser!.userId))
    .limit(1)

  if (userRows.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Your account is being set up…</p>
      </div>
    )
  }

  const dbUser = userRows[0]

  const userAgents = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, dbUser.id))

  let logs: ActionLog[] = []
  if (userAgents.length > 0) {
    // Fetch logs for the first agent (MVP: single-agent)
    logs = await db
      .select()
      .from(actionLogs)
      .where(eq(actionLogs.agentId, userAgents[0].id))
      .orderBy(actionLogs.createdAt)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Action Center</h1>
        <p className="text-muted-foreground mt-1">
          Every action your agent takes or proposes appears here.
        </p>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <p className="text-4xl mb-4">⚡</p>
            <h3 className="text-lg font-semibold mb-2">No actions yet</h3>
            <p className="text-muted-foreground text-sm">
              Your agent hasn't taken any actions yet. Connect an integration and install a skill to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-semibold">{log.toolName}</CardTitle>
                    <CardDescription className="mt-0.5">
                      {formatDate(log.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusVariant[log.status]}>{log.status}</Badge>
                    <Badge variant={policyVariant[log.policyDecision]}>
                      {log.policyDecision}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {log.toolArgs && (
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground list-none flex items-center gap-1">
                      <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                      Arguments
                    </summary>
                    <pre className="mt-2 text-xs bg-muted rounded-md p-3 overflow-auto max-h-40">
                      {JSON.stringify(log.toolArgs, null, 2)}
                    </pre>
                  </details>
                )}
                {log.result && (
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground list-none flex items-center gap-1">
                      <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                      Result
                    </summary>
                    <pre className="mt-2 text-xs bg-muted rounded-md p-3 overflow-auto max-h-40">
                      {JSON.stringify(log.result, null, 2)}
                    </pre>
                  </details>
                )}
                {log.executedAt && (
                  <p className="text-xs text-muted-foreground">
                    Executed: {formatDate(log.executedAt)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
