-- ============================================
-- BlogSpy: User Credits System
-- Database Migration
-- ============================================

-- ============================================
-- 1. User Credits Table
-- Tracks credit usage and limits per user
-- ============================================
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  
  -- Credit Tracking
  credits_total INTEGER NOT NULL DEFAULT 1000,
  credits_used INTEGER NOT NULL DEFAULT 0,
  
  -- Reset Info
  reset_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Plan Info (synced from Stripe)
  plan TEXT NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO', 'ENTERPRISE')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_user_credits_stripe_customer ON user_credits(stripe_customer_id);

-- ============================================
-- 2. Credit Usage History Table
-- Logs each credit transaction for auditing
-- ============================================
CREATE TABLE IF NOT EXISTS credit_usage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  
  -- Transaction Details
  credits_amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('usage', 'refund', 'purchase', 'reset', 'bonus')),
  feature_used TEXT, -- e.g., 'keyword_magic', 'ai_writer', 'rank_tracker'
  
  -- Balance Snapshot
  credits_before INTEGER NOT NULL,
  credits_after INTEGER NOT NULL,
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for history queries
CREATE INDEX idx_credit_history_user ON credit_usage_history(user_id);
CREATE INDEX idx_credit_history_created ON credit_usage_history(created_at);
CREATE INDEX idx_credit_history_type ON credit_usage_history(transaction_type);

-- ============================================
-- 3. Plan Limits Configuration
-- Defines credit limits per plan
-- ============================================
CREATE TABLE IF NOT EXISTS plan_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan TEXT NOT NULL UNIQUE CHECK (plan IN ('FREE', 'PRO', 'ENTERPRISE')),
  
  -- Credit Limits
  monthly_credits INTEGER NOT NULL,
  daily_limit INTEGER, -- Optional daily cap
  
  -- Feature Limits
  max_projects INTEGER NOT NULL DEFAULT 1,
  max_keywords INTEGER NOT NULL DEFAULT 100,
  max_tracked_urls INTEGER NOT NULL DEFAULT 50,
  
  -- Feature Access
  features JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plan limits
INSERT INTO plan_limits (plan, monthly_credits, max_projects, max_keywords, max_tracked_urls, features) VALUES
  ('FREE', 100, 1, 50, 20, '{"ai_writer": false, "api_access": false, "priority_support": false}'),
  ('PRO', 2000, 5, 500, 200, '{"ai_writer": true, "api_access": true, "priority_support": false}'),
  ('ENTERPRISE', 10000, 999, 10000, 2000, '{"ai_writer": true, "api_access": true, "priority_support": true}')
ON CONFLICT (plan) DO UPDATE SET
  monthly_credits = EXCLUDED.monthly_credits,
  max_projects = EXCLUDED.max_projects,
  max_keywords = EXCLUDED.max_keywords,
  max_tracked_urls = EXCLUDED.max_tracked_urls,
  features = EXCLUDED.features,
  updated_at = NOW();

-- ============================================
-- 4. Functions & Triggers
-- ============================================

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_credits
DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to use credits
CREATE OR REPLACE FUNCTION use_credits(
  p_user_id TEXT,
  p_amount INTEGER,
  p_feature TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, remaining INTEGER, message TEXT) AS $$
DECLARE
  v_current_credits INTEGER;
  v_credits_used INTEGER;
  v_credits_total INTEGER;
BEGIN
  -- Get current credit info
  SELECT credits_total - credits_used, credits_used, credits_total
  INTO v_current_credits, v_credits_used, v_credits_total
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user exists
  IF NOT FOUND THEN
    -- Create new user with default credits
    INSERT INTO user_credits (user_id, credits_total, credits_used)
    VALUES (p_user_id, 1000, 0)
    RETURNING credits_total - credits_used, credits_used, credits_total
    INTO v_current_credits, v_credits_used, v_credits_total;
  END IF;

  -- Check if enough credits
  IF v_current_credits < p_amount THEN
    RETURN QUERY SELECT FALSE, v_current_credits, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;

  -- Deduct credits
  UPDATE user_credits
  SET credits_used = credits_used + p_amount
  WHERE user_id = p_user_id;

  -- Log the transaction
  INSERT INTO credit_usage_history (
    user_id, credits_amount, transaction_type, feature_used,
    credits_before, credits_after, description
  ) VALUES (
    p_user_id, p_amount, 'usage', p_feature,
    v_credits_total - v_credits_used, v_credits_total - v_credits_used - p_amount, p_description
  );

  RETURN QUERY SELECT TRUE, v_current_credits - p_amount, 'Credits used successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly credits
CREATE OR REPLACE FUNCTION reset_monthly_credits(p_user_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_credits_used INTEGER;
  v_credits_total INTEGER;
BEGIN
  -- Get current values
  SELECT credits_used, credits_total
  INTO v_credits_used, v_credits_total
  FROM user_credits
  WHERE user_id = p_user_id;

  -- Reset credits
  UPDATE user_credits
  SET 
    credits_used = 0,
    reset_date = NOW() + INTERVAL '30 days',
    last_reset_at = NOW()
  WHERE user_id = p_user_id;

  -- Log the reset
  INSERT INTO credit_usage_history (
    user_id, credits_amount, transaction_type,
    credits_before, credits_after, description
  ) VALUES (
    p_user_id, v_credits_used, 'reset',
    v_credits_total - v_credits_used, v_credits_total, 'Monthly credit reset'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_credits
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

-- Policies for credit_usage_history
CREATE POLICY "Users can view own history" ON credit_usage_history
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- ============================================
-- 6. Sample Data for Testing
-- ============================================
-- Uncomment to insert test data:
/*
INSERT INTO user_credits (user_id, credits_total, credits_used, plan) VALUES
  ('demo_user_001', 2000, 150, 'PRO'),
  ('test_user_001', 100, 45, 'FREE');
*/
