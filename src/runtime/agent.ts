import { db } from '@/lib/db'
import { agents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { PostgresMemoryStore } from './memory'
import { ToolDispatcher } from './tool-dispatcher'
import type { AgentProfile, MemoryTier } from './types'

export class Agent {
  public profile: AgentProfile
  private memory: PostgresMemoryStore
  private dispatcher: ToolDispatcher

  constructor(profile: AgentProfile) {
    this.profile = profile
    this.memory = new PostgresMemoryStore()
    this.dispatcher = new ToolDispatcher()
  }

  async remember(tier: MemoryTier, key: string, value: unknown): Promise<void> {
    return this.memory.set(this.profile.id, tier, key, value)
  }

  async recall(tier: MemoryTier, key: string): Promise<unknown> {
    return this.memory.get(this.profile.id, tier, key)
  }

  async useTool(toolName: string, args: Record<string, unknown>) {
    return this.dispatcher.dispatch(toolName, args, {
      agentId: this.profile.id,
      userId: this.profile.userId,
    })
  }
}

// Factory function — creates a new agent row in DB and returns a bound Agent instance
export async function createAgent(
  userId: string,
  profile: Omit<AgentProfile, 'id' | 'userId'>
): Promise<Agent> {
  const [row] = await db
    .insert(agents)
    .values({
      userId,
      name: profile.name,
      description: profile.description,
      template: profile.template,
      instructions: profile.instructions,
      status: 'draft',
    })
    .returning()

  return new Agent({
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description ?? undefined,
    template: row.template,
    status: row.status as AgentProfile['status'],
    instructions: row.instructions ?? undefined,
  })
}

// Load an existing agent from DB, enforcing userId ownership
export async function loadAgent(agentId: string, userId: string): Promise<Agent> {
  const row = await db.query.agents.findFirst({
    where: and(eq(agents.id, agentId), eq(agents.userId, userId)),
  })

  if (!row) throw new Error('Agent not found or access denied')

  return new Agent({
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description ?? undefined,
    template: row.template,
    status: row.status as AgentProfile['status'],
    instructions: row.instructions ?? undefined,
  })
}
