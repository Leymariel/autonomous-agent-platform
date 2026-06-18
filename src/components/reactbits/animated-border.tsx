'use client'
import { cn } from '@/lib/utils'

export function AnimatedBorder({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('relative rounded-xl p-[1px]', className)}
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.6), rgba(59,130,246,0.6), rgba(6,182,212,0.6))',
      }}
    >
      {/* Static gradient border — no spinning, no overflow issues */}
      <div className="relative rounded-xl bg-zinc-950 w-full h-full">
        {children}
      </div>
    </div>
  )
}
