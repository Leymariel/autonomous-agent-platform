import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../src/lib/db/schema'

async function seed() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const sql = neon(databaseUrl)
  const db = drizzle(sql, { schema })

  console.log('🌱 Seeding database...')

  // Insert test user
  const [user] = await db
    .insert(schema.users)
    .values({
      clerkId: 'test_clerk_id',
      email: 'test@example.com',
      name: 'Test User',
    })
    .onConflictDoNothing()
    .returning()

  if (!user) {
    console.log('ℹ️  User already exists, skipping...')
    // Fetch existing user
    const existing = await db
      .select()
      .from(schema.users)
    const existingUser = existing.find((u) => u.clerkId === 'test_clerk_id')
    if (!existingUser) {
      throw new Error('Failed to find or create test user')
    }
    console.log('✅ Seed complete (no-op, data already exists)')
    process.exit(0)
  }

  console.log(`✅ Created user: ${user.id}`)

  // Insert test agent
  const [agent] = await db
    .insert(schema.agents)
    .values({
      userId: user.id,
      name: 'My Executive Assistant',
      description: 'A personal AI agent that manages email, calendar, and tasks.',
      template: 'executive_assistant',
      status: 'draft',
      instructions:
        'You are a professional executive assistant. Be concise, prioritize urgent items, and always ask before sending anything externally.',
    })
    .returning()

  console.log(`✅ Created agent: ${agent.id}`)

  // Insert test action log
  const [actionLog] = await db
    .insert(schema.actionLogs)
    .values({
      agentId: agent.id,
      toolName: 'listEmails',
      toolArgs: { maxResults: 10, query: 'is:unread' },
      result: {
        emails: [
          { id: 'msg1', subject: 'Q3 Budget Review', from: 'cfo@company.com', snippet: 'Please review...' },
          { id: 'msg2', subject: 'Team standup notes', from: 'pm@company.com', snippet: 'Summary of today...' },
        ],
        total: 2,
      },
      status: 'executed',
      policyDecision: 'allow',
      executedAt: new Date(),
    })
    .returning()

  console.log(`✅ Created action log: ${actionLog.id}`)
  console.log('🎉 Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
