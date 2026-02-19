-- Migration: Add default_language column to user_usage table
-- Date: 2026-02-18
-- Purpose: Store user's preferred AI feedback language preference

-- Add the default_language column with default value 'English'
ALTER TABLE user_usage 
ADD COLUMN IF NOT EXISTS default_language VARCHAR(50) DEFAULT 'English';

-- Add a comment to document the column
COMMENT ON COLUMN user_usage.default_language IS 'User preferred language for AI feedback (e.g., English, Vietnamese, Spanish, etc.)';

-- Optional: Update existing rows to have the default value
UPDATE user_usage 
SET default_language = 'English' 
WHERE default_language IS NULL;

-- Verify the migration
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_usage' AND column_name = 'default_language';
