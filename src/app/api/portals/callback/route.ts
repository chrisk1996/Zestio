// OAuth Callback Handler
// Handles OAuth redirect from real estate portals

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const OAUTH_CONFIGS = {
  immobilienscout24: {
    tokenUrl: 'https://api.immobilienscout24.de/oauth/token',
    clientId: process.env.IMMOSCOUT24_CLIENT_ID,
    clientSecret: process.env.IMMOSCOUT24_CLIENT_SECRET,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/portals/callback`,
  },
  homegate: {
    tokenUrl: 'https://api.homegate.ch/oauth/token',
    clientId: process.env.HOMEGATE_CLIENT_ID,
    clientSecret: process.env.HOMEGATE_CLIENT_SECRET,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/portals/callback`,
  },
};

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.redirect(new URL('/auth/login?error=unauthorized', request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/dashboard/listings?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Validate state
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/dashboard/listings?error=invalid_request', request.url)
    );
  }

  // Decode state to get portal
  let portal: string;
  try {
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    portal = stateData.portal;

    // Validate state belongs to user
    if (stateData.userId !== user.id) {
      throw new Error('State mismatch');
    }
  } catch (e) {
    return NextResponse.redirect(
      new URL('/dashboard/listings?error=invalid_state', request.url)
    );
  }

  const config = OAUTH_CONFIGS[portal as keyof typeof OAUTH_CONFIGS];
  if (!config) {
    return NextResponse.redirect(
      new URL(`/dashboard/listings?error=unknown_portal`, request.url)
    );
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.callbackUrl,
        client_id: config.clientId || '',
        client_secret: config.clientSecret || '',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Token exchange failed');
    }

    const tokenData = await tokenResponse.json();

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);

    // Store credentials in database
    const { error: upsertError } = await supabase
      .from('portal_credentials')
      .upsert({
        agent_id: user.id,
        portal_name: portal,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type || 'Bearer',
        expires_at: expiresAt.toISOString(),
        status: 'active',
        last_used_at: new Date().toISOString(),
      });

    if (upsertError) {
      console.error('Failed to store credentials:', upsertError);
      throw new Error('Failed to store credentials');
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/dashboard/listings?connected=${portal}`, request.url)
    );
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(
      new URL(`/dashboard/listings?error=connection_failed`, request.url)
    );
  }
}
