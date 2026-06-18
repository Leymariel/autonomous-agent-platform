/**
 * Dashboard layout — AgentOS
 * ElevenLabs-style: near-black sidebar (#0a0a0a), gradient logo mark,
 * violet left-border active state, subtle hover bg, user footer.
 */

import { getAuthUser } from '@/lib/auth'
import { redirect }    from 'next/navigation'
import Link            from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Bot,
  Store,
  Zap,
  Settings,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/agents',        label: 'My Agent',     icon: Bot },
  { href: '/marketplace',   label: 'Marketplace',  icon: Store },
  { href: '/action-center', label: 'Action Center', icon: Zap },
  { href: '/settings',      label: 'Settings',     icon: Settings },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user: { userId: string; email: string; name: string | null } | null = null
  try {
    user = await getAuthUser()
  } catch {
    redirect('/sign-in')
  }

  const displayName = user?.name ?? user?.email ?? 'User'
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex min-h-screen bg-[#080808]">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="w-60 flex flex-col shrink-0 bg-[#0a0a0a] border-r border-white/[0.06]">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 border border-violet-500/25 group-hover:bg-violet-500/25 transition-colors">
              <span className="text-sm bg-gradient-to-br from-violet-400 to-cyan-400 bg-clip-text text-transparent font-bold">⚡</span>
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">AgentOS</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            // Note: active state is handled client-side via pathname; for SSR we leave default styling
            // A client wrapper would be needed for true active highlighting — kept server-safe here
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-white/5 hover:text-white transition-all duration-150 border-l-2 border-transparent hover:border-violet-500/50"
              >
                <Icon className="h-4 w-4 shrink-0 transition-colors group-hover:text-violet-400" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/[0.06] px-4 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px] bg-violet-500/15 text-violet-300 border border-violet-500/25">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">{displayName}</p>
              <p className="text-[11px] text-zinc-600 truncate">{user?.email}</p>
            </div>
          </div>
          <Link
            href="/sign-in"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Link>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-white/[0.06] px-8 flex items-center justify-end bg-[#080808]/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[10px] bg-violet-500/15 text-violet-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-zinc-500 hidden sm:block">{displayName}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 py-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
