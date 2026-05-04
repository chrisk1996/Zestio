'use client';

import { useEffect } from 'react';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';

// Store Paddle instance globally
let paddleInstance: Paddle | undefined;

export function PaddleProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;

    initializePaddle({
      environment:
        process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
          ? 'production'
          : 'sandbox',
      token,
    }).then((paddle) => {
      if (paddle) {
        paddleInstance = paddle;
        console.log('[Paddle] Client initialized');
      }
    }).catch((err) => {
      console.warn('[Paddle] Failed to initialize:', err);
    });
  }, []);

  return <>{children}</>;
}

export function getPaddleInstance() {
  return paddleInstance;
}
