"use server"

import "server-only"

import { revalidatePath } from "next/cache"
import { authenticatedAction, z } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"
import { rateLimiter } from "@/lib/rate-limit"
import { createServerClient } from "@/lib/supabase/server"

const NOTIFICATION_KEYS = [
  "weeklyreport",
  "rankalerts",
  "decayalerts",
  "competitoralerts",
  "productupdates",
  "unsubscribeall",
] as const

const NotificationKeySchema = z.enum(NOTIFICATION_KEYS)

type NotificationKey = (typeof NOTIFICATION_KEYS)[number]
type NotificationSettingsRecord = Record<NotificationKey, boolean>

const UpdateNotificationSchema = z.object({
  key: NotificationKeySchema,
  value: z.boolean(),
})

const DEFAULT_SETTINGS: NotificationSettingsRecord = {
  weeklyreport: true,
  rankalerts: true,
  decayalerts: true,
  competitoralerts: false,
  productupdates: false,
  unsubscribeall: false,
}

const SETTINGS_SELECT = {
  weeklyreport: true,
  rankalerts: true,
  decayalerts: true,
  competitoralerts: true,
  productupdates: true,
  unsubscribeall: true,
} as const

function buildUpdatePayload(key: NotificationKey, value: boolean) {
  const payload: Partial<NotificationSettingsRecord> = {}
  payload[key] = value

  if (key === "unsubscribeall" && value) {
    for (const field of NOTIFICATION_KEYS) {
      if (field !== "unsubscribeall") {
        payload[field] = false
      }
    }
  }

  if (key !== "unsubscribeall" && value) {
    payload.unsubscribeall = false
  }

  return payload
}

// Legacy `notification_settings` sync bridge removed.
// All consumers now read from the primary `notificationsettings` table.
// The legacy table can be dropped via a future Supabase migration.

async function requireAuthUser(ctxUserId: string) {
  const supabase = await createServerClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  const authUser = authData?.user
  if (authError || !authUser) {
    throw new Error("PLG_UNAUTHORIZED")
  }

  if (ctxUserId !== authUser.id) {
    throw new Error("PLG_FORBIDDEN")
  }

  return authUser
}

export const getNotificationSettings = authenticatedAction
  .schema(z.object({}))
  .action(async ({ ctx }) => {
    const authUser = await requireAuthUser(ctx.userId)

    const profile = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { billing_tier: true },
    })

    let settings = await prisma.notificationSettings.findUnique({
      where: { userid: authUser.id },
      select: SETTINGS_SELECT,
    })

    if (!settings) {
      try {
        settings = await prisma.notificationSettings.create({
          data: { userid: authUser.id },
          select: SETTINGS_SELECT,
        })
      } catch (error) {
        const fallback = await prisma.notificationSettings.findUnique({
          where: { userid: authUser.id },
          select: SETTINGS_SELECT,
        })
        if (!fallback) {
          console.error("[getNotificationSettings] Create Error:", error)
          throw new Error("Failed to initialize notification settings")
        }
        settings = fallback
      }
    }

    return {
      success: true,
      settings,
      billingTier: profile?.billing_tier ?? "free",
    }
  })

export const updateNotificationSetting = authenticatedAction
  .schema(UpdateNotificationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const authUser = await requireAuthUser(ctx.userId)

    const { success } = await rateLimiter.limit(`settings:${authUser.id}`)
    if (!success) {
      throw new Error("Too Many Requests")
    }

    if (parsedInput.key === "competitoralerts" && parsedInput.value) {
      const profile = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { billing_tier: true },
      })

      if (!profile || profile.billing_tier === "free") {
        throw new Error("Upgrade Required")
      }
    }

    const updatePayload = buildUpdatePayload(parsedInput.key, parsedInput.value)

    const updated = await prisma.notificationSettings.upsert({
      where: { userid: authUser.id },
      update: {
        ...updatePayload,
        updatedat: new Date(),
      },
      create: {
        userid: authUser.id,
        ...DEFAULT_SETTINGS,
        ...updatePayload,
      },
      select: SETTINGS_SELECT,
    })

    // Legacy sync bridge removed — event-dispatcher now reads from primary `notificationsettings` table.

    revalidatePath("/settings")

    console.log(
      `[SETTINGS_UPDATE] User ${authUser.id} changed ${parsedInput.key} to ${parsedInput.value}`
    )

    return {
      success: true,
      settings: updated,
    }
  })
