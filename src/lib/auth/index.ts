import { auth } from './better-auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { agents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function getAuthUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    throw new Response('Unauthorized', { status: 401 })
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
  if (!agent) throw new Response('Not found or access denied', { status: 403 })
  return agent
}
