/**
 * Supabase Browser Client
 * For client-side operations using @supabase/ssr
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';

// Check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Valid Supabase keys start with 'eyJ' (JWT format)
  return !!(url && key && key.startsWith('eyJ'));
}

// Get env vars with build-time fallback
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build or if not configured, return placeholders
  if (!supabaseUrl || !supabaseAnonKey || !supabaseAnonKey.startsWith('eyJ')) {
    console.warn('[Supabase] Not configured or invalid key format. Auth disabled.');
    return {
      supabaseUrl: 'https://placeholder.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDg3MzY4MDAsImV4cCI6MTk2NDMxMjgwMH0.placeholder',
    };
  }

  return { supabaseUrl, supabaseAnonKey };
}

export { isSupabaseConfigured };

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
