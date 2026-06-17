import { google } from 'googleapis'
import { getAuthenticatedClient } from '../google/oauth'
import { globalToolRegistry } from '@/runtime/tool-registry'
import type { Tool } from '@/runtime/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function decodeBase64Url(str: string): string {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
}

function extractBody(payload: any): string {
  if (!payload) return ''
  if (payload.body?.data) return decodeBase64Url(payload.body.data)
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data)
      }
    }
    // Fallback: return first part with body data
    for (const part of payload.parts) {
      if (part.body?.data) return decodeBase64Url(part.body.data)
    }
  }
  return ''
}

function getHeader(headers: Array<{ name: string; value: string }>, name: string): string {
  return headers?.find(h => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const listEmailsTool: Tool = {
  name: 'gmail_list_emails',
  description: 'List recent emails in the user\'s Gmail inbox. Optionally filter by label or query.',
  riskLevel: 'safe',
  requiredCapabilityLevel: 1,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      maxResults: { type: 'number', description: 'Max emails to return (default 10, max 50)' },
      labelIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter by label IDs e.g. ["INBOX", "UNREAD"]',
      },
      query: { type: 'string', description: 'Gmail search query string' },
    },
    required: ['userId'],
  },
  execute: async (args, _context) => {
    const { userId, maxResults = 10, labelIds, query } = args as {
      userId: string
      maxResults?: number
      labelIds?: string[]
      query?: string
    }
    const auth = await getAuthenticatedClient(userId, 'gmail')
    const gmail = google.gmail({ version: 'v1', auth })

    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: Math.min(Number(maxResults), 50),
      labelIds: labelIds as string[] | undefined,
      q: query as string | undefined,
    })

    const messages = listRes.data.messages ?? []
    if (messages.length === 0) return { emails: [] }

    // Fetch metadata for each message
    const emails = await Promise.all(
      messages.map(async m => {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: m.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        })
        const headers = msg.data.payload?.headers ?? []
        return {
          id: msg.data.id,
          threadId: msg.data.threadId,
          snippet: msg.data.snippet,
          subject: getHeader(headers, 'Subject'),
          from: getHeader(headers, 'From'),
          to: getHeader(headers, 'To'),
          date: getHeader(headers, 'Date'),
          labelIds: msg.data.labelIds,
        }
      })
    )

    return { emails }
  },
}

const getEmailTool: Tool = {
  name: 'gmail_get_email',
  description: 'Get the full content of a single Gmail message by its ID.',
  riskLevel: 'safe',
  requiredCapabilityLevel: 1,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      messageId: { type: 'string', description: 'The Gmail message ID' },
    },
    required: ['userId', 'messageId'],
  },
  execute: async (args, _context) => {
    const { userId, messageId } = args as { userId: string; messageId: string }
    const auth = await getAuthenticatedClient(userId, 'gmail')
    const gmail = google.gmail({ version: 'v1', auth })

    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    })

    const headers = msg.data.payload?.headers ?? []
    const body = extractBody(msg.data.payload)

    return {
      id: msg.data.id,
      threadId: msg.data.threadId,
      subject: getHeader(headers, 'Subject'),
      from: getHeader(headers, 'From'),
      to: getHeader(headers, 'To'),
      date: getHeader(headers, 'Date'),
      snippet: msg.data.snippet,
      body,
      labelIds: msg.data.labelIds,
    }
  },
}

const getThreadTool: Tool = {
  name: 'gmail_get_thread',
  description: 'Get the full conversation thread by thread ID, including all messages.',
  riskLevel: 'safe',
  requiredCapabilityLevel: 1,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      threadId: { type: 'string', description: 'The Gmail thread ID' },
    },
    required: ['userId', 'threadId'],
  },
  execute: async (args, _context) => {
    const { userId, threadId } = args as { userId: string; threadId: string }
    const auth = await getAuthenticatedClient(userId, 'gmail')
    const gmail = google.gmail({ version: 'v1', auth })

    const thread = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
      format: 'full',
    })

    const messages = (thread.data.messages ?? []).map(msg => {
      const headers = msg.payload?.headers ?? []
      return {
        id: msg.id,
        subject: getHeader(headers, 'Subject'),
        from: getHeader(headers, 'From'),
        to: getHeader(headers, 'To'),
        date: getHeader(headers, 'Date'),
        snippet: msg.snippet,
        body: extractBody(msg.payload),
        labelIds: msg.labelIds,
      }
    })

    return {
      threadId: thread.data.id,
      historyId: thread.data.historyId,
      messages,
    }
  },
}

const searchEmailsTool: Tool = {
  name: 'gmail_search_emails',
  description: 'Search Gmail using a query string (same syntax as Gmail search bar).',
  riskLevel: 'safe',
  requiredCapabilityLevel: 1,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      query: { type: 'string', description: 'Gmail search query (e.g. "from:boss@company.com subject:invoice")' },
      maxResults: { type: 'number', description: 'Max results to return (default 10, max 50)' },
    },
    required: ['userId', 'query'],
  },
  execute: async (args, _context) => {
    const { userId, query, maxResults = 10 } = args as {
      userId: string
      query: string
      maxResults?: number
    }
    const auth = await getAuthenticatedClient(userId, 'gmail')
    const gmail = google.gmail({ version: 'v1', auth })

    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: Math.min(Number(maxResults), 50),
    })

    const messages = listRes.data.messages ?? []
    if (messages.length === 0) return { results: [], totalEstimate: 0 }

    const results = await Promise.all(
      messages.map(async m => {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: m.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        })
        const headers = msg.data.payload?.headers ?? []
        return {
          id: msg.data.id,
          threadId: msg.data.threadId,
          snippet: msg.data.snippet,
          subject: getHeader(headers, 'Subject'),
          from: getHeader(headers, 'From'),
          to: getHeader(headers, 'To'),
          date: getHeader(headers, 'Date'),
        }
      })
    )

    return {
      results,
      totalEstimate: listRes.data.resultSizeEstimate ?? results.length,
    }
  },
}

const draftReplyTool: Tool = {
  name: 'gmail_draft_reply',
  description: 'Create a draft reply to an existing email. The draft is saved but NOT sent.',
  riskLevel: 'medium',
  requiredCapabilityLevel: 2,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      messageId: { type: 'string', description: 'The message ID to reply to' },
      body: { type: 'string', description: 'The reply body text (plain text)' },
    },
    required: ['userId', 'messageId', 'body'],
  },
  execute: async (args, _context) => {
    const { userId, messageId, body } = args as {
      userId: string
      messageId: string
      body: string
    }
    const auth = await getAuthenticatedClient(userId, 'gmail')
    const gmail = google.gmail({ version: 'v1', auth })

    // Fetch original message to get headers
    const original = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'metadata',
      metadataHeaders: ['From', 'To', 'Subject', 'Message-ID', 'References'],
    })

    const headers = original.data.payload?.headers ?? []
    const originalFrom = getHeader(headers, 'From')
    const originalSubject = getHeader(headers, 'Subject')
    const originalMsgId = getHeader(headers, 'Message-ID')
    const originalReferences = getHeader(headers, 'References')

    const subject = originalSubject.startsWith('Re:')
      ? originalSubject
      : `Re: ${originalSubject}`

    const references = originalReferences
      ? `${originalReferences} ${originalMsgId}`
      : originalMsgId

    const rawMessage = [
      `To: ${originalFrom}`,
      `Subject: ${subject}`,
      `In-Reply-To: ${originalMsgId}`,
      `References: ${references}`,
      `Content-Type: text/plain; charset=utf-8`,
      '',
      body,
    ].join('\r\n')

    const encoded = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const draft = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encoded,
          threadId: original.data.threadId ?? undefined,
        },
      },
    })

    return {
      draftId: draft.data.id,
      threadId: draft.data.message?.threadId,
      message: 'Draft created successfully. Use gmail_send_email to send it.',
    }
  },
}

const sendEmailTool: Tool = {
  name: 'gmail_send_email',
  description: 'Send an email via Gmail. This action is irreversible — use with caution.',
  riskLevel: 'dangerous',
  requiredCapabilityLevel: 3,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      to: { type: 'string', description: 'Recipient email address(es), comma-separated' },
      subject: { type: 'string', description: 'Email subject' },
      body: { type: 'string', description: 'Email body (plain text)' },
      cc: { type: 'string', description: 'CC email address(es), comma-separated (optional)' },
      replyToMessageId: {
        type: 'string',
        description: 'If replying, the original message ID (for threading)',
      },
    },
    required: ['userId', 'to', 'subject', 'body'],
  },
  execute: async (args, _context) => {
    const { userId, to, subject, body, cc, replyToMessageId } = args as {
      userId: string
      to: string
      subject: string
      body: string
      cc?: string
      replyToMessageId?: string
    }
    const auth = await getAuthenticatedClient(userId, 'gmail')
    const gmail = google.gmail({ version: 'v1', auth })

    let threadId: string | undefined
    let inReplyTo = ''
    let references = ''

    if (replyToMessageId) {
      const original = await gmail.users.messages.get({
        userId: 'me',
        id: replyToMessageId,
        format: 'metadata',
        metadataHeaders: ['Message-ID', 'References'],
      })
      threadId = original.data.threadId ?? undefined
      const headers = original.data.payload?.headers ?? []
      inReplyTo = getHeader(headers, 'Message-ID')
      const origRefs = getHeader(headers, 'References')
      references = origRefs ? `${origRefs} ${inReplyTo}` : inReplyTo
    }

    const headerLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/plain; charset=utf-8`,
    ]
    if (cc) headerLines.push(`Cc: ${cc}`)
    if (inReplyTo) headerLines.push(`In-Reply-To: ${inReplyTo}`)
    if (references) headerLines.push(`References: ${references}`)

    const rawMessage = [...headerLines, '', body].join('\r\n')

    const encoded = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const sent = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encoded,
        threadId,
      },
    })

    return {
      messageId: sent.data.id,
      threadId: sent.data.threadId,
      labelIds: sent.data.labelIds,
    }
  },
}

const archiveEmailTool: Tool = {
  name: 'gmail_archive_email',
  description: 'Archive an email by removing it from the inbox (removes INBOX label).',
  riskLevel: 'medium',
  requiredCapabilityLevel: 2,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      messageId: { type: 'string', description: 'The Gmail message ID to archive' },
    },
    required: ['userId', 'messageId'],
  },
  execute: async (args, _context) => {
    const { userId, messageId } = args as { userId: string; messageId: string }
    const auth = await getAuthenticatedClient(userId, 'gmail')
    const gmail = google.gmail({ version: 'v1', auth })

    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['INBOX'],
      },
    })

    return { success: true, messageId, action: 'archived' }
  },
}

const labelEmailTool: Tool = {
  name: 'gmail_label_email',
  description: 'Add or remove labels on a Gmail message.',
  riskLevel: 'medium',
  requiredCapabilityLevel: 2,
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
      messageId: { type: 'string', description: 'The Gmail message ID' },
      addLabelIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Label IDs to add (e.g. ["STARRED", "IMPORTANT"])',
      },
      removeLabelIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Label IDs to remove',
      },
    },
    required: ['userId', 'messageId'],
  },
  execute: async (args, _context) => {
    const { userId, messageId, addLabelIds = [], removeLabelIds = [] } = args as {
      userId: string
      messageId: string
      addLabelIds?: string[]
      removeLabelIds?: string[]
    }
    const auth = await getAuthenticatedClient(userId, 'gmail')
    const gmail = google.gmail({ version: 'v1', auth })

    const result = await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds,
        removeLabelIds,
      },
    })

    return {
      success: true,
      messageId: result.data.id,
      labelIds: result.data.labelIds,
    }
  },
}

// ---------------------------------------------------------------------------
// Registration functions
// ---------------------------------------------------------------------------

const READ_TOOLS: Tool[] = [listEmailsTool, getEmailTool, getThreadTool, searchEmailsTool]
const ALL_TOOLS: Tool[] = [
  ...READ_TOOLS,
  draftReplyTool,
  sendEmailTool,
  archiveEmailTool,
  labelEmailTool,
]

/**
 * Register only read-safe Gmail tools (Sprint 1 default).
 * Dangerous tools (send, archive, label, draft) are excluded.
 */
export function registerGmailReadTools(): void {
  for (const tool of READ_TOOLS) {
    globalToolRegistry.register(tool)
  }
}

/**
 * Register all Gmail tools including medium/dangerous ones.
 * Policy enforcement gates execution — these are available but not auto-approved.
 */
export function registerGmailAllTools(): void {
  for (const tool of ALL_TOOLS) {
    globalToolRegistry.register(tool)
  }
}

export { ALL_TOOLS as gmailTools }
