/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🗄️ SUPABASE BROWSER CLIENT
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Browser-side Supabase client for client components.
 * Use this in "use client" components only.
 * 
 * @example
 * ```tsx
 * "use client"
 * import { createBrowserClient } from "@/lib/supabase/client"
 * 
 * const supabase = createBrowserClient()
 * const { data } = await supabase.from("users").select("*")
 * ```
 */

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error(
      "❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
      "Please add it to your .env.local file."
    )
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. " +
      "Please add it to your .env.local file."
    )
  }

  return { supabaseUrl, supabaseAnonKey }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// BROWSER CLIENT FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Creates a Supabase client for browser/client components.
 * This should be called in "use client" components.
 * 
 * Note: This creates a new instance each time to ensure fresh cookies.
 * The @supabase/ssr package handles caching internally.
 */
export function createBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()

  return createSupabaseBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>
