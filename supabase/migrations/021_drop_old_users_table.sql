-- Migration 021: Drop the old public.users table
-- All user data now lives in zestio_users. public.users is a legacy table.
-- Need to drop foreign key constraints that reference public.users first.

-- Step 1: Remove FK constraints from tables that reference public.users
-- These may or may not exist depending on whether the original schema was run

-- Listings table: agent_id references public.users
DO $$
BEGIN
  -- Drop FK constraint on listings.agent_id if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'listings'
      AND ccu.table_name = 'users'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_agent_id_fkey;
    -- Re-add FK pointing to zestio_users
    ALTER TABLE public.listings
      ADD CONSTRAINT listings_agent_id_fkey
      FOREIGN KEY (agent_id) REFERENCES public.zestio_users(id) ON DELETE CASCADE;
  END IF;

  -- Drop FK constraint on projects.user_id if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'projects'
      AND ccu.table_name = 'users'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.zestio_users(id) ON DELETE CASCADE;
  END IF;

  -- Drop FK constraint on subscriptions.user_id if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'subscriptions'
      AND ccu.table_name = 'users'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.zestio_users(id) ON DELETE CASCADE;
  END IF;

  -- Drop FK constraint on enhancement_history.user_id if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'enhancement_history'
      AND ccu.table_name = 'users'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE public.enhancement_history DROP CONSTRAINT IF EXISTS enhancement_history_user_id_fkey;
    ALTER TABLE public.enhancement_history
      ADD CONSTRAINT enhancement_history_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.zestio_users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 2: Drop the trigger on public.users (if it exists)
DROP TRIGGER IF EXISTS on_user_created ON public.users;

-- Step 3: Drop the old users table
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 4: Also drop the old subscriptions and enhancement_credits tables
-- if they still exist (replaced by zestio_users columns)
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.enhancement_credits CASCADE;

-- Step 5: Ensure handle_new_user trigger on auth.users points to zestio_users
-- (this should already be done by migration 019, but be safe)
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
