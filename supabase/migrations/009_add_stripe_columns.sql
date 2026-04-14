-- Migration: Add Stripe subscription columns to propertypix_users
-- Required for Stripe subscription integration

-- Add Stripe-related columns
ALTER TABLE propertypix_users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing'));

-- Add index for Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_propertypix_users_stripe_customer ON propertypix_users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN propertypix_users.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN propertypix_users.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN propertypix_users.subscription_status IS 'Current subscription status from Stripe';
