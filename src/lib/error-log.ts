/**
 * Lightweight error logging for API routes.
 * In production, integrate with Sentry, Logflare, or similar.
 * For now, structured console logging with context.
 */

interface ErrorLogContext {
  endpoint: string;
  userId?: string;
  method?: string;
  [key: string]: unknown;
}

export function logApiError(error: unknown, context: ErrorLogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };

  // Structured JSON logging — easy to parse in Vercel logs
  console.error(JSON.stringify(entry));

  // In production, you could send to:
  // - Sentry: Sentry.captureException(error, { extra: context })
  // - Logflare: post to logflare endpoint
  // - Supabase: insert into error_logs table
}

export function logApiWarn(message: string, context: ErrorLogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level: 'warn',
    message,
    ...context,
  };
  console.warn(JSON.stringify(entry));
}
