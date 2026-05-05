/**
 * Input validation helpers for API routes.
 * Prevents common injection and malformed data issues.
 */

export function sanitizeString(input: unknown, maxLength = 10000): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).trim();
}

export function validateEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

export function validateUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return url;
  } catch {
    return null;
  }
}

export function validatePositiveInt(value: unknown, max = 10000): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > max || !Number.isInteger(n)) return null;
  return n;
}

export function validateEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  if (typeof value !== 'string') return null;
  return allowed.includes(value as T) ? (value as T) : null;
}

/** Validate an array of URLs (e.g., image URLs for video) */
export function validateUrlArray(urls: unknown, maxItems = 50): string[] | null {
  if (!Array.isArray(urls)) return null;
  if (urls.length === 0 || urls.length > maxItems) return null;
  const validated: string[] = [];
  for (const url of urls) {
    const v = validateUrl(url);
    if (!v) return null;
    validated.push(v);
  }
  return validated;
}

/** Validate base64 data URI */
export function validateDataUri(data: unknown, maxSizeMb = 10): string | null {
  if (typeof data !== 'string') return null;
  if (!data.startsWith('data:image/')) return null;
  // Rough size check — base64 is ~4/3 the original size
  const sizeBytes = (data.length * 3) / 4;
  if (sizeBytes > maxSizeMb * 1024 * 1024) return null;
  return data;
}
