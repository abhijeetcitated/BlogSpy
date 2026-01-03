/**
 * Supabase Browser Client
 * For client-side operations using @supabase/ssr
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';

// Get env vars with build-time fallback
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build, return placeholders to allow static generation
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      console.warn('[Supabase] Using placeholder values during build.');
      return {
        supabaseUrl: 'https://placeholder.supabase.co',
        supabaseAnonKey: 'placeholder-key',
      };
    }
    throw new Error(
      'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Create a Supabase client for browser/client-side usage
 * This client uses the anon key and respects RLS policies
 */
export function createClient(): SupabaseClientType {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Get singleton instance for browser
 * Use this in React components
 */
let browserClient: SupabaseClientType | null = null;

export function getSupabaseBrowserClient(): SupabaseClientType {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}

// Export types
export type SupabaseClient = SupabaseClientType;
