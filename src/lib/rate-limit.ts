/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window counter per IP/user.
 * 
 * For production with multiple instances, use Redis-backed rate limiting.
 * This is sufficient for single-instance Vercel deployments.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const limits = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of limits) {
    if (now > entry.resetAt) {
      limits.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Max requests per window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export const RATE_LIMITS = {
  /** Public endpoints (enhance, staging) */
  public: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10/hour
  /** Standard authenticated endpoints */
  authenticated: { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100/hour
  /** Pro/Enterprise subscribers */
  premium: { maxRequests: 500, windowMs: 60 * 60 * 1000 }, // 500/hour
  /** Video/stitching (expensive operations) */
  expensive: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20/hour
  /** Webhook endpoints */
  webhook: { maxRequests: 1000, windowMs: 60 * 60 * 1000 }, // 1000/hour
} as const;

export type RateLimitTier = keyof typeof RATE_LIMITS;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = limits.get(key);

  // No entry or expired window → start fresh
  if (!entry || now > entry.resetAt) {
    limits.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  // Within window
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get rate limit headers for the response.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.remaining > 0 ? result.remaining + 1 : 0),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}
