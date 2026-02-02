create extension if not exists "pgcrypto";

create table if not exists public.kw_filter_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.core_profiles(id) on delete cascade,
  name text not null,
  filters jsonb not null,
  is_default boolean not null default false,
  created_at timestamp with time zone not null default now()
);

alter table public.kw_filter_presets enable row level security;

drop policy if exists "select_own_kw_filter_presets" on public.kw_filter_presets;
create policy "select_own_kw_filter_presets"
  on public.kw_filter_presets
  for select
  using (auth.uid() = user_id);

drop policy if exists "insert_own_kw_filter_presets" on public.kw_filter_presets;
create policy "insert_own_kw_filter_presets"
  on public.kw_filter_presets
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "delete_own_kw_filter_presets" on public.kw_filter_presets;
create policy "delete_own_kw_filter_presets"
  on public.kw_filter_presets
  for delete
  using (auth.uid() = user_id);
