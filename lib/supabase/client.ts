/**
 * Supabase Browser Client
 * For client-side operations
 * 
 * NOTE: Currently using MOCK implementation
 * Real Supabase integration will be added later:
 * 1. npm install @supabase/ssr @supabase/supabase-js
 * 2. Set up NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env
 * 3. Replace mock functions with real Supabase imports
 */

// Mock Supabase client type
interface MockSupabaseClient {
  from: (table: string) => {
    select: (columns?: string) => Promise<{ data: unknown[]; error: null }>;
    insert: (data: unknown) => Promise<{ data: unknown; error: null }>;
    update: (data: unknown) => { eq: (col: string, val: unknown) => Promise<{ data: unknown; error: null }> };
    delete: () => { eq: (col: string, val: unknown) => Promise<{ data: null; error: null }> };
  };
  auth: {
    getSession: () => Promise<{ data: { session: null }; error: null }>;
    getUser: () => Promise<{ data: { user: null }; error: null }>;
  };
}

/**
 * Create a Supabase client for browser/client-side usage
 * This client uses the anon key and respects RLS policies
 * 
 * TODO: Replace with real Supabase when installed:
 * import { createBrowserClient } from "@supabase/ssr"
 * return createBrowserClient(supabaseUrl, supabaseAnonKey)
 */
export function createClient(): MockSupabaseClient {
  // Mock implementation
  return {
    from: (table: string) => ({
      select: async () => ({ data: [], error: null }),
      insert: async (data) => ({ data, error: null }),
      update: (data) => ({
        eq: async () => ({ data, error: null }),
      }),
      delete: () => ({
        eq: async () => ({ data: null, error: null }),
      }),
    }),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }
}

/**
 * Get singleton instance for browser
 * Use this in React components
 */
let browserClient: MockSupabaseClient | null = null

export function getSupabaseBrowserClient(): MockSupabaseClient {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}

// Export types
export type SupabaseClient = MockSupabaseClient
