'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error.digest, error.message)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center max-w-md p-8">
        <p className="text-4xl mb-4">⚠️</p>
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-zinc-500 mb-1">
          There was an error loading this page.
        </p>
        {error.digest && (
          <p className="text-xs text-zinc-600 font-mono mb-6">ref: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Try again
          </button>
          <Link
            href="/sign-in"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5"
          >
            Sign in again
          </Link>
        </div>
      </div>
    </div>
  )
}
