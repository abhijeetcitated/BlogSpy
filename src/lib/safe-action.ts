import "server-only"

import { createSafeActionClient } from "next-safe-action"
import { headers } from "next/headers"
import { z } from "zod"
import { Redis } from "@upstash/redis"
import { createClient } from "@/lib/supabase/server"

export interface AuthenticatedActionContext {
  userId: string
  email: string
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

const penaltyRedis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

function getClientIpFromHeaders(requestHeaders: Headers): string {
  const forwardedFor = requestHeaders.get("x-forwarded-for")
  if (forwardedFor) {
    const [first] = forwardedFor.split(",")
    if (first) return first.trim()
  }

  const realIp = requestHeaders.get("x-real-ip")
  return realIp ?? "unknown"
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
    const message = error instanceof Error ? error.message : "UNKNOWN_SERVER_ERROR"
    console.error("ACTION_SERVER_ERROR:", message)
    return message
  },
})

export const publicAction = safeActionClient

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

  return next({
    ctx: {
      ...ctx,
      userId: user.id,
      email: user.email ?? "",
      idempotencyKey: await resolveIdempotencyKey(parsedInput),
    },
  })
})

export const authAction = authenticatedAction
export const action = publicAction
export const actionClient = safeActionClient

export { z }
