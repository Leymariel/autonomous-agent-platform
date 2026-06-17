import { db } from '@/lib/db'
import { agentMemory } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import type { MemoryTier, MemoryEntry } from './types'

export interface MemoryStore {
  get(agentId: string, tier: MemoryTier, key: string): Promise<unknown>
  set(agentId: string, tier: MemoryTier, key: string, value: unknown): Promise<void>
  getAll(agentId: string, tier: MemoryTier): Promise<MemoryEntry[]>
  delete(agentId: string, tier: MemoryTier, key: string): Promise<void>
}

export class PostgresMemoryStore implements MemoryStore {
  async get(agentId: string, tier: MemoryTier, key: string): Promise<unknown> {
    const row = await db
      .select()
      .from(agentMemory)
      .where(
        and(
          eq(agentMemory.agentId, agentId),
          eq(agentMemory.tier, tier),
          eq(agentMemory.key, key)
        )
      )
      .limit(1)

    if (row.length === 0) return null
    return row[0].value
  }

  async set(agentId: string, tier: MemoryTier, key: string, value: unknown): Promise<void> {
    await db
      .insert(agentMemory)
      .values({
        agentId,
        tier,
        key,
        value: value as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [agentMemory.agentId, agentMemory.tier, agentMemory.key],
        set: {
          value: value as Record<string, unknown>,
          updatedAt: new Date(),
        },
      })
  }

  async getAll(agentId: string, tier: MemoryTier): Promise<MemoryEntry[]> {
    const rows = await db
      .select()
      .from(agentMemory)
      .where(
        and(
          eq(agentMemory.agentId, agentId),
          eq(agentMemory.tier, tier)
        )
      )

    return rows.map((row) => ({
      key: row.key,
      value: row.value,
      tier: row.tier as MemoryTier,
    }))
  }

  async delete(agentId: string, tier: MemoryTier, key: string): Promise<void> {
    await db
      .delete(agentMemory)
      .where(
        and(
          eq(agentMemory.agentId, agentId),
          eq(agentMemory.tier, tier),
          eq(agentMemory.key, key)
        )
      )
  }
}
