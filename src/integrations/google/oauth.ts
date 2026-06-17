import { google } from 'googleapis'
import { db } from '@/lib/db'
import { oauthTokens } from '@/lib/db/schema'
import { encrypt, decrypt } from '@/lib/crypto'
import { eq, and } from 'drizzle-orm'

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
]

const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
]

export function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  )
}

export function getGmailAuthUrl(state: string): string {
  const client = createOAuthClient()
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [...GMAIL_SCOPES, ...CALENDAR_SCOPES],
    state,
    prompt: 'consent',
  })
}

export async function exchangeCode(code: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresAt: Date
}> {
  const client = createOAuthClient()
  const { tokens } = await client.getToken(code)
  if (!tokens.access_token) throw new Error('No access token returned')
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? '',
    expiresAt: new Date(tokens.expiry_date ?? Date.now() + 3600_000),
  }
}

export async function storeGoogleTokens(
  userId: string,
  tokens: {
    accessToken: string
    refreshToken: string
    expiresAt: Date
  }
): Promise<void> {
  const encAccess = encrypt(tokens.accessToken)
  const encRefresh = encrypt(tokens.refreshToken)

  // Upsert for both gmail and google_calendar (one Google OAuth covers both)
  for (const provider of ['gmail', 'google_calendar'] as const) {
    const existing = await db.query.oauthTokens.findFirst({
      where: and(eq(oauthTokens.userId, userId), eq(oauthTokens.provider, provider)),
    })
    if (existing) {
      await db
        .update(oauthTokens)
        .set({
          accessTokenEnc: encAccess,
          refreshTokenEnc: encRefresh,
          expiresAt: tokens.expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(oauthTokens.id, existing.id))
    } else {
      await db.insert(oauthTokens).values({
        userId,
        provider,
        accessTokenEnc: encAccess,
        refreshTokenEnc: encRefresh,
        expiresAt: tokens.expiresAt,
        scopes:
          provider === 'gmail'
            ? ['gmail.readonly', 'gmail.compose', 'gmail.send', 'gmail.modify']
            : ['calendar.readonly', 'calendar.events'],
      })
    }
  }
}

export async function getAuthenticatedClient(
  userId: string,
  provider: 'gmail' | 'google_calendar'
) {
  const tokenRow = await db.query.oauthTokens.findFirst({
    where: and(eq(oauthTokens.userId, userId), eq(oauthTokens.provider, provider)),
  })
  if (!tokenRow) throw new Error(`Not connected to ${provider}`)

  const accessToken = decrypt(tokenRow.accessTokenEnc)
  const refreshToken = tokenRow.refreshTokenEnc
    ? decrypt(tokenRow.refreshTokenEnc)
    : undefined

  const client = createOAuthClient()
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: tokenRow.expiresAt?.getTime(),
  })

  // Auto-refresh if expired
  if (tokenRow.expiresAt && tokenRow.expiresAt < new Date()) {
    const { credentials } = await client.refreshAccessToken()
    if (credentials.access_token) {
      await db
        .update(oauthTokens)
        .set({
          accessTokenEnc: encrypt(credentials.access_token),
          expiresAt: new Date(credentials.expiry_date ?? Date.now() + 3600_000),
          updatedAt: new Date(),
        })
        .where(eq(oauthTokens.id, tokenRow.id))
    }
  }

  return client
}
