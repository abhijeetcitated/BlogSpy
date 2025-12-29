/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🗄️ SUPABASE - Barrel Export
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 */

export { createBrowserClient, type SupabaseBrowserClient } from "./client"
export { 
  createServerClient, 
  createAdminClient,
  type SupabaseServerClient,
  type SupabaseAdminClient 
} from "./server"
