"use server"

import "server-only"

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const freeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "blogspy:analyze:free",
})

const proLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "10 m"),
  analytics: true,
  prefix: "blogspy:analyze:pro",
})

export type RateLimitPlan = "free" | "pro"

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

export async function enforceAnalyzeRateLimit({
  userId,
  plan,
  ip,
}: {
  userId?: string | null
  plan?: string | null
  ip?: string | null
}) {
  const limiter = normalizePlan(plan) === "pro" ? proLimiter : freeLimiter
  const key = userId ?? ip ?? "anonymous"
  return limiter.limit(key)
}
