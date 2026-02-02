import { cookies } from "next/headers"
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"

export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  const cookieStore = await cookies()

  return createSupabaseServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Ignore: Cookie modification not allowed in Server Components
          // This is expected when called from page.tsx or layout.tsx
        }
      },
    },
  })
}

export async function createClient() {
  return createServerClient()
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSupabaseServerClient(url, serviceKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        return
      },
    },
  })
}
