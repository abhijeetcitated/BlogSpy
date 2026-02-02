"use server"

import "server-only"

import { authenticatedAction } from "@/lib/safe-action"
import { createClient } from "@/lib/supabase/server"
import { ChangePasswordSchema } from "@/features/settings/schemas/security.schema"

type ChangePasswordResult = {
  success: boolean
}

export const updatePassword = authenticatedAction
  .schema(ChangePasswordSchema)
  .action(async ({ parsedInput, ctx }): Promise<ChangePasswordResult> => {
    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.getUser()
    const authUser = authData?.user
    if (authError || !authUser) {
      throw new Error("PLG_UNAUTHORIZED")
    }

    if (ctx.userId !== authUser.id) {
      throw new Error("PLG_FORBIDDEN")
    }

    if (!authUser.email) {
      throw new Error("PLG_EMAIL_NOT_FOUND")
    }

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: authUser.email,
      password: parsedInput.currentPassword,
    })

    if (reauthError) {
      throw new Error("WRONG_CURRENT_PASSWORD")
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: parsedInput.newPassword,
    })

    if (updateError) {
      throw new Error(updateError.message)
    }

    await supabase
      .from("core_profiles")
      .update({ last_password_change: new Date().toISOString() })
      .eq("id", authUser.id)

    return { success: true }
  })
