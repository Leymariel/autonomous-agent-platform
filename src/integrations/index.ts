import { gmailConnector } from './gmail/connector'
import { calendarConnector } from './google-calendar/connector'

export const connectors = {
  gmail: gmailConnector,
  google_calendar: calendarConnector,
}

/**
 * Call this on app startup to register all safe (read-only) tools.
 * To enable write/dangerous tools, call registerGmailAllTools() and registerCalendarAllTools()
 * explicitly after policy configuration.
 */
export function registerAllTools(): void {
  gmailConnector.register()
  calendarConnector.register()
}

export { gmailConnector } from './gmail/connector'
export { calendarConnector } from './google-calendar/connector'
export type { ConnectorInterface } from './connector'
