/**
 * Structured error logging for Zestio.
 *
 * In development: logs to console with full stack.
 * In production: logs structured JSON to console (picked up by Vercel logs).
 *
 * To upgrade to Sentry later:
 * 1. npm install @sentry/nextjs
 * 2. npx @sentry/wizard@latest -i nextjs
 * 3. Replace calls to logError with Sentry.captureException
 */

interface ErrorContext {
  [key: string]: unknown;
}

export function logError(error: unknown, context?: ErrorContext): void {
  const err = error instanceof Error ? error : new Error(String(error));

  const payload = {
    timestamp: new Date().toISOString(),
    message: err.message,
    stack: err.stack,
    ...context,
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('[Zestio Error]', payload);
  } else {
    // Structured JSON for Vercel/production log aggregation
    console.error(JSON.stringify({ level: 'error', ...payload }));
  }
}

export function logWarning(message: string, context?: ErrorContext): void {
  const payload = {
    timestamp: new Date().toISOString(),
    message,
    ...context,
  };

  if (process.env.NODE_ENV === 'development') {
    console.warn('[Zestio Warning]', payload);
  } else {
    console.warn(JSON.stringify({ level: 'warning', ...payload }));
  }
}

/**
 * Wrap an API route handler with error logging.
 * Returns a proper 500 JSON response on unhandled errors.
 */
export function withErrorLogging(
  handler: (request: Request, context?: { params: Promise<Record<string, string>> }) => Promise<Response>
): (request: Request, context?: { params: Promise<Record<string, string>> }) => Promise<Response> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      const { method, url } = request;
      logError(error, { method, url, source: 'api-route' });
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
