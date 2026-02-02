"use server"

import "server-only"

import { z } from "zod"
import { authenticatedAction } from "@/lib/safe-action"
import { createServerClient } from "@/lib/supabase/server"

const UpdateProfileNameSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100, "Max 100 characters"),
})

type UpdateProfileNameResult = {
  success: boolean
}

export const updateProfileName = authenticatedAction
  .schema(UpdateProfileNameSchema)
  .action(async ({ parsedInput, ctx }): Promise<UpdateProfileNameResult> => {
    const supabase = await createServerClient()

    const { data: authData, error: authError } = await supabase.auth.getUser()
    const authUser = authData?.user
    if (authError || !authUser) {
      throw new Error("PLG_UNAUTHORIZED")
    }

    if (ctx.userId !== authUser.id) {
      throw new Error("PLG_FORBIDDEN")
    }

    const nextFullName = parsedInput.fullName.trim()

    const { error: metadataError } = await supabase.auth.updateUser({
      data: { full_name: nextFullName },
    })

    if (metadataError) {
      throw new Error(metadataError.message)
    }

    const { error: profileError } = await supabase
      .from("core_profiles")
      .update({ full_name: nextFullName })
      .eq("id", authUser.id)

    if (profileError) {
      throw new Error(profileError.message)
    }

    return { success: true }
  })

const InitiateEmailChangeSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  currentPassword: z.string().optional(),
})

type InitiateEmailChangeResult = {
  success: boolean
}

export const initiateEmailChange = authenticatedAction
  .schema(InitiateEmailChangeSchema)
  .action(async ({ parsedInput, ctx }): Promise<InitiateEmailChangeResult> => {
    const supabase = await createServerClient()

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

    const provider = (authUser.app_metadata as { provider?: string } | undefined)?.provider ?? "email"
    const isEmailProvider = provider === "email"

    if (isEmailProvider) {
      if (!parsedInput.currentPassword) {
        throw new Error("CURRENT_PASSWORD_REQUIRED")
      }

      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: authUser.email,
        password: parsedInput.currentPassword,
      })

      if (reauthError) {
        throw new Error(reauthError.message)
      }
    } else {
      const authWithReauth = supabase.auth as unknown as {
        reauthenticate?: () => Promise<{ error?: { message?: string } }>
      }
      if (authWithReauth.reauthenticate) {
        const { error: reauthError } = await authWithReauth.reauthenticate()
        if (reauthError?.message) {
          throw new Error(reauthError.message)
        }
      }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      email: parsedInput.newEmail,
    })

    if (updateError) {
      throw new Error(updateError.message)
    }

    return { success: true }
  })
