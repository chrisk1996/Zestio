import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getPaddle, PADDLE_PRICES, isPaddleConfigured } from '@/lib/paddle';

export const dynamic = 'force-dynamic';

/**
 * Preview a subscription plan change — shows proration and billing impact
 * WITHOUT actually applying the change.
 *
 * Body: { plan: 'pro' | 'enterprise' }
 *
 * Returns:
 *  - immediate_transaction: what will be charged/credited now (proration)
 *  - next_transaction: the next regular renewal
 *  - update_summary: proration breakdown
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

    // Get user's current subscription
    const { data: userData } = await supabase
      .from('zestio_users')
      .select('paddle_subscription_id, subscription_tier, subscription_status')
      .eq('id', user.id)
      .single();

    if (!userData?.paddle_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found.' }, { status: 400 });
    }

    if (userData.subscription_tier === plan) {
      return NextResponse.json({ error: `You are already on the ${plan} plan.` }, { status: 400 });
    }

    const subscriptionId = userData.paddle_subscription_id;

    // Get current subscription items
    const subscription = await paddle.subscriptions.get(subscriptionId);
    const currentItems = subscription.items || [];
    const currentItem = currentItems[0];

    if (!currentItem) {
      return NextResponse.json({ error: 'Could not find subscription item.' }, { status: 500 });
    }

    // Preview the update — Paddle returns proration details without applying
    const preview = await paddle.subscriptions.previewUpdate(subscriptionId, {
      items: [
        {
          itemId: currentItem.id,
          priceId: priceId,
          quantity: 1,
        },
      ],
      prorationBillingMode: 'prorated_immediately',
    });

    // Extract the data the UI needs (SDK returns SubscriptionPreview directly)
    const immediateTransaction = preview?.immediateTransaction;
    const nextTransaction = preview?.nextTransaction;
    const updateSummary = preview?.updateSummary;

    // Build a simple response with pricing details
    const previewData: Record<string, unknown> = {
      // Immediate proration charge (what you pay/are credited right now)
      immediateCharge: null as { amount: string; currency: string; description: string } | null,
      // Next regular renewal
      nextCharge: null as { amount: string; date: string } | null,
      // Proration summary
      proration: null as { credit: string; charge: string } | null,
    };

    if (immediateTransaction) {
      const totals = immediateTransaction.details?.totals;
      previewData.immediateCharge = {
        amount: totals?.total || '0',
        currency: immediateTransaction.currencyCode || 'EUR',
        description: `Prorated ${plan} upgrade for the remaining billing period`,
      };
    }

    if (nextTransaction) {
      const totals = nextTransaction.details?.totals;
      previewData.nextCharge = {
        amount: totals?.total || '0',
        currency: nextTransaction.currencyCode || 'EUR',
        date: preview?.nextBilledAt || '',
      };
    }

    if (updateSummary) {
      previewData.proration = {
        credit: updateSummary.credit?.amount || '0',
        charge: updateSummary.charge?.amount || '0',
      };
    }

    console.log(`[Paddle] Preview for ${subscriptionId} → ${plan}:`, JSON.stringify(previewData).substring(0, 200));

    return NextResponse.json({
      success: true,
      plan,
      currentPlan: userData.subscription_tier,
      ...previewData,
    });
  } catch (error: any) {
    console.error('[Paddle] Preview error:', {
      message: error?.message,
      code: error?.code,
      detail: error?.error?.detail,
    });
    return NextResponse.json(
      { error: error?.error?.detail || error?.message || 'Failed to preview subscription update' },
      { status: 500 },
    );
  }
}
