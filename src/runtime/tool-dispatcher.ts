import { PolicyEngine } from './policy'
import { ActionLogger } from './action-logger'
import { globalToolRegistry } from './tool-registry'
import type { ToolContext } from './types'

export interface DispatchResult {
  logId: string
  decision: 'allow' | 'deny' | 'ask'
  result?: unknown
  error?: string
}

export class ToolDispatcher {
  private policy: PolicyEngine
  private logger: ActionLogger

  constructor() {
    this.policy = new PolicyEngine()
    this.logger = new ActionLogger()
  }

  async dispatch(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolContext
  ): Promise<DispatchResult> {
    const tool = globalToolRegistry.get(toolName)
    if (!tool) throw new Error(`Tool not found: ${toolName}`)

    // 1. Evaluate policy
    const decision = await this.policy.evaluate({
      agentId: context.agentId,
      toolName,
      riskLevel: tool.riskLevel,
      capabilityLevel: tool.requiredCapabilityLevel,
    })

    // 2. Log the pending action
    const logId = await this.logger.log({
      agentId: context.agentId,
      toolName,
      toolArgs: args,
      status: decision === 'deny' ? 'denied' : 'pending',
      policyDecision: decision,
    })

    // 3. If denied or ask, return without executing
    if (decision === 'deny') {
      await this.logger.updateStatus(logId, 'denied')
      return { logId, decision, error: 'Action denied by policy' }
    }

    if (decision === 'ask') {
      // Don't execute — return 'ask' for the channel layer to handle approval flow
      return { logId, decision }
    }

    // 4. Execute tool
    try {
      const result = await tool.execute(args, context)
      await this.logger.updateStatus(logId, 'executed', result)
      return { logId, decision, result }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      await this.logger.updateStatus(logId, 'failed', { error })
      return { logId, decision, error }
    }
  }
}
