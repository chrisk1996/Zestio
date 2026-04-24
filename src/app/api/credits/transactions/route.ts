import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('id, type, amount, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      // Table might not exist yet (migration 018 not applied)
      return NextResponse.json({ transactions: [] });
    }

    return NextResponse.json({ transactions: transactions || [] });
  } catch {
    return NextResponse.json({ transactions: [] });
  }
}
