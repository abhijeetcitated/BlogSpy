"use server"

import "server-only"

import { authenticatedAction, z } from "@/lib/safe-action"
import { createClient } from "@/lib/supabase/server"

const GeneralSettingsSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  language: z.string().optional(),
})

type GeneralSettingsInput = z.infer<typeof GeneralSettingsSchema>

type GeneralSettingsResult = {
  success: boolean
  error?: string
}

export const updateUserGeneralSettings = authenticatedAction
  .schema(GeneralSettingsSchema)
  .action(async ({ ctx, parsedInput }): Promise<GeneralSettingsResult> => {
    const supabase = await createClient()

    const profilePayload: Record<string, string | null> = {
      id: ctx.userId,
      full_name: parsedInput.fullName,
    }

    const { error: profileError } = await supabase
      .from("core_profiles")
      .upsert(profilePayload, { onConflict: "id" })

    if (profileError) {
      throw new Error(profileError.message)
    }

    const metadataUpdates: Record<string, string> = {}

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
      const { error: authError } = await supabase.auth.updateUser({
        data: metadataUpdates,
      })

      if (authError) {
        throw new Error(authError.message)
      }
    }

    return { success: true }
  })

export type { GeneralSettingsInput }
