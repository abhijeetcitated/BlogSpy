-- ============================================
-- FRESH DATABASE SETUP: Keyword Explorer
-- ============================================
-- This creates everything from scratch
-- ============================================

-- 1. Create keywords table (global cache)
CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  country TEXT DEFAULT 'US' NOT NULL,
  language TEXT DEFAULT 'en' NOT NULL,
  volume INTEGER,
  difficulty INTEGER,
  cpc DOUBLE PRECISION,
  competition DOUBLE PRECISION,
  intent TEXT,
  trend_data JSONB,
  serp_data JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_fetched_at TIMESTAMP,
  UNIQUE(text, country)
);

-- 2. Create indexes on keywords
CREATE INDEX IF NOT EXISTS idx_keywords_text ON keywords(text);
CREATE INDEX IF NOT EXISTS idx_keywords_country ON keywords(country);

-- 3. Ensure search_history table exists with keyword_id
-- Check if search_history exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'search_history') THEN
    CREATE TABLE search_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
      query TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT,
      results_count INTEGER,
      credits_used INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  ELSE
    -- Add keyword_id column if table exists but column doesn't
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'search_history' AND column_name = 'keyword_id'
    ) THEN
      ALTER TABLE search_history ADD COLUMN keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- 4. Create indexes on search_history
CREATE INDEX IF NOT EXISTS idx_search_history_user_created ON search_history(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_search_history_keyword ON search_history(keyword_id);

-- 5. Enable RLS on search_history
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for search_history
DROP POLICY IF EXISTS "Users can view own search history" ON search_history;
CREATE POLICY "Users can view own search history"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own searches" ON search_history;
CREATE POLICY "Users can insert own searches"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access to search_history" ON search_history;
CREATE POLICY "Service role full access to search_history"
  ON search_history FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- 7. Create rate limiting function
CREATE OR REPLACE FUNCTION check_search_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  search_count INT;
BEGIN
  SELECT COUNT(*) INTO search_count
  FROM search_history
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 minute';
  
  RETURN search_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_keywords_updated_at ON keywords;
CREATE TRIGGER update_keywords_updated_at
  BEFORE UPDATE ON keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Verify with:
-- SELECT * FROM keywords LIMIT 5;
-- SELECT * FROM search_history LIMIT 5;
-- ============================================
