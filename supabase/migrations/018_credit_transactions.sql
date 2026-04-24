-- Migration 018: Credit usage history tracking
-- Stores each credit transaction for analytics and receipts

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.zestio_users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'topup', 'usage', 'refund', 'reset', 'subscription')),
  amount INTEGER NOT NULL, -- positive = credits gained, negative = credits spent
  description TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_credit_transactions_user ON public.credit_transactions(user_id, created_at DESC);
CREATE INDEX idx_credit_transactions_type ON public.credit_transactions(type);
