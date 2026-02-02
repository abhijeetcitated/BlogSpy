"use server"

import "server-only"

import { revalidatePath } from "next/cache"
import { authenticatedAction, z } from "@/lib/safe-action"
import { createServerClient } from "@/lib/supabase/server"

const DATE_FORMAT_OPTIONS = [
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "YYYY-MM-DD",
  "DD MMM YYYY",
  "MMM DD, YYYY",
] as const

const PreferencesSchema = z.object({
  timezone: z
    .string()
    .min(1, "Timezone is required")
    .refine((value) => {
      try {
        Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date())
        return true
      } catch {
        return false
      }
    }, "Invalid timezone"),
  dateFormat: z.enum(DATE_FORMAT_OPTIONS),
})

export const updatePreferences = authenticatedAction
  .schema(PreferencesSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createServerClient()

    const { data: authData, error: authError } = await supabase.auth.getUser()
    const authUser = authData?.user
    if (authError || !authUser) {
      throw new Error("PLG_UNAUTHORIZED")
    }

    if (ctx.userId !== authUser.id) {
      throw new Error("PLG_FORBIDDEN")
    }

    const { data: updatedProfile, error } = await supabase
      .schema("public")
      .from("core_profiles")
      .update({
        timezone: parsedInput.timezone,
        date_format: parsedInput.dateFormat,
      })
      .eq("id", authUser.id)
      .select("timezone, date_format")
      .single()

    if (error) {
      console.error("[updatePreferences] DB Error:", error)
      throw new Error(JSON.stringify(error))
    }

    // With upsert, we should always have a profile
    if (!updatedProfile) {
      throw new Error("Failed to save preferences")
    }

    revalidatePath("/settings")

    // Return the actual saved values for UI confirmation
    return {
      success: true,
      timezone: updatedProfile.timezone,
      dateFormat: updatedProfile.date_format,
    }
  })
