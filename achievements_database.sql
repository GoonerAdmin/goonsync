-- ============================================
-- GOONSYNC ACHIEVEMENTS & XP SYSTEM
-- Complete Database Schema
-- ============================================

-- ============================================
-- TABLE 1: User XP and Levels
-- ============================================
CREATE TABLE IF NOT EXISTS user_xp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 2: User Achievements
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  xp_awarded INTEGER NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- TABLE 3: User Stats (for achievement tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Session stats
  total_sessions INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  longest_session_seconds INTEGER DEFAULT 0,
  
  -- Streak stats
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_session_date DATE,
  
  -- Time-based stats
  sessions_after_midnight INTEGER DEFAULT 0,
  sessions_before_6am INTEGER DEFAULT 0,
  sessions_at_3am INTEGER DEFAULT 0,
  weekend_sessions INTEGER DEFAULT 0,
  
  -- Duration-based stats
  sessions_over_1hr INTEGER DEFAULT 0,
  sessions_over_2hr INTEGER DEFAULT 0,
  sessions_over_3hr INTEGER DEFAULT 0,
  sessions_under_10min INTEGER DEFAULT 0,
  
  -- Social stats
  circles_joined INTEGER DEFAULT 0,
  circles_created INTEGER DEFAULT 0,
  invites_sent INTEGER DEFAULT 0,
  
  -- Ranking stats
  times_ranked_first INTEGER DEFAULT 0,
  times_in_top_3 INTEGER DEFAULT 0,
  
  -- Profile stats
  has_profile_picture BOOLEAN DEFAULT false,
  has_changed_username BOOLEAN DEFAULT false,
  
  -- Account info
  account_created_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_user_xp_user ON user_xp(user_id);
CREATE INDEX idx_user_xp_level ON user_xp(current_level);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_stats_user ON user_stats(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- User XP Policies
CREATE POLICY "select_user_xp"
ON user_xp FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "insert_user_xp"
ON user_xp FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_user_xp"
ON user_xp FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- User Achievements Policies
CREATE POLICY "select_user_achievements"
ON user_achievements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "insert_user_achievements"
ON user_achievements FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- User Stats Policies
CREATE POLICY "select_user_stats"
ON user_stats FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "insert_user_stats"
ON user_stats FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_user_stats"
ON user_stats FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- FUNCTION: Initialize User XP and Stats
-- ============================================
CREATE OR REPLACE FUNCTION initialize_user_gamification()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create XP record
  INSERT INTO public.user_xp (user_id, total_xp, current_level)
  VALUES (NEW.id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create stats record
  INSERT INTO public.user_stats (user_id, account_created_at)
  VALUES (NEW.id, NEW.created_at)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Failed to initialize gamification for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGER: Auto-initialize on user creation
-- ============================================
DROP TRIGGER IF EXISTS on_user_gamification_init ON auth.users;

CREATE TRIGGER on_user_gamification_init
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_gamification();

-- ============================================
-- FUNCTION: Update user stats timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_user_stats_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_timestamp();

CREATE TRIGGER set_user_xp_updated_at
  BEFORE UPDATE ON user_xp
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_timestamp();

-- ============================================
-- Initialize existing users
-- ============================================
INSERT INTO user_xp (user_id, total_xp, current_level)
SELECT id, 0, 1 
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_stats (user_id, account_created_at)
SELECT id, created_at 
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('user_xp', 'user_achievements', 'user_stats')
ORDER BY table_name;

-- Check all users have XP records
SELECT 
  COUNT(*) as total_users,
  (SELECT COUNT(*) FROM user_xp) as users_with_xp,
  (SELECT COUNT(*) FROM user_stats) as users_with_stats
FROM auth.users;

-- ✅ ACHIEVEMENTS DATABASE READY!
-- Next: Run achievements.js to get the achievement definitions
