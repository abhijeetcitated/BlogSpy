import 'server-only';

/**
 * Supabase Server Client
 * For server-side operations (API routes, Server Components)
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

/**
 * Create a Supabase client for server-side usage with cookies
 * This respects RLS policies based on the authenticated user
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}

/**
 * Create a Supabase admin client with service role key
 * CAUTION: This bypasses RLS - use only in secure server contexts like cron jobs
 */
export async function createAdminClient(): Promise<SupabaseClient> {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_KEY is required for admin operations');
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore cookie errors in Server Components
        }
      },
    },
  });
}

// Export types
export type SupabaseServerClient = SupabaseClient;
export type SupabaseAdminClient = SupabaseClient;
