-- Migration 022: Fix signup trigger — add missing columns + set defaults
-- The handle_new_user trigger (since migration 017) tries to insert into
-- email, full_name, avatar_url columns that were NEVER added to the table.
-- This is the root cause of "Database error saving new user" on signup.

-- Step 1: Add the missing columns (idempotent)
ALTER TABLE public.zestio_users
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Step 2: Ensure column defaults (idempotent)
ALTER TABLE public.zestio_users
  ALTER COLUMN credits SET DEFAULT 5,
  ALTER COLUMN used_credits SET DEFAULT 0;

-- Step 3: Update trigger to explicitly set all fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.zestio_users (id, email, full_name, avatar_url, credits, used_credits)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    5,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
