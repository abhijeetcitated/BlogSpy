-- ============================================
-- MIGRATION: Keyword Global Cache + RLS Security
-- ============================================
-- Date: 2026-01-08
-- Description: Global keyword cache with Row-Level Security
-- ============================================

-- Step 1: Enable RLS on search_history
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Step 2: Policy - Users can only see their own search history
CREATE POLICY "Users can view own search history"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id);

-- Step 3: Policy - Users can insert their own searches
CREATE POLICY "Users can insert own searches"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 4: Policy - Service role has full access (for admin/analytics)
CREATE POLICY "Service role full access to search_history"
  ON search_history FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Step 5: Keywords table - NO RLS (global cache, public data)
-- Keywords are public DataForSEO data, no user isolation needed

-- Step 6: Add rate limiting function
CREATE OR REPLACE FUNCTION check_search_rate_limit(p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  search_count INT;
BEGIN
  -- Check searches in last 1 minute
  SELECT COUNT(*) INTO search_count
  FROM search_history
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 minute';
  
  -- Allow max 10 searches per minute
  RETURN search_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Add constraint to prevent DOS
ALTER TABLE search_history
  ADD CONSTRAINT check_rate_limit
  CHECK (check_search_rate_limit(user_id));

-- ============================================
-- RLS VERIFICATION QUERIES
-- ============================================
-- Test as user:
-- SELECT * FROM search_history; -- Should only show own data
-- INSERT INTO search_history (user_id, query, type) VALUES (auth.uid(), 'test', 'KEYWORD');
-- ============================================
