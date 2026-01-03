// ============================================
// SAFE ACTION - Type-Safe Server Actions (2026 Enterprise)
// ============================================
// Uses next-safe-action v8 with:
// - Zod validation
// - Real Supabase authentication
// - Upstash rate limiting
// - Error handling
// ============================================

import "server-only"
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action"
import { z } from "zod"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

// ============================================
// TYPES
// ============================================

export interface ActionContext {
  userId: string
  email: string
  role: "user" | "admin" | "moderator"
}

// ============================================
// RATE LIMITER (Upstash)
// ============================================

// Rate limiter instance - lazy initialized
let ratelimit: Ratelimit | null = null

function getRateLimiter(): Ratelimit | null {
  // Skip rate limiting if Upstash is not configured
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(20, "10 s"), // 20 requests per 10 seconds
      analytics: true,
      prefix: "blogspy:ratelimit:",
    })
  }

  return ratelimit
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getClientIP(): Promise<string> {
  const headersList = await headers()
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIP = headersList.get("x-real-ip")
  
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  
  return realIP || "anonymous"
}

// ============================================
// BASE ACTION CLIENT (Public - No Auth Required)
// ============================================

export const action = createSafeActionClient({
  // Handle server errors
  handleServerError: (error) => {
    console.error("[SafeAction Error]:", error.message)
    
    // Don't expose internal errors to client
    if (error.message.includes("NEXT_REDIRECT")) {
      throw error // Let Next.js handle redirects
    }
    
    return DEFAULT_SERVER_ERROR_MESSAGE
  },
})

// Alias for compatibility
export const actionClient = action

// ============================================
// RATE LIMITED ACTION CLIENT
// ============================================

export const rateLimitedAction = action.use(async ({ next }) => {
  const limiter = getRateLimiter()
  
  if (limiter) {
    const ip = await getClientIP()
    const { success, limit, remaining, reset } = await limiter.limit(ip)
    
    if (!success) {
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`)
    }
    
    // Attach rate limit info to context
    return next({
      ctx: {
        rateLimit: { limit, remaining, reset },
      },
    })
  }
  
  return next({ ctx: {} })
})

// ============================================
// AUTHENTICATED ACTION CLIENT
// ============================================

export const authAction = action.use(async ({ next }) => {
  // Get Supabase client
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error } = await supabase.auth.getUser()
  
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

// ============================================
// AUTHENTICATED + RATE LIMITED ACTION CLIENT
// ============================================

export const authRateLimitedAction = authAction.use(async ({ next, ctx }) => {
  const limiter = getRateLimiter()
  
  if (limiter) {
    // Rate limit by user ID for authenticated users
    const { success, limit, remaining, reset } = await limiter.limit(`user:${ctx.userId}`)
    
    if (!success) {
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`)
    }
    
    return next({
      ctx: {
        ...ctx,
        rateLimit: { limit, remaining, reset },
      },
    })
  }
  
  return next({ ctx })
})

// ============================================
// ADMIN ACTION CLIENT
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

// Re-export zod for schema definitions
export { z }

// Schema helper for common patterns
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
