-- ============================================================================
-- COMPETITOR GAP V1 TABLES (Tier-3)
-- ============================================================================
-- Creates:
--   1) competitor_gap_runs
--   2) competitor_gap_results
--   3) competitor_gap_jobs
-- with strict user-scoped RLS policies.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- TABLE 1: RUNS
-- ----------------------------------------------------------------------------
create table if not exists public.competitor_gap_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('missing-only', 'full-gap')),
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  your_domain text not null,
  competitor1_domain text not null,
  competitor2_domain text,
  location_code integer not null default 2840,
  language_code text not null default 'en',
  cache_key text not null,
  cache_expires_at timestamptz,
  summary jsonb not null default '{}'::jsonb,
  upstream_calls_used integer not null default 0,
  provider_cost_estimate numeric(12, 6) not null default 0,
  retries_used integer not null default 0,
  queue_wait_ms integer not null default 0,
  request_id text not null default gen_random_uuid()::text,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_gap_runs_user_created
  on public.competitor_gap_runs (user_id, created_at desc);

create index if not exists idx_gap_runs_user_status
  on public.competitor_gap_runs (user_id, status, created_at desc);

create index if not exists idx_gap_runs_cache
  on public.competitor_gap_runs (user_id, cache_key, status, cache_expires_at desc);

create index if not exists idx_gap_runs_request_id
  on public.competitor_gap_runs (request_id);

-- ----------------------------------------------------------------------------
-- TABLE 2: RESULTS
-- ----------------------------------------------------------------------------
create table if not exists public.competitor_gap_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.competitor_gap_runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  keyword text not null,
  intent text not null check (intent in ('commercial', 'informational', 'transactional', 'navigational')),
  gap_type text not null check (gap_type in ('missing', 'weak', 'strong', 'shared')),
  has_zero_click_risk boolean not null default false,
  your_rank integer,
  comp1_rank integer,
  comp2_rank integer,
  volume integer not null default 0,
  kd integer not null default 0,
  cpc numeric(12, 4) not null default 0,
  trend text not null default 'stable',
  source text not null check (source in ('comp1', 'comp2', 'both')),
  your_url text,
  comp1_url text,
  comp2_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_gap_results_run
  on public.competitor_gap_results (run_id, volume desc);

create index if not exists idx_gap_results_user_gap
  on public.competitor_gap_results (user_id, gap_type, volume desc);

create index if not exists idx_gap_results_user_keyword
  on public.competitor_gap_results (user_id, keyword);

-- ----------------------------------------------------------------------------
-- TABLE 3: JOBS
-- ----------------------------------------------------------------------------
create table if not exists public.competitor_gap_jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.competitor_gap_runs(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  dedupe_key text not null,
  payload jsonb not null default '{}'::jsonb,
  attempts integer not null default 0,
  error_code text,
  error_message text,
  scheduled_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_gap_jobs_user_status
  on public.competitor_gap_jobs (user_id, status, created_at desc);

create index if not exists idx_gap_jobs_run
  on public.competitor_gap_jobs (run_id);

create index if not exists idx_gap_jobs_dedupe
  on public.competitor_gap_jobs (user_id, dedupe_key, status);

-- ----------------------------------------------------------------------------
-- RLS: competitor_gap_runs
-- ----------------------------------------------------------------------------
alter table public.competitor_gap_runs enable row level security;

drop policy if exists "gap_runs_select_own" on public.competitor_gap_runs;
create policy "gap_runs_select_own"
  on public.competitor_gap_runs
  for select
  using (auth.uid() = user_id);

drop policy if exists "gap_runs_insert_own" on public.competitor_gap_runs;
create policy "gap_runs_insert_own"
  on public.competitor_gap_runs
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "gap_runs_update_own" on public.competitor_gap_runs;
create policy "gap_runs_update_own"
  on public.competitor_gap_runs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "gap_runs_delete_own" on public.competitor_gap_runs;
create policy "gap_runs_delete_own"
  on public.competitor_gap_runs
  for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- RLS: competitor_gap_results
-- ----------------------------------------------------------------------------
alter table public.competitor_gap_results enable row level security;

drop policy if exists "gap_results_select_own" on public.competitor_gap_results;
create policy "gap_results_select_own"
  on public.competitor_gap_results
  for select
  using (auth.uid() = user_id);

drop policy if exists "gap_results_insert_own" on public.competitor_gap_results;
create policy "gap_results_insert_own"
  on public.competitor_gap_results
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "gap_results_update_own" on public.competitor_gap_results;
create policy "gap_results_update_own"
  on public.competitor_gap_results
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "gap_results_delete_own" on public.competitor_gap_results;
create policy "gap_results_delete_own"
  on public.competitor_gap_results
  for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- RLS: competitor_gap_jobs
-- ----------------------------------------------------------------------------
alter table public.competitor_gap_jobs enable row level security;

drop policy if exists "gap_jobs_select_own" on public.competitor_gap_jobs;
create policy "gap_jobs_select_own"
  on public.competitor_gap_jobs
  for select
  using (auth.uid() = user_id);

drop policy if exists "gap_jobs_insert_own" on public.competitor_gap_jobs;
create policy "gap_jobs_insert_own"
  on public.competitor_gap_jobs
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "gap_jobs_update_own" on public.competitor_gap_jobs;
create policy "gap_jobs_update_own"
  on public.competitor_gap_jobs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "gap_jobs_delete_own" on public.competitor_gap_jobs;
create policy "gap_jobs_delete_own"
  on public.competitor_gap_jobs
  for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Rollback SQL (manual)
-- ----------------------------------------------------------------------------
-- drop table if exists public.competitor_gap_jobs;
-- drop table if exists public.competitor_gap_results;
-- drop table if exists public.competitor_gap_runs;
