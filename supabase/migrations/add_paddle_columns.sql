-- Add Paddle payment columns to zestio_users
ALTER TABLE public.zestio_users
  ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;

-- Create index for Paddle customer lookup
CREATE INDEX IF NOT EXISTS idx_zestio_users_paddle_customer ON zestio_users(paddle_customer_id)
  WHERE paddle_customer_id IS NOT NULL;
