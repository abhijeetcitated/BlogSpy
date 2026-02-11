-- ============================================================
-- Fix: billing_subscriptions has RLS enabled but 0 policies
-- Without policies, this table is completely locked out
-- ============================================================

-- User can SELECT own subscriptions
CREATE POLICY "billing_subscriptions_select_own" 
  ON public.billing_subscriptions
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

-- Service role gets full access (for webhook/server operations)
CREATE POLICY "billing_subscriptions_service_role" 
  ON public.billing_subscriptions
  FOR ALL TO service_role 
  USING (true);

-- Grant table permissions
GRANT SELECT ON public.billing_subscriptions TO authenticated;
GRANT ALL ON public.billing_subscriptions TO service_role;

-- ============================================================
-- Fix: notificationsettings has RLS enabled but 0 policies
-- This is the PRIMARY notification settings table used by Prisma
-- ============================================================

-- User can SELECT own settings
CREATE POLICY "notificationsettings_select_own" 
  ON public.notificationsettings
  FOR SELECT TO authenticated 
  USING (userid = auth.uid());

-- User can UPDATE own settings
CREATE POLICY "notificationsettings_update_own" 
  ON public.notificationsettings
  FOR UPDATE TO authenticated 
  USING (userid = auth.uid())
  WITH CHECK (userid = auth.uid());

-- User can INSERT own settings (first-time setup)
CREATE POLICY "notificationsettings_insert_own" 
  ON public.notificationsettings
  FOR INSERT TO authenticated 
  WITH CHECK (userid = auth.uid());

-- Service role gets full access (for trigger/sync operations)
CREATE POLICY "notificationsettings_service_role" 
  ON public.notificationsettings
  FOR ALL TO service_role 
  USING (true);

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON public.notificationsettings TO authenticated;
GRANT ALL ON public.notificationsettings TO service_role;
