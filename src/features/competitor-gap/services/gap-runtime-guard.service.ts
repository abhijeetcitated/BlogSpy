import "server-only"

import { redis } from "@/lib/redis"

const PROVIDER_BUDGET_PER_MINUTE = 1400
const PROVIDER_BUDGET_WINDOW_SECONDS = 60
const LOCK_TTL_SECONDS = 90

function minuteBucketKey(): string {
  const minute = Math.floor(Date.now() / 60000)
  return `citated:competitor-gap:provider:rpm:${minute}`
}

function inFlightKey(cacheKey: string): string {
  return `citated:competitor-gap:inflight:${cacheKey}`
}

export async function reserveProviderBudget(callsRequested: number): Promise<{ granted: boolean; retryAfterSeconds: number }> {
  const normalizedCalls = Math.max(1, Math.round(callsRequested))
  const bucket = minuteBucketKey()

  const current = await redis.incrby(bucket, normalizedCalls)
  if (current === normalizedCalls) {
    await redis.expire(bucket, PROVIDER_BUDGET_WINDOW_SECONDS)
  }

  if (current > PROVIDER_BUDGET_PER_MINUTE) {
    await redis.decrby(bucket, normalizedCalls)
    return {
      granted: false,
      retryAfterSeconds: 3,
    }
  }

  return {
    granted: true,
    retryAfterSeconds: 0,
  }
}

export async function acquireGapInFlightLock(cacheKey: string): Promise<boolean> {
  const key = inFlightKey(cacheKey)
  const result = await redis.set(key, "1", {
    nx: true,
    ex: LOCK_TTL_SECONDS,
  })

  return result === "OK"
}

export async function releaseGapInFlightLock(cacheKey: string): Promise<void> {
  const key = inFlightKey(cacheKey)
  await redis.del(key)
}
