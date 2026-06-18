/**
 * GlowCard — dark card with purple/blue glow on hover
 * GPU-friendly: only box-shadow and border-color animate
 */
'use client'

import { cn } from '@/lib/utils'

export function GlowCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6',
        'transition-all duration-300',
        'hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]',
        className
      )}
    >
      {children}
    </div>
  )
}
