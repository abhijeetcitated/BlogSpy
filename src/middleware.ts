import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Product-Led Growth Middleware
 * - Dashboard is PUBLIC (demo mode for guests)
 * - Only /settings and /api/protected/* are gated
 * - Actions are gated at component level
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 🔧 Check Supabase Config
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ═══════════════════════════════════════════════════════════════════════════
  // PROTECTED ROUTES (Require Login)
  // ═══════════════════════════════════════════════════════════════════════════
  const isProtectedRoute = 
    pathname.startsWith('/settings') ||
    pathname.startsWith('/dashboard/settings') ||
    pathname.startsWith('/api/protected')

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH ROUTES (Redirect logged-in users to dashboard)
  // ═══════════════════════════════════════════════════════════════════════════
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // Only run middleware on these routes
    '/settings/:path*',
    '/dashboard/settings/:path*',
    '/api/protected/:path*',
    '/login',
    '/register',
  ],
}
