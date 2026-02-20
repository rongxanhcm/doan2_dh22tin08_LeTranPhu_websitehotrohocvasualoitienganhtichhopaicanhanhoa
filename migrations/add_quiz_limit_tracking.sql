-- Migration: Add quiz limit tracking to user_usage table
-- Purpose: Track daily quiz attempts for free users
-- Date: 2026-02-20

ALTER TABLE user_usage 
ADD COLUMN IF NOT EXISTS quiz_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_quiz_reset_date DATE;

COMMENT ON COLUMN user_usage.quiz_count IS 'Number of quizzes generated today (resets daily)';
COMMENT ON COLUMN user_usage.last_quiz_reset_date IS 'Date when quiz count was last reset';

-- Set initial values for existing users
UPDATE user_usage 
SET quiz_count = 0, last_quiz_reset_date = CURRENT_DATE
WHERE quiz_count IS NULL;
