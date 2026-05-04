// Tour Scan Detail API
// GET /api/tour-scans/[id] - Get scan details
// PATCH /api/tour-scans/[id] - Update title, is_public
// DELETE /api/tour-scans/[id] - Delete scan

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: scan, error } = await supabase
      .from('tour_scans')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    return NextResponse.json({ scan });
  } catch (err) {
    console.error('[TourScan] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.title === 'string') {
      updates.title = body.title;
    }
    if (typeof body.is_public === 'boolean') {
      updates.is_public = body.is_public;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: scan, error } = await supabase
      .from('tour_scans')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !scan) {
      return NextResponse.json({ error: 'Scan not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ scan });
  } catch (err) {
    console.error('[TourScan] PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get scan to clean up files
    const { data: scan } = await supabase
      .from('tour_scans')
      .select('splat_file_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    // Clean up storage files
    try {
      if (scan.splat_file_path) {
        await admin.storage.from('tour-scans').remove([scan.splat_file_path]);
      }
      // Remove all uploaded images for this scan
      const { data: uploadList } = await admin.storage
        .from('tour-uploads')
        .list(`${user.id}/${id}`);
      if (uploadList && uploadList.length > 0) {
        const paths = uploadList.map(f => `${user.id}/${id}/${f.name}`);
        await admin.storage.from('tour-uploads').remove(paths);
      }
    } catch (cleanupErr) {
      console.warn('[TourScan] Cleanup error:', cleanupErr);
    }

    // Delete the record
    const { error } = await supabase
      .from('tour_scans')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[TourScan] DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
