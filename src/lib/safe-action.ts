// ============================================
// 🛡️ SECURE ACTION WRAPPER (The Guard)
// ============================================
// Centralized security for all Server Actions
// - Supabase authentication
// - Upstash rate limiting (10 req / 10s sliding window)
// - Secure error logging (no stack trace leaks)
// ============================================

import "server-only"
import { createSafeActionClient } from "next-safe-action"
import { z } from "zod"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { createServerClient } from "@/src/lib/supabase/server"
import { headers } from "next/headers"

// ============================================
// TYPES
// ============================================

export interface AuthContext {
  userId: string
  email: string
  role: "user" | "admin" | "moderator"
}

// ============================================
// RATE LIMITER (Upstash - 10 req / 10s sliding window)
// ============================================

let ratelimit: Ratelimit | null = null

function getRateLimiter(): Ratelimit | null {
  // Skip rate limiting if Upstash is not configured
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[SafeAction] Upstash not configured, rate limiting disabled")
    }
    return null
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
      analytics: true,
      prefix: "blogspy:action:",
    })
  }

  return ratelimit
}

// ============================================
// HELPER: Get Client IP for Rate Limiting
// ============================================

async function getClientIdentifier(userId?: string): Promise<string> {
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}`
  }

  // Fall back to IP for anonymous requests
  const headersList = await headers()
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIP = headersList.get("x-real-ip")

  if (forwardedFor) {
    return `ip:${forwardedFor.split(",")[0].trim()}`
  }

  return realIP ? `ip:${realIP}` : "ip:anonymous"
}

// ============================================
// SECURE ERROR HANDLER (No Stack Trace Leaks)
// ============================================

function handleServerError(error: Error): string {
  // Log full error server-side for debugging
  console.error("[SafeAction Error]:", {
    message: error.message,
    name: error.name,
    // Stack only logged in development
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })

  // Allow Next.js redirects to pass through
  if (error.message.includes("NEXT_REDIRECT")) {
    throw error
  }

  // Return sanitized error messages to client
  const safeErrors = [
    "Unauthorized",
    "Too Many Requests",
    "Admin access required",
    "Invalid input",
  ]

  if (safeErrors.some((msg) => error.message.includes(msg))) {
    return error.message
  }

  // Generic error for everything else (no stack trace leak)
  return "An unexpected error occurred. Please try again."
}

// ============================================
// PUBLIC ACTION (No Auth Required)
// ============================================

export const publicAction = createSafeActionClient({
  handleServerError,
})

// ============================================
// AUTHENTICATED ACTION (Auth + Rate Limit)
// ============================================

export const authAction = publicAction.use(async ({ next }) => {
  // ─────────────────────────────────────────
  // STEP 1: Check Supabase Authentication
  // ─────────────────────────────────────────
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Unauthorized")
  }

  // ─────────────────────────────────────────
  // STEP 2: Check Rate Limit
  // ─────────────────────────────────────────
  const limiter = getRateLimiter()

  if (limiter) {
    const identifier = await getClientIdentifier(user.id)
    const { success, reset } = await limiter.limit(identifier)

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      throw new Error(`Too Many Requests. Retry after ${retryAfter}s`)
    }
  }

  // ─────────────────────────────────────────
  // STEP 3: Build Auth Context
  // ─────────────────────────────────────────
  const ctx: AuthContext = {
    userId: user.id,
    email: user.email || "",
    role: (user.user_metadata?.role as AuthContext["role"]) || "user",
  }

  return next({ ctx })
})

// ============================================
// ADMIN ACTION (Auth + Admin Role Required)
// ============================================

export const adminAction = authAction.use(async ({ next, ctx }) => {
  if (ctx.role !== "admin") {
    throw new Error("Admin access required")
  }

  return next({ ctx })
})

// ============================================
// CONVENIENCE EXPORTS
// ============================================

export { z }

export const schemas = {
  id: z.string().uuid(),
  email: z.string().email(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),
}
