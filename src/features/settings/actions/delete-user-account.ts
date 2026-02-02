"use server"

import "server-only"

import { z } from "zod"
import { authenticatedAction } from "@/lib/safe-action"
import { createAdminClient, createServerClient } from "@/lib/supabase/server"

const DeleteAccountSchema = z.object({
  userId: z.string().uuid(),
})

type DeleteAccountResult = {
  success: boolean
}

export const deleteUserAccount = authenticatedAction
  .schema(DeleteAccountSchema)
  .action(async ({ parsedInput, ctx }): Promise<DeleteAccountResult> => {
    if (parsedInput.userId !== ctx.userId) {
      throw new Error("PLG_FORBIDDEN")
    }

    const supabase = await createServerClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      throw new Error("PLG_UNAUTHORIZED")
    }

    if (authData.user.id !== parsedInput.userId) {
      throw new Error("PLG_FORBIDDEN")
    }

    const admin = createAdminClient()

    const { error: profileError } = await admin
      .from("core_profiles")
      .delete()
      .eq("id", parsedInput.userId)

    if (profileError) {
      throw new Error(profileError.message)
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(parsedInput.userId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    return { success: true }
  })
