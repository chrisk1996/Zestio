-- Migration: Rename propertypix_users to zestio_users
-- This aligns the database schema with the application code

-- Rename the table
ALTER TABLE propertypix_users RENAME TO zestio_users;

-- Rename the index for Stripe customer lookup
ALTER INDEX idx_propertypix_users_stripe_customer RENAME TO idx_zestio_users_stripe_customer;

-- Update index name convention (if exists)
DROP INDEX IF EXISTS propertypix_users_stripe_customer_id_idx;
CREATE INDEX IF NOT EXISTS idx_zestio_users_stripe_customer 
ON zestio_users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Update table comment
COMMENT ON TABLE zestio_users IS 'User credits and subscription info. credits = total available, used_credits = already consumed';

-- Rename any foreign key constraints that reference this table
-- First, find and update any FK constraints
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_name LIKE '%propertypix_users%'
    LOOP
        EXECUTE format('ALTER TABLE %I RENAME CONSTRAINT %I TO %I',
            constraint_record.table_name,
            constraint_record.constraint_name,
            replace(constraint_record.constraint_name, 'propertypix_users', 'zestio_users')
        );
    END LOOP;
END $$;
