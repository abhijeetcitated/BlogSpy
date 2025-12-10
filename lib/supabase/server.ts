/**
 * Supabase Server Client
 * For server-side operations (API routes, Server Components)
 * 
 * NOTE: Currently using MOCK implementation
 * Real Supabase integration will be added later:
 * 1. npm install @supabase/ssr @supabase/supabase-js
 * 2. Set up SUPABASE_SERVICE_KEY in .env
 * 3. Replace mock functions with real Supabase imports
 */

// Mock Supabase server client type
interface MockSupabaseServerClient {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (col: string, val: unknown) => Promise<{ data: unknown[]; error: null }>;
      single: () => Promise<{ data: unknown | null; error: null }>;
    } & Promise<{ data: unknown[]; error: null }>;
    insert: (data: unknown) => Promise<{ data: unknown; error: null }>;
    update: (data: unknown) => { eq: (col: string, val: unknown) => Promise<{ data: unknown; error: null }> };
    delete: () => { eq: (col: string, val: unknown) => Promise<{ data: null; error: null }> };
    upsert: (data: unknown) => Promise<{ data: unknown; error: null }>;
  };
  auth: {
    getSession: () => Promise<{ data: { session: null }; error: null }>;
    getUser: () => Promise<{ data: { user: null }; error: null }>;
  };
  rpc: (fn: string, params?: unknown) => Promise<{ data: unknown; error: null }>;
}

/**
 * Create a Supabase client for server-side usage with cookies
 * This respects RLS policies based on the authenticated user
 * 
 * TODO: Replace with real Supabase when installed:
 * import { createServerClient } from "@supabase/ssr"
 * import { cookies } from "next/headers"
 */
export async function createClient(): Promise<MockSupabaseServerClient> {
  // Mock implementation
  return createMockClient()
}

/**
 * Create a Supabase admin client with service role key
 * CAUTION: This bypasses RLS - use only in secure server contexts
 * 
 * TODO: Replace with real Supabase admin client when installed
 */
export function createAdminClient(): MockSupabaseServerClient {
  return createMockClient()
}

// Helper to create mock client
function createMockClient(): MockSupabaseServerClient {
  const selectResult = Object.assign(
    Promise.resolve({ data: [], error: null }),
    {
      eq: async () => ({ data: [], error: null }),
      single: async () => ({ data: null, error: null }),
    }
  )

  return {
    from: (table: string) => ({
      select: () => selectResult,
      insert: async (data) => ({ data, error: null }),
      update: (data) => ({
        eq: async () => ({ data, error: null }),
      }),
      delete: () => ({
        eq: async () => ({ data: null, error: null }),
      }),
      upsert: async (data) => ({ data, error: null }),
    }),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    rpc: async () => ({ data: null, error: null }),
  }
}

// Export types
export type SupabaseServerClient = MockSupabaseServerClient
export type SupabaseAdminClient = MockSupabaseServerClient
