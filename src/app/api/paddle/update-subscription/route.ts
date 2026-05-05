import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getPaddle, PADDLE_PRICES, isPaddleConfigured } from '@/lib/paddle';

export const dynamic = 'force-dynamic';

/**
 * Update an existing Paddle subscription to a different plan.
 * Paddle handles proration automatically — charges/refunds for remaining time.
 *
 * Body: { plan: 'pro' | 'enterprise' }
 */
export async function POST(request: NextRequest) {
  if (!isPaddleConfigured()) {
    return NextResponse.json({ error: 'Paddle is not configured' }, { status: 503 });
  }

  try {
    const paddle = await getPaddle();
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body as { plan: 'pro' | 'enterprise' };

    if (!plan || !['pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan. Must be "pro" or "enterprise".' }, { status: 400 });
    }

    const priceId = PADDLE_PRICES[plan];
    if (!priceId) {
      return NextResponse.json({ error: `Price ID not configured for plan: ${plan}` }, { status: 500 });
    }

    // Get user's current subscription details
    const { data: userData } = await supabase
      .from('zestio_users')
      .select('paddle_subscription_id, paddle_customer_id, subscription_tier, subscription_status')
      .eq('id', user.id)
      .single();

    if (!userData?.paddle_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found. Please subscribe first.' },
        { status: 400 },
      );
    }

    if (userData.subscription_tier === plan) {
      return NextResponse.json(
        { error: `You are already on the ${plan} plan.` },
        { status: 400 },
      );
    }

    // Check if subscription is active
    if (userData.subscription_status === 'canceled' || userData.subscription_status === 'expired') {
      return NextResponse.json(
        { error: 'Your subscription is not active. Please subscribe again.' },
        { status: 400 },
      );
    }

    // Update the subscription via Paddle API — change the price
    // Paddle handles proration: immediate charge/refund for the difference
    const subscriptionId = userData.paddle_subscription_id;

    // Get current subscription to find the existing item ID
    const subscription = await paddle.subscriptions.get(subscriptionId);
    const currentItems = subscription.items || [];
    const currentItem = currentItems[0];

    if (!currentItem) {
      return NextResponse.json(
        { error: 'Could not find subscription item to update.' },
        { status: 500 },
      );
    }

    // Update subscription with new price, proration enabled
    await paddle.subscriptions.update(subscriptionId, {
      items: [
        {
          itemId: currentItem.id,
          priceId: priceId,
          quantity: 1,
        },
      ],
      prorationBillingMode: 'prorated_immediately',
      customData: {
        user_id: user.id,
        type: 'subscription',
        plan: plan,
      },
    });

    console.log(`[Paddle] Subscription update requested: ${subscriptionId} → ${plan} (was ${userData.subscription_tier})`);

    return NextResponse.json({
      success: true,
      message: `Subscription updated to ${plan}. Proration will be applied automatically.`,
    });
  } catch (error: any) {
    console.error('[Paddle] Update subscription error:', {
      message: error?.message,
      code: error?.code,
      detail: error?.error?.detail,
      errors: error?.error?.errors,
    });
    return NextResponse.json(
      { error: error?.error?.detail || error?.message || 'Failed to update subscription' },
      { status: 500 },
    );
  }
}
