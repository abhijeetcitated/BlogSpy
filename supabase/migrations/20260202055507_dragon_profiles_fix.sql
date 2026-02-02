-- 1. Ensure schema is standard
ALTER TABLE IF EXISTS public.core_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Clear all conflicting policies
DROP POLICY IF EXISTS "users_select_own_profile" ON public.core_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.core_profiles;
DROP POLICY IF EXISTS "service_role_full_access" ON public.core_profiles;

-- 3. Standard Production Policies
CREATE POLICY "profiles_select" ON public.core_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.core_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_service" ON public.core_profiles FOR INSERT TO service_role WITH CHECK (true);

-- 4. CRITICAL: Grants Fix (Isse Permission Denied khatam hoga)
GRANT ALL ON public.core_profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.core_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- 5. FAIL-SAFE SYNC FUNCTION (Dragon Protocol)
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as Admin
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.core_profiles (
    id, 
    email, 
    auth_provider, 
    full_name, 
    avatar_url, 
    billing_tier,
    timezone
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_app_meta_data->>'provider', 'email'),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    new.raw_user_meta_data->>'avatar_url',
    'free',
    'UTC'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    auth_provider = EXCLUDED.auth_provider,
    updated_at = NOW();
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Agar koi error aaye toh signup na roko, bas ignore karo (Debug later)
  RETURN new;
END;
$$;

-- 6. Trigger Re-wiring
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_sync();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_sync();