import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/src/lib/supabase/server"

/**
 * OAuth Callback Handler
 * Exchanges the auth code for a session and redirects to dashboard
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(`${origin}/dashboard`)
}
