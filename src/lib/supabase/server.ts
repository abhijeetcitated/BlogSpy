/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🗄️ SUPABASE SERVER CLIENT
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Server-side Supabase client for Server Components, Route Handlers, and Server Actions.
 * Handles cookies automatically for authentication.
 * 
 * @example
 * ```tsx
 * // In Server Component or Server Action
 * import { createServerClient } from "@/lib/supabase/server"
 * 
 * const supabase = await createServerClient()
 * const { data } = await supabase.from("users").select("*")
 * ```
 */

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
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
// SERVER CLIENT FACTORY
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Creates a Supabase client for server-side usage.
 * Works in Server Components, Route Handlers, and Server Actions.
 * 
 * This function is async because it needs to access cookies.
 */
export async function createServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()
  const cookieStore = await cookies()

  return createSupabaseServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          })
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ADMIN CLIENT (Service Role - Use with caution!)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Creates a Supabase admin client with service role key.
 * ⚠️ USE WITH EXTREME CAUTION - Bypasses Row Level Security!
 * 
 * Only use for admin operations, background jobs, or webhooks.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable.")
  }

  if (!supabaseServiceKey) {
    throw new Error(
      "❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
      "This is required for admin operations."
    )
  }

  return createSupabaseServerClient<Database>(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // No-op for admin client
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export type SupabaseServerClient = Awaited<ReturnType<typeof createServerClient>>
export type SupabaseAdminClient = ReturnType<typeof createAdminClient>
