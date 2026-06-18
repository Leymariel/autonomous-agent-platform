import { auth } from './better-auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { agents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function getAuthUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    const err = new Error('Unauthorized') as Error & { statusCode: number }
    err.statusCode = 401
    throw err
  }
  return {
    userId: session.user.id,          // text ID from Better Auth
    email: session.user.email,
    name: session.user.name ?? null,
  }
}

export async function syncUser(authId: string, email: string, name?: string | null) {
  // Better Auth manages the users table directly — no-op here
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
