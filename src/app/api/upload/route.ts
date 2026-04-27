import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { uploadImage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * POST /api/upload
 * Upload an image to Supabase Storage.
 * Body: { image: string (base64 data URI), folder?: string }
 * Returns: { url: string, path: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { image, folder = `users/${user.id}` } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Image data URI is required' }, { status: 400 });
    }

    const result = await uploadImage(image, 'images', folder);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
