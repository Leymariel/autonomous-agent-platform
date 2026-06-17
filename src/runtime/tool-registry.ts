import type { Tool } from './types'

export class ToolRegistry {
  private tools = new Map<string, Tool>()

  register(tool: Tool): void {
    this.tools.set(tool.name, tool)
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name)
  }

  list(): Tool[] {
    return Array.from(this.tools.values())
  }

  listByRisk(riskLevel: string): Tool[] {
    return this.list().filter(t => t.riskLevel === riskLevel)
  }
}

export const globalToolRegistry = new ToolRegistry()
