import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth provider errors (e.g. user denied access)
  if (errorParam) {
    console.error(`[Auth Callback] OAuth error: ${errorParam} — ${errorDescription}`)
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(errorDescription || errorParam)}`)
  }

  const supabase = await createClient()

  // PKCE code flow (standard email + OAuth)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error(`[Auth Callback] Code exchange failed: ${error.message}`)
  }

  // Token hash flow (email confirmation) — redirect new signups to welcome
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email' | 'recovery' | 'invite',
    })
    if (!error) {
      const redirectTo = type === 'signup'
        ? `${origin}/dashboard?welcome=1`
        : `${origin}${next}`;
      return NextResponse.redirect(redirectTo);
    }
    console.error(`[Auth Callback] OTP verification failed: ${error.message}`)
  }

  return NextResponse.redirect(`${origin}/auth?error=Unable to authenticate`)
}
