/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔐 ROOT MIDDLEWARE — Supabase Auth Token Refresh
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Ensures Supabase auth tokens (JWT + refresh_token) are refreshed on every
 * request before Server Components and Server Actions read cookies.
 *
 * Without this middleware, cookies can become stale:
 *   - JWT expires (default 1 hour)
 *   - Server Actions using createClient() read expired cookies
 *   - supabase.auth.getUser() fails → PLG_LOGIN_REQUIRED
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { response } = await updateSession(request)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     * - API webhook routes (they use their own auth)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$|api/webhooks).*)",
  ],
}
