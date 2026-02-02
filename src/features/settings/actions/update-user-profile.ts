"use server"

import "server-only"

import { z } from "zod"
import { authenticatedAction } from "@/lib/safe-action"
import { createServerClient } from "@/lib/supabase/server"
import { ProfileSchema } from "@/features/settings/validation/profile.schema"

const UpdateUserProfileSchema = ProfileSchema.extend({
  userId: z.string().uuid(),
})

type UpdateUserProfileResult = {
  success: boolean
}

export const updateUserProfile = authenticatedAction
  .schema(UpdateUserProfileSchema)
  .action(async ({ parsedInput, ctx }): Promise<UpdateUserProfileResult> => {
    if (parsedInput.userId !== ctx.userId) {
      throw new Error("PLG_FORBIDDEN")
    }

    const supabase = await createServerClient()

    const { data: authData, error: authError } = await supabase.auth.getUser()
    const authUser = authData?.user
    if (authError || !authUser) {
      throw new Error("PLG_UNAUTHORIZED")
    }

    if (parsedInput.userId !== authUser.id) {
      throw new Error("PLG_FORBIDDEN")
    }

    const metadataUpdates: Record<string, string | null> = {}

    if (parsedInput.fullName) {
      metadataUpdates.full_name = parsedInput.fullName.trim()
    }

    if (parsedInput.timezone) {
      metadataUpdates.timezone = parsedInput.timezone
    }

    if (parsedInput.dateFormat) {
      metadataUpdates.date_format = parsedInput.dateFormat
    }

    if (parsedInput.language) {
      metadataUpdates.language = parsedInput.language
    }

    if (Object.keys(metadataUpdates).length > 0) {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: metadataUpdates,
      })

      if (metadataError) {
        throw new Error(metadataError.message)
      }
    }

    const profilePayload = {
      full_name: parsedInput.fullName.trim(),
      timezone: parsedInput.timezone,
      date_format: parsedInput.dateFormat,
    }

    const updatePayload = Object.fromEntries(
      Object.entries(profilePayload).filter(([, value]) => value !== undefined)
    )

    const { error: profileError } = await supabase
      .from("core_profiles")
      .update(updatePayload)
      .eq("id", authUser.id)

    if (profileError) {
      if (profileError.code === "42501") {
        throw new Error("RLS_DENIED")
      }
      throw new Error(profileError.message)
    }

    return { success: true }
  })
