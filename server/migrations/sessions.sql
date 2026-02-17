-- =====================================================
-- ADD SESSIONS TABLE TO EXISTING MIGRATION
-- Insert this AFTER the users table in migration.sql
-- =====================================================

-- =====================================================
-- SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  
  -- Session token
  token TEXT NOT NULL UNIQUE,
  
  -- Device/Browser info
  user_agent TEXT,
  ip_address TEXT,
  
  -- Expiration
  expires_at TEXT NOT NULL,
  
  -- Timestamps
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create unique index on token
CREATE UNIQUE INDEX IF NOT EXISTS sessions_token_unique ON sessions(token);

-- Create index on user_id for user's sessions lookup
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

-- =====================================================
-- SESSION CLEANUP TRIGGER (Optional)
-- Automatically delete expired sessions
-- =====================================================
CREATE TRIGGER IF NOT EXISTS sessions_cleanup
AFTER INSERT ON sessions
BEGIN
  DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;