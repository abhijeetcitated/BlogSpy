-- AI Visibility configs: allow multiple configs per user + project naming

alter table if exists public.ai_visibility_configs
  add column if not exists project_name text;

-- Drop any single-config-per-user unique constraints
alter table if exists public.ai_visibility_configs
  drop constraint if exists ai_visibility_configs_user_id_key;

alter table if exists public.ai_visibility_configs
  drop constraint if exists ai_visibility_configs_user_id_unique;

-- RLS: ensure users can access only their own configs
alter table if exists public.ai_visibility_configs enable row level security;

drop policy if exists "ai_visibility_configs_select_own" on public.ai_visibility_configs;
drop policy if exists "ai_visibility_configs_insert_own" on public.ai_visibility_configs;
drop policy if exists "ai_visibility_configs_update_own" on public.ai_visibility_configs;
drop policy if exists "ai_visibility_configs_delete_own" on public.ai_visibility_configs;

create policy "ai_visibility_configs_select_own"
  on public.ai_visibility_configs
  for select
  using (auth.uid() = user_id);

create policy "ai_visibility_configs_insert_own"
  on public.ai_visibility_configs
  for insert
  with check (auth.uid() = user_id);

create policy "ai_visibility_configs_update_own"
  on public.ai_visibility_configs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ai_visibility_configs_delete_own"
  on public.ai_visibility_configs
  for delete
  using (auth.uid() = user_id);
