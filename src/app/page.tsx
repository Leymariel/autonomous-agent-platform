import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="font-semibold text-lg">AgentOS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get started free</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 inline-flex items-center rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
            Now in early access — limited spots available
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
            Your AI employee,{' '}
            <span className="text-primary">ready in minutes.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Set up an autonomous AI agent that manages your inbox, schedules meetings, and
            handles tasks — all with your approval on every action that matters.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto px-8">
                Get started free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="border-t py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">📬</div>
            <h3 className="font-semibold text-lg mb-2">Inbox management</h3>
            <p className="text-muted-foreground text-sm">
              Your agent reads, categorizes, and drafts replies to emails — you just approve.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="font-semibold text-lg mb-2">Smart scheduling</h3>
            <p className="text-muted-foreground text-sm">
              Automatically books meetings based on your preferences and calendar availability.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="font-semibold text-lg mb-2">You stay in control</h3>
            <p className="text-muted-foreground text-sm">
              Every action is logged. Set approval rules per task type. Nothing happens without your OK.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AgentOS. All rights reserved.
      </footer>
    </div>
  )
}
