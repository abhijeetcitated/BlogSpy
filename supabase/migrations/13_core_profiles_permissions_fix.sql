-- ============================================================
-- CORE PROFILES: COMPLETE PERMISSIONS FIX
-- ============================================================
-- This migration fixes all permission issues with core_profiles
-- by granting proper table-level and column-level permissions.
-- ============================================================

-- 1) Ensure RLS is enabled
alter table public.core_profiles enable row level security;

-- 2) Drop ALL old policies (clean slate)
drop policy if exists "policy_profiles_select" on public.core_profiles;
drop policy if exists "policy_profiles_update" on public.core_profiles;
drop policy if exists "policy_profiles_service_role" on public.core_profiles;
drop policy if exists "select_own_core_profiles" on public.core_profiles;
drop policy if exists "update_own_core_profiles" on public.core_profiles;
drop policy if exists "service_role_insert_core_profiles" on public.core_profiles;

-- 3) Create NEW unified policies
-- SELECT: Users can read their own profile
create policy "users_select_own_profile" on public.core_profiles
  for select to authenticated
  using (auth.uid() = id);

-- UPDATE: Users can update their own profile
create policy "users_update_own_profile" on public.core_profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- SERVICE ROLE: Full access for backend operations
create policy "service_role_full_access" on public.core_profiles
  for all to service_role
  using (true)
  with check (true);

-- 4) Fix table-level grants (CRITICAL!)
-- First revoke everything to start fresh
revoke all on public.core_profiles from authenticated;
revoke all on public.core_profiles from anon;

-- Grant SELECT to authenticated users (they can read their profile)
grant select on public.core_profiles to authenticated;

-- Grant UPDATE on specific columns only (not id, email, auth_provider, billing_tier)
grant update (full_name, timezone, date_format, language_preference, last_password_change) on public.core_profiles to authenticated;

-- Service role gets everything
grant all on public.core_profiles to service_role;

-- 5) Verify anon has no access (security)
revoke all on public.core_profiles from anon;
