create extension if not exists "pgcrypto";

create table if not exists public.kw_serp_tasks (
  id uuid primary key default gen_random_uuid(),
  task_id text not null,
  user_id uuid not null references public.core_profiles(id),
  keyword_slug text not null,
  status text not null default 'pending',
  created_at timestamp with time zone not null default now()
);

alter table public.kw_serp_tasks enable row level security;

drop policy if exists "select_own_kw_serp_tasks" on public.kw_serp_tasks;
create policy "select_own_kw_serp_tasks"
  on public.kw_serp_tasks
  for select
  using (auth.uid() = user_id);

drop policy if exists "insert_kw_serp_tasks_service_role" on public.kw_serp_tasks;
create policy "insert_kw_serp_tasks_service_role"
  on public.kw_serp_tasks
  for insert
  with check (auth.role() = 'service_role');
