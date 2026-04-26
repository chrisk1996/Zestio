-- Migration 022: Fix signup trigger and ensure column defaults
-- The handle_new_user trigger was failing because credits/used_credits
-- may lack defaults, and the trigger didn't set them explicitly.
-- Best practice: set column defaults (safety net) AND explicit trigger values (clarity).

-- Step 1: Ensure column defaults exist (idempotent)
ALTER TABLE public.zestio_users
  ALTER COLUMN credits SET DEFAULT 5,
  ALTER COLUMN used_credits SET DEFAULT 0;

-- Step 2: Update trigger to explicitly set all fields on new user creation
-- This makes the trigger self-documenting: you can see exactly what a new user gets.
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
  EXCEPTION WHEN undefined_column THEN
    -- Fallback: insert only core fields if extra columns are missing
    INSERT INTO public.zestio_users (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Ensure the trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
