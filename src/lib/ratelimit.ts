import "server-only"

import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/lib/redis"
import { createAdminClient } from "@/lib/supabase/server"

type RateLimitPlan = "free" | "pro"

type RateLimitInput = {
  userId?: string | null
  plan?: string | null
  ip?: string | null
  userAgent?: string | null
  route?: string
}

type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

const freeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "citated:ratelimit:free",
})

const proLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "10 m"),
  analytics: true,
  prefix: "citated:ratelimit:pro",
})

const RATE_LIMIT_STRIKES_KEY = "citated:ratelimit:strikes"
const STRIKE_WINDOW_SECONDS = 60 * 60
const SUSPICIOUS_WINDOW_SECONDS = 24 * 60 * 60

function normalizePlan(plan?: string | null): RateLimitPlan {
  if (!plan) return "free"
  const normalized = plan.toLowerCase()
  if (
    ["pro", "agency", "enterprise", "starter", "paid"].includes(normalized) ||
    normalized.includes("pro") ||
    normalized.includes("agency") ||
    normalized.includes("enterprise")
  ) {
    return "pro"
  }
  return "free"
}

async function logRateLimitViolation({
  userId,
  ip,
  userAgent,
  route,
  strikes,
  plan,
}: {
  userId?: string | null
  ip?: string | null
  userAgent?: string | null
  route?: string
  strikes: number
  plan: string
}) {
  const admin = createAdminClient()
  const now = new Date()

  try {
    await admin.from("core_security_violations").insert({
      ip_address: ip ?? "unknown",
      user_agent: userAgent ?? "unknown",
      violation_type: "rate_limit_exceeded",
      metadata: {
        user_id: userId ?? null,
        strikes,
        plan,
        route: route ?? "unknown",
      },
    })
  } catch (error) {
    console.warn("[RateLimit] Failed to log security violation", {
      error: error instanceof Error ? error.message : "unknown error",
    })
  }

  if (!userId) {
    return
  }

  try {
    await admin
      .from("core_profiles")
      .update({
        suspicious: true,
        suspicious_until: new Date(now.getTime() + SUSPICIOUS_WINDOW_SECONDS * 1000).toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", userId)
  } catch (error) {
    console.warn("[RateLimit] Failed to flag suspicious user", {
      error: error instanceof Error ? error.message : "unknown error",
    })
  }
}

async function recordStrike({
  userId,
  ip,
  userAgent,
  route,
  plan,
}: {
  userId?: string | null
  ip?: string | null
  userAgent?: string | null
  route?: string
  plan: string
}) {
  const identifier = userId ?? ip ?? "anonymous"
  const key = `${RATE_LIMIT_STRIKES_KEY}:${identifier}`

  const strikes = await redis.incr(key)
  if (strikes === 1) {
    await redis.expire(key, STRIKE_WINDOW_SECONDS)
  }

  if (strikes > 3) {
    await logRateLimitViolation({ userId, ip, userAgent, route, strikes, plan })
  }
}

export async function enforceKeywordRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const plan = normalizePlan(input.plan)
  const limiter = plan === "pro" ? proLimiter : freeLimiter
  const key = input.userId ?? input.ip ?? "anonymous"
  const result = await limiter.limit(key)

  if (!result.success) {
    await recordStrike({
      userId: input.userId,
      ip: input.ip,
      userAgent: input.userAgent,
      route: input.route ?? "keyword-research",
      plan,
    })
  }

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}