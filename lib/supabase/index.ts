/**
 * Supabase Lib Barrel Export
 * 
 * NOTE: Server-only exports (createServerClient, createAdminClient) are NOT included here
 * to prevent accidental client-side imports. Import them directly:
 *   import { createClient } from '@/lib/supabase/server'
 */

// Client-side exports only
export { createClient, getSupabaseBrowserClient } from "./client"
export type { SupabaseClient } from "./client"
