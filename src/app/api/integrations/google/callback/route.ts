import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { users, oauthTokens } from '@/lib/db/schema'

const ALGORITHM = 'aes-256-cbc'

function getEncryptionKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY
  if (!hex) throw new Error('TOKEN_ENCRYPTION_KEY not set')
  return Buffer.from(hex, 'hex')
}

function encryptToken(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decryptToken(ciphertext: string): string {
  const key = getEncryptionKey()
  const [ivHex, encHex] = ciphertext.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const encrypted = Buffer.from(encHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/dashboard?error=oauth_denied', req.url))
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(new URL('/dashboard?error=oauth_invalid', req.url))
  }

  let state: { scope: string; userId: string }
  try {
    state = JSON.parse(stateParam)
  } catch {
    return NextResponse.redirect(new URL('/dashboard?error=oauth_invalid_state', req.url))
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL('/dashboard?error=oauth_not_configured', req.url))
  }

  // Exchange code for tokens
  let tokenData: TokenResponse
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed: ${tokenRes.status}`)
    }

    tokenData = await tokenRes.json()
  } catch (err) {
    console.error('OAuth token exchange error:', err)
    return NextResponse.redirect(new URL('/dashboard?error=oauth_token_exchange_failed', req.url))
  }

  // Look up user in DB
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, state.userId))
    .limit(1)

  if (userRows.length === 0) {
    return NextResponse.redirect(new URL('/dashboard?error=user_not_found', req.url))
  }

  const dbUser = userRows[0]
  const provider = state.scope === 'calendar' ? 'google_calendar' : 'gmail'
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
  const scopes = tokenData.scope.split(' ')

  const accessTokenEnc = encryptToken(tokenData.access_token)
  const refreshTokenEnc = tokenData.refresh_token
    ? encryptToken(tokenData.refresh_token)
    : null

  // Upsert token
  const existing = await db
    .select({ id: oauthTokens.id })
    .from(oauthTokens)
    .where(eq(oauthTokens.userId, dbUser.id))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(oauthTokens)
      .set({
        accessTokenEnc,
        refreshTokenEnc,
        expiresAt,
        scopes,
        updatedAt: new Date(),
      })
      .where(eq(oauthTokens.id, existing[0].id))
  } else {
    await db.insert(oauthTokens).values({
      userId: dbUser.id,
      provider,
      accessTokenEnc,
      refreshTokenEnc,
      expiresAt,
      scopes,
    })
  }

  return NextResponse.redirect(new URL('/dashboard?connected=' + provider, req.url))
}
