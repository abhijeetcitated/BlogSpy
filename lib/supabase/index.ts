/**
 * Supabase Lib Barrel Export
 */

export { createClient, getSupabaseBrowserClient } from "./client"
export type { SupabaseClient } from "./client"

export { createClient as createServerClient, createAdminClient } from "./server"
export type { SupabaseServerClient, SupabaseAdminClient } from "./server"
