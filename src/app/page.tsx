/**
 * Landing page — AgentOS
 * ElevenLabs-inspired: near-black base, aurora + particles canvas, blur-in hero,
 * GlowCards feature grid, gradient CTAs. Dark-only, GPU-friendly animations.
 */
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Calendar, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import { AuroraBackground } from '@/components/reactbits/aurora-background'
import { Particles }        from '@/components/reactbits/particles'
import { GlowCard }         from '@/components/reactbits/glow-card'
import { GradientText }     from '@/components/reactbits/gradient-text'
import { BlurIn }           from '@/components/reactbits/blur-in'

/* ── Animation helpers ─────────────────────────────────── */
const fadeSlide = {
  hidden:  { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
  }),
}

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const cardVariant = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

/* ── Data ───────────────────────────────────────────────── */
const features = [
  {
    icon: Mail,
    iconColor: 'text-violet-400',
    iconBg:    'bg-violet-500/10 border-violet-500/20',
    title:     'Reads & triages your inbox',
    description:
      'Your agent reads every email, categorises by priority, drafts replies, and surfaces only what needs your eyes. Zero inbox anxiety.',
  },
  {
    icon: Calendar,
    iconColor: 'text-blue-400',
    iconBg:    'bg-blue-500/10 border-blue-500/20',
    title:     'Schedules meetings automatically',
    description:
      'Proposes times based on your calendar preferences, books the slot, sends invites — all without a single back-and-forth email.',
  },
  {
    icon: ShieldCheck,
    iconColor: 'text-cyan-400',
    iconBg:    'bg-cyan-500/10 border-cyan-500/20',
    title:     'Takes action, asks permission',
    description:
      'Every action is logged, every risky move needs your approval. You set the rules. The agent respects them. Always.',
  },
]

const socialProof = ['Acme Corp', 'Vercel-style', 'Y-Combinator', 'Stripe-adjacent']

/* ── Component ──────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] text-white overflow-x-hidden">

      {/* ── Fixed Nav ─────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-lg font-bold tracking-tight">
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">⚡</span>
              {' '}AgentOS
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <button className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5">
                Sign in
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="px-5 py-2 text-sm font-semibold text-black bg-white rounded-full hover:bg-zinc-100 transition-colors duration-200 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                Get started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <AuroraBackground className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6">
        {/* Particles layer */}
        <Particles count={55} className="opacity-60" />

        {/* Radial glow behind hero text */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">

          {/* Pill badge */}
          <BlurIn delay={0} className="inline-block mb-8">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400 animate-glow-dot" />
              </span>
              AI-powered · No code required
            </div>
          </BlurIn>

          {/* H1 */}
          <BlurIn delay={0.1}>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none">
              <span className="block text-white mb-2">The AI employee</span>
              <span className="block">
                <GradientText className="text-6xl md:text-7xl lg:text-8xl font-bold">
                  that never sleeps.
                </GradientText>
              </span>
            </h1>
          </BlurIn>

          {/* Subheadline */}
          <BlurIn delay={0.2}>
            <p className="mt-7 text-lg md:text-xl text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Set up your autonomous AI agent in minutes. It handles email, meetings,
              and tasks — and asks before doing anything that matters.
            </p>
          </BlurIn>

          {/* CTAs */}
          <BlurIn delay={0.35}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <button className="group relative px-8 py-3.5 text-base font-semibold text-black bg-white rounded-full hover:bg-zinc-100 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                  Get started free
                  <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link href="#features">
                <button className="px-8 py-3.5 text-base font-medium text-zinc-300 border border-white/20 rounded-full hover:bg-white/5 hover:border-white/30 transition-all duration-200">
                  See how it works
                </button>
              </Link>
            </div>
          </BlurIn>

          {/* Social proof strip */}
          <BlurIn delay={0.5}>
            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium">
                Trusted by founders at
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {socialProof.map((name) => (
                  <span
                    key={name}
                    className="px-3 py-1 rounded-full border border-white/8 bg-white/4 text-xs text-zinc-500 font-medium"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </BlurIn>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-xs text-zinc-500 tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-zinc-500 to-transparent" />
        </div>
      </AuroraBackground>

      {/* ── Feature Cards ─────────────────────────────────── */}
      <section id="features" className="py-32 px-6">
        <div className="mx-auto max-w-5xl">

          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-500 font-medium uppercase tracking-widest mb-6">
              <Sparkles className="h-3 w-3 text-violet-400" />
              What your agent does
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Everything handled.{' '}
              <GradientText>Nothing missed.</GradientText>
            </h2>
            <p className="mt-4 text-zinc-500 text-lg max-w-xl mx-auto">
              Plug your accounts in once. Your agent gets to work immediately.
            </p>
          </motion.div>

          {/* Cards grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {features.map((feat) => (
              <motion.div key={feat.title} variants={cardVariant}>
                <GlowCard className="h-full flex flex-col gap-5">
                  {/* Icon */}
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border ${feat.iconBg}`}>
                    <feat.icon className={`h-5 w-5 ${feat.iconColor}`} />
                  </div>
                  {/* Text */}
                  <div>
                    <h3 className="font-semibold text-white text-base mb-2">{feat.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{feat.description}</p>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Divider line ───────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 w-full">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="relative mx-auto max-w-3xl text-center">

          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 70%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Ready to hire your{' '}
              <GradientText>AI employee?</GradientText>
            </h2>
            <p className="mt-6 text-lg text-zinc-500 max-w-md mx-auto">
              Setup takes under 10 minutes. No docs, no engineers, no headaches.
            </p>
            <div className="mt-10">
              <Link href="/sign-up">
                <button className="group relative px-10 py-4 text-base font-semibold text-black bg-white rounded-full hover:bg-zinc-100 transition-all duration-200 shadow-[0_0_50px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)]">
                  Get started free
                  <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <p className="mt-4 text-xs text-zinc-600">No credit card required · Cancel any time</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">⚡</span>
            <span className="text-zinc-500">AgentOS</span>
          </span>
          <p className="text-xs text-zinc-700">© {new Date().getFullYear()} AgentOS. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/sign-in" className="hover:text-zinc-400 transition-colors">Sign in</Link>
            <Link href="/sign-up" className="hover:text-zinc-400 transition-colors">Get started</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
