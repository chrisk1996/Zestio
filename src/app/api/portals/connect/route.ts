// Portal OAuth Connection Routes
// Handles OAuth flow for real estate portals (ImmoScout24, Homegate, etc.)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Portal OAuth configurations
const OAUTH_CONFIGS = {
  immobilienscout24: {
    authorizeUrl: 'https://api.immobilienscout24.de/oauth/authorize',
    tokenUrl: 'https://api.immobilienscout24.de/oauth/token',
    scope: 'read write',
    clientId: process.env.IMMOSCOUT24_CLIENT_ID,
    clientSecret: process.env.IMMOSCOUT24_CLIENT_SECRET,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/portals/callback`,
  },
  homegate: {
    authorizeUrl: 'https://api.homegate.ch/oauth/authorize',
    tokenUrl: 'https://api.homegate.ch/oauth/token',
    scope: 'listing:write',
    clientId: process.env.HOMEGATE_CLIENT_ID,
    clientSecret: process.env.HOMEGATE_CLIENT_SECRET,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/portals/callback`,
  },
};

// GET /api/portals/connect - Initiate OAuth flow
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const portal = searchParams.get('portal') as keyof typeof OAUTH_CONFIGS;

  if (!portal || !OAUTH_CONFIGS[portal]) {
    return NextResponse.json(
      { error: 'Invalid portal. Supported: immobilienscout24, homegate' },
      { status: 400 }
    );
  }

  const config = OAUTH_CONFIGS[portal];

  // Generate state for CSRF protection
  const state = Buffer.from(JSON.stringify({
    portal,
    userId: user.id,
    timestamp: Date.now(),
  })).toString('base64');

  // Build authorization URL
  const authUrl = new URL(config.authorizeUrl);
  authUrl.searchParams.set('client_id', config.clientId || '');
  authUrl.searchParams.set('redirect_uri', config.callbackUrl);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', config.scope);
  authUrl.searchParams.set('state', state);

  // Store state in session for verification
  await supabase.from('portal_credentials').upsert({
    agent_id: user.id,
    portal_name: portal,
    status: 'pending',
    portal_metadata: { oauth_state: state },
  });

  return NextResponse.redirect(authUrl.toString());
}

// POST /api/portals/connect - Manual credential entry (for portals without OAuth)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { portal, apiKey, apiSecret, accountId } = body;

  const validPortals = ['immowelt', 'immonet', 'immobilier'];
  if (!validPortals.includes(portal)) {
    return NextResponse.json(
      { error: `Invalid portal. For OAuth portals, use GET /api/portals/connect?portal=xxx` },
      { status: 400 }
    );
  }

  // Store API credentials
  const { error } = await supabase.from('portal_credentials').upsert({
    agent_id: user.id,
    portal_name: portal,
    access_token: apiKey,
    portal_metadata: { api_secret: apiSecret, account_id: accountId },
    status: 'active',
    last_used_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to store credentials' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: `${portal} connected successfully` });
}
