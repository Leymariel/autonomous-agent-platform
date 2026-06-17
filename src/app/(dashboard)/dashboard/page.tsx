import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, agents, actionLogs, oauthTokens } from '@/lib/db/schema'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  const { userId: clerkId } = auth()
  if (!clerkId) redirect('/sign-in')

  // Fetch user from DB
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1)

  if (userRows.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Welcome to AgentOS!</h2>
        <p className="text-muted-foreground mb-6">
          Your account is being set up. This usually takes a few seconds.
        </p>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>
    )
  }

  const dbUser = userRows[0]

  // Fetch agents for user
  const userAgents = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, dbUser.id))

  // Fetch recent action count
  let recentActionCount = 0
  if (userAgents.length > 0) {
    const agentIds = userAgents.map((a) => a.id)
    const allLogs = await db
      .select({ id: actionLogs.id })
      .from(actionLogs)
      .where(eq(actionLogs.agentId, agentIds[0]))
    recentActionCount = allLogs.length
  }

  // Check connected integrations
  const connectedIntegrations = await db
    .select({ provider: oauthTokens.provider })
    .from(oauthTokens)
    .where(eq(oauthTokens.userId, dbUser.id))

  const hasGmail = connectedIntegrations.some((i) => i.provider === 'gmail')
  const hasCalendar = connectedIntegrations.some((i) => i.provider === 'google_calendar')

  const activeAgent = userAgents.find((a) => a.status === 'active') ?? userAgents[0] ?? null

  const setupChecklist = [
    {
      id: 'gmail',
      label: 'Connect Gmail',
      done: hasGmail,
      href: '/api/integrations/google/connect?scope=gmail',
    },
    {
      id: 'calendar',
      label: 'Connect Google Calendar',
      done: hasCalendar,
      href: '/api/integrations/google/connect?scope=calendar',
    },
    {
      id: 'skills',
      label: 'Install your first skill',
      done: false,
      href: '/marketplace',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Agent status</CardDescription>
            <CardTitle className="text-2xl">
              {activeAgent ? (
                <Badge
                  variant={
                    activeAgent.status === 'active'
                      ? 'success'
                      : activeAgent.status === 'paused'
                      ? 'warning'
                      : 'secondary'
                  }
                >
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
          <CardDescription>
            Complete these steps to get your agent running.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {setupChecklist.map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      item.done
                        ? 'bg-green-100 text-green-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.done ? '✓' : '○'}
                  </span>
                  <span
                    className={`text-sm font-medium ${item.done ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {item.label}
                  </span>
                </div>
                {!item.done && (
                  <Link href={item.href}>
                    <Button variant="outline" size="sm">
                      Set up
                    </Button>
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
            <Link href="/agents">
              <Button>Create your agent</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
