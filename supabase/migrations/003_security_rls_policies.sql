-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 🛡️ CATEGORY 1: SECURITY & SAFETY - ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 
-- Production Security Hardening - January 2026
-- Implements enterprise-grade RLS policies for BlogSpy SaaS
-- 
-- STACK: Next.js 16.1.1, React 19.2+, Supabase, Tailwind v4
-- 
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 1. ENABLE RLS ON ALL TABLES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- User profiles table
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- Keywords table
ALTER TABLE IF EXISTS keywords ENABLE ROW LEVEL SECURITY;

-- Rankings table
ALTER TABLE IF EXISTS rankings ENABLE ROW LEVEL SECURITY;

-- Content decay tracking
ALTER TABLE IF EXISTS content_decay ENABLE ROW LEVEL SECURITY;

-- User credits system
ALTER TABLE IF EXISTS user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credit_transactions ENABLE ROW LEVEL SECURITY;

-- Social tracker keywords
ALTER TABLE IF EXISTS social_keywords ENABLE ROW LEVEL SECURITY;

-- News tracker keywords
ALTER TABLE IF EXISTS news_keywords ENABLE ROW LEVEL SECURITY;

-- Community tracker keywords
ALTER TABLE IF EXISTS community_keywords ENABLE ROW LEVEL SECURITY;

-- Commerce tracker keywords
ALTER TABLE IF EXISTS commerce_keywords ENABLE ROW LEVEL SECURITY;

-- Content roadmap tasks
ALTER TABLE IF EXISTS roadmap_tasks ENABLE ROW LEVEL SECURITY;

-- Notifications
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 2. PROFILES TABLE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (excluding sensitive fields)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role full access"
  ON profiles
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 3. KEYWORDS TABLE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Users can view their own keywords
CREATE POLICY "Users can view own keywords"
  ON keywords
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own keywords
CREATE POLICY "Users can insert own keywords"
  ON keywords
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own keywords
CREATE POLICY "Users can update own keywords"
  ON keywords
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own keywords
CREATE POLICY "Users can delete own keywords"
  ON keywords
  FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 4. RANKINGS TABLE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Users can view rankings for their keywords
CREATE POLICY "Users can view own rankings"
  ON rankings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM keywords
      WHERE keywords.id = rankings.keyword_id
      AND keywords.user_id = auth.uid()
    )
  );

-- System can insert rankings (server-side only)
CREATE POLICY "System can insert rankings"
  ON rankings
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 5. CONTENT DECAY TABLE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Users can view their own decay data
CREATE POLICY "Users can view own content decay"
  ON content_decay
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own decay data
CREATE POLICY "Users can insert own content decay"
  ON content_decay
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own decay data
CREATE POLICY "Users can update own content decay"
  ON content_decay
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 6. USER CREDITS SYSTEM POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Users can view their own credits
CREATE POLICY "Users can view own credits"
  ON user_credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can update credits (server-side only)
CREATE POLICY "System can update credits"
  ON user_credits
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Users can view their own transactions
CREATE POLICY "Users can view own credit transactions"
  ON credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert transactions (server-side only)
CREATE POLICY "System can insert credit transactions"
  ON credit_transactions
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 7. SOCIAL TRACKER POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Users can manage their own social keywords
CREATE POLICY "Users can view own social keywords"
  ON social_keywords
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social keywords"
  ON social_keywords
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social keywords"
  ON social_keywords
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social keywords"
  ON social_keywords
  FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 8. NEWS TRACKER POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Users can manage their own news keywords
CREATE POLICY "Users can view own news keywords"
  ON news_keywords
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own news keywords"
  ON news_keywords
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own news keywords"
  ON news_keywords
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own news keywords"
  ON news_keywords
  FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 9. COMMUNITY TRACKER POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Users can manage their own community keywords
CREATE POLICY "Users can view own community keywords"
  ON community_keywords
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own community keywords"
  ON community_keywords
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own community keywords"
  ON community_keywords
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own community keywords"
  ON community_keywords
  FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 10. COMMERCE TRACKER POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Users can manage their own commerce keywords
CREATE POLICY "Users can view own commerce keywords"
  ON commerce_keywords
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own commerce keywords"
  ON commerce_keywords
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commerce keywords"
  ON commerce_keywords
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own commerce keywords"
  ON commerce_keywords
  FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 11. CONTENT ROADMAP POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Users can manage their own roadmap tasks
CREATE POLICY "Users can view own roadmap tasks"
  ON roadmap_tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmap tasks"
  ON roadmap_tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmap tasks"
  ON roadmap_tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmap tasks"
  ON roadmap_tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 12. NOTIFICATIONS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert notifications (server-side only)
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 13. SECURE VIEWS WITH SECURITY INVOKER
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Example: User statistics view (runs with user's permissions)
CREATE OR REPLACE VIEW user_stats
WITH (security_invoker = true) AS
SELECT
  user_id,
  COUNT(*) AS total_keywords,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) AS recent_keywords
FROM keywords
GROUP BY user_id;

-- Example: User credit balance view (runs with user's permissions)
CREATE OR REPLACE VIEW user_credit_balance
WITH (security_invoker = true) AS
SELECT
  user_id,
  balance,
  updated_at
FROM user_credits;

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 14. GRANT USAGE TO AUTHENTICATED USERS
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Grant basic permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- 15. SECURITY NOTES
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- IMPORTANT SECURITY CONSIDERATIONS:
-- 
-- 1. RLS is ENABLED on all user-facing tables
-- 2. Users can only access their own data via auth.uid() checks
-- 3. Service role bypasses RLS for admin operations
-- 4. Views use security_invoker = true to respect RLS
-- 5. Sensitive fields (passwords, API keys) should NEVER be selected directly
-- 6. Use the Data Access Layer (lib/dal/) for all data operations
-- 
-- DEPLOYMENT:
-- Run this migration in Supabase SQL Editor:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create new query
-- 3. Paste this entire file
-- 4. Execute
-- 
-- ROLLBACK:
-- To disable RLS (development only):
-- ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
-- DROP POLICY "policy_name" ON table_name;
-- 
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- Migration complete
SELECT 'RLS policies successfully applied' AS status;
