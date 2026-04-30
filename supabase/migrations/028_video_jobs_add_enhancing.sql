-- Add 'enhancing' status to video_jobs status check constraint
ALTER TABLE video_jobs DROP CONSTRAINT IF EXISTS video_jobs_status_check;
ALTER TABLE video_jobs ADD CONSTRAINT video_jobs_status_check 
  CHECK (status IN ('queued', 'scraping', 'sorting', 'twilighting', 'enhancing', 'renovating', 'animating', 'stitching', 'done', 'failed', 'needs_images'));
