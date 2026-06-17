import type { ConnectorInterface } from '../connector'
import { getGmailAuthUrl, exchangeCode, storeGoogleTokens } from '../google/oauth'
import { db } from '@/lib/db'
import { oauthTokens } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { registerCalendarReadTools, calendarTools } from './tools'
import type { Tool } from '@/runtime/types'

export class CalendarConnector implements ConnectorInterface {
  id = 'google_calendar'
  name = 'Google Calendar'
  category = 'Productivity'
  tools: Tool[] = calendarTools

  /**
   * Google Calendar uses the same OAuth flow as Gmail.
   * The combined scopes (Gmail + Calendar) are requested in a single authorization.
   * userId is passed as the state param so the callback can associate tokens.
   */
  getAuthUrl(userId: string): string {
    return getGmailAuthUrl(userId)
  }

  async isConnected(userId: string): Promise<boolean> {
    const row = await db.query.oauthTokens.findFirst({
      where: and(
        eq(oauthTokens.userId, userId),
        eq(oauthTokens.provider, 'google_calendar')
      ),
    })
    return !!row
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    const tokens = await exchangeCode(code)
    await storeGoogleTokens(userId, tokens)
  }

  register(): void {
    registerCalendarReadTools()
  }
}

export const calendarConnector = new CalendarConnector()
