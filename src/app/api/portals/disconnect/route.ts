// Portal Disconnect Route
// Revokes OAuth credentials for a portal

// Force dynamic rendering - uses cookies/auth
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// DELETE /api/portals/disconnect?portal=immobilienscout24
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const portal = searchParams.get('portal');

  if (!portal) {
    return NextResponse.json({ error: 'Portal parameter required' }, { status: 400 });
  }

  // Delete credentials
  const { error } = await supabase
    .from('portal_credentials')
    .delete()
    .eq('agent_id', user.id)
    .eq('portal_name', portal);

  if (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: `${portal} disconnected` });
}
