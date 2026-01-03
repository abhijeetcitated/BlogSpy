// ============================================
// 🔐 DATA ACCESS LAYER - User Module
// ============================================
// Secure server-only access to user data.
// Uses React Taint API to prevent sensitive data leaks.
// 
// RULE: Raw DB rows are NEVER returned directly.
//       Always map to safe DTOs.
// ============================================

import "server-only"
import { 
  experimental_taintObjectReference, 
  experimental_taintUniqueValue 
} from "react"
import { createServerClient } from "@/src/lib/supabase/server"

// ============================================
// SAFE DTOs (Data Transfer Objects)
// ============================================

/**
 * Safe user DTO - can be passed to Client Components
 */
export interface UserDTO {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: "user" | "admin" | "moderator"
  createdAt: string // ISO string for serialization
}

/**
 * Safe user profile DTO with billing info
 */
export interface UserProfileDTO extends UserDTO {
  plan: "free" | "starter" | "professional" | "enterprise"
  creditsTotal: number
  creditsUsed: number
  creditsRemaining: number
}

// ============================================
// INTERNAL TYPES (Never exposed to client)
// ============================================

/**
 * @internal - Sensitive user data (all fields tainted)
 */
interface SensitiveUserData {
  userId: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  accessToken: string | null
  refreshToken: string | null
}

// ============================================
// TAINT HELPERS
// ============================================

/**
 * Taint sensitive string values
 */
function taintValue(value: string | null, message: string, owner: object): void {
  if (value) {
    experimental_taintUniqueValue(message, owner, value)
  }
}

// ============================================
// PUBLIC API: Safe User Access
// ============================================

/**
 * Get the current authenticated user (safe DTO)
 * ✅ Safe to pass to Client Components
 */
export async function getCurrentUser(): Promise<UserDTO | null> {
  const supabase = await createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Map Supabase auth user to safe DTO
  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || user.user_metadata?.full_name || null,
    avatarUrl: user.user_metadata?.avatar_url || null,
    role: (user.user_metadata?.role as UserDTO["role"]) || "user",
    createdAt: user.created_at,
  }
}

/**
 * Get user profile with billing info (safe DTO)
 * ✅ Safe to pass to Client Components
 */
export async function getUserProfile(userId: string): Promise<UserProfileDTO | null> {
  const supabase = await createServerClient()
  
  // Get user from auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user || user.id !== userId) {
    return null
  }

  // Get credits from user_credits table
  const { data: credits } = await supabase
    .from("user_credits")
    .select("credits_total, credits_used, plan")
    .eq("user_id", userId)
    .single()

  const creditsTotal = credits?.credits_total ?? 100
  const creditsUsed = credits?.credits_used ?? 0
  const plan = credits?.plan?.toLowerCase() as UserProfileDTO["plan"] ?? "free"

  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || user.user_metadata?.full_name || null,
    avatarUrl: user.user_metadata?.avatar_url || null,
    role: (user.user_metadata?.role as UserDTO["role"]) || "user",
    createdAt: user.created_at,
    plan,
    creditsTotal,
    creditsUsed,
    creditsRemaining: Math.max(0, creditsTotal - creditsUsed),
  }
}

// ============================================
// INTERNAL API: Sensitive Data Access
// ============================================

/**
 * Get user with sensitive billing data for server-side operations
 * ⚠️ ALL SENSITIVE FIELDS ARE TAINTED
 * ❌ Do NOT pass to Client Components (React will throw)
 * 
 * @internal Use only for billing operations, Stripe webhooks, etc.
 */
export async function _getUserWithSensitiveData(
  userId: string
): Promise<SensitiveUserData | null> {
  const supabase = await createServerClient()
  
  // Get session for tokens
  const { data: { session } } = await supabase.auth.getSession()
  
  // Get Stripe IDs from user_credits
  const { data: credits } = await supabase
    .from("user_credits")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("user_id", userId)
    .single()

  // Create the sensitive data object
  const sensitiveData: SensitiveUserData = {
    userId,
    stripeCustomerId: credits?.stripe_customer_id || null,
    stripeSubscriptionId: credits?.stripe_subscription_id || null,
    accessToken: session?.access_token || null,
    refreshToken: session?.refresh_token || null,
  }

  // TAINT the entire object reference
  experimental_taintObjectReference(
    "🚨 SECURITY: This object contains sensitive user data and must not be passed to client components.",
    sensitiveData
  )

  // TAINT each sensitive field individually
  taintValue(
    sensitiveData.stripeCustomerId,
    "🚨 SECURITY: Stripe customer IDs must never be sent to the client.",
    sensitiveData
  )
  taintValue(
    sensitiveData.stripeSubscriptionId,
    "🚨 SECURITY: Stripe subscription IDs must never be sent to the client.",
    sensitiveData
  )
  taintValue(
    sensitiveData.accessToken,
    "🚨 SECURITY: Access tokens must never be sent to the client.",
    sensitiveData
  )
  taintValue(
    sensitiveData.refreshToken,
    "🚨 SECURITY: Refresh tokens must never be sent to the client.",
    sensitiveData
  )

  return sensitiveData
}

// ============================================
// AUTH HELPERS
// ============================================

/**
 * Require authentication - throws if not authenticated
 * ✅ Returns safe UserDTO
 */
export async function requireAuth(): Promise<UserDTO> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }
  
  return user
}

/**
 * Require admin role - throws if not admin
 * ✅ Returns safe UserDTO
 */
export async function requireAdmin(): Promise<UserDTO> {
  const user = await requireAuth()
  
  if (user.role !== "admin") {
    throw new Error("Admin access required")
  }
  
  return user
}
