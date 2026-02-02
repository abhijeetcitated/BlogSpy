import { NextResponse, type NextRequest } from "next/server"
import arcjet, { detectBot, shield, type ArcjetWellKnownBot } from "@arcjet/next"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { createServerClient } from "@supabase/ssr"

const SEO_BOTS = ["GOOGLE_SEO", "BING_SEO"] as const
const SEO_BOT_SET = new Set<string>(SEO_BOTS)
const SEO_BOT_ALLOW = SEO_BOTS as unknown as ArcjetWellKnownBot[]

const aj = arcjet({
  key: process.env.NEXT_PUBLIC_ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: SEO_BOT_ALLOW,
    }),
  ],
})

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const BANNED_SET_KEY = "banned_ips"

const guestRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "blogspy:edge:guest",
})

const userRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "10 m"),
  analytics: true,
  prefix: "blogspy:edge:user",
})

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.ico"
  )
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const [first] = forwardedFor.split(",")
    if (first) return first.trim()
  }

  const realIp = request.headers.get("x-real-ip")
  return realIp ?? "unknown"
}

function isAllowedSeoBot(decision: Awaited<ReturnType<typeof aj.protect>>): boolean {
  return decision.results.some((result) => {
    if (!result.reason.isBot()) {
      return false
    }

    if (result.conclusion !== "ALLOW") {
      return false
    }

    return result.reason.allowed.some((bot) => SEO_BOT_SET.has(bot))
  })
}

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

  const shouldProtect =
    request.method === "POST" &&
    (pathname.startsWith("/api/keywords/") || pathname.startsWith("/dashboard/research/"))

  if (!shouldProtect) {
    return response
  }

  const clientIp = getClientIp(request)
  const isBanned = await redis.sismember(BANNED_SET_KEY, clientIp)
  if (isBanned) {
    return copyResponseCookies(
      response,
      NextResponse.json({ error: "Access Denied" }, { status: 403 })
    )
  }

  if (process.env.NODE_ENV === "development") {
    return response
  }

  const decision = await aj.protect(request)
  if (decision.isDenied()) {
    return copyResponseCookies(
      response,
      NextResponse.json({ error: "Forbidden" }, { status: 403 })
    )
  }

  const isSeoBot = isAllowedSeoBot(decision)

  if (!isSeoBot && !isStaticAsset(pathname)) {
    const rateKey = user?.id ?? clientIp
    const limiter = user?.id ? userRateLimiter : guestRateLimiter
    const { success } = await limiter.limit(rateKey)

    if (!success) {
      return copyResponseCookies(
        response,
        NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        )
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
