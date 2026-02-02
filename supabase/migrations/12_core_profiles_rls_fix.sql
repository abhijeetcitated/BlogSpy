-- ============================================================
-- CORE PROFILES: RLS & CASCADE SAFETY FIX
-- ============================================================
-- Purpose:
-- 1) Enforce RLS on core_profiles.
-- 2) Allow authenticated users to read/update only their row.
-- 3) Ensure ON DELETE CASCADE from auth.users.
-- ============================================================

alter table public.core_profiles enable row level security;

-- Read own profile
drop policy if exists "select_own_core_profiles" on public.core_profiles;
create policy "select_own_core_profiles"
  on public.core_profiles
  for select
  using (auth.uid() = id);

-- Update own profile
drop policy if exists "update_own_core_profiles" on public.core_profiles;
create policy "update_own_core_profiles"
  on public.core_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Column-level update grants
revoke update on public.core_profiles from authenticated;
grant update (full_name, timezone, date_format, language_preference, last_password_change) on public.core_profiles to authenticated;

-- Ensure FK has ON DELETE CASCADE
do $$
declare
  constraint_name text;
begin
  select conname
    into constraint_name
    from pg_constraint
   where conrelid = 'public.core_profiles'::regclass
     and contype = 'f'
     and confrelid = 'auth.users'::regclass;

  if constraint_name is not null then
    execute format('alter table public.core_profiles drop constraint if exists %I', constraint_name);
  end if;

  execute 'alter table public.core_profiles add constraint core_profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade';
end $$;
