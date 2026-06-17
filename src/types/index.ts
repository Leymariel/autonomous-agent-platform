import type {
  users,
  agents,
  agentMemory,
  oauthTokens,
  approvalPolicies,
  actionLogs,
  agentSkills,
} from '@/lib/db/schema'

// Inferred types from Drizzle schema
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Agent = typeof agents.$inferSelect
export type NewAgent = typeof agents.$inferInsert

export type AgentMemory = typeof agentMemory.$inferSelect
export type NewAgentMemory = typeof agentMemory.$inferInsert

export type AgentSkill = typeof agentSkills.$inferSelect
export type NewAgentSkill = typeof agentSkills.$inferInsert

export type OAuthToken = typeof oauthTokens.$inferSelect
export type NewOAuthToken = typeof oauthTokens.$inferInsert

export type ApprovalPolicy = typeof approvalPolicies.$inferSelect
export type NewApprovalPolicy = typeof approvalPolicies.$inferInsert

export type ActionLog = typeof actionLogs.$inferSelect
export type NewActionLog = typeof actionLogs.$inferInsert

// Enum value types
export type AgentStatus = 'active' | 'paused' | 'draft'
export type MemoryTier = 'preferences' | 'working' | 'long_term'
export type OAuthProvider = 'gmail' | 'google_calendar' | 'github' | 'slack' | 'notion'
export type PolicyType = 'always_ask' | 'auto_approve' | 'rule_based'
export type ActionStatus = 'pending' | 'approved' | 'denied' | 'executed' | 'failed'
export type PolicyDecision = 'allow' | 'deny' | 'ask'

// API response shapes
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiError {
  error: string
  statusCode: number
}
