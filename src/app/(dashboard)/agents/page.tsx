import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { agents, agentSkills, oauthTokens, approvalPolicies } from '@/lib/db/schema'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function AgentsPage() {
  let authUser: { userId: string; email: string; name: string | null }
  try { authUser = await getAuthUser() } catch { redirect('/sign-in') }

  const userId = authUser!.userId

  let userAgents: { id: string; name: string; status: string; description: string | null; instructions: string | null; template: string }[] = []
  try {
    userAgents = await db
      .select({ id: agents.id, name: agents.name, status: agents.status, description: agents.description, instructions: agents.instructions, template: agents.template })
      .from(agents)
      .where(eq(agents.userId, userId))
  } catch { /* no agents yet */ }

  let skills: { agentId: string; skillId: string; enabled: boolean }[] = []
  let tokens: { provider: string }[] = []
  let policies: { agentId: string; actionType: string; policyType: string }[] = []

  if (userAgents.length > 0) {
    try {
      skills = await db.select({ agentId: agentSkills.agentId, skillId: agentSkills.skillId, enabled: agentSkills.enabled })
        .from(agentSkills).where(eq(agentSkills.agentId, userAgents[0].id))
    } catch { /* no skills */ }
    try {
      tokens = await db.select({ provider: oauthTokens.provider })
        .from(oauthTokens).where(eq(oauthTokens.userId, userId))
    } catch { /* no tokens */ }
    try {
      policies = await db.select({ agentId: approvalPolicies.agentId, actionType: approvalPolicies.actionType, policyType: approvalPolicies.policyType })
        .from(approvalPolicies).where(eq(approvalPolicies.agentId, userAgents[0].id))
    } catch { /* no policies */ }
  }

  if (userAgents.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Agent</h1>
          <p className="text-muted-foreground mt-1">Set up your AI agent to start delegating tasks.</p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-5xl mb-4">🤖</p>
            <h3 className="text-xl font-semibold mb-2">No agent yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Your agent will read email, manage your calendar, and take action on your behalf.
            </p>
            <Link href="/marketplace"
              className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
              Get started →
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const agent = userAgents[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
          <p className="text-muted-foreground mt-1">{agent.description ?? 'Your AI executive assistant'}</p>
        </div>
        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className="text-sm">
          {agent.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Connected integrations</CardTitle></CardHeader>
          <CardContent>
            {tokens.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">No integrations connected yet.</p>
                <Link href="/marketplace" className="text-sm text-blue-600 hover:underline">Browse marketplace →</Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {tokens.map(t => (
                  <li key={t.provider} className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span className="capitalize">{t.provider.replace('_', ' ')}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Installed skills</CardTitle></CardHeader>
          <CardContent>
            {skills.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">No skills installed yet.</p>
                <Link href="/marketplace" className="text-sm text-blue-600 hover:underline">Browse skills →</Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {skills.map(s => (
                  <li key={s.skillId} className="flex items-center gap-2 text-sm">
                    <span>{s.enabled ? '✓' : '○'}</span>
                    <span>{s.skillId}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Approval settings</CardTitle>
            <CardDescription>Control what your agent can do automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            {policies.length === 0 ? (
              <p className="text-sm text-muted-foreground">Default: agent will ask before any action. Go to <Link href="/settings" className="text-blue-600 hover:underline">Settings</Link> to configure.</p>
            ) : (
              <ul className="space-y-2">
                {policies.map((p, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.actionType}</span>
                    <Badge variant="secondary">{p.policyType.replace('_', ' ')}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
