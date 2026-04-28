import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

type TransactionType = 'purchase' | 'topup' | 'usage' | 'refund' | 'reset' | 'subscription';

/**
 * Log a credit transaction for analytics.
 * Uses service role key to bypass RLS, falls back to server client.
 */
export async function logCreditTransaction(params: {
  userId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  stripePaymentIntentId?: string;
}) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (url && key) {
      const admin = createClient(url, key);
      await admin.from('credit_transactions').insert({
        user_id: params.userId,
        type: params.type,
        amount: params.amount,
        description: params.description,
        stripe_payment_intent_id: params.stripePaymentIntentId,
      });
    } else {
      // Fallback: use server client (has authenticated user context)
      console.warn('[CreditTransaction] Service role key not set, using server client fallback');
      const supabase = await createServerClient();
      const { error } = await supabase.from('credit_transactions').insert({
        user_id: params.userId,
        type: params.type,
        amount: params.amount,
        description: params.description,
        stripe_payment_intent_id: params.stripePaymentIntentId,
      });
      if (error) console.error('[CreditTransaction] Insert failed:', error.message);
    }
  } catch (err) {
    console.error('[CreditTransaction] Failed to log:', err);
  }
}
