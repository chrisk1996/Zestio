// Check KIRI task status and download result
// POST /api/tour-scans/[id]/check-status

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getTaskStatus } from '@/lib/kiri';

export const dynamic = 'force-dynamic';

export async function POST(
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

    // Get scan record
    const { data: scan, error: scanError } = await supabase
      .from('tour_scans')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (scanError || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    if (!scan.kiri_task_id) {
      return NextResponse.json({ error: 'No KIRI task associated with this scan' }, { status: 400 });
    }

    if (scan.status === 'done') {
      return NextResponse.json({ scan, message: 'Already completed' });
    }

    // Poll KIRI API
    let kiriStatus;
    try {
      kiriStatus = await getTaskStatus(scan.kiri_task_id);
    } catch (err) {
      console.error('[CheckStatus] KIRI API error:', err);
      return NextResponse.json({
        scan,
        message: 'Unable to reach KIRI Engine. Try again in a moment.',
        kiriAvailable: false,
      });
    }

    // Handle completed task
    if (kiriStatus.status === 'completed' && kiriStatus.resultUrl) {
      try {
        // Download the result file
        const resultResponse = await fetch(kiriStatus.resultUrl);
        if (!resultResponse.ok) {
          throw new Error(`Failed to download result: ${resultResponse.status}`);
        }

        const resultBuffer = await resultResponse.arrayBuffer();
        const storagePath = `${user.id}/${scan.id}/result.splat`;

        // Upload to Supabase storage
        const { error: uploadError } = await admin.storage
          .from('tour-scans')
          .upload(storagePath, resultBuffer, {
            contentType: 'application/octet-stream',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = admin.storage
          .from('tour-scans')
          .getPublicUrl(storagePath);

        // Update scan record
        const { data: updatedScan } = await admin
          .from('tour_scans')
          .update({
            status: 'done',
            splat_file_url: urlData.publicUrl,
            splat_file_path: storagePath,
            completed_at: new Date().toISOString(),
          })
          .eq('id', scan.id)
          .select()
          .single();

        return NextResponse.json({ scan: updatedScan, message: '3D tour ready!' });
      } catch (downloadErr) {
        console.error('[CheckStatus] Download/upload error:', downloadErr);
        await admin.from('tour_scans')
          .update({
            status: 'failed',
            error_message: `Failed to save result: ${downloadErr instanceof Error ? downloadErr.message : 'Unknown error'}`,
          })
          .eq('id', scan.id);

        return NextResponse.json({
          scan: { ...scan, status: 'failed' },
          message: 'Failed to save 3D tour result.',
        });
      }
    }

    // Handle failed task
    if (kiriStatus.status === 'failed') {
      await admin.from('tour_scans')
        .update({
          status: 'failed',
          error_message: kiriStatus.errorMessage || 'KIRI Engine processing failed',
        })
        .eq('id', scan.id);

      return NextResponse.json({
        scan: { ...scan, status: 'failed' },
        message: kiriStatus.errorMessage || 'Processing failed on KIRI Engine.',
      });
    }

    // Still processing
    return NextResponse.json({
      scan,
      message: 'Still processing...',
      kiriStatus: kiriStatus.status,
    });
  } catch (err) {
    console.error('[CheckStatus] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
