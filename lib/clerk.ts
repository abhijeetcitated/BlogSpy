/**
 * Server-side Authentication Helpers
 * Utility functions for authentication using Supabase
 * 
 * These functions are used in Server Components and API routes
 * to get the current authenticated user.
 */

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase client for server-side usage
 * Uses cookies for session management
 */
async function createServerSupabaseClient() {
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
 * Get the current authenticated user's ID
 * Use in Server Components and API routes
 * Returns null if not authenticated
 */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user.id;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

/**
 * Require authentication - throws if not authenticated
 * Use in protected API routes
 */
export async function requireAuth(): Promise<string> {
  const userId = await getAuthUserId();
  
  if (!userId) {
    throw new Error('Unauthorized: Authentication required');
  }
  
  return userId;
}

/**
 * Get current user details from Supabase
 * Returns the full user object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      avatar: user.user_metadata?.avatar_url || null,
      createdAt: new Date(user.created_at),
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if user has a specific role
 * Checks user_metadata for roles array
 */
export async function hasRole(role: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }
    
    const userRoles = user.user_metadata?.roles || ['user'];
    return userRoles.includes(role);
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Clerk public routes configuration
 */
export const CLERK_PUBLIC_ROUTES = [
  "/",
  "/features",
  "/pricing",
  "/blog",
  "/blog/(.*)",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/api/webhooks/(.*)",
]

/**
 * Clerk ignored routes (static files, etc.)
 */
export const CLERK_IGNORED_ROUTES = [
  "/api/webhooks/stripe",
  "/api/webhooks/clerk",
]
