import { db } from '@/lib/db'
import { actionLogs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import type { ActionLogEntry } from './types'

export class ActionLogger {
  async log(entry: ActionLogEntry): Promise<string> {
    const [row] = await db
      .insert(actionLogs)
      .values({
        agentId: entry.agentId,
        toolName: entry.toolName,
        toolArgs: entry.toolArgs as Record<string, unknown> | undefined,
        result: entry.result as Record<string, unknown> | undefined,
        status: entry.status,
        policyDecision: entry.policyDecision,
        executedAt: entry.executedAt ?? null,
      })
      .returning({ id: actionLogs.id })

    return row.id
  }

  async updateStatus(id: string, status: string, result?: unknown): Promise<void> {
    await db
      .update(actionLogs)
      .set({
        status: status as ActionLogEntry['status'],
        result: result as Record<string, unknown> | undefined,
        executedAt: status === 'executed' ? new Date() : undefined,
      })
      .where(eq(actionLogs.id, id))
  }

  async getByAgent(agentId: string, limit = 20): Promise<unknown[]> {
    const rows = await db
      .select()
      .from(actionLogs)
      .where(eq(actionLogs.agentId, agentId))
      .orderBy(desc(actionLogs.createdAt))
      .limit(limit)

    return rows
  }
}
