/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔐 DATA ACCESS LAYER (DAL) - User Operations
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * React 19 Taint API Implementation:
 * - Prevents sensitive data from leaking to client components
 * - Uses experimental_taintObjectReference for entire objects
 * - Uses experimental_taintUniqueValue for specific fields
 * - Returns clean DTOs (Data Transfer Objects)
 * 
 * @see https://react.dev/reference/react/experimental_taintObjectReference
 * @see https://react.dev/reference/react/experimental_taintUniqueValue
 */

import "server-only"

import { experimental_taintObjectReference, experimental_taintUniqueValue } from "react"
import { createClient } from "@/lib/supabase/server"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * RAW Database User (TAINTED - Never expose to client)
 */
interface RawUser {
  id: string
  email: string
  email_verified: boolean
  phone: string | null
  created_at: string
  updated_at: string
  last_sign_in_at: string | null
  role: string
  app_metadata: Record<string, unknown>
  user_metadata: Record<string, unknown>
  // Sensitive fields
  encrypted_password?: string
  confirmation_token?: string
  recovery_token?: string
  email_change_token_new?: string
  phone_change_token?: string
}

/**
 * CLEAN User DTO (Safe to pass to client)
 */
export interface UserDTO {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: "user" | "admin" | "moderator"
  createdAt: string
  emailVerified: boolean
}

/**
 * User Profile (Extended info, safe for client)
 */
export interface UserProfile extends UserDTO {
  plan: "free" | "pro" | "enterprise"
  credits: number
  stripeCustomerId: string | null
  subscriptionStatus: string | null
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER: Taint Raw User Object
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function taintUser(user: RawUser): void {
  // Taint the entire object to prevent accidental leakage
  experimental_taintObjectReference(
    "Do not pass raw user objects to the client. Use UserDTO instead.",
    user
  )

  // Taint specific sensitive values
  experimental_taintUniqueValue(
    "Do not pass user email to the client without sanitization.",
    user,
    user.email
  )

  if (user.phone) {
    experimental_taintUniqueValue(
      "Do not pass user phone to the client.",
      user,
      user.phone
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER: Convert Raw User to Safe DTO
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function toUserDTO(rawUser: RawUser): UserDTO {
  return {
    id: rawUser.id,
    email: rawUser.email.replace(/(.{2}).*(@.*)/, "$1***$2"), // Mask email: ab***@domain.com
    name: (rawUser.user_metadata?.name as string) || null,
    avatar: (rawUser.user_metadata?.avatar_url as string) || null,
    role: (rawUser.role as UserDTO["role"]) || "user",
    createdAt: rawUser.created_at,
    emailVerified: rawUser.email_verified,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Get current authenticated user (returns safe DTO)
 * 
 * @returns {Promise<UserDTO | null>} Safe user data or null if not authenticated
 * 
 * @example
 * ```tsx
 * import { getCurrentUser } from "@/lib/dal/user"
 * 
 * export async function UserProfile() {
 *   const user = await getCurrentUser()
 *   if (!user) return <div>Not authenticated</div>
 *   return <div>Hello {user.name}</div>
 * }
 * ```
 */
export async function getCurrentUser(): Promise<UserDTO | null> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Cast to RawUser and taint it
  const rawUser = user as unknown as RawUser
  taintUser(rawUser)

  // Return clean DTO
  return toUserDTO(rawUser)
}

/**
 * Get user by ID (admin only, returns safe DTO)
 * 
 * @param {string} userId - User ID to fetch
 * @returns {Promise<UserDTO | null>} Safe user data or null if not found
 */
export async function getUserById(userId: string): Promise<UserDTO | null> {
  const supabase = await createClient()
  
  // This would typically fetch from your users table
  // For now, we'll use the auth user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user || user.id !== userId) {
    return null
  }

  const rawUser = user as unknown as RawUser
  taintUser(rawUser)

  return toUserDTO(rawUser)
}

/**
 * Get user profile with extended information (credits, subscription, etc.)
 * 
 * @returns {Promise<UserProfile | null>} Extended user profile or null
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  const rawUser = user as unknown as RawUser
  taintUser(rawUser)

  // Fetch additional profile data from database
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan, credits, stripe_customer_id, subscription_status")
    .eq("user_id", user.id)
    .single()

  const baseDTO = toUserDTO(rawUser)

  return {
    ...baseDTO,
    plan: (profile?.plan as UserProfile["plan"]) || "free",
    credits: profile?.credits || 0,
    stripeCustomerId: profile?.stripe_customer_id || null,
    subscriptionStatus: profile?.subscription_status || null,
  }
}

/**
 * Check if user has specific role
 * 
 * @param {string} requiredRole - Role to check
 * @returns {Promise<boolean>} True if user has the role
 */
export async function hasRole(requiredRole: "admin" | "moderator" | "user"): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  return user.role === requiredRole || user.role === "admin" // Admin has all roles
}

/**
 * Check if user is admin
 * 
 * @returns {Promise<boolean>} True if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin")
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

// Types are already exported via interface declarations above
