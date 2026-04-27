'use client';

import { useEffect } from 'react';

/**
 * Global error telemetry hook.
 * Captures unhandled errors and unhandled promise rejections,
 * logs them as structured JSON for Vercel log aggregation.
 *
 * Add <GlobalErrorTelemetry /> to your root layout.
 */
export function GlobalErrorTelemetry() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error(JSON.stringify({
        level: 'error',
        source: 'client-unhandled',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
      }));
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      console.error(JSON.stringify({
        level: 'error',
        source: 'client-unhandled-rejection',
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        timestamp: new Date().toISOString(),
      }));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
