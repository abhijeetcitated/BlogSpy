-- ============================================================
-- CORE PROFILES: USER PREFERENCES (timezone/date_format/language)
-- ============================================================
-- Purpose:
-- 1) Persist localization preferences on core_profiles.
-- 2) Allow authenticated users to update only their own preferences.
-- ============================================================

alter table public.core_profiles
  add column if not exists timezone text not null default 'UTC',
  add column if not exists date_format text not null default 'DD/MM/YYYY',
  add column if not exists language_preference text not null default 'en';

-- Ensure update policy exists (auth users can update own row)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'core_profiles'
      and policyname = 'update_own_core_profiles'
  ) then
    create policy "update_own_core_profiles"
      on public.core_profiles
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

-- Restrict column updates to safe fields only
revoke update on public.core_profiles from authenticated;
grant update (full_name, timezone, date_format, language_preference) on public.core_profiles to authenticated;
