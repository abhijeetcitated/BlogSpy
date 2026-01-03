/**
 * Supabase Browser Client
 * For client-side operations using @supabase/ssr
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase client for browser/client-side usage
 * This client uses the anon key and respects RLS policies
 */
export function createClient(): SupabaseClientType {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }
  
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
