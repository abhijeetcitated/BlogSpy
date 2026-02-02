/**
 * API Route Utilities with Rate Limiting
 * ============================================
 * Provides rate limiting wrapper for API routes
 * ============================================
 */

import { NextResponse, type NextRequest } from "next/server"
import { 
  checkRateLimitByIp, 
  getRateLimitHeaders, 
  RateLimitConfigs, 
  type RateLimitConfig 
} from "@/lib/rate-limiter"

// ============================================
// TYPES
// ============================================

type ApiHandler = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>

interface WithRateLimitOptions {
  config?: keyof typeof RateLimitConfigs
  customConfig?: RateLimitConfig
}

// ============================================
// GET CLIENT IP
// ============================================

function getClientIp(request: NextRequest): string {
  // Try X-Forwarded-For first (from proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  
  // Try X-Real-IP
  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }
  
  // Fallback to localhost
  return "127.0.0.1"
}

// ============================================
// RATE LIMITED API WRAPPER
// ============================================

export function withRateLimit(
  handler: ApiHandler,
  options: WithRateLimitOptions = {}
): ApiHandler {
  return async (request: NextRequest, context?: { params: Record<string, string> }) => {
    const ip = getClientIp(request)
    const route = request.nextUrl.pathname
    
    // Get rate limit config
    const rateLimitConfig = options.customConfig 
      ?? RateLimitConfigs[options.config ?? "api"]
    
    // Check rate limit
    const result = checkRateLimitByIp(ip, route, rateLimitConfig)
    const rateLimitHeaders = getRateLimitHeaders(result)
    
    // If rate limited, return 429
    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      )
    }
    
    // Execute handler and add rate limit headers to response
    const response = await handler(request, context)
    
    // Add rate limit headers to successful response
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }
}

// ============================================
// CONVENIENCE WRAPPERS
// ============================================

/**
 * Strict rate limit (10 req/min) for expensive operations
 */
export function withStrictRateLimit(handler: ApiHandler): ApiHandler {
  return withRateLimit(handler, { config: "strict" })
}

/**
 * Auth rate limit (5 req/min) for login/register
 */
export function withAuthRateLimit(handler: ApiHandler): ApiHandler {
  return withRateLimit(handler, { config: "auth" })
}

/**
 * Search rate limit (30 req/min) for search operations
 */
export function withSearchRateLimit(handler: ApiHandler): ApiHandler {
  return withRateLimit(handler, { config: "search" })
}
