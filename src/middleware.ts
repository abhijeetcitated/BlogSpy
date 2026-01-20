import { NextResponse, type NextRequest } from "next/server"
import arcjet, { detectBot } from "@arcjet/next"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { updateSession } from "@/src/lib/supabase/middleware"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🚦 GLOBAL MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Entry point for all incoming requests.
 * Delegates authentication logic to Supabase helper.
 */

const SEO_BOTS = [
    "GOOGLE_CRAWLER",
    "GOOGLE_CRAWLER_IMAGE",
    "GOOGLE_CRAWLER_MOBILE",
    "GOOGLE_CRAWLER_NEWS",
    "GOOGLE_CRAWLER_OTHER",
    "GOOGLE_CRAWLER_STORE",
    "GOOGLE_CRAWLER_VIDEO",
    "GOOGLE_INSPECTION_TOOL",
    "BING_CRAWLER",
] as const

const SEO_BOT_SET = new Set<string>(SEO_BOTS)

const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    rules: [
        detectBot({
            mode: "LIVE",
            allow: [...SEO_BOTS],
        }),
    ],
})

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const rateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 m"),
    analytics: true,
    prefix: "blogspy:edge",
})

function getClientIp(request: NextRequest): string {
    const forwardedFor = request.headers.get("x-forwarded-for")
    if (forwardedFor) {
        const [first] = forwardedFor.split(",")
        if (first) {
            return first.trim()
        }
    }

    const realIp = request.headers.get("x-real-ip")
    if (realIp) {
        return realIp
    }

    return "unknown"
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

export async function middleware(request: NextRequest) {
    const decision = await aj.protect(request)
    if (decision.isDenied()) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { response, user } = await updateSession(request)
    const isSeoBot = isAllowedSeoBot(decision)

    if (!user && !isSeoBot) {
        const ip = getClientIp(request)
        const { success } = await rateLimiter.limit(ip)

        if (!success) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Please try again later." },
                { status: 429 }
            )
        }
    }

    return response
}

export const config = {
    /**
     * Matcher:
     * Match all paths except for:
     * 1. /_next/ (Next.js internals)
     * 2. /api/ (API routes - handled separately or let middleware pass through)
     * 3. /static (inside /public)
     * 4. File extensions (images, fonts, etc.)
     */
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
