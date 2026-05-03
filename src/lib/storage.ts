import { createClient } from '@/utils/supabase/server';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * Upload an image to Supabase Storage and return the public URL.
 * Accepts both base64 data URIs and Files.
 */
export async function uploadImage(
  data: string | File,
  bucket: string = 'images',
  folder: string = 'uploads'
): Promise<{ url: string; path: string }> {
  const supabase = await createClient();

  let fileBody: Blob | ArrayBuffer;
  let contentType: string;
  let ext: string;

  if (typeof data === 'string') {
    // Base64 data URI
    if (!data.startsWith('data:')) {
      throw new Error('Invalid data URI');
    }
    const match = data.match(/^data:(image\/\w+);base64,/);
    if (!match) throw new Error('Invalid image data URI format');
    contentType = match[1];
    if (!ALLOWED_TYPES.includes(contentType)) {
      throw new Error(`Unsupported image type: ${contentType}`);
    }
    ext = contentType.split('/')[1] === 'jpeg' ? 'jpg' : contentType.split('/')[1];

    const base64 = data.split(',')[1];
    const binary = atob(base64);

    if (binary.length > MAX_SIZE) {
      throw new Error('Image too large (max 20MB)');
    }

    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    fileBody = bytes;
  } else {
    // File object
    if (!ALLOWED_TYPES.includes(data.type)) {
      throw new Error(`Unsupported image type: ${data.type}`);
    }
    if (data.size > MAX_SIZE) {
      throw new Error('Image too large (max 20MB)');
    }
    contentType = data.type;
    ext = data.name.split('.').pop() || 'jpg';
    fileBody = data;
  }

  // Ensure bucket exists (idempotent)
  const { error: bucketError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: MAX_SIZE,
    allowedMimeTypes: ALLOWED_TYPES,
  });
  // Ignore error if bucket already exists
  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('[Storage] Bucket creation error:', bucketError);
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, fileBody, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return { url: urlData.publicUrl, path };
}

/**
 * Download a remote image URL and upload to Supabase Storage.
 * Returns the permanent public URL. Falls back to original URL on failure.
 */
export async function persistRemoteImage(
  remoteUrl: string,
  bucket: string = 'images',
  folder: string = 'generated'
): Promise<string> {
  try {
    const response = await fetch(remoteUrl, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) return remoteUrl;

    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.length < 100) return remoteUrl; // too small, probably error

    const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg'
      : contentType.includes('webp') ? 'webp'
      : contentType.includes('avif') ? 'avif'
      : 'png';

    const supabase = await createClient();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType, upsert: false });

    if (uploadError) {
      console.warn('[Storage] Upload failed:', uploadError.message);
      return remoteUrl;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
  } catch (err) {
    console.warn('[Storage] persistRemoteImage failed:', err);
    return remoteUrl;
  }
}

/**
 * Delete an image from Supabase Storage by path.
 */
export async function deleteImage(path: string, bucket: string = 'images'): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
