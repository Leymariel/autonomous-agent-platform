import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type RiskLevel = 'safe' | 'medium' | 'dangerous'

interface SkillCard {
  id: string
  name: string
  description: string
  icon: string
  risk: RiskLevel
  category: 'skill'
}

interface IntegrationCard {
  id: string
  name: string
  description: string
  icon: string
  risk: RiskLevel
  category: 'integration'
  connectHref: string
}

const skills: SkillCard[] = [
  {
    id: 'inbox-manager',
    name: 'Inbox Manager',
    description: 'Reads and categorizes your emails, surfaces important messages, and drafts replies for your approval.',
    icon: '📬',
    risk: 'medium',
    category: 'skill',
  },
  {
    id: 'meeting-scheduler',
    name: 'Meeting Scheduler',
    description: 'Proposes meeting times, sends invites, and manages your calendar conflicts automatically.',
    icon: '📅',
    risk: 'medium',
    category: 'skill',
  },
  {
    id: 'github-developer',
    name: 'GitHub Developer',
    description: 'Opens issues, reviews PRs, and creates branches based on your instructions.',
    icon: '🐙',
    risk: 'dangerous',
    category: 'skill',
  },
]

const integrations: IntegrationCard[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail inbox so your agent can read and send emails on your behalf.',
    icon: '✉️',
    risk: 'medium',
    category: 'integration',
    connectHref: '/api/integrations/google/connect?scope=gmail',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Give your agent access to your calendar so it can schedule and manage events.',
    icon: '📆',
    risk: 'safe',
    category: 'integration',
    connectHref: '/api/integrations/google/connect?scope=calendar',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect GitHub to let your agent manage repositories, issues, and pull requests.',
    icon: '🐙',
    risk: 'dangerous',
    category: 'integration',
    connectHref: '#',
  },
]

const riskBadgeVariant: Record<RiskLevel, 'success' | 'warning' | 'destructive'> = {
  safe: 'success',
  medium: 'warning',
  dangerous: 'destructive',
}

const riskLabel: Record<RiskLevel, string> = {
  safe: '🟢 Safe',
  medium: '🟡 Medium',
  dangerous: '🔴 High risk',
}

export default async function MarketplacePage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Add skills and connect services to make your agent more capable.
        </p>
      </div>

      {/* Skills section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <Card key={skill.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{skill.icon}</span>
                    <CardTitle className="text-base">{skill.name}</CardTitle>
                  </div>
                  <Badge variant={riskBadgeVariant[skill.risk]} className="text-xs">
                    {riskLabel[skill.risk]}
                  </Badge>
                </div>
                <CardDescription className="mt-2">{skill.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <form action="/api/agents" method="POST">
                  <input type="hidden" name="action" value="install_skill" />
                  <input type="hidden" name="skillId" value={skill.id} />
                  <Button className="w-full" variant="outline">
                    Install skill
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Integrations section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{integration.icon}</span>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                  </div>
                  <Badge variant={riskBadgeVariant[integration.risk]} className="text-xs">
                    {riskLabel[integration.risk]}
                  </Badge>
                </div>
                <CardDescription className="mt-2">{integration.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link href={integration.connectHref}>
                  <Button className="w-full" variant="outline">
                    Connect
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
