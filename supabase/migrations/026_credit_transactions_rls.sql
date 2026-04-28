-- Fix: Enable RLS on credit_transactions and add read policy for users
-- Transactions were not showing because RLS was enabled with no policies

ALTER TABLE IF EXISTS public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
  ON public.credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role full access (for logging)
CREATE POLICY "Service role full access"
  ON public.credit_transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);
