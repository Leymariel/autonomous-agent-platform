/**
 * AuroraBackground — animated aurora/gradient mesh background
 * Multiple radial gradients drifting slowly via CSS keyframes in globals.css
 */
'use client'

import { cn } from '@/lib/utils'

export function AuroraBackground({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="aurora-bg absolute inset-0 pointer-events-none" aria-hidden />
      {children}
    </div>
  )
}
