-- ============================================
-- MIGRATION: Keyword Global Cache Architecture
-- ============================================
-- Date: 2026-01-08
-- Description: Convert keyword model from user-owned to global cache
-- ============================================

-- Step 1: Create new keywords table (global cache)
CREATE TABLE IF NOT EXISTS keywords_new (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_keywords_text ON keywords_new(text);
CREATE INDEX IF NOT EXISTS idx_keywords_country ON keywords_new(country);

-- Step 3: Migrate existing keywords (dedupe by text+country)
-- Note: Only run if old 'keywords' table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'keywords') THEN
    INSERT INTO keywords_new (text, country, language, volume, difficulty, cpc, competition, intent, trend_data, serp_data, created_at, updated_at, last_fetched_at)
    SELECT DISTINCT ON (keyword, location)
      keyword AS text,
      location AS country,
      language,
      volume,
      difficulty,
      cpc,
      competition,
      intent,
      monthly_data AS trend_data,
      serp_features AS serp_data,
      created_at,
      updated_at,
      last_fetched_at
    FROM keywords
    ORDER BY keyword, location, updated_at DESC;
  END IF;
END $$;

-- Step 4: Add keyword_id to search_history
ALTER TABLE search_history 
  ADD COLUMN IF NOT EXISTS keyword_id TEXT REFERENCES keywords_new(id) ON DELETE SET NULL;

-- Step 5: Create index on keyword_id
CREATE INDEX IF NOT EXISTS idx_search_history_keyword ON search_history(keyword_id);

-- Step 6: Backfill search_history.keyword_id (match by query text)
UPDATE search_history sh
SET keyword_id = k.id
FROM keywords_new k
WHERE sh.query = k.text AND sh.keyword_id IS NULL;

-- Step 7: Update rankings table to remove user_id
-- First, check if rankings table exists and has user_id column
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'rankings' AND column_name = 'user_id'
  ) THEN
    -- Make project_id required
    ALTER TABLE rankings ALTER COLUMN project_id SET NOT NULL;
    
    -- Drop user_id foreign key constraint first
    ALTER TABLE rankings DROP CONSTRAINT IF EXISTS rankings_user_id_fkey;
    
    -- Then drop the column
    ALTER TABLE rankings DROP COLUMN user_id;
  END IF;
END $$;

-- Step 8: Add project_id index to rankings
CREATE INDEX IF NOT EXISTS idx_rankings_project ON rankings(project_id);

-- Step 9: Drop old keywords table if it exists
DROP TABLE IF EXISTS keywords CASCADE;

-- Step 10: Rename new table to keywords
ALTER TABLE keywords_new RENAME TO keywords;

-- Step 11: Update updated_at trigger
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
-- MIGRATION COMPLETE
-- ============================================
-- Verify with:
-- SELECT COUNT(*) FROM keywords;
-- SELECT * FROM keywords LIMIT 5;
-- ============================================
