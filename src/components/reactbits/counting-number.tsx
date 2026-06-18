'use client'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export function CountingNumber({ to, duration = 2, suffix = '' }: { to: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = (Date.now() - start) / (duration * 1000)
      if (elapsed >= 1) {
        setCount(to)
        clearInterval(timer)
      } else {
        setCount(Math.floor(to * elapsed))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, to, duration])

  return <span ref={ref}>{count}{suffix}</span>
}
