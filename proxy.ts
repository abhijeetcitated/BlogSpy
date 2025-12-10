/**
 * Next.js Proxy (Route Protection)
 * ============================================
 * Handles:
 * - Route protection (auth required for dashboard)
 * - Redirect logic (logged in users can't access auth pages)
 * - API rate limiting headers
 * 
 * NOTE: In production, integrate with Clerk middleware
 * ============================================
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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
// PROXY (Next.js 16+)
// ============================================

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip proxy for static assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next()
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
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // ============================================
  // API RATE LIMITING HEADERS
  // ============================================
  if (isApiRoute(pathname)) {
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
