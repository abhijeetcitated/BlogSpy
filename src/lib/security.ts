/**
 * ============================================
 * SECURITY MIDDLEWARE & HELPERS
 * ============================================
 * 
 * Production security utilities:
 * - Security headers
 * - CORS configuration
 * - Input sanitization
 * - Rate limiting helpers
 * 
 * @version 1.0.0
 */

import { NextResponse, type NextRequest } from "next/server"

// ============================================
// SECURITY HEADERS
// ============================================

/**
 * Security headers for all responses
 */
export const SECURITY_HEADERS = {
  // Prevent XSS attacks
  "X-XSS-Protection": "1; mode=block",

  // Prevent clickjacking
  "X-Frame-Options": "DENY",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions policy
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",

  // Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co https://*.googleapis.com wss://*.supabase.co",
    "frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; "),

  // HSTS - enforce HTTPS
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// ============================================
// CORS CONFIGURATION
// ============================================

/**
 * Allowed origins for CORS
 */
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  "https://blogspy.ai",
  "https://www.blogspy.ai",
  "https://app.blogspy.ai",
]

/**
 * CORS configuration
 */
export const CORS_CONFIG = {
  allowedOrigins: ALLOWED_ORIGINS,
  allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
  ],
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
  maxAge: 86400, // 24 hours
  credentials: true,
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  return ALLOWED_ORIGINS.some(
    (allowed) => origin === allowed || origin.endsWith(allowed.replace("https://", "."))
  )
}

/**
 * Get CORS headers for a request
 */
export function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin")

  if (!origin || !isOriginAllowed(origin)) {
    return {}
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": CORS_CONFIG.allowedMethods.join(", "),
    "Access-Control-Allow-Headers": CORS_CONFIG.allowedHeaders.join(", "),
    "Access-Control-Expose-Headers": CORS_CONFIG.exposedHeaders.join(", "),
    "Access-Control-Max-Age": CORS_CONFIG.maxAge.toString(),
    "Access-Control-Allow-Credentials": "true",
  }
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreFlight(request: NextRequest): NextResponse {
  const corsHeaders = getCorsHeaders(request)

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize string input - remove potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return ""

  return input
    // Remove null bytes
    .replace(/\0/g, "")
    // Encode HTML entities
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    // Remove potential SQL injection patterns
    .replace(/--/g, "")
    .replace(/;/g, "")
    // Trim whitespace
    .trim()
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value)
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string"
          ? sanitizeString(item)
          : typeof item === "object"
            ? sanitizeObject(item as Record<string, unknown>)
            : item
      )
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  const sanitized = sanitizeString(email).toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(sanitized)) {
    return null
  }

  return sanitized
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    // Only allow http and https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Sanitize domain - extract clean domain from input
 */
export function sanitizeDomain(input: string): string | null {
  const sanitized = sanitizeString(input).toLowerCase()

  // Remove protocol if present
  let domain = sanitized.replace(/^https?:\/\//, "")

  // Remove path
  domain = domain.split("/")[0]

  // Remove port
  domain = domain.split(":")[0]

  // Validate domain format
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/

  if (!domainRegex.test(domain)) {
    return null
  }

  return domain
}

// ============================================
// REQUEST VALIDATION
// ============================================

/**
 * Check if request has valid JSON content type
 */
export function hasJsonContentType(request: NextRequest): boolean {
  const contentType = request.headers.get("content-type")
  return contentType?.includes("application/json") ?? false
}

/**
 * Get client IP from request
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  )
}

/**
 * Check if request is from a bot/crawler
 */
export function isBot(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || ""

  const botPatterns = [
    "bot",
    "crawler",
    "spider",
    "scraper",
    "curl",
    "wget",
    "python",
    "java",
    "perl",
    "ruby",
  ]

  return botPatterns.some((pattern) => userAgent.includes(pattern))
}

// ============================================
// EXPORTS
// ============================================

export const security = {
  headers: SECURITY_HEADERS,
  cors: CORS_CONFIG,
  applySecurityHeaders,
  getCorsHeaders,
  handleCorsPreFlight,
  isOriginAllowed,
  sanitizeString,
  sanitizeObject,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeDomain,
  hasJsonContentType,
  getClientIp,
  isBot,
}

export default security
