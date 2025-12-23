/**
 * ============================================
 * FEATURE ACCESS CONTROL
 * ============================================
 * 
 * ⚠️  IMPORTANT: AUTH SYSTEM DISABLED FOR DEVELOPMENT ⚠️
 * 
 * TODO: [AUTH] Before production deployment, re-enable authentication:
 * 
 * 1. RESTORE ENV-BASED CHECKS:
 *    - Import { env } from "@/config/env"
 *    - Check env.isDev vs env.isProd
 *    - In dev: full access
 *    - In prod: check actual auth
 * 
 * 2. IMPLEMENT PROPER AUTH FLOW:
 *    - Login page: /login
 *    - Signup page: /signup  
 *    - Protected routes middleware
 *    - Session management (Clerk/NextAuth/Supabase)
 * 
 * 3. IMPLEMENT SUBSCRIPTION TIERS:
 *    - Free: Limited features, demo mode
 *    - Pro: Full access, no limits
 *    - Enterprise: Team features
 * 
 * 4. STRIPE INTEGRATION:
 *    - Payment processing
 *    - Subscription management
 *    - Usage-based billing (credits)
 * 
 * 5. FILES TO UPDATE WHEN ENABLING AUTH:
 *    - lib/feature-access.ts (this file)
 *    - hooks/use-auth.ts
 *    - contexts/auth-context.tsx
 *    - src/features/ai-writer/utils/context-parser.ts (remove getDemoContextForDev)
 *    - src/features/ai-writer/ai-writer-content.tsx (remove dev-only context)
 * 
 * SEARCH FOR: TODO: [AUTH] to find all auth-related code
 * ============================================
 */

export interface FeatureAccess {
  hasFullAccess: boolean
  isDemoMode: boolean
  isDevMode: boolean
  accessLevel: "full" | "demo" | "limited"
}

/**
 * Get feature access - ALWAYS returns full access during development
 * TODO: [AUTH] Re-enable auth checks before production
 */
export function getFeatureAccess(
  _isAuthenticated: boolean = false,
  _isDemoUser: boolean = false
): FeatureAccess {
  // TEMPORARY: Always give full access during feature development
  return {
    hasFullAccess: true,
    isDemoMode: false,
    isDevMode: true,
    accessLevel: "full",
  }
}

/**
 * Always skip auth checks during feature development
 * TODO: [AUTH] Change to: return env.isDev
 */
export function shouldSkipAuthCheck(): boolean {
  return true
}

/**
 * Always return true during development
 * TODO: [AUTH] Change to: return env.isDev
 */
export function isDevEnvironment(): boolean {
  return true
}

/**
 * Check if we're in production mode
 */
export function isProdEnvironment(): boolean {
  return process.env.NODE_ENV === "production"
}
