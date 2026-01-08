"use server"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🎯 USER SERVER ACTIONS - Settings Profile Management
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Server Actions for fetching and updating user profile data.
 * Uses next-safe-action for type-safe, authenticated operations.
 */

import { authAction, z } from "@/lib/safe-action"
import { getCurrentUser, type UserDTO } from "@/src/lib/dal"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  timezone: z.string().optional(),
})

const updateNotificationsSchema = z.object({
  email: z.boolean(),
  rankingAlerts: z.boolean(),
  weeklyReport: z.boolean(),
  productUpdates: z.boolean(),
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface UserActionResponse {
  success: boolean
  data?: UserDTO | null
  error?: string
}

export interface ProfileUpdateResponse {
  success: boolean
  data?: {
    id: string
    name: string
    company?: string
    website?: string
    timezone?: string
    updatedAt: Date
  }
  error?: string
}

export interface NotificationsUpdateResponse {
  success: boolean
  data?: {
    email: boolean
    rankingAlerts: boolean
    weeklyReport: boolean
    productUpdates: boolean
  }
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// FETCH USER ACTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch current authenticated user profile
 * Returns SafeUser from the DAL
 */
export const fetchUserAction = authAction
  .schema(z.object({}))
  .action(async ({ ctx }): Promise<UserActionResponse> => {
    try {
      const user = await getCurrentUser()
      
      if (!user) {
        return {
          success: false,
          error: "User not found",
        }
      }

      // Also fetch extended profile data from users table
      const supabase = await createClient()
      const { data: profile } = await supabase
        .from("users")
        .select("company, website, timezone, notifications")
        .eq("id", ctx.userId)
        .single()

      // Merge DAL data with profile data
      const enrichedUser: UserDTO & {
        company?: string
        website?: string
        timezone?: string
        notifications?: Record<string, boolean>
      } = {
        ...user,
        company: profile?.company || undefined,
        website: profile?.website || undefined,
        timezone: profile?.timezone || "America/New_York",
        notifications: profile?.notifications || {
          email: true,
          rankingAlerts: true,
          weeklyReport: true,
          productUpdates: false,
        },
      }

      return {
        success: true,
        data: enrichedUser as UserDTO,
      }
    } catch (error) {
      console.error("[fetchUserAction] Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch user",
      }
    }
  })

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// UPDATE PROFILE ACTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Update user profile (name, company, website, timezone)
 * Persists to public.users table
 */
export const updateProfileAction = authAction
  .schema(updateProfileSchema)
  .action(async ({ parsedInput, ctx }): Promise<ProfileUpdateResponse> => {
    try {
      const supabase = await createClient()
      const { name, company, website, timezone } = parsedInput

      // Upsert to users table (create if not exists, update if exists)
      const { data, error } = await supabase
        .from("users")
        .upsert(
          {
            id: ctx.userId,
            email: ctx.email,
            name,
            company: company || null,
            website: website || null,
            timezone: timezone || "America/New_York",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        )
        .select()
        .single()

      if (error) {
        console.error("[updateProfileAction] Supabase error:", error)
        return {
          success: false,
          error: error.message,
        }
      }

      // Also update auth user metadata for name
      await supabase.auth.updateUser({
        data: { full_name: name },
      })

      // Revalidate dashboard and settings pages
      revalidatePath("/dashboard")
      revalidatePath("/settings")

      return {
        success: true,
        data: {
          id: data.id,
          name: data.name,
          company: data.company,
          website: data.website,
          timezone: data.timezone,
          updatedAt: new Date(data.updated_at),
        },
      }
    } catch (error) {
      console.error("[updateProfileAction] Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update profile",
      }
    }
  })

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// UPDATE NOTIFICATIONS ACTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Update notification preferences
 * Stores as JSONB in users.notifications column
 */
export const updateNotificationsAction = authAction
  .schema(updateNotificationsSchema)
  .action(async ({ parsedInput, ctx }): Promise<NotificationsUpdateResponse> => {
    try {
      const supabase = await createClient()

      const { error } = await supabase
        .from("users")
        .update({
          notifications: parsedInput,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ctx.userId)

      if (error) {
        console.error("[updateNotificationsAction] Supabase error:", error)
        return {
          success: false,
          error: error.message,
        }
      }

      // Revalidate settings page
      revalidatePath("/settings")

      return {
        success: true,
        data: parsedInput,
      }
    } catch (error) {
      console.error("[updateNotificationsAction] Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update notifications",
      }
    }
  })
