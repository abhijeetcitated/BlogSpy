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
import { headers } from "next/headers"
import { z } from "zod"
import { createClient } from "@/src/lib/supabase/server"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface BaseActionContext {
  idempotencyKey: string | null
}

export interface ActionContext extends BaseActionContext {
  userId: string
  email: string
  role: "user" | "admin" | "moderator"
}

const HONEYTOKEN_KEYS = new Set(["bot_trap", "botTrap", "honeytoken", "honeyToken"])
const SAFE_ACTION_ERRORS = new Set(["PLG_LOGIN_REQUIRED", "Bot Detected"])

async function getRequestIp(): Promise<string | null> {
  const headerList = await headers()
  const forwardedFor = headerList.get("x-forwarded-for")

  if (forwardedFor) {
    const [first] = forwardedFor.split(",")
    if (first) {
      return first.trim()
    }
  }

  return (
    headerList.get("x-real-ip") ??
    headerList.get("cf-connecting-ip") ??
    headerList.get("x-client-ip") ??
    null
  )
}

async function getIdempotencyKey(): Promise<string | null> {
  const value = (await headers()).get("x-idempotency-key")
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function findHoneytokenValue(input: unknown): string | null {
  if (!input || typeof input !== "object") {
    return null
  }

  if (Array.isArray(input)) {
    for (const entry of input) {
      const found = findHoneytokenValue(entry)
      if (found) return found
    }
    return null
  }

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (HONEYTOKEN_KEYS.has(key)) {
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        return String(value)
      }
    }

    const nested = findHoneytokenValue(value)
    if (nested) return nested
  }

  return null
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

    if (SAFE_ACTION_ERRORS.has(error.message)) {
      return error.message
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

const securityClient = baseClient.use(async ({ clientInput, bindArgsClientInputs, next, ctx }) => {
  const honeytokenValue =
    findHoneytokenValue(clientInput) ?? findHoneytokenValue(bindArgsClientInputs)

  if (honeytokenValue !== null) {
    const ip = await getRequestIp()
    console.warn("[SafeAction] Honeytoken triggered", { ip })
    throw new Error("Bot Detected")
  }

  const idempotencyKey = await getIdempotencyKey()
  return next({ ctx: { ...ctx, idempotencyKey } })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// PUBLIC ACTION (no auth required)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export const publicAction = securityClient

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// AUTH ACTION (requires authenticated user)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export const authAction = securityClient.use(async ({ next, ctx }) => {
  // ═══════════════════════════════════════════════════════════════
  // MOCK MODE: Bypass authentication for development
  // ═══════════════════════════════════════════════════════════════
  const isMockMode = process.env.USE_MOCK_DATA === "true" ||
                     process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
  
  if (isMockMode) {
    console.log("[authAction] MOCK MODE: Bypassing authentication")
    const nextCtx: ActionContext = {
      ...ctx,
      userId: "mock-user-dev-123",
      email: "dev@ozmeum.com",
      role: "user",
    }
    return next({ ctx: nextCtx })
  }

  // ═══════════════════════════════════════════════════════════════
  // PRODUCTION MODE: Real Supabase authentication
  // ═══════════════════════════════════════════════════════════════
  
  // Get Supabase client
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("PLG_LOGIN_REQUIRED")
  }

  // Build context
  const nextCtx: ActionContext = {
    ...ctx,
    userId: user.id,
    email: user.email || "",
    role: (user.user_metadata?.role as ActionContext["role"]) || "user",
  }

  return next({ ctx: nextCtx })
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
