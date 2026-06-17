import type { ConnectorInterface } from '../connector'
import { getGmailAuthUrl, exchangeCode, storeGoogleTokens } from '../google/oauth'
import { db } from '@/lib/db'
import { oauthTokens } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { registerGmailReadTools, gmailTools } from './tools'
import type { Tool } from '@/runtime/types'

export class GmailConnector implements ConnectorInterface {
  id = 'gmail'
  name = 'Gmail'
  category = 'Communication'
  tools: Tool[] = gmailTools

  getAuthUrl(userId: string): string {
    return getGmailAuthUrl(userId)
  }

  async isConnected(userId: string): Promise<boolean> {
    const row = await db.query.oauthTokens.findFirst({
      where: and(eq(oauthTokens.userId, userId), eq(oauthTokens.provider, 'gmail')),
    })
    return !!row
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    const tokens = await exchangeCode(code)
    await storeGoogleTokens(userId, tokens)
  }

  register(): void {
    registerGmailReadTools()
  }
}

export const gmailConnector = new GmailConnector()
