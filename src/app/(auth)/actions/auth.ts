"use server"

/**
 * Auth Server Actions - Supabase Authentication
 * Handles login, signup, and OAuth flows
 */

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"
import { z } from "zod"

// ============================================
// VALIDATION SCHEMAS
// ============================================

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character")

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address"),
  password: strongPasswordSchema,
})

// ============================================
// ACTION RESPONSE TYPE
// ============================================

type ActionResponse<T = void> = {
  success: boolean
  error?: string
  data?: T
}

async function getRequestOrigin(): Promise<string | null> {
  const headerOrigin = (await headers()).get("origin")
  if (headerOrigin) return headerOrigin
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || null
}

// ============================================
// SIGN IN WITH EMAIL
// ============================================

export async function signIn(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  try {
    // Validate input
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    }

    const result = signInSchema.safeParse(rawData)
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Invalid input",
      }
    }

    const { email, password } = result.data

    // Get Supabase client
    const supabase = await createServerClient()

    // Sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message === "Invalid login credentials" 
          ? "Invalid email or password" 
          : error.message.toLowerCase().includes("confirm")
            ? "Please verify your email before logging in"
          : error.message,
      }
    }

    // Revalidate and redirect
    revalidatePath("/", "layout")
    redirect("/dashboard")
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error // Let Next.js handle the redirect
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

// ============================================
// SIGN UP WITH EMAIL
// ============================================

export async function signUp(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  try {
    // Validate input
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    }

    const result = signUpSchema.safeParse(rawData)
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Invalid input",
      }
    }

    const { name, email, password } = result.data

    // Get Supabase client
    const supabase = await createServerClient()
    const origin = await getRequestOrigin()
    if (!origin) {
      return {
        success: false,
        error: "Missing app origin for verification redirect.",
      }
    }

    // Sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
        data: {
          full_name: name?.trim() || null,
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // If email confirmation is required, redirect to verify page
    if (!data?.session) {
      revalidatePath("/", "layout")
      redirect("/verify-email")
    }

    // Email confirmation is OFF, user is auto-logged in
    // Revalidate and redirect
    revalidatePath("/", "layout")
    redirect("/dashboard")
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error // Let Next.js handle the redirect
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

// ============================================
// SIGN IN WITH GOOGLE OAUTH
// ============================================

export async function signInWithGoogle(): Promise<ActionResponse<{ url: string }>> {
  try {
    const supabase = await createServerClient()

    const origin = await getRequestOrigin()
    if (!origin) {
      return {
        success: false,
        error: "Missing app origin for OAuth redirect.",
      }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    if (data.url) {
      redirect(data.url) // Redirect to Google OAuth
    }

    return {
      success: false,
      error: "Failed to initialize Google sign-in",
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error // Let Next.js handle the redirect
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

// ============================================
// SIGN OUT
// ============================================

export async function signOut(): Promise<ActionResponse> {
  try {
    const supabase = await createServerClient()
    await supabase.auth.signOut()
    
    revalidatePath("/", "layout")
    redirect("/")
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error
    }

    return {
      success: false,
      error: "Failed to sign out",
    }
  }
}
