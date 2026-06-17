import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, agents, agentSkills, oauthTokens, approvalPolicies } from '@/lib/db/schema'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AgentsPage() {
  const { userId: clerkId } = auth()
  if (!clerkId) redirect('/sign-in')

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1)

  if (userRows.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Setting up your account…</p>
      </div>
    )
  }

  const dbUser = userRows[0]

  const userAgents = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, dbUser.id))

  if (userAgents.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Agent</h1>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-5xl mb-4">🤖</p>
            <h3 className="text-lg font-semibold mb-2">No agent yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Your agent is your AI employee. Set it up once, and it works for you every day.
            </p>
            <form action="/api/agents" method="POST">
              <Button type="submit">Create my agent</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const agent = userAgents[0]

  const skills = await db
    .select()
    .from(agentSkills)
    .where(eq(agentSkills.agentId, agent.id))

  const integrations = await db
    .select({ provider: oauthTokens.provider })
    .from(oauthTokens)
    .where(eq(oauthTokens.userId, dbUser.id))

  const policies = await db
    .select()
    .from(approvalPolicies)
    .where(eq(approvalPolicies.agentId, agent.id))

  const statusVariant =
    agent.status === 'active' ? 'success' : agent.status === 'paused' ? 'warning' : 'secondary'

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Agent</h1>
        <div className="flex gap-3">
          <Link href="/settings">
            <Button variant="outline">Edit agent</Button>
          </Link>
          <form
            action={`/api/agents/${agent.id}`}
            method="POST"
          >
            <input type="hidden" name="_method" value="PATCH" />
            <input
              type="hidden"
              name="status"
              value={agent.status === 'active' ? 'paused' : 'active'}
            />
            <Button variant={agent.status === 'active' ? 'destructive' : 'default'}>
              {agent.status === 'active' ? 'Pause agent' : 'Activate agent'}
            </Button>
          </form>
        </div>
      </div>

      {/* Agent card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{agent.name}</CardTitle>
              {agent.description && (
                <CardDescription className="mt-1">{agent.description}</CardDescription>
              )}
            </div>
            <Badge variant={statusVariant}>{agent.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>Template: <span className="text-foreground font-medium">{agent.template}</span></p>
          {agent.instructions && (
            <p className="mt-2 text-foreground">{agent.instructions}</p>
          )}
        </CardContent>
      </Card>

      {/* Installed skills */}
      <Card>
        <CardHeader>
          <CardTitle>Installed skills</CardTitle>
          <CardDescription>
            {skills.length === 0
              ? 'No skills installed yet.'
              : `${skills.length} skill${skills.length > 1 ? 's' : ''} active`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-4">
                Install skills from the marketplace to give your agent abilities.
              </p>
              <Link href="/marketplace">
                <Button variant="outline" size="sm">Browse marketplace</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {skills.map((skill) => (
                <li key={skill.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{skill.skillId}</p>
                  </div>
                  <Badge variant={skill.enabled ? 'success' : 'secondary'}>
                    {skill.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Connected integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Connected integrations</CardTitle>
          <CardDescription>
            {integrations.length === 0 ? 'No integrations connected.' : `${integrations.length} connected`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {integrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-4">
                Connect Gmail or Google Calendar to let your agent take action.
              </p>
              <Link href="/marketplace">
                <Button variant="outline" size="sm">Connect integrations</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {integrations.map((integration) => (
                <li key={integration.provider} className="flex items-center gap-3 py-2">
                  <Badge variant="secondary">{integration.provider}</Badge>
                  <span className="text-sm text-green-600 font-medium">Connected</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Approval policies */}
      <Card>
        <CardHeader>
          <CardTitle>Approval policies</CardTitle>
          <CardDescription>
            Rules that determine when your agent needs your sign-off.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Default policy: always ask for approval. Configure in Settings.
            </p>
          ) : (
            <ul className="space-y-3">
              {policies.map((policy) => (
                <li key={policy.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium">{policy.actionType}</span>
                  <Badge variant="secondary">{policy.policyType}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
