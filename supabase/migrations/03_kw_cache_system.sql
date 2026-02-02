-- ============================================================
-- KW CACHE SYSTEM (Split-Timing + Lifecycle Maintenance)
-- ============================================================
-- Purpose:
-- 1) Cache keyword data with separate TTLs for Labs vs SERP.
-- 2) Track access recency for pruning cold rows.
-- 3) Enforce RLS with service_role write access only.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Table: public.kw_cache
-- ------------------------------------------------------------
-- last_labs_update: Volume/CPC/KD (30-day TTL)
-- last_serp_update: WeakSpots/GEO/Serp (7-day TTL)
-- last_accessed_at: updated on every search to track popularity
-- ------------------------------------------------------------
create table if not exists public.kw_cache (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  keyword text not null,
  country_code text not null,
  match_type text not null,
  raw_data jsonb,
  analysis_data jsonb,
  last_labs_update timestamp with time zone not null default now(),
  last_serp_update timestamp with time zone default null,
  last_accessed_at timestamp with time zone not null default now()
);

-- ------------------------------------------------------------
-- Device targeting support
-- ------------------------------------------------------------
ALTER TABLE public.kw_cache
  ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'desktop'
  CHECK (device_type IN ('desktop', 'mobile'));

-- Create a lookup index that includes device_type.
-- Use location_code if it exists; otherwise fall back to country_code.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'kw_cache'
      AND column_name = 'location_code'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_kw_cache_device_lookup ON public.kw_cache (keyword, location_code, device_type)';
  ELSE
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_kw_cache_device_lookup ON public.kw_cache (keyword, country_code, device_type)';
  END IF;
END $$;

-- Unique lookup key
create unique index if not exists kw_cache_slug_key on public.kw_cache (slug);

-- Fast pruning by recency
create index if not exists kw_cache_last_accessed_at_idx on public.kw_cache (last_accessed_at);

alter table public.kw_cache enable row level security;

-- ------------------------------------------------------------
-- RLS Policies
-- ------------------------------------------------------------
-- Authenticated users can read cached data.
-- Only service_role can insert/update cached rows.
-- ------------------------------------------------------------
drop policy if exists "select_kw_cache_authenticated" on public.kw_cache;
create policy "select_kw_cache_authenticated"
  on public.kw_cache
  for select
  using (auth.role() in ('authenticated', 'service_role'));

drop policy if exists "insert_kw_cache_service_role" on public.kw_cache;
create policy "insert_kw_cache_service_role"
  on public.kw_cache
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists "update_kw_cache_service_role" on public.kw_cache;
create policy "update_kw_cache_service_role"
  on public.kw_cache
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ------------------------------------------------------------
-- Maintenance Function: public.maintain_kw_cache_health()
-- ------------------------------------------------------------
-- Logic 1 (Forensic Purge):
--   If SERP data is older than 7 days, clear analysis_data and
--   last_serp_update to force a fresh forensic scan.
-- Logic 2 (Deep Purge):
--   If a keyword hasn't been accessed in 60 days, delete it.
-- ------------------------------------------------------------
create or replace function public.maintain_kw_cache_health()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Forensic purge: expire SERP analysis after 7 days
  update public.kw_cache
  set
    analysis_data = null,
    last_serp_update = null
  where last_serp_update is not null
    and last_serp_update < now() - interval '7 days';

  -- Deep purge: remove cold rows after 60 days of no access
  delete from public.kw_cache
  where last_accessed_at < now() - interval '60 days';
end;
$$;
