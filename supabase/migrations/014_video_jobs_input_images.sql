-- Add input_images column for manual video uploads
ALTER TABLE video_jobs ADD COLUMN IF NOT EXISTS input_images TEXT[];
