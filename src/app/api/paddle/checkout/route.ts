import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getPaddle, PADDLE_PRICES, isPaddleConfigured } from '@/lib/paddle';

export const dynamic = 'force-dynamic';

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

    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, plan, credits } = body as {
      type: 'subscription' | 'topup';
      plan?: 'pro' | 'enterprise';
      credits?: 50 | 200 | 500;
    };

    // Resolve price ID
    let priceId: string;
    let customDataType: string;

    if (type === 'topup') {
      if (!credits || ![50, 200, 500].includes(credits)) {
        return NextResponse.json(
          { error: 'Invalid top-up amount. Must be 50, 200, or 500.' },
          { status: 400 },
        );
      }
      const key = `topup_${credits}` as keyof typeof PADDLE_PRICES;
      priceId = PADDLE_PRICES[key];
      customDataType = 'topup';
    } else if (type === 'subscription') {
      if (!plan || !['pro', 'enterprise'].includes(plan)) {
        return NextResponse.json(
          { error: 'Invalid plan. Must be "pro" or "enterprise".' },
          { status: 400 },
        );
      }
      priceId = PADDLE_PRICES[plan];
      customDataType = 'subscription';
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "subscription" or "topup".' },
        { status: 400 },
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for this item. Key: ${type === 'topup' ? 'topup_' + credits : plan}` },
        { status: 500 },
      );
    }

    // Get or create Paddle customer
    const { data: userData } = await supabase
      .from('zestio_users')
      .select('paddle_customer_id, email')
      .eq('id', user.id)
      .single();

    let customerId = userData?.paddle_customer_id || undefined;
    const customerEmail = userData?.email || user.email;

    console.log('[Paddle] User data:', { customerId: customerId || 'none', customerEmail: customerEmail || 'MISSING', userId: user.id, priceId });

    if (!customerId) {
      console.log('[Paddle] Creating customer...');
      try {
        if (!customerEmail) {
          return NextResponse.json({ error: 'No email found for user' }, { status: 400 });
        }
        const customerBody: Record<string, any> = { email: customerEmail };
        if (user.user_metadata?.full_name) {
          customerBody.name = user.user_metadata.full_name;
        }
        const customer = await paddle.customers.create(customerBody);
        customerId = customer.id;
        console.log('[Paddle] Customer created:', customerId);

        await supabase
          .from('zestio_users')
          .update({ paddle_customer_id: customerId })
          .eq('id', user.id);
      } catch (custErr: any) {
        console.error('[Paddle] Customer creation failed:', {
          message: custErr?.message,
          code: custErr?.code,
          detail: custErr?.error?.detail,
        });
        return NextResponse.json(
          { error: `Customer creation failed: ${custErr?.message || 'unknown'}` },
          { status: 500 },
        );
      }
    }

    // Build custom_data
    const customData: Record<string, string> = {
      user_id: user.id,
      type: customDataType,
    };
    if (type === 'topup') {
      customData.credits = String(credits);
    } else {
      customData.plan = plan!;
    }

    // Create Paddle transaction — minimal body to debug
    const transactionBody: Record<string, any> = {
      items: [{ priceId, quantity: 1 }],
    };

    if (customerId) {
      transactionBody.customerId = customerId;
    }

    console.log('[Paddle] Creating transaction with:', JSON.stringify({ priceId, customerId, customData }));

    const transaction = await paddle.transactions.create(transactionBody);

    console.log('[Paddle] Transaction created:', transaction?.id);

    return NextResponse.json({ transactionId: transaction.id });
  } catch (error: any) {
    console.error('[Paddle] Checkout error:', {
      message: error?.message,
      code: error?.code,
      detail: error?.error?.detail,
      errors: error?.error?.errors,
      stack: error?.stack?.split('\n').slice(0, 3),
    });
    return NextResponse.json(
      { error: error?.error?.detail || error?.message || 'Checkout failed' },
      { status: 500 },
    );
  }
}
