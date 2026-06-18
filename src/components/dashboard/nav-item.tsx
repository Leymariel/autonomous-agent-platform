'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItemProps {
  href: string
  label: string
  icon: LucideIcon
}

export function NavItem({ href, label, icon: Icon }: NavItemProps) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 border-l-2',
        active
          ? 'text-white bg-white/5 border-violet-500'
          : 'text-zinc-500 hover:bg-white/5 hover:text-white border-transparent hover:border-violet-500/50'
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          active ? 'text-violet-400' : 'group-hover:text-violet-400'
        )}
      />
      {label}
    </Link>
  )
}
