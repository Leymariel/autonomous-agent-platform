/**
 * Marketplace page — AgentOS
 * ReactBits: SpotlightCard integrations, GlowCard skills, BadgeGlow risk levels.
 */

import Link from 'next/link'
import { CheckCircle2, Mail, CalendarDays, Github, Inbox, Clock, Code2 } from 'lucide-react'
import { SpotlightCard } from '@/components/reactbits/spotlight'
import { GlowCard }      from '@/components/reactbits/glow-card'
import { BadgeGlow }     from '@/components/reactbits/badge-glow'
import { GradientText }  from '@/components/reactbits/gradient-text'

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
  { id: 'inbox-manager',      name: 'Inbox Manager',      description: 'Reads and categorizes your emails, surfaces important messages, and drafts replies for your approval.', Icon: Inbox,  risk: 'medium',    category: 'skill' },
  { id: 'meeting-scheduler',  name: 'Meeting Scheduler',  description: 'Proposes meeting times, sends invites, and manages your calendar conflicts automatically.',             Icon: Clock,  risk: 'medium',    category: 'skill' },
  { id: 'github-developer',   name: 'GitHub Developer',   description: 'Opens issues, reviews PRs, and creates branches based on your instructions.',                          Icon: Code2,  risk: 'dangerous', category: 'skill' },
]

const integrations: IntegrationCard[] = [
  { id: 'gmail',            name: 'Gmail',            description: 'Connect your Gmail inbox so your agent can read and send emails on your behalf.',                          Icon: Mail,        risk: 'medium',    category: 'integration', connectHref: '/api/integrations/google/connect?scope=gmail' },
  { id: 'google-calendar',  name: 'Google Calendar',  description: 'Give your agent access to your calendar so it can schedule and manage events.',                           Icon: CalendarDays, risk: 'safe',     category: 'integration', connectHref: '/api/integrations/google/connect?scope=calendar' },
  { id: 'github',           name: 'GitHub',           description: 'Connect GitHub to let your agent manage repositories, issues, and pull requests.',                       Icon: Github,      risk: 'dangerous', category: 'integration', connectHref: '#' },
]

const riskBadge: Record<RiskLevel, { color: 'green' | 'amber' | 'red'; label: string }> = {
  safe:      { color: 'green', label: 'Safe' },
  medium:    { color: 'amber', label: 'Medium risk' },
  dangerous: { color: 'red',   label: 'High risk' },
}

const iconColors: Record<string, string> = {
  gmail:                'text-red-400   bg-red-500/10',
  'google-calendar':    'text-blue-400  bg-blue-500/10',
  github:               'text-zinc-300  bg-zinc-700/50',
  'inbox-manager':      'text-violet-400 bg-violet-500/10',
  'meeting-scheduler':  'text-emerald-400 bg-emerald-500/10',
  'github-developer':   'text-orange-400  bg-orange-500/10',
}

export default async function MarketplacePage() {
  return (
    <div className="space-y-12">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Marketplace</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Add skills and connect services to make your <GradientText>agent</GradientText> more capable.
        </p>
      </div>

      {/* Integrations */}
      <section>
        <div className="mb-6">
          <h2 className="text-base font-semibold text-white">Integrations</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Connect external services so your agent can take action on your behalf.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => {
            const Icon = integration.Icon
            const colorClass = iconColors[integration.id] ?? 'text-zinc-400 bg-zinc-800'
            const risk = riskBadge[integration.risk]
            return (
              <SpotlightCard key={integration.id} className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <BadgeGlow color={risk.color}>{risk.label}</BadgeGlow>
                </div>
                <h3 className="font-semibold text-sm text-white mb-1.5">{integration.name}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed flex-1 mb-4">
                  {integration.description}
                </p>
                {integration.connected ? (
                  <div className="flex items-center gap-2">
                    <BadgeGlow color="green">
                      <CheckCircle2 className="h-3 w-3" /> Connected
                    </BadgeGlow>
                  </div>
                ) : (
                  <Link
                    href={integration.connectHref}
                    className="w-full text-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-all"
                  >
                    Connect
                  </Link>
                )}
              </SpotlightCard>
            )
          })}
        </div>
      </section>

      {/* Skills */}
      <section>
        <div className="mb-6">
          <h2 className="text-base font-semibold text-white">Skills</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Install capabilities that teach your agent how to handle specific tasks.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => {
            const Icon = skill.Icon
            const colorClass = iconColors[skill.id] ?? 'text-zinc-400 bg-zinc-800'
            const risk = riskBadge[skill.risk]
            return (
              <GlowCard key={skill.id} className="flex flex-col h-full p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <BadgeGlow color={risk.color}>{risk.label}</BadgeGlow>
                </div>
                <h3 className="font-semibold text-sm text-white mb-1.5">{skill.name}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed flex-1 mb-4">
                  {skill.description}
                </p>
                <form action="/api/agents" method="POST">
                  <input type="hidden" name="action" value="install_skill" />
                  <input type="hidden" name="skillId" value={skill.id} />
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-all"
                  >
                    Install skill
                  </button>
                </form>
              </GlowCard>
            )
          })}
        </div>
      </section>
    </div>
  )
}
