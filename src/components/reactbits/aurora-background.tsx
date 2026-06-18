'use client'
import { cn } from '@/lib/utils'

export function AuroraBackground({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      {/* Fixed aurora — no movement, just static layered gradients. No overflow-hidden so content never clips. */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 40%, rgba(120, 80, 255, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 20%, rgba(56, 182, 255, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 50% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 60%)
          `,
        }}
      />
      {children}
    </div>
  )
}
