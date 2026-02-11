import { Redis } from "@upstash/redis"

const globalForRedis = globalThis as unknown as {
  redis: Redis
}

function createRedisClient(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error(
      "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variable."
    )
  }

  if (globalForRedis.redis) {
    return globalForRedis.redis
  }

  globalForRedis.redis = new Redis({ url, token })
  return globalForRedis.redis
}

export const redis = createRedisClient()
