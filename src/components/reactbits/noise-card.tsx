'use client'
import { cn } from '@/lib/utils'

export function NoiseCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900', className)}>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
