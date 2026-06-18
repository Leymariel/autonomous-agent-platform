import { auth } from './better-auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { agents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function getAuthUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      const err = new Error('Unauthorized') as Error & { statusCode: number }
      err.statusCode = 401
      throw err
    }
    return {
      userId: session.user.id,
      email: session.user.email,
      name: (session.user as { name?: string }).name ?? null,
    }
  } catch (e) {
    // If Better Auth itself throws (misconfiguration, DB issue), treat as unauthenticated
    const err = e as Error & { statusCode?: number }
    if (!err.statusCode) {
      // Log for debugging but don't expose internals
      console.error('[getAuthUser] Better Auth error:', err.message)
      const authErr = new Error('Unauthorized') as Error & { statusCode: number }
      authErr.statusCode = 401
      throw authErr
    }
    throw e
  }
}

export async function syncUser(authId: string, email: string, name?: string | null) {
  return { id: authId, email, name: name ?? null }
}

export async function requireAgent(agentId: string, userId: string) {
  const agent = await db.query.agents.findFirst({
    where: and(eq(agents.id, agentId), eq(agents.userId, userId)),
  })
  if (!agent) {
    const err = new Error('Not found or access denied') as Error & { statusCode: number }
    err.statusCode = 403
    throw err
  }
  return agent
}
