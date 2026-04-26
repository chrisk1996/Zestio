import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { PLANS } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

function getPlanCredits(tier: string): number {
  return (PLANS as Record<string, { credits: number }>)[tier]?.credits ?? 5;
}

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

    // Model A: credits = remaining balance, used_credits = total ever consumed
    const creditsRemaining = userData.credits ?? 5;
    const creditsUsed = userData.used_credits ?? 0;
    const planCredits = getPlanCredits(userData.subscription_tier || 'free');

    return NextResponse.json({
      credits: creditsRemaining,
      plan: userData.subscription_tier || 'free',
      used: creditsUsed,
      total: planCredits,
    });
  } catch (error) {
    console.error('Credits error:', error);
    return NextResponse.json({ credits: 5, plan: 'free', used: 0, total: 5 });
  }
}
