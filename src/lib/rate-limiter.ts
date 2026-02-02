/**
 * Rate Limiter
 * ============================================
 * In-memory rate limiting for API routes
 * For production, use Redis-based solution
 * ============================================
 */

// ============================================
// TYPES
// ============================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

// ============================================
// IN-MEMORY STORE
// ============================================

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

// ============================================
// RATE LIMIT CONFIGURATIONS
// ============================================

export const RateLimitConfigs = {
  // Default: 100 requests per minute
  default: { maxRequests: 100, windowMs: 60 * 1000 },
  
  // Strict: 10 requests per minute (for expensive operations)
  strict: { maxRequests: 10, windowMs: 60 * 1000 },
  
  // Auth: 5 requests per minute (for login/register)
  auth: { maxRequests: 5, windowMs: 60 * 1000 },
  
  // API: 60 requests per minute
  api: { maxRequests: 60, windowMs: 60 * 1000 },
  
  // Search: 30 requests per minute
  search: { maxRequests: 30, windowMs: 60 * 1000 },
} as const

// ============================================
// RATE LIMITER
// ============================================

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RateLimitConfigs.default
): RateLimitResult {
  const now = Date.now()
  const key = identifier
  
  const entry = rateLimitStore.get(key)
  
  // First request or window expired
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }
  
  // Within window
  if (entry.count < config.maxRequests) {
    entry.count++
    rateLimitStore.set(key, entry)
    
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }
  
  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetTime: entry.resetTime,
    retryAfter: Math.ceil((entry.resetTime - now) / 1000),
  }
}

// ============================================
// RATE LIMIT BY IP
// ============================================

export function checkRateLimitByIp(
  ip: string,
  route: string,
  config?: RateLimitConfig
): RateLimitResult {
  const identifier = `${ip}:${route}`
  return checkRateLimit(identifier, config)
}

// ============================================
// RATE LIMIT BY USER
// ============================================

export function checkRateLimitByUser(
  userId: string,
  route: string,
  config?: RateLimitConfig
): RateLimitResult {
  const identifier = `user:${userId}:${route}`
  return checkRateLimit(identifier, config)
}

// ============================================
// GET RATE LIMIT HEADERS
// ============================================

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.remaining + (result.allowed ? 1 : 0)),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
  }
  
  if (result.retryAfter) {
    headers["Retry-After"] = String(result.retryAfter)
  }
  
  return headers
}
