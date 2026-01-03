// ============================================
// DATA ACCESS LAYER (DAL) - Secure Server-Only Data Access
// ============================================
// This module provides a secure interface for accessing sensitive data.
// Uses React Taint API to prevent accidental exposure of sensitive fields.
// 
// SECURITY: This file MUST only run on the server.
// ============================================

import "server-only"
import { experimental_taintObjectReference, experimental_taintUniqueValue } from "react"
import { createClient } from "@/lib/supabase/server"

// ============================================
// TYPES
// ============================================

export interface SafeUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: "user" | "admin" | "moderator"
  createdAt: Date
  // Note: password_hash is NEVER included here
}

export interface UserWithSensitiveData {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: "user" | "admin" | "moderator"
  createdAt: Date
  // Sensitive fields - tainted before any access
  passwordHash: string
  apiKeys: string[]
  stripeCustomerId: string | null
}

// ============================================
// USER DATA ACCESS
// ============================================

/**
 * Get current authenticated user (safe version - no sensitive data)
 * This is safe to use in Server Components
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Return only safe fields
  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || null,
    avatarUrl: user.user_metadata?.avatar_url || null,
    role: (user.user_metadata?.role as SafeUser["role"]) || "user",
    createdAt: new Date(user.created_at),
  }
}

/**
 * Get user by ID (safe version)
 */
export async function getUserById(userId: string): Promise<SafeUser | null> {
  const supabase = await createClient()
  
  const { data: user, error } = await supabase
    .from("profiles")
    .select("id, email, name, avatar_url, role, created_at")
    .eq("id", userId)
    .single()
  
  if (error || !user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    role: user.role || "user",
    createdAt: new Date(user.created_at),
  }
}

/**
 * Get user with sensitive data (for internal server operations only)
 * ALL SENSITIVE FIELDS ARE TAINTED - cannot be passed to client
 * 
 * @internal - Only use in server-side operations like password verification
 */
export async function getUserWithSensitiveData(userId: string): Promise<UserWithSensitiveData | null> {
  const supabase = await createClient()
  
  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  
  if (error || !user) {
    return null
  }

  // Taint sensitive values to prevent accidental exposure
  // If these are passed to a Client Component, React will throw an error
  
  if (user.password_hash) {
    experimental_taintUniqueValue(
      "Do not pass password hashes to the client. This is a security vulnerability.",
      user,
      user.password_hash
    )
  }
  
  if (user.stripe_customer_id) {
    experimental_taintUniqueValue(
      "Do not pass Stripe customer IDs to the client.",
      user,
      user.stripe_customer_id
    )
  }
  
  // Taint API keys array
  if (user.api_keys && Array.isArray(user.api_keys)) {
    for (const key of user.api_keys) {
      experimental_taintUniqueValue(
        "Do not pass API keys to the client.",
        user,
        key
      )
    }
  }

  // Taint the entire object reference as well
  const sensitiveUser: UserWithSensitiveData = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    role: user.role || "user",
    createdAt: new Date(user.created_at),
    passwordHash: user.password_hash || "",
    apiKeys: user.api_keys || [],
    stripeCustomerId: user.stripe_customer_id,
  }

  experimental_taintObjectReference(
    "Do not pass user objects with sensitive data to client components.",
    sensitiveUser
  )

  return sensitiveUser
}

// ============================================
// API KEY MANAGEMENT
// ============================================

/**
 * Verify API key and return the associated user (server-only)
 */
export async function verifyApiKey(apiKey: string): Promise<SafeUser | null> {
  // Taint the input API key
  experimental_taintUniqueValue(
    "API keys should not be exposed to client components.",
    {},
    apiKey
  )

  const supabase = await createClient()
  
  const { data: user, error } = await supabase
    .from("profiles")
    .select("id, email, name, avatar_url, role, created_at")
    .contains("api_keys", [apiKey])
    .single()
  
  if (error || !user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    role: user.role || "user",
    createdAt: new Date(user.created_at),
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Get current session (server-only)
 */
export async function getSession() {
  const supabase = await createClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    return null
  }

  // Taint access token
  if (session.access_token) {
    experimental_taintUniqueValue(
      "Do not expose access tokens to client components.",
      session,
      session.access_token
    )
  }

  // Taint refresh token
  if (session.refresh_token) {
    experimental_taintUniqueValue(
      "Do not expose refresh tokens to client components.",
      session,
      session.refresh_token
    )
  }

  return session
}

/**
 * Require authenticated session or throw
 */
export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Authentication required")
  }
  
  return user
}

/**
 * Require admin role or throw
 */
export async function requireAdmin(): Promise<SafeUser> {
  const user = await requireAuth()
  
  if (user.role !== "admin") {
    throw new Error("Admin access required")
  }
  
  return user
}
