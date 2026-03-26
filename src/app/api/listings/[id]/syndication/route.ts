// Syndication Logs API
// GET /api/listings/[id]/syndication - Get syndication logs for a listing

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Verify listing belongs to user
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id')
    .eq('id', id)
    .eq('agent_id', user.id)
    .single();

  if (listingError || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  // Fetch syndication logs
  const { data: logs, error } = await supabase
    .from('syndication_logs')
    .select('id, portal_name, status, portal_listing_id, portal_listing_url, error_message, created_at, completed_at')
    .eq('listing_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }

  return NextResponse.json(logs || []);
}
