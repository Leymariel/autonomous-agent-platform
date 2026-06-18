/**
 * Landing page — AgentOS
 * Premium hero + feature grid + social proof. Dark-ready, CSS gradient bg, framer-motion entrance.
 */
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Mail, Calendar, ShieldCheck, Zap, ArrowRight } from 'lucide-react'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
  }),
}

const features = [
  {
    icon: Mail,
    title: 'Reads your inbox',
    description: 'Your agent reads, categorizes, and drafts replies — you just review and approve.',
  },
  {
    icon: Calendar,
    title: 'Manages your calendar',
    description: 'Proposes times, books meetings, and resolves conflicts based on your preferences.',
  },
  {
    icon: ShieldCheck,
    title: 'Takes action, with your approval',
    description: 'Every action is logged. Set approval rules per task type. Nothing happens without your OK.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-primary">⚡</span> AgentOS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="gap-1.5">
                Get started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="hero-bg flex flex-1 flex-col items-center justify-center text-center px-6 py-28">
        <div className="mx-auto max-w-3xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Now in early access — limited spots available
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
            className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Your AI employee,{' '}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              ready in minutes.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
            className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Set up an autonomous AI agent that manages your inbox, schedules meetings, and handles
            tasks — all with your approval on every action that matters.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.3}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto px-8 gap-2 shadow-lg shadow-primary/20">
                Get started free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                Sign in
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Feature grid */}
      <section className="border-t border-border/60 py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold tracking-tight">Everything your agent can do</h2>
            <p className="mt-3 text-muted-foreground">Plug in once, delegate forever.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-xl border border-border/60 bg-card p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-t border-border/60 py-16 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span>Built on the same stack as your favourite SaaS tools</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline font-medium text-foreground">Next.js · Vercel · Neon · Clerk</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} AgentOS. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/sign-up" className="hover:text-foreground transition-colors">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
