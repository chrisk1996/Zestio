-- Floorplan Projects Table
-- Stores Pascal Editor scene data for each floor plan project

CREATE TABLE IF NOT EXISTS public.floorplan_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Untitled Floor Plan',
  scene_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.floorplan_projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own projects
CREATE POLICY "Users can view own projects" ON public.floorplan_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.floorplan_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.floorplan_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.floorplan_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_floorplan_projects_user_id ON public.floorplan_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_floorplan_projects_updated_at ON public.floorplan_projects(updated_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_floorplan_projects_updated_at
  BEFORE UPDATE ON public.floorplan_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Allow anonymous access for demo mode (optional - remove in production)
-- CREATE POLICY "Allow anonymous read" ON public.floorplan_projects FOR SELECT USING (true);
-- CREATE POLICY "Allow anonymous insert" ON public.floorplan_projects FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow anonymous update" ON public.floorplan_projects FOR UPDATE USING (true);
