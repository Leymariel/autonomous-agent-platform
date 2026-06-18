'use client'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function SpotlightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn('relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/80 p-6', className)}
    >
      {hovered && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(139,92,246,0.12), transparent 60%)`,
          }}
        />
      )}
      {children}
    </div>
  )
}
