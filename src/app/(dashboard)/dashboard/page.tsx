import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { agents, actionLogs, oauthTokens } from '@/lib/db/schema'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function DashboardPage() {
  let authUser: { userId: string; email: string; name: string | null }
  try {
    authUser = await getAuthUser()
  } catch {
    redirect('/sign-in')
  }

  const userId = authUser!.userId

  // Fetch agents for this user
  let userAgents: { id: string; name: string; status: string }[] = []
  try {
    userAgents = await db
      .select({ id: agents.id, name: agents.name, status: agents.status })
      .from(agents)
      .where(eq(agents.userId, userId))
  } catch { /* table may be empty */ }

  // Fetch recent action count
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

  // Check connected integrations
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
    { id: 'gmail', label: 'Connect Gmail', done: hasGmail, href: '/api/integrations/google/connect?scope=gmail' },
    { id: 'calendar', label: 'Connect Google Calendar', done: hasCalendar, href: '/api/integrations/google/connect?scope=calendar' },
    { id: 'skills', label: 'Install your first skill', done: userAgents.some(a => a.status === 'active'), href: '/marketplace' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{authUser!.name ? `, ${authUser!.name}` : ''}. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Agent status</CardDescription>
            <CardTitle className="text-2xl">
              {activeAgent ? (
                <Badge variant={activeAgent.status === 'active' ? 'default' : 'secondary'}>
                  {activeAgent.status}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-base font-normal">No agent yet</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {activeAgent ? activeAgent.name : 'Create your first agent to get started.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Actions taken</CardDescription>
            <CardTitle className="text-2xl">{recentActionCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total logged actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Integrations</CardDescription>
            <CardTitle className="text-2xl">{connectedIntegrations.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Connected services</p>
          </CardContent>
        </Card>
      </div>

      {/* Setup checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Quick setup</CardTitle>
          <CardDescription>Complete these steps to get your agent running.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {setupChecklist.map(item => (
              <li key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${item.done ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {item.done ? '✓' : '○'}
                  </span>
                  <span className={`text-sm font-medium ${item.done ? 'line-through text-muted-foreground' : ''}`}>
                    {item.label}
                  </span>
                </div>
                {!item.done && (
                  <Link href={item.href} className="text-sm text-blue-600 hover:underline font-medium">
                    Set up →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* No agent CTA */}
      {!activeAgent && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-4xl mb-4">🤖</p>
            <h3 className="text-lg font-semibold mb-2">No agent yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Create your first AI agent and start delegating tasks in minutes.
            </p>
            <Link href="/agents"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Create your agent
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
