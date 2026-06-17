import { pgTable, uuid, text, boolean, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const agentStatusEnum = pgEnum('agent_status', ['active', 'paused', 'draft'])
export const memoryTierEnum = pgEnum('memory_tier', ['preferences', 'working', 'long_term'])
export const oauthProviderEnum = pgEnum('oauth_provider', ['gmail', 'google_calendar', 'github', 'slack', 'notion'])
export const policyTypeEnum = pgEnum('policy_type', ['always_ask', 'auto_approve', 'rule_based'])
export const actionStatusEnum = pgEnum('action_status', ['pending', 'approved', 'denied', 'executed', 'failed'])
export const policyDecisionEnum = pgEnum('policy_decision', ['allow', 'deny', 'ask'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  template: text('template').notNull().default('executive_assistant'),
  status: agentStatusEnum('status').notNull().default('draft'),
  instructions: text('instructions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const agentMemory = pgTable('agent_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  tier: memoryTierEnum('tier').notNull(),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const agentSkills = pgTable('agent_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  skillId: text('skill_id').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  config: jsonb('config'),
  installedAt: timestamp('installed_at').defaultNow().notNull(),
})

export const oauthTokens = pgTable('oauth_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: oauthProviderEnum('provider').notNull(),
  accessTokenEnc: text('access_token_enc').notNull(),
  refreshTokenEnc: text('refresh_token_enc'),
  expiresAt: timestamp('expires_at'),
  scopes: text('scopes').array().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const approvalPolicies = pgTable('approval_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  actionType: text('action_type').notNull(),
  policyType: policyTypeEnum('policy_type').notNull().default('always_ask'),
  ruleConfig: jsonb('rule_config'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const actionLogs = pgTable('action_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  toolName: text('tool_name').notNull(),
  toolArgs: jsonb('tool_args'),
  result: jsonb('result'),
  status: actionStatusEnum('status').notNull().default('pending'),
  policyDecision: policyDecisionEnum('policy_decision').notNull().default('ask'),
  executedAt: timestamp('executed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
