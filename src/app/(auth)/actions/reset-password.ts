"use server"

/**
 * Reset Password Server Action
 * Updates user password after clicking reset link
 */

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

// ============================================
// VALIDATION SCHEMA (Same as signup)
// ============================================

const strongPasswordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number")
    .regex(/[^A-Za-z0-9]/, "Password must include a special character")

const resetPasswordSchema = z.object({
    password: strongPasswordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

// ============================================
// ACTION RESPONSE TYPE
// ============================================

type ActionResponse = {
    success: boolean
    error?: string
}

// ============================================
// RESET PASSWORD ACTION
// ============================================

export async function resetPassword(
    _prevState: ActionResponse,
    formData: FormData
): Promise<ActionResponse> {
    try {
        // Validate input
        const rawData = {
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword"),
        }

        const result = resetPasswordSchema.safeParse(rawData)
        if (!result.success) {
            return {
                success: false,
                error: result.error.issues[0]?.message ?? "Invalid input",
            }
        }

        const { password } = result.data

        // Get Supabase client
        const supabase = await createServerClient()

        // Check if user is authenticated (via recovery link)
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return {
                success: false,
                error: "Invalid or expired reset link. Please request a new one.",
            }
        }

        // Update password
        const { error } = await supabase.auth.updateUser({
            password: password,
        })

        if (error) {
            console.error("Password update error:", error.message)

            // Handle specific errors
            if (error.message.includes("same")) {
                return {
                    success: false,
                    error: "New password must be different from your current password.",
                }
            }

            return {
                success: false,
                error: "Failed to update password. Please try again.",
            }
        }

        // Update last_password_change in core_profiles
        await supabase
            .from("core_profiles")
            .update({ last_password_change: new Date().toISOString() })
            .eq("id", user.id)

        // Sign out to force re-login with new password
        await supabase.auth.signOut()

        // Revalidate and redirect to login with success message
        revalidatePath("/", "layout")
        redirect("/login?message=password_reset_success")
    } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            throw error // Let Next.js handle the redirect
        }

        console.error("Reset password error:", error)

        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        }
    }
}
