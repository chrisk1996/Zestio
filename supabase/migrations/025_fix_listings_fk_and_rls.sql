-- Fix listings table: update FK from users -> zestio_users and fix RLS UUID casting

-- Drop existing foreign key constraint
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_agent_id_fkey;

-- Add correct foreign key to zestio_users
ALTER TABLE public.listings
  ADD CONSTRAINT listings_agent_id_fkey
  FOREIGN KEY (agent_id) REFERENCES public.zestio_users(id) ON DELETE CASCADE;

-- Fix RLS policies (UUID = text casting)
DROP POLICY IF EXISTS "Users can view their own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can create listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;

CREATE POLICY "Users can view their own listings" ON public.listings
  FOR SELECT USING (agent_id::text = auth.uid()::text);
CREATE POLICY "Users can create listings" ON public.listings
  FOR INSERT WITH CHECK (agent_id::text = auth.uid()::text);
CREATE POLICY "Users can update their own listings" ON public.listings
  FOR UPDATE USING (agent_id::text = auth.uid()::text);
CREATE POLICY "Users can delete their own listings" ON public.listings
  FOR DELETE USING (agent_id::text = auth.uid()::text);
