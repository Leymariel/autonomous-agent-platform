'use client'
import { cn } from '@/lib/utils'

export function TextShimmer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      'inline-block bg-gradient-to-r from-zinc-500 via-white to-zinc-500',
      'bg-[length:200%_auto] bg-clip-text text-transparent',
      'animate-[shimmer_2.5s_linear_infinite]',
      className
    )}>
      {children}
    </span>
  )
}
