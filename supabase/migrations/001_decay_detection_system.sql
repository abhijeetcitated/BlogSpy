-- ============================================
-- BlogSpy: Content Decay Detection System
-- Database Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. User Integrations Table
-- Stores OAuth tokens for GSC/GA4
-- ============================================
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'google_gsc', 'google_ga4'
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  selected_property TEXT, -- GSC site URL or GA4 property ID
  scope TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_user_integrations_user ON user_integrations(user_id);
CREATE INDEX idx_user_integrations_provider ON user_integrations(provider);

-- ============================================
-- 2. GSC Cached Data Table
-- Stores search analytics data from GSC
-- ============================================
CREATE TABLE IF NOT EXISTS gsc_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  property_url TEXT NOT NULL,
  page_url TEXT NOT NULL,
  date DATE NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5, 4) DEFAULT 0,
  position DECIMAL(6, 2) DEFAULT 0,
  query TEXT, -- Optional: specific keyword
  device TEXT, -- 'MOBILE', 'DESKTOP', 'TABLET'
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, property_url, page_url, date, COALESCE(query, ''), COALESCE(device, ''), COALESCE(country, ''))
);

CREATE INDEX idx_gsc_data_user ON gsc_data(user_id);
CREATE INDEX idx_gsc_data_page ON gsc_data(page_url);
CREATE INDEX idx_gsc_data_date ON gsc_data(date);
CREATE INDEX idx_gsc_data_user_page ON gsc_data(user_id, page_url);

-- ============================================
-- 3. GA4 Cached Data Table
-- Stores analytics data from GA4
-- ============================================
CREATE TABLE IF NOT EXISTS ga4_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  avg_engagement_time DECIMAL(10, 2) DEFAULT 0,
  bounce_rate DECIMAL(5, 4) DEFAULT 0,
  engagement_rate DECIMAL(5, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, property_id, page_path, date)
);

CREATE INDEX idx_ga4_data_user ON ga4_data(user_id);
CREATE INDEX idx_ga4_data_page ON ga4_data(page_path);
CREATE INDEX idx_ga4_data_date ON ga4_data(date);

-- ============================================
-- 4. Decay Scores Table
-- Stores calculated decay scores for each URL
-- ============================================
CREATE TABLE IF NOT EXISTS decay_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  level TEXT NOT NULL CHECK (level IN ('critical', 'high', 'medium', 'low', 'healthy')),
  trend TEXT NOT NULL CHECK (trend IN ('declining', 'stable', 'improving')),
  traffic_decay DECIMAL(8, 2),
  position_decay DECIMAL(8, 2),
  ctr_decay DECIMAL(8, 2),
  engagement_decay DECIMAL(8, 2),
  comparison_period JSONB NOT NULL,
  factors JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, url)
);

CREATE INDEX idx_decay_scores_user ON decay_scores(user_id);
CREATE INDEX idx_decay_scores_level ON decay_scores(level);
CREATE INDEX idx_decay_scores_score ON decay_scores(overall_score);
CREATE INDEX idx_decay_scores_user_level ON decay_scores(user_id, level);

-- ============================================
-- 5. Decay History Table
-- Stores historical decay scores for trending
-- ============================================
CREATE TABLE IF NOT EXISTS decay_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  level TEXT NOT NULL,
  traffic_decay DECIMAL(8, 2),
  position_decay DECIMAL(8, 2),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decay_history_user_url ON decay_history(user_id, url);
CREATE INDEX idx_decay_history_recorded ON decay_history(recorded_at);

-- ============================================
-- 6. User Alert Preferences Table
-- Stores user notification preferences
-- ============================================
CREATE TABLE IF NOT EXISTS user_alert_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  channels JSONB DEFAULT '{"email": {"enabled": true}}',
  categories JSONB DEFAULT '{"decay": true, "rank_drop": true, "rank_gain": true}',
  thresholds JSONB DEFAULT '{"decay_critical": 30, "decay_high": 50, "rank_drop": 10}',
  frequency TEXT DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
  timezone TEXT DEFAULT 'UTC',
  quiet_hours JSONB DEFAULT '{"enabled": false, "start": "22:00", "end": "08:00"}',
  digest_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alert_prefs_user ON user_alert_preferences(user_id);

-- ============================================
-- 7. Alerts Table
-- Stores generated alerts
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('decay', 'rank_drop', 'rank_gain', 'indexing', 'error', 'system')),
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  url TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'read', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_category ON alerts(category);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- ============================================
-- 8. Alert Logs Table
-- Tracks alert delivery attempts
-- ============================================
CREATE TABLE IF NOT EXISTS alert_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  response JSONB DEFAULT '{}',
  error TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alert_logs_alert ON alert_logs(alert_id);
CREATE INDEX idx_alert_logs_user ON alert_logs(user_id);

-- ============================================
-- 9. Sync Jobs Table
-- Tracks background sync operations
-- ============================================
CREATE TABLE IF NOT EXISTS sync_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('gsc_sync', 'ga4_sync', 'decay_analysis')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_user ON sync_jobs(user_id);
CREATE INDEX idx_sync_jobs_type ON sync_jobs(job_type);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);

-- ============================================
-- Update Triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON user_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decay_scores_updated_at
  BEFORE UPDATE ON decay_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_alert_preferences_updated_at
  BEFORE UPDATE ON user_alert_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga4_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE decay_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE decay_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be created based on your auth setup
-- Example for service role access:
-- CREATE POLICY "Service role access" ON user_integrations
--   FOR ALL USING (true);

-- ============================================
-- Cleanup old data (optional scheduled function)
-- ============================================
-- You can schedule this via pg_cron or Supabase scheduled functions:
-- DELETE FROM gsc_data WHERE date < NOW() - INTERVAL '180 days';
-- DELETE FROM ga4_data WHERE date < NOW() - INTERVAL '180 days';
-- DELETE FROM decay_history WHERE recorded_at < NOW() - INTERVAL '365 days';
-- DELETE FROM alert_logs WHERE sent_at < NOW() - INTERVAL '90 days';
