-- Zestio Pro Database Schema (Current)
-- This is the canonical schema definition
-- Run this in your Supabase SQL editor for a fresh install

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users Table (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.zestio_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active',
  credits INTEGER NOT NULL DEFAULT 5,
  used_credits INTEGER NOT NULL DEFAULT 0,
  language TEXT DEFAULT 'en',
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_current_period_end TIMESTAMPTZ,
  subscription_cancel_at TIMESTAMPTZ,
  subscription_canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.zestio_users ENABLE ROW LEVEL SECURITY;

-- Policies for zestio_users table
CREATE POLICY "Users can view their own profile" ON public.zestio_users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.zestio_users
  FOR UPDATE USING (auth.uid() = id);

-- Index for Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_zestio_users_stripe_customer ON zestio_users(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.zestio_users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN undefined_column THEN
    INSERT INTO public.zestio_users (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Atomic credit deduction function
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_credits INTEGER;
  v_used_credits INTEGER;
BEGIN
  SELECT credits, used_credits INTO v_credits, v_used_credits
  FROM zestio_users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF v_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  UPDATE zestio_users
  SET credits = credits - p_amount,
      used_credits = used_credits + p_amount
  WHERE id = p_user_id;

  RETURN v_credits - p_amount;
END;
$$;

-- ============================================
-- Storage Buckets
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('job-assets', 'job-assets', false)
  ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_zestio_users_stripe_customer ON zestio_users(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
