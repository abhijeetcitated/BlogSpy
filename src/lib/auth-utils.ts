import 'server-only';

/**
 * Server-side Authentication Utilities
 * Use these helpers in API routes to protect endpoints
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * Authentication result type
 */
export type AuthResult = 
  | { success: true; user: User; userId: string }
  | { success: false; response: NextResponse };

/**
 * Require authentication for API routes
 * Returns the authenticated user or an unauthorized response
 * 
 * @example
 * ```typescript
 * export async function GET() {
 *   const auth = await requireAuth();
 *   if (!auth.success) return auth.response;
 *   
 *   const { user, userId } = auth;
 *   // ... rest of your code
 * }
 * ```
 */
export async function requireAuth(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        ),
      };
    }

    return {
      success: true,
      user,
      userId: user.id,
    };
  } catch (error) {
    console.error('[Auth] Error checking authentication:', error);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication failed' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Get the current user without returning an error response
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch {
    return null;
  }
}

/**
 * Standard unauthorized response
 */
export function unauthorizedResponse(message = 'Authentication required'): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized', message },
    { status: 401 }
  );
}
