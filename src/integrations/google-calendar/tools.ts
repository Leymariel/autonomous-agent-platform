import { google } from 'googleapis'
import { getAuthenticatedClient } from '../google/oauth'
import { globalToolRegistry } from '@/runtime/tool-registry'
import type { Tool } from '@/runtime/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toRFC3339(dateStr: string): string {
  // Accept ISO strings or plain date strings and ensure RFC3339 format
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) throw new Error(`Invalid date: ${dateStr}`)
  return d.toISOString()
}

interface TimeSlot {
  start: string
  end: string
}

function findFreeSlots(
  busySlots: TimeSlot[],
  rangeStart: Date,
  rangeEnd: Date,
  durationMs: number
): TimeSlot[] {
  const freeSlots: TimeSlot[] = []

  // Sort busy slots by start time
  const sorted = [...busySlots].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )

  let cursor = rangeStart.getTime()

  for (const busy of sorted) {
    const busyStart = new Date(busy.start).getTime()
    const busyEnd = new Date(busy.end).getTime()

    if (busyStart > cursor && busyStart - cursor >= durationMs) {
      freeSlots.push({
        start: new Date(cursor).toISOString(),
        end: new Date(busyStart).toISOString(),
      })
    }
    if (busyEnd > cursor) {
      cursor = busyEnd
    }
  }

  // Check trailing free time
  const rangeEndMs = rangeEnd.getTime()
  if (rangeEndMs > cursor && rangeEndMs - cursor >= durationMs) {
    freeSlots.push({
      start: new Date(cursor).toISOString(),
      end: new Date(rangeEndMs).toISOString(),
    })
  }

  return freeSlots
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const listEventsTool: Tool = {
  name: 'calendar_list_events',
  description: 'List Google Calendar events within a time range.',
  riskLevel: 'safe',
  requiredCapabilityLevel: 1,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      timeMin: {
        type: 'string',
        description: 'Start of time range (ISO 8601). Defaults to now.',
      },
      timeMax: {
        type: 'string',
        description: 'End of time range (ISO 8601). Defaults to 7 days from now.',
      },
      maxResults: { type: 'number', description: 'Max events to return (default 10, max 50)' },
      calendarId: {
        type: 'string',
        description: 'Calendar ID (default "primary")',
      },
    },
    required: ['userId'],
  },
  execute: async (args, _context) => {
    const {
      userId,
      timeMin,
      timeMax,
      maxResults = 10,
      calendarId = 'primary',
    } = args as {
      userId: string
      timeMin?: string
      timeMax?: string
      maxResults?: number
      calendarId?: string
    }

    const auth = await getAuthenticatedClient(userId, 'google_calendar')
    const calendar = google.calendar({ version: 'v3', auth })

    const now = new Date()
    const defaultMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const res = await calendar.events.list({
      calendarId,
      timeMin: timeMin ? toRFC3339(timeMin) : now.toISOString(),
      timeMax: timeMax ? toRFC3339(timeMax) : defaultMax.toISOString(),
      maxResults: Math.min(Number(maxResults), 50),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = (res.data.items ?? []).map(e => ({
      id: e.id,
      summary: e.summary,
      description: e.description,
      location: e.location,
      start: e.start?.dateTime ?? e.start?.date,
      end: e.end?.dateTime ?? e.end?.date,
      attendees: e.attendees?.map(a => ({ email: a.email, responseStatus: a.responseStatus })),
      status: e.status,
      htmlLink: e.htmlLink,
    }))

    return { events, calendarId }
  },
}

const getEventTool: Tool = {
  name: 'calendar_get_event',
  description: 'Get full details of a specific Google Calendar event by its ID.',
  riskLevel: 'safe',
  requiredCapabilityLevel: 1,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      eventId: { type: 'string', description: 'The calendar event ID' },
      calendarId: { type: 'string', description: 'Calendar ID (default "primary")' },
    },
    required: ['userId', 'eventId'],
  },
  execute: async (args, _context) => {
    const { userId, eventId, calendarId = 'primary' } = args as {
      userId: string
      eventId: string
      calendarId?: string
    }

    const auth = await getAuthenticatedClient(userId, 'google_calendar')
    const calendar = google.calendar({ version: 'v3', auth })

    const res = await calendar.events.get({ calendarId, eventId })
    const e = res.data

    return {
      id: e.id,
      summary: e.summary,
      description: e.description,
      location: e.location,
      start: e.start?.dateTime ?? e.start?.date,
      end: e.end?.dateTime ?? e.end?.date,
      attendees: e.attendees?.map(a => ({
        email: a.email,
        displayName: a.displayName,
        responseStatus: a.responseStatus,
        organizer: a.organizer,
      })),
      organizer: e.organizer,
      status: e.status,
      recurrence: e.recurrence,
      recurringEventId: e.recurringEventId,
      htmlLink: e.htmlLink,
      conferenceData: e.conferenceData,
      created: e.created,
      updated: e.updated,
    }
  },
}

const findAvailabilityTool: Tool = {
  name: 'calendar_find_availability',
  description:
    'Find free time slots in the user\'s calendar for a given duration within a date range.',
  riskLevel: 'safe',
  requiredCapabilityLevel: 1,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      dateRangeStart: {
        type: 'string',
        description: 'Start of search range (ISO 8601)',
      },
      dateRangeEnd: {
        type: 'string',
        description: 'End of search range (ISO 8601)',
      },
      durationMinutes: {
        type: 'number',
        description: 'Required duration of free slot in minutes (e.g. 30, 60)',
      },
      calendarId: { type: 'string', description: 'Calendar ID (default "primary")' },
    },
    required: ['userId', 'dateRangeStart', 'dateRangeEnd', 'durationMinutes'],
  },
  execute: async (args, _context) => {
    const {
      userId,
      dateRangeStart,
      dateRangeEnd,
      durationMinutes,
      calendarId = 'primary',
    } = args as {
      userId: string
      dateRangeStart: string
      dateRangeEnd: string
      durationMinutes: number
      calendarId?: string
    }

    const auth = await getAuthenticatedClient(userId, 'google_calendar')
    const calendar = google.calendar({ version: 'v3', auth })

    const rangeStart = new Date(dateRangeStart)
    const rangeEnd = new Date(dateRangeEnd)

    // Use freebusy API for accurate busy time
    const freebusyRes = await calendar.freebusy.query({
      requestBody: {
        timeMin: rangeStart.toISOString(),
        timeMax: rangeEnd.toISOString(),
        items: [{ id: calendarId }],
      },
    })

    const busySlots: TimeSlot[] =
      freebusyRes.data.calendars?.[calendarId]?.busy?.map(b => ({
        start: b.start!,
        end: b.end!,
      })) ?? []

    const durationMs = Number(durationMinutes) * 60 * 1000
    const freeSlots = findFreeSlots(busySlots, rangeStart, rangeEnd, durationMs)

    return {
      freeSlots,
      busySlots,
      durationMinutes,
      searchRange: { start: dateRangeStart, end: dateRangeEnd },
    }
  },
}

const createEventTool: Tool = {
  name: 'calendar_create_event',
  description:
    'Create a new Google Calendar event. This is irreversible without manual deletion — confirm with user before calling.',
  riskLevel: 'dangerous',
  requiredCapabilityLevel: 3,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      title: { type: 'string', description: 'Event title / summary' },
      startTime: { type: 'string', description: 'Start time (ISO 8601)' },
      endTime: { type: 'string', description: 'End time (ISO 8601)' },
      description: { type: 'string', description: 'Event description (optional)' },
      location: { type: 'string', description: 'Event location (optional)' },
      attendees: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of attendee email addresses (optional)',
      },
      calendarId: { type: 'string', description: 'Calendar ID (default "primary")' },
      sendNotifications: {
        type: 'boolean',
        description: 'Send email invites to attendees (default true)',
      },
    },
    required: ['userId', 'title', 'startTime', 'endTime'],
  },
  execute: async (args, _context) => {
    const {
      userId,
      title,
      startTime,
      endTime,
      description,
      location,
      attendees = [],
      calendarId = 'primary',
      sendNotifications = true,
    } = args as {
      userId: string
      title: string
      startTime: string
      endTime: string
      description?: string
      location?: string
      attendees?: string[]
      calendarId?: string
      sendNotifications?: boolean
    }

    const auth = await getAuthenticatedClient(userId, 'google_calendar')
    const calendar = google.calendar({ version: 'v3', auth })

    const res = await calendar.events.insert({
      calendarId,
      sendUpdates: sendNotifications ? 'all' : 'none',
      requestBody: {
        summary: title,
        description,
        location,
        start: { dateTime: toRFC3339(startTime) },
        end: { dateTime: toRFC3339(endTime) },
        attendees: attendees.map(email => ({ email })),
      },
    })

    return {
      eventId: res.data.id,
      htmlLink: res.data.htmlLink,
      summary: res.data.summary,
      start: res.data.start?.dateTime ?? res.data.start?.date,
      end: res.data.end?.dateTime ?? res.data.end?.date,
      status: res.data.status,
    }
  },
}

const updateEventTool: Tool = {
  name: 'calendar_update_event',
  description: 'Update an existing Google Calendar event. Modifies the event in place.',
  riskLevel: 'dangerous',
  requiredCapabilityLevel: 3,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      eventId: { type: 'string', description: 'The event ID to update' },
      calendarId: { type: 'string', description: 'Calendar ID (default "primary")' },
      updates: {
        type: 'object',
        description: 'Fields to update',
        properties: {
          title: { type: 'string' },
          startTime: { type: 'string' },
          endTime: { type: 'string' },
          description: { type: 'string' },
          location: { type: 'string' },
          attendees: {
            type: 'array',
            items: { type: 'string' },
            description: 'Full replacement list of attendee emails',
          },
        },
      },
      sendNotifications: {
        type: 'boolean',
        description: 'Send update notifications to attendees (default true)',
      },
    },
    required: ['userId', 'eventId', 'updates'],
  },
  execute: async (args, _context) => {
    const {
      userId,
      eventId,
      calendarId = 'primary',
      updates = {},
      sendNotifications = true,
    } = args as {
      userId: string
      eventId: string
      calendarId?: string
      updates: {
        title?: string
        startTime?: string
        endTime?: string
        description?: string
        location?: string
        attendees?: string[]
      }
      sendNotifications?: boolean
    }

    const auth = await getAuthenticatedClient(userId, 'google_calendar')
    const calendar = google.calendar({ version: 'v3', auth })

    // Fetch existing event first to do a patch
    const existing = await calendar.events.get({ calendarId, eventId })

    const patchBody: Record<string, unknown> = {}
    if (updates.title !== undefined) patchBody.summary = updates.title
    if (updates.description !== undefined) patchBody.description = updates.description
    if (updates.location !== undefined) patchBody.location = updates.location
    if (updates.startTime !== undefined) patchBody.start = { dateTime: toRFC3339(updates.startTime) }
    if (updates.endTime !== undefined) patchBody.end = { dateTime: toRFC3339(updates.endTime) }
    if (updates.attendees !== undefined) {
      patchBody.attendees = updates.attendees.map(email => ({ email }))
    }

    const res = await calendar.events.patch({
      calendarId,
      eventId,
      sendUpdates: sendNotifications ? 'all' : 'none',
      requestBody: patchBody,
    })

    return {
      eventId: res.data.id,
      htmlLink: res.data.htmlLink,
      summary: res.data.summary,
      start: res.data.start?.dateTime ?? res.data.start?.date,
      end: res.data.end?.dateTime ?? res.data.end?.date,
      updated: res.data.updated,
    }
  },
}

const deleteEventTool: Tool = {
  name: 'calendar_delete_event',
  description:
    'Delete a Google Calendar event permanently. This action is irreversible — always confirm with user first.',
  riskLevel: 'dangerous',
  requiredCapabilityLevel: 3,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      eventId: { type: 'string', description: 'The event ID to delete' },
      calendarId: { type: 'string', description: 'Calendar ID (default "primary")' },
      sendNotifications: {
        type: 'boolean',
        description: 'Send cancellation notifications to attendees (default true)',
      },
    },
    required: ['userId', 'eventId'],
  },
  execute: async (args, _context) => {
    const {
      userId,
      eventId,
      calendarId = 'primary',
      sendNotifications = true,
    } = args as {
      userId: string
      eventId: string
      calendarId?: string
      sendNotifications?: boolean
    }

    const auth = await getAuthenticatedClient(userId, 'google_calendar')
    const calendar = google.calendar({ version: 'v3', auth })

    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: sendNotifications ? 'all' : 'none',
    })

    return { success: true, eventId, action: 'deleted' }
  },
}

// ---------------------------------------------------------------------------
// Registration functions
// ---------------------------------------------------------------------------

const READ_TOOLS: Tool[] = [listEventsTool, getEventTool, findAvailabilityTool]
const ALL_TOOLS: Tool[] = [
  ...READ_TOOLS,
  createEventTool,
  updateEventTool,
  deleteEventTool,
]

/**
 * Register only read-safe calendar tools (Sprint 1 default).
 */
export function registerCalendarReadTools(): void {
  for (const tool of READ_TOOLS) {
    globalToolRegistry.register(tool)
  }
}

/**
 * Register all calendar tools including dangerous write/delete ones.
 * Policy enforcement gates execution — these are registered but not auto-approved.
 */
export function registerCalendarAllTools(): void {
  for (const tool of ALL_TOOLS) {
    globalToolRegistry.register(tool)
  }
}

export { ALL_TOOLS as calendarTools }
