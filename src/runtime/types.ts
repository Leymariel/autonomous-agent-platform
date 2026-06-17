export type PolicyType = 'always_ask' | 'auto_approve' | 'rule_based'
export type PolicyDecision = 'allow' | 'deny' | 'ask'
export type ActionStatus = 'pending' | 'approved' | 'denied' | 'executed' | 'failed'
export type MemoryTier = 'preferences' | 'working' | 'long_term'
export type RiskLevel = 'safe' | 'medium' | 'dangerous'
export type CapabilityLevel = 1 | 2 | 3

export interface Tool {
  name: string
  description: string
  riskLevel: RiskLevel
  requiredCapabilityLevel: CapabilityLevel
  parameters: Record<string, unknown>
  execute: (args: Record<string, unknown>, context: ToolContext) => Promise<unknown>
}

export interface ToolContext {
  agentId: string
  userId: string
}

export interface ApprovalPolicy {
  id: string
  agentId: string
  actionType: string
  policyType: PolicyType
  ruleConfig?: Record<string, unknown>
}

export interface AgentProfile {
  id: string
  userId: string
  name: string
  description?: string
  template: string
  status: 'active' | 'paused' | 'draft'
  instructions?: string
}

export interface MemoryEntry {
  key: string
  value: unknown
  tier: MemoryTier
}

export interface ActionLogEntry {
  agentId: string
  toolName: string
  toolArgs?: unknown
  result?: unknown
  status: ActionStatus
  policyDecision: PolicyDecision
  executedAt?: Date
}

export interface ChannelMessage {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: Date
}

export interface ChannelAdapter {
  id: string
  receiveMessage(raw: unknown): ChannelMessage
  sendResponse(message: string, context: unknown): Promise<void>
  streamStatus?(status: string, context: unknown): Promise<void>
}
