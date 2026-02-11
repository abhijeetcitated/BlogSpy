-- AI Suggestions live refresh jobs/results (production hardening)

create table if not exists public.ai_suggestion_live_refresh_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.userprojects(id) on delete cascade,
  status text not null default 'queued',
  provider text not null default 'dataforseo',
  credits_charged integer not null default 0,
  idempotency_key text not null unique,
  refreshed_keywords integer not null default 0,
  error_message text,
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_suggestion_live_refresh_jobs_user_requested
  on public.ai_suggestion_live_refresh_jobs (user_id, requested_at desc);

create index if not exists idx_ai_suggestion_live_refresh_jobs_project_requested
  on public.ai_suggestion_live_refresh_jobs (project_id, requested_at desc);

create table if not exists public.ai_suggestion_live_refresh_results (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.ai_suggestion_live_refresh_jobs(id) on delete cascade,
  project_id uuid not null references public.userprojects(id) on delete cascade,
  keyword text not null,
  keyword_slug text,
  source text not null default 'serp',
  has_ai_overview boolean,
  serp_features jsonb,
  weak_spot jsonb,
  trend_growth_percent integer,
  metadata jsonb,
  created_at timestamptz not null default now(),
  unique(job_id, keyword, source)
);

create index if not exists idx_ai_suggestion_live_refresh_results_project_created
  on public.ai_suggestion_live_refresh_results (project_id, created_at desc);

create index if not exists idx_ai_suggestion_live_refresh_results_job
  on public.ai_suggestion_live_refresh_results (job_id);

-- Keep updated_at fresh on updates
create or replace function public.set_ai_suggestion_live_refresh_jobs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_ai_suggestion_live_refresh_jobs_updated_at
on public.ai_suggestion_live_refresh_jobs;

create trigger trg_ai_suggestion_live_refresh_jobs_updated_at
before update on public.ai_suggestion_live_refresh_jobs
for each row
execute function public.set_ai_suggestion_live_refresh_jobs_updated_at();

-- RLS
alter table public.ai_suggestion_live_refresh_jobs enable row level security;
alter table public.ai_suggestion_live_refresh_results enable row level security;

-- Jobs: user can read own jobs
create policy "select_own_ai_suggestion_live_refresh_jobs"
  on public.ai_suggestion_live_refresh_jobs
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Jobs: user can insert own jobs
create policy "insert_own_ai_suggestion_live_refresh_jobs"
  on public.ai_suggestion_live_refresh_jobs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Results: user can read results for own jobs
create policy "select_own_ai_suggestion_live_refresh_results"
  on public.ai_suggestion_live_refresh_results
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.ai_suggestion_live_refresh_jobs j
      where j.id = ai_suggestion_live_refresh_results.job_id
        and j.user_id = auth.uid()
    )
  );

grant all on table public.ai_suggestion_live_refresh_jobs to authenticated, service_role;
grant all on table public.ai_suggestion_live_refresh_results to authenticated, service_role;