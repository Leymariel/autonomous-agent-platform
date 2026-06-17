import type { Tool } from '@/runtime/types'

export interface ConnectorInterface {
  id: string
  name: string
  category: string
  tools: Tool[]
  // Register all tools into the global tool registry
  register(): void
  // Check if a user has connected this integration
  isConnected(userId: string): Promise<boolean>
  // Get OAuth authorization URL
  getAuthUrl(userId: string, state?: string): string
  // Handle OAuth callback — exchange code for tokens, store encrypted
  handleCallback(code: string, userId: string): Promise<void>
}
