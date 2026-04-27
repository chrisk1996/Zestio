-- Add language column to zestio_users
ALTER TABLE public.zestio_users
ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'de' CHECK (language IN ('de', 'en'));
