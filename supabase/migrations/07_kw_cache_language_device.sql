-- ============================================================
-- KW CACHE: ADD LANGUAGE + DEVICE TARGETING
-- ============================================================
-- Purpose:
-- 1) Store language_code and device_type for cache granularity.
-- 2) Keep slug as the unique lookup key (now includes lang+device).
-- ============================================================

alter table public.kw_cache
  add column if not exists language_code text not null default 'en',
  add column if not exists device_type text not null default 'desktop';

-- Re-assert unique slug constraint for 4-part cache keys
drop index if exists kw_cache_slug_key;
create unique index if not exists kw_cache_slug_key on public.kw_cache (slug);
