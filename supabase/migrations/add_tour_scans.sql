CREATE TABLE IF NOT EXISTS public.tour_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'done', 'failed')),
  kiri_task_id TEXT,
  splat_file_url TEXT,
  splat_file_path TEXT,
  thumbnail_url TEXT,
  image_count INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 5,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.tour_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tours" ON public.tour_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tours" ON public.tour_scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tours" ON public.tour_scans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public tours viewable via share token" ON public.tour_scans FOR SELECT USING (is_public = true AND share_token IS NOT NULL);

CREATE INDEX idx_tour_scans_user ON tour_scans(user_id);
CREATE INDEX idx_tour_scans_share ON tour_scans(share_token) WHERE is_public = true;
