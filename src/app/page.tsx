/**
 * Landing page — AgentOS
 * Full ReactBits-style: particles, aurora, spotlight cards, animated border, typing text,
 * gradient text, blur-in, noise cards, badge glow. Dark-first, GPU-friendly animations.
 */
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Calendar, Shield, Zap, ArrowRight } from 'lucide-react'
import { AuroraBackground } from '@/components/reactbits/aurora-background'
import { Particles }        from '@/components/reactbits/particles'
import { GradientText }     from '@/components/reactbits/gradient-text'
import { BlurIn }           from '@/components/reactbits/blur-in'
import { SpotlightCard }    from '@/components/reactbits/spotlight'
import { BadgeGlow }        from '@/components/reactbits/badge-glow'
import { AnimatedBorder }   from '@/components/reactbits/animated-border'
import { TypingText }       from '@/components/reactbits/typing-text'
import { NoiseCard }        from '@/components/reactbits/noise-card'
import { CountingNumber }   from '@/components/reactbits/counting-number'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">

      {/* ── Fixed Nav ─────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <span className="text-violet-400">⚡</span>
          <GradientText>AgentOS</GradientText>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-white text-black hover:bg-zinc-100 rounded-full px-5 py-2 font-semibold transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-24">
        <AuroraBackground className="absolute inset-0 pointer-events-none" />
        <Particles className="absolute inset-0 pointer-events-none" quantity={80} />

        <div className="relative z-10 flex flex-col items-center text-center px-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <BadgeGlow color="violet">✦ Now in early access</BadgeGlow>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-center leading-[0.95]"
          >
            <span className="block text-white">Your AI</span>
            <span className="block">
              <GradientText>employee</GradientText>
            </span>
            <span className="block text-zinc-400 mt-2 text-4xl md:text-5xl lg:text-6xl font-semibold">
              <TypingText texts={['that reads email', 'that books meetings', 'that never sleeps']} />
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-zinc-500 max-w-xl text-center mt-6"
          >
            Set up your autonomous AI agent in under 10 minutes — no code, no jargon, no surprises.
            It acts; you approve.
          </motion.p>

          {/* Buttons */}
          <BlurIn delay={0.35} className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/sign-up"
              className="bg-white text-black hover:bg-zinc-100 rounded-full px-8 py-3 font-semibold text-sm transition-colors inline-flex items-center gap-2"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="border border-white/20 text-zinc-300 hover:text-white hover:border-white/40 rounded-full px-8 py-3 text-sm transition-colors">
              Watch demo
            </button>
          </BlurIn>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-5 text-zinc-600 text-sm"
          >
            No credit card required · Free forever plan
          </motion.p>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────── */}
      <section className="border-y border-white/5 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-white/5">
          {[
            { value: 10, suffix: ' min', label: 'Setup time' },
            { display: 'Zero', label: 'Lines of code' },
            { value: 100, suffix: '%', label: 'Transparent' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-1 px-8">
              <span className="text-3xl md:text-4xl font-bold text-white">
                {'value' in stat ? (
                  <CountingNumber to={stat.value} suffix={stat.suffix} />
                ) : (
                  stat.display
                )}
              </span>
              <span className="text-sm text-zinc-600">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="mt-32 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-16">
          <BadgeGlow color="blue" className="mb-4">Features</BadgeGlow>
          <h2 className="text-4xl md:text-5xl font-bold text-center">
            Everything your <GradientText>agent needs</GradientText>
          </h2>
          <p className="mt-4 text-zinc-500 text-center max-w-md">
            From inbox to calendar to guardrails — every tool your AI employee needs, built in from day one.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Mail,
              iconColor: 'text-violet-400',
              iconBg: 'bg-violet-500/10',
              title: 'Inbox mastery',
              desc: 'Reads, categorizes, and drafts replies. You approve before anything sends.',
              delay: 0,
            },
            {
              icon: Calendar,
              iconColor: 'text-blue-400',
              iconBg: 'bg-blue-500/10',
              title: 'Calendar intelligence',
              desc: 'Finds gaps, suggests times, books meetings. Always checks with you first.',
              delay: 0.1,
            },
            {
              icon: Shield,
              iconColor: 'text-green-400',
              iconBg: 'bg-green-500/10',
              title: 'Built-in guardrails',
              desc: 'Every action is logged. Dangerous actions always require your approval.',
              delay: 0.2,
            },
          ].map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: feature.delay, ease: [0.16, 1, 0.3, 1] }}
              >
                <SpotlightCard className="h-full">
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.iconBg}`}>
                    <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
                </SpotlightCard>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="mt-32 px-6 max-w-5xl mx-auto">
        <div className="flex flex-col items-center mb-16">
          <BadgeGlow color="violet" className="mb-4">How it works</BadgeGlow>
          <h2 className="text-4xl md:text-5xl font-bold text-center">
            Up and running in <GradientText>3 steps</GradientText>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Dashed connector line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 border-t-2 border-dashed border-white/10 z-0" />

          {[
            { num: '01', title: 'Connect your tools', desc: 'Link Gmail, Google Calendar, or other tools in one click. No API keys, no setup docs.' },
            { num: '02', title: 'Set permissions', desc: 'Choose exactly what your agent can do. "Draft only" or "send with approval" — you control it.' },
            { num: '03', title: 'Let it run', desc: 'Your agent works in the background. Every action is logged, reviewable, and fully reversible.' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              <NoiseCard className="p-6">
                <div className="mb-4 text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  {step.num}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
              </NoiseCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="mt-32 mb-24 px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatedBorder>
            <div className="p-12 flex flex-col items-center text-center">
              <Zap className="h-10 w-10 text-violet-400 mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Ready to hire your AI employee?
              </h2>
              <p className="text-zinc-500 mb-8 max-w-sm">
                Set up in under 10 minutes. No code required.
              </p>
              <Link
                href="/sign-up"
                className="bg-white text-black hover:bg-zinc-100 rounded-full px-10 py-3.5 font-semibold text-sm transition-colors inline-flex items-center gap-2"
              >
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </AnimatedBorder>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-violet-400">⚡</span>
          <GradientText>AgentOS</GradientText>
        </div>
        <p className="text-xs text-zinc-700">
          © {new Date().getFullYear()} AgentOS. Built for humans, run by AI.
        </p>
        <div className="flex items-center gap-5 text-xs text-zinc-700">
          <Link href="#" className="hover:text-zinc-400 transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-zinc-400 transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  )
}
