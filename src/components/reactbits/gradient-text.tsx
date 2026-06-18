/**
 * GradientText — animated purple→blue→cyan gradient text
 * Uses animate-gradient-x keyframe defined in tailwind.config.ts
 */

import { cn } from '@/lib/utils'

export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent',
        'animate-gradient-x bg-[length:200%_auto]',
        className
      )}
    >
      {children}
    </span>
  )
}
