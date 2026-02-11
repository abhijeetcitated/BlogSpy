import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// 🔒 SECURITY: Strict Allow-List for post-login redirects
// Only allow redirects to local relative paths to prevent Open Redirect attacks.
function getSafeNextPath(nextValue: string | null, baseOrigin: string): string {
  if (!nextValue) return "/"

  // 1. Length check to prevent buffer overflow attacks
  if (nextValue.length > 2048) return "/"

  // 2. Reject control characters and backslashes (prevent header splitting/mixed-encoding)
  // Rejects: \ (backslash), 0x00-0x1F (control chars), 0x7F (DEL)
  if (/[\\\u0000-\u001F\u007F]/.test(nextValue)) return "/"

  try {
    // 3. Resolve URL against the authorized origin
    const resolved = new URL(nextValue, baseOrigin)

    // 4. Force Same-Origin Check
    if (resolved.origin !== baseOrigin) {
      console.warn("[SECURITY] Blocked cross-origin redirect attempt:", nextValue)
      return "/"
    }

    // 5. Return only the path + search + hash (strip scheme/host)
    return `${resolved.pathname}${resolved.search}${resolved.hash}` || "/"
  } catch {
    return "/"
  }
}

function getRedirectBaseUrl(origin: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (!configured) return origin

  try {
    return new URL(configured).origin
  } catch {
    return origin
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const errorParam = url.searchParams.get("error")
  const errorDesc = url.searchParams.get("error_description")
  
  // Use the calculated redirection base (handles proxies/Vercel URLs)
  const redirectBase = getRedirectBaseUrl(url.origin)
  const nextPath = getSafeNextPath(url.searchParams.get("next"), redirectBase)

  // 1. Handle OAuth Errors from Provider
  if (errorParam) {
    console.error("[AUTH] Provider Error:", errorParam, errorDesc)
    // Redirect to a safe error page with the code (do not reflect raw description)
    return NextResponse.redirect(new URL(`/auth/error?code=${encodeURIComponent(errorParam)}`, redirectBase))
  }

  // 2. Validate Auth Code
  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?code=missing_code", redirectBase))
  }

  // 3. Exchange Code for Session
  const supabase = await createServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("[AUTH] Exchange Failed:", error.message)
    return NextResponse.redirect(new URL("/auth/error?code=exchange_failed", redirectBase))
  }

  // 4. Success Redirect
  return NextResponse.redirect(new URL(nextPath, redirectBase))
}
