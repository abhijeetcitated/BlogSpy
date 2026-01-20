import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ SUPABASE MIDDLEWARE HELPER (PLG EDITION)
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Handles authentication checks and session management at the Edge.
 * 
 * LOGIC:
 * 1. Refresh Supabase Session (updates cookies).
 * 2. PLG Mode: ALLOW guest access to /dashboard (Soft Gate).
 * 3. Redirect logged-in users away from /login & /register.
 */

export async function updateSession(request: NextRequest) {
    // Create an unmodified response first
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })

                    response = NextResponse.next({
                        request,
                    })

                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // ════════════════════════════════════════════════════════════════════════════════════════════
    // 🔒 ROUTE PROTECTION LOGIC
    // ════════════════════════════════════════════════════════════════════════════════════════════

    // 1. Protected Routes: /dashboard/*
    // [PLG STRATEGY]: We comment this out to allow "Guest Access".
    // Users can explore the UI, but Server Actions will fail if they try to use paid features.

    /*
    if (path.startsWith("/dashboard") && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("next", path) 
      return NextResponse.redirect(url)
    }
    */

    // 2. Auth Routes: /login, /register
    // If user IS logged in, redirect to /dashboard (Don't let them see login page)
    if ((path.startsWith("/login") || path.startsWith("/register")) && user) {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return { response: NextResponse.redirect(url), user }
    }

    return { response, user }
}
