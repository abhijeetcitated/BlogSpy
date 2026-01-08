/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ SAFE ACTION - Type-safe Server Actions with Authentication
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Simple wrapper for next-safe-action v8+ with Supabase authentication.
 * 
 * @see https://next-safe-action.dev/docs/getting-started
 */

import "server-only"

import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface ActionContext {
  userId: string
  email: string
  role: "user" | "admin" | "moderator"
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// BASE ACTION CLIENT (handles errors globally)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const baseClient = createSafeActionClient({
  handleServerError(error) {
    // Log error for debugging (server-side only)
    console.error("[SafeAction Error]:", error.message)

    // Handle Next.js redirects
    if (error.message.includes("NEXT_REDIRECT")) {
      throw error
    }

    // Sanitize error message - don't expose internals
    if (process.env.NODE_ENV === "production") {
      // Return generic message in production
      return DEFAULT_SERVER_ERROR_MESSAGE
    }

    // In development, return actual error for debugging
    return error.message
  },
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// PUBLIC ACTION (no auth required)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export const publicAction = baseClient

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// AUTH ACTION (requires authenticated user)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export const authAction = baseClient.use(async ({ next }) => {
  // Get Supabase client
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Authentication required")
  }

  // Build context
  const ctx: ActionContext = {
    userId: user.id,
    email: user.email || "",
    role: (user.user_metadata?.role as ActionContext["role"]) || "user",
  }

  return next({ ctx })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ADMIN ACTION (requires admin role)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export const adminAction = authAction.use(async ({ next, ctx }) => {
  if (ctx.role !== "admin") {
    throw new Error("Admin access required")
  }

  return next({ ctx })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// LEGACY EXPORTS (for backwards compatibility with existing code)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

// Alias for existing code using 'action'
export const action = publicAction

// Alias for existing code using 'actionClient'
export const actionClient = publicAction

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

// Re-export zod for schema definitions
export { z }

// Common schema patterns
export const schemas = {
  id: z.string().uuid(),
  email: z.string().email(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
}
