"use server"

import "server-only"

import { revalidatePath } from "next/cache"
import { authenticatedAction, z } from "@/lib/safe-action"
import { createServerClient } from "@/lib/supabase/server"

const NotificationKeySchema = z.enum([
  "weeklySeoReport",
  "rankAlerts",
  "decayAlerts",
  "competitorAlerts",
  "productUpdates",
  "unsubscribeAll",
])

const UpdateNotificationSchema = z.object({
  key: NotificationKeySchema,
  value: z.boolean(),
})

const DEFAULT_SETTINGS = {
  weeklySeoReport: true,
  rankAlerts: true,
  decayAlerts: false,
  competitorAlerts: false,
  productUpdates: true,
  unsubscribeAll: false,
}

const COLUMN_MAP: Record<z.infer<typeof NotificationKeySchema>, string> = {
  weeklySeoReport: "weekly_seo_report",
  rankAlerts: "rank_alerts",
  decayAlerts: "decay_alerts",
  competitorAlerts: "competitor_alerts",
  productUpdates: "product_updates",
  unsubscribeAll: "unsubscribe_all",
}

function toCamelCase(payload: {
  weekly_seo_report: boolean
  rank_alerts: boolean
  decay_alerts: boolean
  competitor_alerts: boolean
  product_updates: boolean
  unsubscribe_all: boolean
}) {
  return {
    weeklySeoReport: payload.weekly_seo_report,
    rankAlerts: payload.rank_alerts,
    decayAlerts: payload.decay_alerts,
    competitorAlerts: payload.competitor_alerts,
    productUpdates: payload.product_updates,
    unsubscribeAll: payload.unsubscribe_all,
  }
}

export const getNotificationSettings = authenticatedAction
  .schema(z.object({}))
  .action(async ({ ctx }) => {
    const supabase = await createServerClient()

    const { data: authData, error: authError } = await supabase.auth.getUser()
    const authUser = authData?.user
    if (authError || !authUser) {
      throw new Error("PLG_UNAUTHORIZED")
    }

    if (ctx.userId !== authUser.id) {
      throw new Error("PLG_FORBIDDEN")
    }

    const { data: settings, error } = await supabase
      .schema("public")
      .from("notification_settings")
      .select(
        "weekly_seo_report, rank_alerts, decay_alerts, competitor_alerts, product_updates, unsubscribe_all"
      )
      .eq("user_id", authUser.id)
      .maybeSingle()

    if (error) {
      console.error("[getNotificationSettings] DB Error:", error)
      throw new Error(JSON.stringify(error))
    }

    if (settings) {
      return {
        success: true,
        settings: toCamelCase(settings),
      }
    }

    const { data: inserted, error: insertError } = await supabase
      .schema("public")
      .from("notification_settings")
      .insert({
        user_id: authUser.id,
        weekly_seo_report: DEFAULT_SETTINGS.weeklySeoReport,
        rank_alerts: DEFAULT_SETTINGS.rankAlerts,
        decay_alerts: DEFAULT_SETTINGS.decayAlerts,
        competitor_alerts: DEFAULT_SETTINGS.competitorAlerts,
        product_updates: DEFAULT_SETTINGS.productUpdates,
        unsubscribe_all: DEFAULT_SETTINGS.unsubscribeAll,
      })
      .select(
        "weekly_seo_report, rank_alerts, decay_alerts, competitor_alerts, product_updates, unsubscribe_all"
      )
      .single()

    if (insertError || !inserted) {
      console.error("[getNotificationSettings] Insert Error:", insertError)
      throw new Error("Failed to initialize notification settings")
    }

    return {
      success: true,
      settings: toCamelCase(inserted),
    }
  })

export const updateNotificationSetting = authenticatedAction
  .schema(UpdateNotificationSchema)
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

    const column = COLUMN_MAP[parsedInput.key]

    const { data: updated, error } = await supabase
      .schema("public")
      .from("notification_settings")
      .upsert(
        {
          user_id: authUser.id,
          [column]: parsedInput.value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select(
        "weekly_seo_report, rank_alerts, decay_alerts, competitor_alerts, product_updates, unsubscribe_all"
      )
      .single()

    if (error || !updated) {
      console.error("[updateNotificationSetting] DB Error:", error)
      throw new Error(JSON.stringify(error))
    }

    revalidatePath("/settings")

    return {
      success: true,
      settings: toCamelCase(updated),
    }
  })
