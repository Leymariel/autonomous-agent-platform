/**
 * Dashboard layout — AgentOS
 * Dark sidebar (gray-950), Lucide icons, glow logo, user avatar at bottom.
 */

import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Bot,
  Store,
  Zap,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/agents',        label: 'My Agent',       icon: Bot },
  { href: '/marketplace',   label: 'Marketplace',    icon: Store },
  { href: '/action-center', label: 'Action Center',  icon: Zap },
  { href: '/settings',      label: 'Settings',       icon: Settings },
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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col bg-gray-950 border-r border-gray-800/60 shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-800/60">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30 group-hover:bg-blue-600/30 transition-colors">
              <Zap className="h-4 w-4 text-blue-400" />
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">AgentOS</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800/60 hover:text-white transition-all duration-150"
              >
                <Icon className="h-4 w-4 shrink-0 text-gray-500 group-hover:text-blue-400 transition-colors" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-800/60 px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px] bg-blue-600/20 text-blue-300 border border-blue-500/30">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate">{displayName}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border/60 px-8 flex items-center justify-between bg-background/80 backdrop-blur-sm shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-muted-foreground hidden sm:block">{displayName}</span>
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
