import "server-only"

import { createSafeActionClient } from "next-safe-action"
import { headers } from "next/headers"
import { z } from "zod"
import { Ratelimit } from "@upstash/ratelimit"
import { redis as penaltyRedis } from "@/lib/redis"
import { createClient } from "@/lib/supabase/server"

export interface AuthenticatedActionContext {
  userId: string
  email: string | null
  idempotencyKey: string | null
}

async function getIdempotencyKey(): Promise<string | null> {
  const value = (await headers()).get("x-idempotency-key")
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getIdempotencyKeyFromInput(parsedInput: Record<string, unknown> | null): string | null {
  if (!parsedInput) return null
  const value = parsedInput.idempotency_key
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

async function resolveIdempotencyKey(parsedInput: Record<string, unknown> | null): Promise<string | null> {
  const inputKey = getIdempotencyKeyFromInput(parsedInput)
  if (inputKey) return inputKey
  return getIdempotencyKey()
}

const HONEYPOT_FIELDS = ["user_system_priority", "admin_validation_token"] as const
const BANNED_SET_KEY = "banned_ips"
const BAN_TTL_SECONDS = 24 * 60 * 60

// Redis singleton imported as penaltyRedis from @/lib/redis

// ── Per-user rate limiter (30 requests / 60 seconds sliding window) ──
const actionRateLimiter = new Ratelimit({
  redis: penaltyRedis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  analytics: true,
  prefix: "citated:ratelimit:action",
})

// ── IP-based rate limiter for public (unauthenticated) actions ──
const publicActionRateLimiter = new Ratelimit({
  redis: penaltyRedis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  analytics: true,
  prefix: "citated:ratelimit:public",
})

// 🔒 SECURITY: Robust IP Extraction
// Prioritizes platform-specific headers (Cloudflare, Vercel) over X-Forwarded-For
// to prevent spoofing. X-Forwarded-For is only trusted if explicitly enabled.
function isValidIp(ip: string): boolean {
  // Basic IPv4
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return ip.split(".").every(o => {
      const n = Number(o)
      return n >= 0 && n <= 255
    })
  }
  // Basic IPv6 check
  return /^[0-9a-fA-F:]+$/.test(ip) && ip.includes(":")
}

function getClientIpFromHeaders(requestHeaders: Headers): string {
  // 1. Direct Platform Headers (Best Trust)
  const cfIp = requestHeaders.get("cf-connecting-ip")
  if (cfIp && isValidIp(cfIp)) return cfIp

  const realIp = requestHeaders.get("x-real-ip")
  if (realIp && isValidIp(realIp)) return realIp

  // 2. X-Forwarded-For (Trust only if configured)
  // Vercel/Supabase Edge usually strips untrusted xff, but we double-check config
  if (process.env.TRUST_X_FORWARDED_FOR === "true") {
    const forwardedFor = requestHeaders.get("x-forwarded-for")
    if (forwardedFor) {
      const [first] = forwardedFor.split(",")
      if (first) {
        const trimmed = first.trim()
        if (isValidIp(trimmed)) return trimmed
      }
    }
  }

  // 3. Fallback
  return "unknown"
}

function getHoneytokenHits(parsedInput: unknown): string[] {
  if (!parsedInput) return []

  const values: Record<string, unknown> = {}
  if (parsedInput instanceof FormData) {
    for (const field of HONEYPOT_FIELDS) {
      values[field] = parsedInput.get(field)
    }
  } else if (typeof parsedInput === "object") {
    const record = parsedInput as Record<string, unknown>
    for (const field of HONEYPOT_FIELDS) {
      values[field] = record[field]
    }
  } else {
    return []
  }

  return HONEYPOT_FIELDS.filter((field) => {
    const value = values[field]
    if (value === null || value === undefined) return false
    return String(value).trim().length > 0
  })
}

function isBotRequest(parsedInput: unknown): boolean {
  return getHoneytokenHits(parsedInput).length > 0
}

function getUserAgent(requestHeaders: Headers): string {
  return requestHeaders.get("user-agent") ?? "unknown"
}

function getFingerprint(requestHeaders: Headers): string | null {
  return (
    requestHeaders.get("x-client-fingerprint") ??
    requestHeaders.get("x-fingerprint") ??
    requestHeaders.get("x-device-fingerprint")
  )
}

async function addToBanList(ip: string): Promise<void> {
  await penaltyRedis.sadd(BANNED_SET_KEY, ip)
  await penaltyRedis.expire(BANNED_SET_KEY, BAN_TTL_SECONDS)
}

const safeActionClient = createSafeActionClient({
  handleServerError: (error) => {
    const rawMessage = error instanceof Error ? error.message : "UNKNOWN_SERVER_ERROR"
    const normalizedMessage = rawMessage.trim().toUpperCase()
    const isSafeCode = /^[A-Z0-9_]{3,80}$/.test(normalizedMessage)
    const publicCode = isSafeCode ? normalizedMessage : "INTERNAL_SERVER_ERROR"

    console.error("ACTION_SERVER_ERROR:", rawMessage)
    return publicCode
  },
})

// ── publicAction: honeypot + IP ban + IP-based rate limiting ──
export const publicAction = safeActionClient.use(async ({ clientInput, next, ctx }) => {
  const parsedInput = clientInput as Record<string, unknown> | null

  // 1. Honeypot bot detection
  if (isBotRequest(parsedInput)) {
    const requestHeaders = await headers()
    const clientIp = getClientIpFromHeaders(requestHeaders)
    try { await addToBanList(clientIp) } catch { /* swallow */ }
    throw new Error("An unexpected error occurred")
  }

  // 2. IP ban check
  const requestHeaders = await headers()
  const clientIp = getClientIpFromHeaders(requestHeaders)
  try {
    const isBanned = await penaltyRedis.sismember(BANNED_SET_KEY, clientIp)
    if (isBanned) {
      throw new Error("An unexpected error occurred")
    }
  } catch (error) {
    // If Redis is down, fail open but log
    if (error instanceof Error && error.message === "An unexpected error occurred") throw error
    console.warn("[SECURITY] IP ban check failed", { ip: clientIp })
  }

  // 3. IP-based rate limiting
  const { success: rateLimitOk } = await publicActionRateLimiter.limit(clientIp)
  if (!rateLimitOk) {
    console.warn("[SECURITY] Public action rate limit exceeded", { ip: clientIp })
    throw new Error("RATE_LIMIT_EXCEEDED")
  }

  return next({ ctx })
})

export const authenticatedAction = safeActionClient.use(async ({ clientInput, next, ctx }) => {
  const parsedInput = clientInput as Record<string, unknown> | null
  if (isBotRequest(parsedInput)) {
    const requestHeaders = await headers()
    const clientIp = getClientIpFromHeaders(requestHeaders)
    const userAgent = getUserAgent(requestHeaders)
    const fingerprint = getFingerprint(requestHeaders)

    try {
      await addToBanList(clientIp)
    } catch (error) {
      console.warn("[SECURITY] Failed to add IP to ban list", {
        ip: clientIp,
        error: error instanceof Error ? error.message : "unknown error",
      })
    }

    try {
      const supabase = await createClient()
      await (supabase as any).from("core_security_violations").insert({
        ip_address: clientIp,
        user_agent: userAgent,
        violation_type: "bot_trap",
        metadata: {
          fingerprint,
        },
      })
    } catch (error) {
      console.warn("[SECURITY] Failed to log security violation", {
        ip: clientIp,
        error: error instanceof Error ? error.message : "unknown error",
      })
    }
    throw new Error("An unexpected error occurred")
  }

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("PLG_LOGIN_REQUIRED")
  }

  // ── Per-user rate limiting (sliding window) ──
  const { success: rateLimitOk, remaining, reset } = await actionRateLimiter.limit(user.id)
  if (!rateLimitOk) {
    const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    console.warn("[SECURITY] Rate limit exceeded", {
      userId: user.id,
      remaining,
      retryAfterSec,
    })
    throw new Error("RATE_LIMIT_EXCEEDED")
  }

  return next({
    ctx: {
      ...ctx,
      userId: user.id,
      email: user.email ?? null,
      idempotencyKey: await resolveIdempotencyKey(parsedInput),
    },
  })
})

export const authAction = authenticatedAction
export const action = publicAction
export const actionClient = safeActionClient

export { z }
