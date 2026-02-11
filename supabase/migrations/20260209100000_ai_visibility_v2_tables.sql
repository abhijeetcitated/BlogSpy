-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- AI VISIBILITY V2 — New tables for DataForSEO-powered visibility tracking
-- ═══════════════════════════════════════════════════════════════════════════════════════════════
--
-- Creates 4 tables:
--   1. ai_visibility_scans      — scan history + results (jsonb)
--   2. ai_visibility_citations  — individual citation records per platform
--   3. ai_visibility_keywords   — tracked keywords per config
--   4. ai_visibility_snapshots  — daily aggregated metrics for trend charts
--
-- All tables have RLS enabled with user_id-based policies.
-- ai_visibility_configs already exists (see ai_visibility_configs.sql).
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- ─── TABLE 1: SCANS ─────────────────────────────────────────────────────────────────────────
-- Records every scan run (full scan or quick check).
-- scan_result stores the complete FullScanResult JSON for retrieval.

CREATE TABLE IF NOT EXISTS public.ai_visibility_scans (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config_id     uuid REFERENCES public.ai_visibility_configs(id) ON DELETE SET NULL,
  keyword       text NOT NULL,
  brand_domain  text NOT NULL,
  scan_result   jsonb NOT NULL DEFAULT '{}',
  overall_score integer NOT NULL DEFAULT 0,
  visible_platforms integer NOT NULL DEFAULT 0,
  total_platforms   integer NOT NULL DEFAULT 6,
  credits_used  integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_vis_scans_user_id      ON public.ai_visibility_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_vis_scans_config_id    ON public.ai_visibility_scans(config_id);
CREATE INDEX IF NOT EXISTS idx_ai_vis_scans_created_at   ON public.ai_visibility_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_vis_scans_user_created ON public.ai_visibility_scans(user_id, created_at DESC);

-- RLS
ALTER TABLE public.ai_visibility_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_vis_scans_select_own" ON public.ai_visibility_scans;
CREATE POLICY "ai_vis_scans_select_own"
  ON public.ai_visibility_scans FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_vis_scans_insert_own" ON public.ai_visibility_scans;
CREATE POLICY "ai_vis_scans_insert_own"
  ON public.ai_visibility_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_vis_scans_delete_own" ON public.ai_visibility_scans;
CREATE POLICY "ai_vis_scans_delete_own"
  ON public.ai_visibility_scans FOR DELETE
  USING (auth.uid() = user_id);


-- ─── TABLE 2: CITATIONS ────────────────────────────────────────────────────────────────────
-- Individual citation records extracted from scans.
-- Stores which platform mentioned the brand, with context and sentiment.

CREATE TABLE IF NOT EXISTS public.ai_visibility_citations (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config_id       uuid REFERENCES public.ai_visibility_configs(id) ON DELETE SET NULL,
  platform        text NOT NULL,               -- 'google-aio', 'google-ai-mode', 'chatgpt', 'claude', 'gemini', 'perplexity'
  query           text NOT NULL,               -- the keyword/question
  cited_url       text,
  cited_title     text,
  context         text,                        -- surrounding text in AI response
  position        integer NOT NULL DEFAULT 1,  -- 1st, 2nd, 3rd mention
  citation_type   text NOT NULL DEFAULT 'reference',  -- 'direct-quote', 'paraphrase', 'reference', 'recommendation', 'source-link'
  sentiment       text NOT NULL DEFAULT 'neutral',    -- 'positive', 'neutral', 'negative'
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_vis_cites_user_id      ON public.ai_visibility_citations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_vis_cites_config_id    ON public.ai_visibility_citations(config_id);
CREATE INDEX IF NOT EXISTS idx_ai_vis_cites_platform     ON public.ai_visibility_citations(platform);
CREATE INDEX IF NOT EXISTS idx_ai_vis_cites_created_at   ON public.ai_visibility_citations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_vis_cites_user_created ON public.ai_visibility_citations(user_id, created_at DESC);

-- RLS
ALTER TABLE public.ai_visibility_citations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_vis_cites_select_own" ON public.ai_visibility_citations;
CREATE POLICY "ai_vis_cites_select_own"
  ON public.ai_visibility_citations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_vis_cites_insert_own" ON public.ai_visibility_citations;
CREATE POLICY "ai_vis_cites_insert_own"
  ON public.ai_visibility_citations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_vis_cites_delete_own" ON public.ai_visibility_citations;
CREATE POLICY "ai_vis_cites_delete_own"
  ON public.ai_visibility_citations FOR DELETE
  USING (auth.uid() = user_id);


-- ─── TABLE 3: KEYWORDS ─────────────────────────────────────────────────────────────────────
-- Tracked keywords linked to a visibility config.
-- Users add keywords they want to monitor across AI platforms.

CREATE TABLE IF NOT EXISTS public.ai_visibility_keywords (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config_id        uuid NOT NULL REFERENCES public.ai_visibility_configs(id) ON DELETE CASCADE,
  keyword          text NOT NULL,
  category         text,                              -- 'brand', 'product', 'competitor', 'industry', 'other'
  last_results     jsonb,                             -- latest scan results for this keyword
  last_checked_at  timestamptz,                       -- when this keyword was last scanned
  created_at       timestamptz NOT NULL DEFAULT now(),

  -- Prevent duplicate keywords per config
  UNIQUE(config_id, keyword)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_vis_kw_user_id    ON public.ai_visibility_keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_vis_kw_config_id  ON public.ai_visibility_keywords(config_id);

-- RLS
ALTER TABLE public.ai_visibility_keywords ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_vis_kw_select_own" ON public.ai_visibility_keywords;
CREATE POLICY "ai_vis_kw_select_own"
  ON public.ai_visibility_keywords FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_vis_kw_insert_own" ON public.ai_visibility_keywords;
CREATE POLICY "ai_vis_kw_insert_own"
  ON public.ai_visibility_keywords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_vis_kw_delete_own" ON public.ai_visibility_keywords;
CREATE POLICY "ai_vis_kw_delete_own"
  ON public.ai_visibility_keywords FOR DELETE
  USING (auth.uid() = user_id);


-- ─── TABLE 4: SNAPSHOTS ────────────────────────────────────────────────────────────────────
-- Daily aggregated metrics for trend charts.
-- One row per user+config per day. Computed from scans.
-- Enables 7d/30d/90d trend views without re-scanning.

CREATE TABLE IF NOT EXISTS public.ai_visibility_snapshots (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config_id             uuid REFERENCES public.ai_visibility_configs(id) ON DELETE CASCADE,
  date                  date NOT NULL,
  visibility_score      integer NOT NULL DEFAULT 0,       -- 0-100 overall score
  share_of_voice        numeric(5,2) NOT NULL DEFAULT 0,  -- 0-100 %
  total_mentions        integer NOT NULL DEFAULT 0,
  sentiment_positive    integer NOT NULL DEFAULT 0,
  sentiment_neutral     integer NOT NULL DEFAULT 0,
  sentiment_negative    integer NOT NULL DEFAULT 0,
  platform_breakdown    jsonb NOT NULL DEFAULT '{}',       -- { "google-aio": 2, "chatgpt": 1, ... }
  competitor_data       jsonb NOT NULL DEFAULT '[]',       -- [{ domain, mentions, sov }]
  created_at            timestamptz NOT NULL DEFAULT now(),

  -- One snapshot per config per day
  UNIQUE(config_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_vis_snap_user_id    ON public.ai_visibility_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_vis_snap_config_date ON public.ai_visibility_snapshots(config_id, date DESC);

-- RLS
ALTER TABLE public.ai_visibility_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_vis_snap_select_own" ON public.ai_visibility_snapshots;
CREATE POLICY "ai_vis_snap_select_own"
  ON public.ai_visibility_snapshots FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_vis_snap_insert_own" ON public.ai_visibility_snapshots;
CREATE POLICY "ai_vis_snap_insert_own"
  ON public.ai_visibility_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_vis_snap_update_own" ON public.ai_visibility_snapshots;
CREATE POLICY "ai_vis_snap_update_own"
  ON public.ai_visibility_snapshots FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_vis_snap_delete_own" ON public.ai_visibility_snapshots;
CREATE POLICY "ai_vis_snap_delete_own"
  ON public.ai_visibility_snapshots FOR DELETE
  USING (auth.uid() = user_id);
