// Public share endpoint
// GET /api/tour-scans/[id]/share - Get public scan data (no auth required)

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: scan, error } = await admin
      .from('tour_scans')
      .select('id, title, splat_file_url, thumbnail_url, image_count, is_public, share_token, created_at')
      .eq('id', id)
      .eq('is_public', true)
      .single();

    if (error || !scan) {
      return NextResponse.json({ error: 'Tour not found or not publicly shared' }, { status: 404 });
    }

    return NextResponse.json({ scan });
  } catch (err) {
    console.error('[TourShare] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
