import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getPaddle, isPaddleConfigured } from '@/lib/paddle';

export const dynamic = 'force-dynamic';

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

    const { data: userData } = await supabase
      .from('zestio_users')
      .select('paddle_customer_id, paddle_subscription_id')
      .eq('id', user.id)
      .single();

    if (!userData?.paddle_customer_id) {
      return NextResponse.json({ error: 'No Paddle customer found' }, { status: 400 });
    }

    // Create a customer portal session using the Paddle SDK
    const subscriptionIds = userData.paddle_subscription_id
      ? [userData.paddle_subscription_id]
      : [];

    const session = await paddle.customerPortalSessions.create(
      userData.paddle_customer_id,
      subscriptionIds,
    );

    // The session contains authenticated URLs to the customer portal
    const portalUrl = session.urls?.general?.overview;

    if (!portalUrl) {
      return NextResponse.json({ error: 'Failed to generate portal URL' }, { status: 500 });
    }

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('[Paddle] Portal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Portal failed' },
      { status: 500 },
    );
  }
}
