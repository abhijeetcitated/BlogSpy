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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

// Mock Supabase Query Builder for proper chaining
class MockQueryBuilder {
  private tableName: string;
  private queryType: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private data: AnyData = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns?: string, options?: { count?: string; head?: boolean }) {
    this.queryType = 'select';
    return this;
  }

  insert(data: AnyData) {
    this.queryType = 'insert';
    this.data = data;
    return this;
  }

  update(data: AnyData) {
    this.queryType = 'update';
    this.data = data;
    return this;
  }

  delete() {
    this.queryType = 'delete';
    return this;
  }

  upsert(data: AnyData, options?: { onConflict?: string }) {
    this.queryType = 'upsert';
    this.data = data;
    return this;
  }

  eq(column: string, value: AnyData) {
    return this;
  }

  neq(column: string, value: AnyData) {
    return this;
  }

  gt(column: string, value: AnyData) {
    return this;
  }

  gte(column: string, value: AnyData) {
    return this;
  }

  lt(column: string, value: AnyData) {
    return this;
  }

  lte(column: string, value: AnyData) {
    return this;
  }

  like(column: string, pattern: string) {
    return this;
  }

  ilike(column: string, pattern: string) {
    return this;
  }

  is(column: string, value: AnyData) {
    return this;
  }

  in(column: string, values: AnyData[]) {
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    return this;
  }

  limit(count: number) {
    return this;
  }

  range(from: number, to: number) {
    return this;
  }

  single() {
    return Promise.resolve({ data: null, error: null });
  }

  maybeSingle() {
    return Promise.resolve({ data: null, error: null });
  }

  then<TResult>(
    onfulfilled?: ((value: { data: AnyData; error: null; count?: number }) => TResult) | null
  ): Promise<TResult> {
    const result = {
      data: this.queryType === 'select' ? [] : this.data,
      error: null,
      count: 0,
    };
    return Promise.resolve(result).then(onfulfilled);
  }
}

// Mock Supabase server client type
interface MockSupabaseServerClient {
  from: (table: string) => MockQueryBuilder;
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
  return {
    from: (table: string) => new MockQueryBuilder(table),
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
