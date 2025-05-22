import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { exchangeGoogleCode } from '@/lib/calendar-service'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.redirect(new URL('/profile?error=missing_code', request.url))
    }

    // Exchange code for tokens
    const tokens = await exchangeGoogleCode(code)
    if (!tokens) {
      return NextResponse.redirect(new URL('/profile?error=token_exchange_failed', request.url))
    }

    // Store connection in database
    const { error: storageError } = await supabase
      .from('calendar_connections')
      .insert({
        user_id: session.user.id,
        type: 'google',
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_at: new Date(Date.now() + (tokens.expiresAt - Date.now())).toISOString(),
        calendar_id: 'primary'
      })

    if (storageError) {
      console.error('Error storing calendar connection:', storageError)
      return NextResponse.redirect(new URL('/profile?error=storage_failed', request.url))
    }

    return NextResponse.redirect(new URL('/profile?success=calendar_connected', request.url))
  } catch (error) {
    console.error('Calendar callback error:', error)
    return NextResponse.redirect(new URL('/profile?error=callback_failed', request.url))
  }
} 