export const runtime = 'edge'
import { NextResponse, NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
]

const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
]

export async function GET(req: NextRequest) {
  let authUser: { userId: string }
  try {
    authUser = await getAuthUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const scope = searchParams.get('scope') ?? 'gmail'

  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
  }

  const scopes = scope === 'calendar' ? CALENDAR_SCOPES : GMAIL_SCOPES

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: JSON.stringify({ scope, userId: authUser.userId }),
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}
