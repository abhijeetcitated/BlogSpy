"use server"

/**
 * Auth Server Actions - Supabase Authentication
 * Handles login, signup, and OAuth flows
 */

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerClient } from "@/src/lib/supabase/server"
import { z } from "zod"

// ============================================
// VALIDATION SCHEMAS
// ============================================

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

// ============================================
// ACTION RESPONSE TYPE
// ============================================

type ActionResponse<T = void> = {
  success: boolean
  error?: string
  data?: T
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

    const { email, password } = result.data

    // Get Supabase client
    const supabase = await createServerClient()

    // Sign up
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Since email confirmation is OFF, user is auto-logged in
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

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
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
    redirect("/login")
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
