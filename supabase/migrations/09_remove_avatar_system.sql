-- ============================================================
-- REMOVE AVATAR SYSTEM (PROFILE + STORAGE)
-- ============================================================
-- Purpose:
-- 1) Drop avatar_url from core_profiles
-- 2) Remove avatars bucket policies
-- 3) Optional: delete avatars bucket + objects
-- ============================================================

alter table public.core_profiles
  drop column if exists avatar_url;

-- Drop avatars bucket policies (if they exist)
drop policy if exists "Public read avatars" on storage.objects;
drop policy if exists "Authenticated insert avatars" on storage.objects;
drop policy if exists "Owner update avatars" on storage.objects;
drop policy if exists "Owner delete avatars" on storage.objects;

-- Optional cleanup: remove stored avatars and bucket (safe if already empty)
delete from storage.objects where bucket_id = 'avatars';
delete from storage.buckets where id = 'avatars';
