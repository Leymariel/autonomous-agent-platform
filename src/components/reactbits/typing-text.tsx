'use client'
import { useEffect, useState } from 'react'

export function TypingText({ texts, speed = 80, pauseMs = 2000 }: { texts: string[]; speed?: number; pauseMs?: number }) {
  const [display, setDisplay] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[textIndex]
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIndex < current.length) {
          setDisplay(current.slice(0, charIndex + 1))
          setCharIndex(c => c + 1)
        } else {
          setTimeout(() => setDeleting(true), pauseMs)
        }
      } else {
        if (charIndex > 0) {
          setDisplay(current.slice(0, charIndex - 1))
          setCharIndex(c => c - 1)
        } else {
          setDeleting(false)
          setTextIndex(i => (i + 1) % texts.length)
        }
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, textIndex, texts, speed, pauseMs])

  return (
    <span>
      {display}
      <span className="animate-pulse">|</span>
    </span>
  )
}
