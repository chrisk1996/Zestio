-- Migration: Ensure subscription_tier column exists and fix any legacy columns
-- This migration ensures the correct schema for Stripe subscription handling

-- First, check if we need to rename plan_status to subscription_tier
DO $$
BEGIN
    -- If plan_status exists but subscription_tier doesn't, rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'zestio_users' AND column_name = 'plan_status'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'zestio_users' AND column_name = 'subscription_tier'
    ) THEN
        ALTER TABLE zestio_users RENAME COLUMN plan_status TO subscription_tier;
    END IF;
END $$;

-- Ensure subscription_tier column exists (if neither plan_status nor subscription_tier exists)
ALTER TABLE zestio_users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));

-- Ensure subscription_status column exists (from migration 009, but check after rename)
ALTER TABLE zestio_users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing'));

-- Ensure stripe_customer_id exists (from migration 009)
ALTER TABLE zestio_users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Ensure stripe_subscription_id exists (from migration 009)
ALTER TABLE zestio_users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Drop the legacy 'plan' column if it exists (we use subscription_tier now)
ALTER TABLE zestio_users DROP COLUMN IF EXISTS plan;

-- Comments
COMMENT ON COLUMN zestio_users.subscription_tier IS 'Subscription plan: free, pro, or enterprise';
COMMENT ON COLUMN zestio_users.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN zestio_users.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN zestio_users.stripe_subscription_id IS 'Active Stripe subscription ID';
