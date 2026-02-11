-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- ADD competitors COLUMN to ai_visibility_citations
-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- Stores competitor domains detected alongside brand in AI responses.
-- Supports auto-detection from LLM citation URLs + response text patterns.

ALTER TABLE public.ai_visibility_citations
  ADD COLUMN IF NOT EXISTS competitors text[] DEFAULT '{}';

-- Index for competitor analysis queries
CREATE INDEX IF NOT EXISTS idx_ai_vis_cites_competitors
  ON public.ai_visibility_citations USING GIN (competitors);
