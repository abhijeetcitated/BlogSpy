/**
 * ============================================
 * SERVER-SIDE AUTHENTICATION UTILITIES
 * ============================================
 * 
 * Centralized auth helpers for API routes
 * Uses Supabase SSR for secure cookie-based auth
 * 
 * ============================================
 */

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { User } from "@supabase/supabase-js"

export interface AuthResult {
  user: User | null
  error: string | null
  isAuthenticated: boolean
}

/**
 * Get authenticated user from Supabase (Server-side)
 * 
 * Use in API routes and Server Components:
 * ```ts
 * const { user, isAuthenticated } = await getServerUser()
 * if (!isAuthenticated) return unauthorized()
 * ```
 */
export async function getServerUser(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        user: null,
        error: "Supabase not configured",
        isAuthenticated: false,
      }
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors in read-only contexts (like Server Components)
          }
        },
      },
    })

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return {
        user: null,
        error: error.message,
        isAuthenticated: false,
      }
    }

    return {
      user,
      error: null,
      isAuthenticated: !!user,
    }
  } catch (error) {
    console.error("[ServerAuth] Error:", error)
    return {
      user: null,
      error: "Authentication check failed",
      isAuthenticated: false,
    }
  }
}

/**
 * Create Supabase client for server-side operations
 * Use when you need to perform DB operations as the user
 */
export async function getServerSupabase() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignore errors in read-only contexts
        }
      },
    },
  })
}

/**
 * Extract user identifier for rate limiting
 * Prefers user ID, falls back to IP
 */
export function getUserIdentifier(
  user: User | null,
  ip: string | null
): string {
  if (user?.id) return `user:${user.id}`
  return `ip:${ip || "anonymous"}`
}
