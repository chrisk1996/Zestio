-- Migration: Fix video_jobs foreign key to reference propertypix_users
-- The original migration referenced 'users' table but we use 'propertypix_users'

-- Drop the existing foreign key constraint
ALTER TABLE video_jobs 
DROP CONSTRAINT IF EXISTS video_jobs_user_id_fkey;

-- Add the correct foreign key constraint referencing propertypix_users
ALTER TABLE video_jobs 
ADD CONSTRAINT video_jobs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES propertypix_users(id) ON DELETE CASCADE;

-- Also fix video_job_assets if needed (it references video_jobs which is correct)
-- But let's ensure the chain is complete
