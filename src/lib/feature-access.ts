/**
 * ============================================
 * FEATURE ACCESS CONTROL
 * ============================================
 * 
 * Environment-aware authentication system:
 * - Development: Full access for faster iteration
 * - Production: Requires proper authentication
 * 
 * ============================================
 */

export interface FeatureAccess {
  hasFullAccess: boolean
  isDemoMode: boolean
  isDevMode: boolean
  accessLevel: "full" | "demo" | "limited"
}

/**
 * Check if we're in development mode
 */
export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === "development"
}

/**
 * Check if we're in production mode
 */
export function isProdEnvironment(): boolean {
  return process.env.NODE_ENV === "production"
}

/**
 * Should skip auth check?
 * - Dev: Skip for faster development
 * - Prod: Never skip
 */
export function shouldSkipAuthCheck(): boolean {
  return isDevEnvironment()
}

/**
 * Get feature access based on authentication status
 * 
 * @param isAuthenticated - Whether user is logged in
 * @param isDemoUser - Whether user is using demo account
 * @returns FeatureAccess object with access levels
 */
export function getFeatureAccess(
  isAuthenticated: boolean = false,
  isDemoUser: boolean = false
): FeatureAccess {
  const isDev = isDevEnvironment()

  // Development mode: Full access for testing
  if (isDev) {
    return {
      hasFullAccess: true,
      isDemoMode: false,
      isDevMode: true,
      accessLevel: "full",
    }
  }

  // Production: Check actual authentication
  if (!isAuthenticated) {
    return {
      hasFullAccess: false,
      isDemoMode: true,
      isDevMode: false,
      accessLevel: "demo",
    }
  }

  // Demo user: Limited access
  if (isDemoUser) {
    return {
      hasFullAccess: false,
      isDemoMode: true,
      isDevMode: false,
      accessLevel: "demo",
    }
  }

  // Authenticated user: Full access
  return {
    hasFullAccess: true,
    isDemoMode: false,
    isDevMode: false,
    accessLevel: "full",
  }
}

/**
 * Check if user can access a specific feature
 * Useful for feature-gating in components
 */
export function canAccessFeature(
  featureName: string,
  isAuthenticated: boolean,
  userPlan: "free" | "pro" | "enterprise" = "free"
): boolean {
  // Dev mode: All features accessible
  if (isDevEnvironment()) return true

  // Production: Check plan-based access
  const freeFeatures = ["keyword-magic", "keyword-overview"]
  const proFeatures = [...freeFeatures, "rank-tracker", "content-decay", "topic-clusters", "ai-writer"]
  const enterpriseFeatures = [...proFeatures, "competitor-gap", "video-hijack", "api-access"]

  if (!isAuthenticated) {
    return freeFeatures.includes(featureName)
  }

  switch (userPlan) {
    case "enterprise":
      return enterpriseFeatures.includes(featureName)
    case "pro":
      return proFeatures.includes(featureName)
    default:
      return freeFeatures.includes(featureName)
  }
}
