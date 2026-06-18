/**
 * Sign-in page — AgentOS
 * Full ReactBits: particles, aurora, glow card, blur-in, animated border, badge glow.
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { signIn } from '@/lib/auth/client'
import { AuroraBackground } from '@/components/reactbits/aurora-background'
import { Particles }        from '@/components/reactbits/particles'
import { BlurIn }           from '@/components/reactbits/blur-in'
import { GradientText }     from '@/components/reactbits/gradient-text'
import { BadgeGlow }        from '@/components/reactbits/badge-glow'
import { AnimatedBorder }   from '@/components/reactbits/animated-border'
import { GlowCard }         from '@/components/reactbits/glow-card'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [error, setError]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await signIn.email({ email, password, callbackURL: '/dashboard' })
      if (result.error) {
        setError(result.error.message || 'Invalid email or password')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    try {
      await signIn.social({ provider: 'google', callbackURL: '/dashboard' })
    } catch {
      setError('Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#080808]">
      <AuroraBackground className="absolute inset-0 pointer-events-none" />
      <Particles className="absolute inset-0 pointer-events-none" quantity={50} />

      {/* Logo */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors z-20"
      >
        <span className="text-sm font-bold flex items-center gap-1.5">
          <span className="text-violet-400">⚡</span>
          <GradientText>AgentOS</GradientText>
        </span>
      </Link>

      <BlurIn delay={0} className="relative z-10 w-full max-w-md">
        <GlowCard className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <BadgeGlow color="violet">🔒 Secure · Private · Zero jargon</BadgeGlow>
            </div>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/25">
              <span className="text-xl">⚡</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Sign in to your <GradientText>AgentOS</GradientText> account
            </p>
          </div>

          {/* Google — AnimatedBorder CTA */}
          <AnimatedBorder className="mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black hover:bg-zinc-100 disabled:opacity-60 transition-all duration-200"
            >
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{googleLoading ? 'Redirecting…' : 'Continue with Google'}</span>
            </button>
          </AnimatedBorder>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center text-xs text-zinc-600">
              <span className="bg-zinc-950 px-3">or continue with email</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-white/10 bg-white/8 hover:bg-white/12 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in with email'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            No account?{' '}
            <Link href="/sign-up" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </GlowCard>
      </BlurIn>
    </div>
  )
}
