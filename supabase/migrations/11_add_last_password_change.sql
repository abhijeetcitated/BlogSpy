-- ============================================================
-- CORE PROFILES: PASSWORD CHANGE TIMESTAMP
-- ============================================================
-- Purpose:
-- 1) Track when a user last changed their password.
-- ============================================================

alter table public.core_profiles
  add column if not exists last_password_change timestamp with time zone default now();

update public.core_profiles
set last_password_change = now()
where last_password_change is null;
