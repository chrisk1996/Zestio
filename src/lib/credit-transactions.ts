import { createClient } from '@supabase/supabase-js';

type TransactionType = 'purchase' | 'topup' | 'usage' | 'refund' | 'reset' | 'subscription';

/**
 * Log a credit transaction for analytics.
 * Uses service role key to bypass RLS.
 */
export async function logCreditTransaction(params: {
  userId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  paymentReference?: string;
}) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return;

    const admin = createClient(url, key);
    await admin.from('credit_transactions').insert({
      user_id: params.userId,
      type: params.type,
      amount: params.amount,
      description: params.description,
      // Legacy column kept for backward compat — new entries use paymentReference in description
      stripe_payment_intent_id: params.paymentReference || null,
    });
  } catch (err) {
    console.warn('[CreditTransaction] Failed to log:', err);
  }
}
