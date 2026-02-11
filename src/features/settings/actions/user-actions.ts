"use server"

import "server-only"

import { createClient, createAdminClient } from "@/lib/supabase/server"

type ActionResponse<T> = {
  data: T
  serverError?: string
}

type ActionResult<T> = {
  success: boolean
  data?: T
  error?: string
}

export async function fetchUserAction(
  _input: unknown
): Promise<ActionResponse<ActionResult<Record<string, unknown>>>> {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()

    const { data: authData, error: authError } = await supabase.auth.getUser()
    const authUser = authData?.user
    if (authError || !authUser) {
      return { data: { success: false, error: "UNAUTHORIZED" } }
    }

    // Use admin client to bypass RLS for reading profile
    const { data: profile, error: profileError } = await admin
      .from("core_profiles")
      .select(
        "id, email, full_name, billing_tier, timezone, date_format, language_preference, auth_provider, last_password_change, created_at"
      )
      .eq("id", authUser.id)
      .single()

    if (profileError || !profile) {
      console.error("[fetchUserAction] Profile missing:", profileError?.message)
      return { data: { success: false, error: "PROFILE_MISSING" } }
    }

    // Use admin client for credits too
    const { data: creditsRow } = await admin
      .from("bill_credits")
      .select("credits_total, credits_used")
      .eq("user_id", authUser.id)
      .single()

    const remainingCredits =
      creditsRow?.credits_total && creditsRow?.credits_used !== null
        ? Math.max(creditsRow.credits_total - creditsRow.credits_used, 0)
        : 0

    const plan = String(profile.billing_tier || "free").toUpperCase()

    return {
      data: {
        success: true,
        data: {
          id: profile.id,
          email: profile.email || authUser.email,
          name: profile.full_name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
          plan,
          credits: remainingCredits,
          createdAt: profile.created_at,
          timezone: profile.timezone,
          dateFormat: profile.date_format,
          language: profile.language_preference,
          auth_provider: profile.auth_provider,
          last_password_change: profile.last_password_change,
        },
      },
    }
  } catch (error) {
    return {
      data: {
        success: false,
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      },
    }
  }
}

export async function softSyncProfileAction(
  _input: unknown
): Promise<ActionResponse<ActionResult<Record<string, unknown>>>> {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()

    const { data: authData, error: authError } = await supabase.auth.getUser()
    const authUser = authData?.user
    if (authError || !authUser) {
      return { data: { success: false, error: "UNAUTHORIZED" } }
    }

    const provider = authUser.app_metadata?.provider || "email"
    const fullName = authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User"

    const { error: upsertError } = await admin.from("core_profiles").upsert(
      {
        id: authUser.id,
        email: authUser.email,
        auth_provider: provider,
        full_name: fullName,
        avatar_url: authUser.user_metadata?.avatar_url ?? null,
        billing_tier: "free",
      },
      { onConflict: "id" }
    )

    if (upsertError) {
      return { data: { success: false, error: upsertError.message } }
    }

    const { data: profile, error: profileError } = await admin
      .from("core_profiles")
      .select(
        "id, email, full_name, billing_tier, timezone, date_format, language_preference, auth_provider, last_password_change, created_at"
      )
      .eq("id", authUser.id)
      .single()

    if (profileError || !profile) {
      return { data: { success: false, error: profileError?.message || "PROFILE_SYNC_FAILED" } }
    }

    const { data: creditsRow } = await admin
      .from("bill_credits")
      .select("credits_total, credits_used")
      .eq("user_id", authUser.id)
      .single()

    const remainingCredits =
      creditsRow?.credits_total && creditsRow?.credits_used !== null
        ? Math.max(creditsRow.credits_total - creditsRow.credits_used, 0)
        : 0

    const plan = String(profile.billing_tier || "free").toUpperCase()

    return {
      data: {
        success: true,
        data: {
          id: profile.id,
          email: profile.email || authUser.email,
          name: profile.full_name || fullName,
          plan,
          credits: remainingCredits,
          createdAt: profile.created_at,
          timezone: profile.timezone,
          dateFormat: profile.date_format,
          language: profile.language_preference,
          auth_provider: profile.auth_provider,
          last_password_change: profile.last_password_change,
        },
      },
    }
  } catch (error) {
    return {
      data: {
        success: false,
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      },
    }
  }
}

export async function updateProfileAction(
  _input: unknown
): Promise<ActionResponse<ActionResult<null>>> {
  return {
    data: {
      success: false,
      error: "This feature is being rebuilt in V2",
    },
  }
}

export async function updateNotificationsAction(
  _input: unknown
): Promise<ActionResponse<ActionResult<null>>> {
  return {
    data: {
      success: false,
      error: "This feature is being rebuilt in V2",
    },
  }
}
