import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getPaddle, isPaddleConfigured } from '@/lib/paddle';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!isPaddleConfigured()) {
    return NextResponse.json({ error: 'Paddle is not configured' }, { status: 503 });
  }

  try {
    const paddle = getPaddle();
    const supabase = await createClient();
    const baseUrl =
      process.env.NEXT_PUBLIC_URL ||
      request.headers.get('origin') ||
      `https://${request.headers.get('host')}`;

    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('zestio_users')
      .select('paddle_customer_id')
      .eq('id', user.id)
      .single();

    if (!userData?.paddle_customer_id) {
      return NextResponse.json({ error: 'No Paddle customer found' }, { status: 400 });
    }

    const settings = await paddle.customerPortalSettings.create({
      returnUrl: `${baseUrl}/billing`,
      customData: { user_id: user.id },
    });

    // Generate a portal session URL
    // Paddle SDK: customer portal uses a URL pattern
    const portalUrl = `https://my.paddle.com/customer/${userData.paddle_customer_id}?settings_id=${settings.id}&return_url=${encodeURIComponent(`${baseUrl}/billing`)}`;

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('[Paddle] Portal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Portal failed' },
      { status: 500 },
    );
  }
}
