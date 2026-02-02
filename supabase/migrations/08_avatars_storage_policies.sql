-- ============================================================
-- Avatars Storage RLS Policies
-- ============================================================
-- Purpose:
-- 1) Public read-only access to avatars
-- 2) Authenticated upload access
-- 3) Owner-only update/delete access
-- ============================================================

-- Enable RLS on storage.objects (safe if already enabled).
-- Some hosted roles are not table owners; ignore insufficient_privilege.
DO $$
BEGIN
  BEGIN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping RLS enable on storage.objects (insufficient privilege)';
  END;
END $$;

-- POLICY 1: Public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read avatars'
  ) THEN
    CREATE POLICY "Public read avatars"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'avatars');
  END IF;
END $$;

-- POLICY 2: Authenticated insert access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated insert avatars'
  ) THEN
    CREATE POLICY "Authenticated insert avatars"
      ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- POLICY 3: Owner-only update access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Owner update avatars'
  ) THEN
    CREATE POLICY "Owner update avatars"
      ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- POLICY 4: Owner-only delete access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Owner delete avatars'
  ) THEN
    CREATE POLICY "Owner delete avatars"
      ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;
