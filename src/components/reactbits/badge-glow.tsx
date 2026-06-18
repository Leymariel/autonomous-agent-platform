'use client'
import { cn } from '@/lib/utils'

export function BadgeGlow({
  children,
  className,
  color = 'violet',
}: {
  children: React.ReactNode
  className?: string
  color?: 'violet' | 'blue' | 'green' | 'amber' | 'red'
}) {
  const colors = {
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.3)]',
    blue:   'bg-blue-500/10 text-blue-300 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.3)]',
    green:  'bg-green-500/10 text-green-300 border-green-500/30 shadow-[0_0_12px_rgba(34,197,94,0.3)]',
    amber:  'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    red:    'bg-red-500/10 text-red-300 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.3)]',
  }
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
      colors[color],
      className
    )}>
      {children}
    </span>
  )
}
