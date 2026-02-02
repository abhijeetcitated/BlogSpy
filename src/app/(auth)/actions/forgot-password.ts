"use server"

/**
 * Forgot Password Server Action
 * Sends password reset email via Supabase Auth
 */

import { createServerClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { z } from "zod"

// ============================================
// VALIDATION SCHEMA
// ============================================

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
})

// ============================================
// ACTION RESPONSE TYPE
// ============================================

type ActionResponse = {
    success: boolean
    error?: string
    message?: string
}

// ============================================
// GET REQUEST ORIGIN
// ============================================

async function getRequestOrigin(): Promise<string | null> {
    const headerOrigin = (await headers()).get("origin")
    if (headerOrigin) return headerOrigin
    return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || null
}

// ============================================
// FORGOT PASSWORD ACTION
// ============================================

export async function forgotPassword(
    _prevState: ActionResponse,
    formData: FormData
): Promise<ActionResponse> {
    try {
        // Validate input
        const rawData = {
            email: formData.get("email"),
        }

        const result = forgotPasswordSchema.safeParse(rawData)
        if (!result.success) {
            return {
                success: false,
                error: result.error.issues[0]?.message ?? "Invalid email",
            }
        }

        const { email } = result.data

        // Get Supabase client
        const supabase = await createServerClient()

        // Get origin for redirect URL
        const origin = await getRequestOrigin()
        if (!origin) {
            return {
                success: false,
                error: "Configuration error. Please contact support.",
            }
        }

        // Send password reset email
        // Redirect to /auth/callback to handle code exchange server-side
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/callback?next=/reset-password&type=recovery`,
        })

        if (error) {
            // Don't reveal if email exists or not for security
            console.error("Password reset error:", error.message)

            // For rate limiting errors, show specific message
            if (error.message.includes("rate") || error.message.includes("limit")) {
                return {
                    success: false,
                    error: "Too many requests. Please wait a few minutes before trying again.",
                }
            }
        }

        // Always return success to prevent email enumeration attacks
        // Even if the email doesn't exist, we pretend it worked
        return {
            success: true,
            message: "If an account exists with this email, you will receive a password reset link.",
        }
    } catch (error) {
        console.error("Forgot password error:", error)

        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        }
    }
}
