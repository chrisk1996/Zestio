// Tour Scans API
// POST /api/tour-scans - Create new tour scan
// GET /api/tour-scans - List user's tour scans

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { CREDIT_COSTS } from '@/lib/pricing';
import { logCreditTransaction } from '@/lib/credit-transactions';
import { createTask } from '@/lib/kiri';

export const dynamic = 'force-dynamic';

const MAX_IMAGES = 200;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List user's tour scans
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: scans, error } = await supabase
      .from('tour_scans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ scans });
  } catch (err) {
    console.error('[TourScans] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new tour scan
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check credits
    const { data: userData } = await supabase
      .from('zestio_users')
      .select('credits, used_credits')
      .eq('id', user.id)
      .single();

    const creditsNeeded = CREDIT_COSTS.TOUR_3D_SCAN;
    if ((userData?.credits ?? 0) < creditsNeeded) {
      return NextResponse.json({ error: 'Insufficient credits', creditsNeeded }, { status: 402 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const title = formData.get('title') as string | null;
    const roomsRaw = formData.get('rooms') as string | null;
    const rooms: string[] = roomsRaw ? JSON.parse(roomsRaw) : [];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_IMAGES) {
      return NextResponse.json({ error: `Maximum ${MAX_IMAGES} files allowed` }, { status: 400 });
    }

    // Validate files
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.type}. Accepted: jpg, png, webp, mp4` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 50MB limit` },
          { status: 400 }
        );
      }
    }

    // Create scan record
    const admin = getAdminSupabase();
    const { data: scan, error: scanError } = await admin
      .from('tour_scans')
      .insert({
        user_id: user.id,
        title: title || `3D Tour ${new Date().toLocaleDateString()}`,
        status: 'uploading',
        image_count: files.length,
        credits_used: creditsNeeded,
        metadata: rooms.length > 0 ? { rooms } : {},
      })
      .select()
      .single();

    if (scanError) {
      console.error('[TourScans] Insert error:', scanError);
      return NextResponse.json({ error: scanError.message }, { status: 500 });
    }

    // Upload images to Supabase storage
    const imageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop() || 'jpg';
      const storagePath = `${user.id}/${scan.id}/${Date.now()}-${i}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadError } = await admin.storage
        .from('tour-uploads')
        .upload(storagePath, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('[TourScans] Upload error:', uploadError);
        continue;
      }

      const { data: urlData } = admin.storage
        .from('tour-uploads')
        .getPublicUrl(storagePath);

      if (urlData?.publicUrl) {
        imageUrls.push(urlData.publicUrl);
      }
    }

    if (imageUrls.length === 0) {
      await admin.from('tour_scans').update({ status: 'failed', error_message: 'All file uploads failed' }).eq('id', scan.id);
      return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
    }

    // Update image count and set thumbnail from first image
    const thumbnailUrl = imageUrls.length > 0 ? imageUrls[0] : null;
    await admin.from('tour_scans')
      .update({ image_count: imageUrls.length, thumbnail_url: thumbnailUrl })
      .eq('id', scan.id);

    // Call KIRI API to create processing task
    let kiriTaskId: string | null = null;
    try {
      const kiriResult = await createTask(imageUrls);
      kiriTaskId = kiriResult.taskId;
    } catch (kiriErr) {
      console.error('[TourScans] KIRI API error:', kiriErr);
      await admin.from('tour_scans')
        .update({
          status: 'failed',
          error_message: `KIRI Engine unavailable: ${kiriErr instanceof Error ? kiriErr.message : 'Unknown error'}. Please try again later.`,
        })
        .eq('id', scan.id);
      return NextResponse.json({
        error: '3D processing service is currently unavailable. Please try again later.',
        scan: { ...scan, status: 'failed' },
      }, { status: 503 });
    }

    // Update scan with KIRI task ID and set status to processing
    const { data: updatedScan } = await admin
      .from('tour_scans')
      .update({
        kiri_task_id: kiriTaskId,
        status: 'processing',
      })
      .eq('id', scan.id)
      .select()
      .single();

    // Deduct credits
    try {
      await supabase.rpc('deduct_credits', { p_user_id: user.id, p_amount: creditsNeeded });
    } catch {
      await supabase
        .from('zestio_users')
        .update({
          credits: Math.max(0, (userData?.credits ?? 0) - creditsNeeded),
          used_credits: (userData?.used_credits ?? 0) + creditsNeeded,
        })
        .eq('id', user.id);
    }
    logCreditTransaction({
      userId: user.id,
      type: 'usage',
      amount: -creditsNeeded,
      description: '3D Tour scan',
    }).catch(() => {});

    return NextResponse.json({ scan: updatedScan || scan }, { status: 201 });
  } catch (err) {
    console.error('[TourScans] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
