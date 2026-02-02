import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

function copyResponseCookies(source: NextResponse, target: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie)
  })
  return target
}

function createSupabaseClient(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  return { supabase, response }
}

async function isUserSuspicious(supabase: ReturnType<typeof createSupabaseClient>["supabase"], userId: string) {
  const { data: profile } = await supabase
    .from("core_profiles")
    .select("suspicious, suspicious_until")
    .eq("id", userId)
    .maybeSingle()

  if (!profile?.suspicious) {
    return false
  }

  if (!profile.suspicious_until) {
    return true
  }

  const untilTime = new Date(profile.suspicious_until).getTime()
  if (Number.isNaN(untilTime)) {
    return true
  }

  return Date.now() < untilTime
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname
  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isLoginRoute = pathname.startsWith("/login")
  const isAuthCallback = pathname.startsWith("/auth/callback")

  if (isAuthCallback) {
    return response
  }

  if (isDashboardRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.search = ""
    redirectUrl.searchParams.set("redirect", pathname)

    return copyResponseCookies(response, NextResponse.redirect(redirectUrl))
  }

  if (isLoginRoute && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    redirectUrl.search = ""

    return copyResponseCookies(response, NextResponse.redirect(redirectUrl))
  }

  if (pathname.startsWith("/api/research/") && user) {
    const suspicious = await isUserSuspicious(supabase, user.id)
    if (suspicious) {
      return copyResponseCookies(
        response,
        NextResponse.json({ error: "Account temporarily restricted." }, { status: 403 })
      )
    }
  }
  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
