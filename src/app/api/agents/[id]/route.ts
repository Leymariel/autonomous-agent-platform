export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getAuthUser, requireAgent } from '@/lib/auth'
import { db } from '@/lib/db'
import { agents } from '@/lib/db/schema'

const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  instructions: z.string().max(2000).nullable().optional(),
  status: z.enum(['active', 'paused', 'draft']).optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuthUser()
    const agent = await requireAgent(params.id, userId)
    return NextResponse.json({ data: agent })
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string }
    const status = error.statusCode ?? 500
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuthUser()
    await requireAgent(params.id, userId)

    const body = await req.json()
    const parsed = updateAgentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (parsed.data.name !== undefined) updates.name = parsed.data.name
    if (parsed.data.description !== undefined) updates.description = parsed.data.description
    if (parsed.data.instructions !== undefined) updates.instructions = parsed.data.instructions
    if (parsed.data.status !== undefined) updates.status = parsed.data.status

    const [updated] = await db
      .update(agents)
      .set(updates)
      .where(eq(agents.id, params.id))
      .returning()

    return NextResponse.json({ data: updated })
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string }
    const status = error.statusCode ?? 500
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getAuthUser()
    await requireAgent(params.id, userId)

    await db.delete(agents).where(eq(agents.id, params.id))

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string }
    const status = error.statusCode ?? 500
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status })
  }
}
