export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { agents } from '@/lib/db/schema'

const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  template: z.string().default('executive_assistant'),
  instructions: z.string().max(2000).optional(),
})

export async function GET() {
  try {
    const { userId } = await getAuthUser()

    const userAgents = await db
      .select()
      .from(agents)
      .where(eq(agents.userId, userId))

    return NextResponse.json({ data: userAgents })
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string }
    const status = error.statusCode ?? 500
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await getAuthUser()

    const body = await req.json()
    const parsed = createAgentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, description, template, instructions } = parsed.data

    const [agent] = await db
      .insert(agents)
      .values({
        userId,
        name,
        description: description ?? null,
        template,
        instructions: instructions ?? null,
        status: 'draft',
      })
      .returning()

    return NextResponse.json({ data: agent }, { status: 201 })
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string }
    const status = error.statusCode ?? 500
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status })
  }
}
