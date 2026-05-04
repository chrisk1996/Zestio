// Lazy-initialized Paddle client — avoids Turbopack build issues with static imports

type PaddleInstance = any;

let paddle: PaddleInstance | null = null;

async function getPaddleModule() {
  return await import('@paddle/paddle-node-sdk');
}

export async function getPaddle(): Promise<PaddleInstance> {
  if (!paddle) {
    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey) {
      throw new Error('PADDLE_API_KEY environment variable is not set');
    }
    const { Paddle, Environment } = await getPaddleModule();
    const isProduction = process.env.NEXT_PUBLIC_PADDLE_ENV === 'production';
    paddle = new Paddle(apiKey, {
      environment: isProduction ? Environment.production : Environment.sandbox,
    });
  }
  return paddle;
}

/** Check if Paddle is configured (env vars present) */
export function isPaddleConfigured(): boolean {
  return !!(process.env.PADDLE_API_KEY && process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);
}

// Price ID mapping
export const PADDLE_PRICES = {
  pro: process.env.PADDLE_PRO_PRICE_ID || '',
  enterprise: process.env.PADDLE_ENTERPRISE_PRICE_ID || '',
  topup_50: process.env.PADDLE_TOPUP_50_PRICE_ID || '',
  topup_200: process.env.PADDLE_TOPUP_200_PRICE_ID || '',
  topup_500: process.env.PADDLE_TOPUP_500_PRICE_ID || '',
} as const;

// Top-up credit amounts by price ID
export const PADDLE_TOPUP_CREDITS: Record<string, number> = {
  [PADDLE_PRICES.topup_50]: 50,
  [PADDLE_PRICES.topup_200]: 200,
  [PADDLE_PRICES.topup_500]: 500,
};

// Get plan from Paddle price ID
export function getPlanFromPriceId(priceId: string): string {
  if (priceId === PADDLE_PRICES.pro) return 'pro';
  if (priceId === PADDLE_PRICES.enterprise) return 'enterprise';
  return 'free';
}

// Get top-up credits from price ID
export function getTopupCreditsFromPriceId(priceId: string): number | null {
  return PADDLE_TOPUP_CREDITS[priceId] ?? null;
}

// Re-export unmarshal for webhook verification (lazy, instance-based)
export async function unmarshal(body: string, secret: string, signature: string) {
  const paddle = await getPaddle();
  return paddle.webhooks.unmarshal(body, secret, signature);
}
