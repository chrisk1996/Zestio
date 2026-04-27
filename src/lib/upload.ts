/**
 * Client-side utility to upload an image to Supabase Storage.
 * Converts base64 data URI → File → uploads via /api/upload.
 * Returns the public URL.
 */
export async function uploadImageToStorage(base64DataUri: string): Promise<string> {
  // Extract mime type and base64 data
  const match = base64DataUri.match(/^data:(image\/\w+);base64,/);
  if (!match) throw new Error('Invalid image data URI');

  const mimeType = match[1];
  const base64 = base64DataUri.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
  const file = new File([bytes], `upload.${ext}`, { type: mimeType });

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64DataUri }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Upload failed');
  }

  const data = await res.json();
  return data.url;
}
