/**
 * Marketplace page — AgentOS
 * Integration cards with hover lift, risk badges, skills grid.
 */

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, Mail, CalendarDays, Github, Inbox, Clock, Code2 } from 'lucide-react'

type RiskLevel = 'safe' | 'medium' | 'dangerous'

interface SkillCard {
  id: string
  name: string
  description: string
  Icon: React.ElementType
  risk: RiskLevel
  category: 'skill'
}

interface IntegrationCard {
  id: string
  name: string
  description: string
  Icon: React.ElementType
  risk: RiskLevel
  category: 'integration'
  connectHref: string
  connected?: boolean
}

const skills: SkillCard[] = [
  {
    id: 'inbox-manager',
    name: 'Inbox Manager',
    description: 'Reads and categorizes your emails, surfaces important messages, and drafts replies for your approval.',
    Icon: Inbox,
    risk: 'medium',
    category: 'skill',
  },
  {
    id: 'meeting-scheduler',
    name: 'Meeting Scheduler',
    description: 'Proposes meeting times, sends invites, and manages your calendar conflicts automatically.',
    Icon: Clock,
    risk: 'medium',
    category: 'skill',
  },
  {
    id: 'github-developer',
    name: 'GitHub Developer',
    description: 'Opens issues, reviews PRs, and creates branches based on your instructions.',
    Icon: Code2,
    risk: 'dangerous',
    category: 'skill',
  },
]

const integrations: IntegrationCard[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail inbox so your agent can read and send emails on your behalf.',
    Icon: Mail,
    risk: 'medium',
    category: 'integration',
    connectHref: '/api/integrations/google/connect?scope=gmail',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Give your agent access to your calendar so it can schedule and manage events.',
    Icon: CalendarDays,
    risk: 'safe',
    category: 'integration',
    connectHref: '/api/integrations/google/connect?scope=calendar',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect GitHub to let your agent manage repositories, issues, and pull requests.',
    Icon: Github,
    risk: 'dangerous',
    category: 'integration',
    connectHref: '#',
  },
]

const riskConfig: Record<RiskLevel, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  safe:      { variant: 'success', label: 'Safe' },
  medium:    { variant: 'warning', label: 'Medium risk' },
  dangerous: { variant: 'danger',  label: 'High risk' },
}

const iconColors: Record<string, string> = {
  gmail:           'text-red-500   bg-red-500/10',
  'google-calendar': 'text-blue-500  bg-blue-500/10',
  github:          'text-white     bg-gray-700/50',
  'inbox-manager': 'text-violet-500 bg-violet-500/10',
  'meeting-scheduler': 'text-emerald-500 bg-emerald-500/10',
  'github-developer':  'text-orange-500  bg-orange-500/10',
}

export default async function MarketplacePage() {
  return (
    <div className="space-y-12 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Add skills and connect services to make your agent more capable.
        </p>
      </div>

      {/* Integrations */}
      <section>
        <div className="mb-6">
          <h2 className="text-base font-semibold">Integrations</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Connect external services so your agent can take action on your behalf.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => {
            const Icon = integration.Icon
            const colorClass = iconColors[integration.id] ?? 'text-muted-foreground bg-muted'
            const risk = riskConfig[integration.risk]
            return (
              <div
                key={integration.id}
                className={`group flex flex-col rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  integration.connected
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-border/60 bg-card hover:border-border hover:shadow-primary/5'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant={risk.variant}>{risk.label}</Badge>
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{integration.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">
                  {integration.description}
                </p>
                {integration.connected ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected
                  </div>
                ) : (
                  <Link href={integration.connectHref}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Connect
                    </Button>
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Skills */}
      <section>
        <div className="mb-6">
          <h2 className="text-base font-semibold">Skills</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Install capabilities that teach your agent how to handle specific tasks.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => {
            const Icon = skill.Icon
            const colorClass = iconColors[skill.id] ?? 'text-muted-foreground bg-muted'
            const risk = riskConfig[skill.risk]
            return (
              <div
                key={skill.id}
                className="group flex flex-col rounded-xl border border-border/60 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant={risk.variant}>{risk.label}</Badge>
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{skill.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">
                  {skill.description}
                </p>
                <form action="/api/agents" method="POST">
                  <input type="hidden" name="action" value="install_skill" />
                  <input type="hidden" name="skillId" value={skill.id} />
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Install skill
                  </Button>
                </form>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
