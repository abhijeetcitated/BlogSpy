/**
 * Next.js Proxy (Route Protection + Security)
 * ============================================
 * Handles:
 * - Route protection (auth required for dashboard)
 * - Redirect logic (logged in users can't access auth pages)
 * - Security headers (XSS, CSP, HSTS)
 * - CORS for API routes
 * - API rate limiting headers
 * 
 * @version 2.0.0
 * ============================================
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ============================================
// SECURITY HEADERS
// ============================================

const SECURITY_HEADERS: Record<string, string> = {
  "X-XSS-Protection": "1; mode=block",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

// Content Security Policy (relaxed for development, strict in production)
const CSP_PRODUCTION = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://*.supabase.co https://*.googleapis.com wss://*.supabase.co",
  "frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ")

// ============================================
// CORS CONFIGURATION
// ============================================

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  "https://blogspy.ai",
  "https://www.blogspy.ai",
  "https://app.blogspy.ai",
]

// ============================================
// ROUTE CONFIGURATION
// ============================================

// Public routes - accessible without authentication
const PUBLIC_ROUTES = new Set([
  "/",
  "/features",
  "/pricing",
  "/blog",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
])

// Auth routes - only accessible when NOT logged in
const AUTH_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
])

// Demo routes - feature demos accessible without auth
const DEMO_ROUTES = new Set([
  "/keyword-magic",
  "/keyword-overview",
  "/rank-tracker",
  "/competitor-gap",
  "/content-decay",
  "/topic-clusters",
  "/snippet-stealer",
  "/trend-spotter",
  "/trends",
  "/ai-writer",
  "/content-roadmap",
  "/on-page-checker",
])

// API routes that need rate limiting
const RATE_LIMITED_ROUTES = ["/api/keywords", "/api/content", "/api/rankings", "/api/trends"]

// ============================================
// HELPER FUNCTIONS
// ============================================

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.has(pathname) || DEMO_ROUTES.has(pathname)
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.has(pathname)
}

function isDashboardRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard")
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api")
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.includes(".") // Files with extensions
  )
}

// ============================================
// SECURITY HELPERS
// ============================================

function applySecurityHeaders(response: NextResponse): void {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Apply CSP in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Content-Security-Policy", CSP_PRODUCTION)
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  }
}

function applyCorsHeaders(request: NextRequest, response: NextResponse): void {
  const origin = request.headers.get("origin")
  if (origin && ALLOWED_ORIGINS.some(o => origin.includes(o.replace("https://", "")))) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
  }
}

// ============================================
// PROXY (Next.js 16+)
// ============================================

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip proxy for static assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next()
  }

  // ============================================
  // HANDLE CORS PREFLIGHT FOR API ROUTES
  // ============================================
  if (isApiRoute(pathname) && request.method === "OPTIONS") {
    const origin = request.headers.get("origin")
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.some(o => origin.includes(o.replace("https://", ""))) ? origin : "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Max-Age": "86400",
      },
    })
  }

  // ============================================
  // DEMO MODE: Allow all access during development
  // Remove this block when implementing real auth
  // ============================================
  const isDemoMode = true // Set to false when real auth is ready
  
  if (isDemoMode) {
    const response = NextResponse.next()
    // Apply all security headers
    applySecurityHeaders(response)
    // Add CORS for API routes
    if (isApiRoute(pathname)) {
      applyCorsHeaders(request, response)
    }
    return response
  }

  // Get auth status (in production, use Clerk's auth())
  // For now, check cookie
  const authToken = request.cookies.get("__session")?.value ||
                    request.cookies.get("auth_token")?.value
  const isAuthenticated = !!authToken

  // Create response
  const response = NextResponse.next()

  // ============================================
  // SECURITY HEADERS (for all routes)
  // ============================================
  applySecurityHeaders(response)

  // ============================================
  // API ROUTES - CORS + RATE LIMITING
  // ============================================
  if (isApiRoute(pathname)) {
    applyCorsHeaders(request, response)
    // Add rate limit headers (actual limiting done in API routes)
    response.headers.set("X-RateLimit-Limit", "100")
    response.headers.set("X-RateLimit-Remaining", "99")
    return response
  }

  // ============================================
  // ROUTE PROTECTION LOGIC
  // ============================================

  // Case 1: User trying to access dashboard without auth
  if (isDashboardRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Case 2: Authenticated user trying to access auth routes
  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Case 3: Public routes - allow access
  return response
}

// ============================================
// MATCHER CONFIGURATION
// ============================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
