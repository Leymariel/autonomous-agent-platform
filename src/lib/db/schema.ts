import { pgTable, uuid, text, boolean, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const agentStatusEnum = pgEnum('agent_status', ['active', 'paused', 'draft'])
export const memoryTierEnum = pgEnum('memory_tier', ['preferences', 'working', 'long_term'])
export const oauthProviderEnum = pgEnum('oauth_provider', ['gmail', 'google_calendar', 'github', 'slack', 'notion'])
export const policyTypeEnum = pgEnum('policy_type', ['always_ask', 'auto_approve', 'rule_based'])
export const actionStatusEnum = pgEnum('action_status', ['pending', 'approved', 'denied', 'executed', 'failed'])
export const policyDecisionEnum = pgEnum('policy_decision', ['allow', 'deny', 'ask'])

// Better Auth core tables (users, sessions, accounts, verifications)
// Column names follow Better Auth's camelCase defaults mapped to snake_case DB columns
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Better Auth tables use singular names in DB
export const sessions = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const accounts = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const verifications = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),   // TEXT to match Better Auth users.id
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
  agentId: uuid('agent_id').notNull(),
  tier: memoryTierEnum('tier').notNull(),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const agentSkills = pgTable('agent_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull(),
  skillId: text('skill_id').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  config: jsonb('config'),
  installedAt: timestamp('installed_at').defaultNow().notNull(),
})

export const oauthTokens = pgTable('oauth_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),   // TEXT to match Better Auth users.id
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
  agentId: uuid('agent_id').notNull(),
  actionType: text('action_type').notNull(),
  policyType: policyTypeEnum('policy_type').notNull().default('always_ask'),
  ruleConfig: jsonb('rule_config'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const actionLogs = pgTable('action_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull(),
  toolName: text('tool_name').notNull(),
  toolArgs: jsonb('tool_args'),
  result: jsonb('result'),
  status: actionStatusEnum('status').notNull().default('pending'),
  policyDecision: policyDecisionEnum('policy_decision').notNull().default('ask'),
  executedAt: timestamp('executed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
