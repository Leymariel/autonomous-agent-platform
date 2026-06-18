/**
 * BlurIn — text/content that blurs and fades in dramatically on mount
 * Uses framer-motion for GPU-friendly opacity + filter animation
 */
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function BlurIn({
  children,
  className,
  delay = 0,
  duration = 0.8,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}) {
  return (
    <motion.div
      initial={{ filter: 'blur(20px)', opacity: 0, y: 10 }}
      animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
