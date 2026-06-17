export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { eq, desc } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { agents, actionLogs } from '@/lib/db/schema'

const PAGE_SIZE = 20

export async function GET(req: Request) {
  try {
    const { userId } = await getAuthUser()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const offset = (page - 1) * PAGE_SIZE

    // Get all agents for user
    const userAgents = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.userId, userId))

    if (userAgents.length === 0) {
      return NextResponse.json({
        data: [],
        total: 0,
        page,
        pageSize: PAGE_SIZE,
        hasMore: false,
      })
    }

    // MVP: single agent
    const agentId = userAgents[0].id

    const logs = await db
      .select()
      .from(actionLogs)
      .where(eq(actionLogs.agentId, agentId))
      .orderBy(desc(actionLogs.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset)

    // Count total
    const allLogs = await db
      .select({ id: actionLogs.id })
      .from(actionLogs)
      .where(eq(actionLogs.agentId, agentId))

    const total = allLogs.length

    return NextResponse.json({
      data: logs,
      total,
      page,
      pageSize: PAGE_SIZE,
      hasMore: offset + logs.length < total,
    })
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string }
    const status = error.statusCode ?? 500
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status })
  }
}
