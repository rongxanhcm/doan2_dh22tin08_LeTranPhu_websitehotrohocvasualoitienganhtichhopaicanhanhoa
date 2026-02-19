-- Create quiz_attempts table for tracking learning progress
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    error_type TEXT NOT NULL,
    quiz_date TIMESTAMP DEFAULT NOW(),
    score INT NOT NULL CHECK (score >= 0 AND score <= 10), -- 0-10 represents 0-100%
    passed BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE if score >= 6 (60%)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast queries on user + error_type
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_error 
ON quiz_attempts(user_id, error_type, quiz_date DESC);

-- Create index for recent attempts
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_recent 
ON quiz_attempts(user_id, quiz_date DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own quiz attempts
CREATE POLICY "quiz_attempts_user_select" ON quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own quiz attempts
CREATE POLICY "quiz_attempts_user_insert" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own quiz attempts
CREATE POLICY "quiz_attempts_user_update" ON quiz_attempts
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
