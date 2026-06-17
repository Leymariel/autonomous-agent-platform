import type { ChannelAdapter, ChannelMessage } from './types'

// Web App channel adapter (reference implementation)
export class WebChannelAdapter implements ChannelAdapter {
  id = 'web'

  receiveMessage(raw: { content: string; id: string; timestamp?: string }): ChannelMessage {
    return {
      id: raw.id,
      content: raw.content,
      role: 'user',
      timestamp: raw.timestamp ? new Date(raw.timestamp) : new Date(),
    }
  }

  async sendResponse(message: string, context: { res?: Response }): Promise<void> {
    // In the web context, the response is returned directly from the API route.
    // This adapter is a pass-through; the API route handles the actual response transport.
    console.log('[WebChannelAdapter] response:', message)
  }

  async streamStatus(status: string, context: { res?: Response }): Promise<void> {
    // Emit a status update (e.g., "thinking", "waiting_approval") back to the client.
    // In production this would write to an SSE stream or WebSocket; for now, log.
    console.log('[WebChannelAdapter] status:', status)
  }
}
