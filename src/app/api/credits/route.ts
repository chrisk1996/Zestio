import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { computeCreditState } from '@/lib/credits-shared';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ credits: 0, plan: 'free', used: 0, total: 0 });
    }

    const { data: userData, error } = await supabase
      .from('zestio_users')
      .select('subscription_tier, credits, used_credits')
      .eq('id', user.id)
      .single();

    if (error || !userData) {
      return NextResponse.json({ credits: 5, plan: 'free', used: 0, total: 5 });
    }

    const state = computeCreditState(userData);

    return NextResponse.json({
      credits: state.remaining,
      plan: state.plan,
      used: state.used,
      total: state.total,
    });
  } catch (error) {
    console.error('Credits error:', error);
    return NextResponse.json({ credits: 5, plan: 'free', used: 0, total: 5 });
  }
}
