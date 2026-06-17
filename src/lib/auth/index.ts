import { auth } from './better-auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { users, agents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function getAuthUser() {
  const session = await auth.api.getSession({ headers: headers() })
  if (!session?.user) {
    throw new Response('Unauthorized', { status: 401 })
  }
  // Ensure user exists in our DB
  const existing = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  })
  if (!existing) {
    const [newUser] = await db.insert(users).values({
      email: session.user.email,
      name: session.user.name ?? null,
      clerkId: session.user.id, // reusing clerkId column for better-auth user id
    }).returning()
    return { userId: newUser.id, email: newUser.email, name: newUser.name }
  }
  return { userId: existing.id, email: existing.email, name: existing.name }
}

export async function syncUser(authId: string, email: string, name?: string | null) {
  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, authId),
  })
  if (existing) return existing
  const [newUser] = await db.insert(users).values({
    clerkId: authId,
    email,
    name: name ?? null,
  }).returning()
  return newUser
}

export async function requireAgent(agentId: string, userId: string) {
  const agent = await db.query.agents.findFirst({
    where: and(eq(agents.id, agentId), eq(agents.userId, userId)),
  })
  if (!agent) throw new Response('Not found or access denied', { status: 403 })
  return agent
}
