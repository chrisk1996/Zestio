import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getPaddle, PADDLE_PRICES, isPaddleConfigured } from '@/lib/paddle';

export const dynamic = 'force-dynamic';

/**
 * Create a Paddle checkout transaction for subscriptions or credit top-ups.
 * This replaces the legacy Stripe checkout endpoint.
 */
export async function POST(request: NextRequest) {
  if (!isPaddleConfigured()) {
    return NextResponse.json({ error: 'Paddle is not configured' }, { status: 503 });
  }

  try {
    const paddle = await getPaddle();
    const supabase = await createClient();
    const baseUrl =
      process.env.NEXT_PUBLIC_URL ||
      request.headers.get('origin') ||
      `https://${request.headers.get('host')}`;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, plan, topUpCredits } = body as {
      priceId?: string;
      plan?: string;
      topUpCredits?: number;
    };

    // Resolve price ID and build metadata
    let resolvedPriceId: string;
    let customData: Record<string, string>;

    if (topUpCredits) {
      const credits = Number(topUpCredits);
      if (![50, 200, 500].includes(credits)) {
        return NextResponse.json({ error: 'Invalid top-up amount' }, { status: 400 });
      }
      const key = `topup_${credits}` as keyof typeof PADDLE_PRICES;
      resolvedPriceId = PADDLE_PRICES[key];
      customData = { user_id: user.id, type: 'topup', credits: String(credits) };
    } else if (plan && ['pro', 'enterprise'].includes(plan)) {
      resolvedPriceId = priceId || PADDLE_PRICES[plan as keyof typeof PADDLE_PRICES];
      customData = { user_id: user.id, type: 'subscription', plan };
    } else {
      return NextResponse.json({ error: 'Must provide plan or topUpCredits' }, { status: 400 });
    }

    if (!resolvedPriceId) {
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 });
    }

    // Get or create Paddle customer
    const { data: userData } = await supabase
      .from('zestio_users')
      .select('paddle_customer_id, email')
      .eq('id', user.id)
      .single();

    let customerId = userData?.paddle_customer_id || undefined;

    if (!customerId) {
      const customer = await paddle.customers.create({
        email: user.email!,
        name: user.user_metadata?.full_name || undefined,
        customData: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from('zestio_users')
        .update({ paddle_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create Paddle transaction
    const transaction = await paddle.transactions.create({
      collectionMode: 'automatic',
      customerId,
      customData,
      items: [{ priceId: resolvedPriceId, quantity: 1 }],
      checkout: {
        url: topUpCredits
          ? `${baseUrl}/billing?topup=success`
          : `${baseUrl}/billing?success=true`,
      },
    });

    return NextResponse.json({ transactionId: transaction.id });
  } catch (error) {
    console.error('[Paddle] Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 },
    );
  }
}
