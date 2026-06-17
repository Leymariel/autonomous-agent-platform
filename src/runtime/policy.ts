import { db } from '@/lib/db'
import { approvalPolicies } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import type { PolicyDecision, RiskLevel } from './types'

interface EvaluateOptions {
  agentId: string
  toolName: string
  riskLevel: RiskLevel
  capabilityLevel: number
}

interface RuleConfig {
  maxRiskLevel?: RiskLevel
  maxCapabilityLevel?: number
  allowedTools?: string[]
  deniedTools?: string[]
}

const RISK_ORDER: Record<RiskLevel, number> = {
  safe: 0,
  medium: 1,
  dangerous: 2,
}

export class PolicyEngine {
  async evaluate(opts: EvaluateOptions): Promise<PolicyDecision> {
    const { agentId, toolName, riskLevel, capabilityLevel } = opts

    // 1. Look up policy for agentId + actionType (toolName)
    const rows = await db
      .select()
      .from(approvalPolicies)
      .where(
        and(
          eq(approvalPolicies.agentId, agentId),
          eq(approvalPolicies.actionType, toolName)
        )
      )
      .limit(1)

    // 2. If no policy found: dangerous → 'ask', medium → 'ask', safe → 'allow'
    if (rows.length === 0) {
      if (riskLevel === 'dangerous') return 'ask'
      if (riskLevel === 'medium') return 'ask'
      return 'allow'
    }

    const policy = rows[0]

    // 3. always_ask → return 'ask'
    if (policy.policyType === 'always_ask') {
      return 'ask'
    }

    // 4. auto_approve → return 'allow'
    if (policy.policyType === 'auto_approve') {
      return 'allow'
    }

    // 5. rule_based → evaluate ruleConfig
    if (policy.policyType === 'rule_based' && policy.ruleConfig) {
      const rules = policy.ruleConfig as RuleConfig

      // Check denied tools list
      if (rules.deniedTools && rules.deniedTools.includes(toolName)) {
        return 'deny'
      }

      // Check allowed tools list (allowlist mode)
      if (rules.allowedTools && !rules.allowedTools.includes(toolName)) {
        return 'deny'
      }

      // Check max risk level threshold
      if (rules.maxRiskLevel !== undefined) {
        const maxRiskOrder = RISK_ORDER[rules.maxRiskLevel]
        if (RISK_ORDER[riskLevel] > maxRiskOrder) {
          return 'ask'
        }
      }

      // Check max capability level threshold
      if (rules.maxCapabilityLevel !== undefined) {
        if (capabilityLevel > rules.maxCapabilityLevel) {
          return 'ask'
        }
      }

      return 'allow'
    }

    // Fallback: safe default
    if (riskLevel === 'dangerous') return 'ask'
    return 'allow'
  }
}
