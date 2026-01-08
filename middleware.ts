/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ MIDDLEWARE - The Gatekeeper (Phase 1: Security Fortress)
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * 2026 Security Standards:
 * 1. Arcjet bot detection (allow search engines, block malicious bots)
 * 2. Supabase session refresh via @supabase/ssr
 * 
 * @see https://docs.arcjet.com/get-started/nextjs
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createMiddleware } from "@arcjet/next"
import arcjet, { detectBot, shield } from "@arcjet/next"
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ARCJET CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    // Shield against common attacks (SQL injection, XSS, etc.)
    shield({ mode: "LIVE" }),
    
    // Bot detection: Allow search engines, block everything else
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],  // Google, Bing, etc.
    }),
  ],
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SUPABASE SESSION REFRESH
// ═══════════════════════════════════════════════════════════════════════════════════════════════

async function refreshSupabaseSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // Refresh session - this updates the cookies automatically
  // IMPORTANT: Do not check for errors here, just refresh
  await supabase.auth.getUser()

  return response
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES (no auth required, still get session refresh)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/auth/callback",
  "/auth/confirm",
  "/pricing",
  "/features",
  "/about",
  "/blog",
  "/api/webhooks",
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE HANDLER
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export const middleware = createMiddleware(aj, async (request: NextRequest) => {
  const { pathname } = request.nextUrl
  
  // Skip static files, Next.js internals, and test endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/_next") ||
    pathname.startsWith("/api/test-") ||  // Allow test endpoints
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Arcjet decision is automatically checked by createMiddleware
  // If we reach here, the request passed bot detection

  // Create response for cookie manipulation
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Always refresh Supabase session (for all routes)
  // This keeps the session alive without blocking public routes
  response = await refreshSupabaseSession(request, response)

  // Add security headers
  response.headers.set("X-Middleware-Cache", "no-cache")
  response.headers.set("X-Request-Id", crypto.randomUUID())

  return response
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MATCHER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
