"use server"

import "server-only"

import { Client } from "@upstash/qstash"
import { headers } from "next/headers"
import { authenticatedAction, z } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { creditBanker } from "@/lib/services/credit-banker.service"

const LIVE_REFRESH_CREDIT_COST = 3
const LIVE_REFRESH_COOLDOWN_SECONDS = 5 * 60
const LIVE_REFRESH_DAILY_CAP = 6

const qstash = new Client({
  token: process.env.QSTASH_TOKEN ?? "",
})

const RequestLiveRefreshSchema = z.object({
  projectId: z.string().uuid("Project ID must be a valid UUID"),
})

type LiveRefreshRequestResult = {
  success: boolean
  jobId: string
  status: "queued" | "processing" | "completed" | "failed"
  remainingCredits: number | null
  duplicate: boolean
}

function getAppUrl(): string {
  // APP_URL is the ONLY source for webhook destination (server-side, not exposed to client).
  // NEXT_PUBLIC_APP_URL is for client-side links and must NOT be used for QStash webhooks
  // because it may resolve to localhost in dev.
  const url = process.env.APP_URL
  if (!url) {
    console.error("[LiveRefresh] APP_URL env var is not set. QStash webhook delivery will fail.")
    return "http://localhost:3000"
  }
  return url
}

function getQueueWebhookUrl() {
  return `${getAppUrl().replace(/\/$/, "")}/api/webhooks/qstash`
}

function isLoopbackWebhook(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host.endsWith(".localhost")
    )
  } catch {
    return true
  }
}

function buildCooldownKey(userId: string, projectId: string) {
  return `citated:ai-suggestions:live-refresh:cooldown:${userId}:${projectId}`
}

function buildDailyCapKey(userId: string) {
  const day = new Date().toISOString().slice(0, 10)
  return `citated:ai-suggestions:live-refresh:daily:${userId}:${day}`
}

async function resolveIdempotencyKey(): Promise<string> {
  const key = (await headers()).get("x-idempotency-key")?.trim()
  return key && key.length > 0 ? key : crypto.randomUUID()
}

export const requestAISuggestionsLiveRefresh = authenticatedAction
  .schema(RequestLiveRefreshSchema)
  .action(async ({ parsedInput, ctx }): Promise<LiveRefreshRequestResult> => {
    const userId = ctx.userId

    const ownerProject = await prisma.userProject.findFirst({
      where: {
        id: parsedInput.projectId,
        userid: userId,
      },
      select: { id: true },
    })

    if (!ownerProject) {
      throw new Error("PLG_FORBIDDEN")
    }

    const cooldownKey = buildCooldownKey(userId, parsedInput.projectId)
    const dailyCapKey = buildDailyCapKey(userId)

    const cooldownActive = await redis.get(cooldownKey)
    if (cooldownActive) {
      throw new Error("LIVE_REFRESH_COOLDOWN_ACTIVE")
    }

    const usedTodayRaw = await redis.get<number>(dailyCapKey)
    const usedToday = typeof usedTodayRaw === "number" ? usedTodayRaw : 0
    if (usedToday >= LIVE_REFRESH_DAILY_CAP) {
      throw new Error("LIVE_REFRESH_DAILY_CAP_REACHED")
    }

    const incomingKey = await resolveIdempotencyKey()
    const idempotencyKey = `ai-live-refresh:${userId}:${parsedInput.projectId}:${incomingKey}`
    const webhookUrl = getQueueWebhookUrl()

    // QStash cannot deliver to loopback/localhost, and charging before this check causes bad UX.
    if (isLoopbackWebhook(webhookUrl)) {
      throw new Error("LIVE_REFRESH_PUBLIC_URL_INVALID")
    }

    const existingJob = await prisma.suggestionLiveRefreshJob.findUnique({
      where: { idempotency_key: idempotencyKey },
      select: {
        id: true,
        status: true,
      },
    })

    if (existingJob) {
      return {
        success: true,
        jobId: existingJob.id,
        status: existingJob.status as LiveRefreshRequestResult["status"],
        remainingCredits: null,
        duplicate: true,
      }
    }

    const creditResult = await creditBanker.deduct(
      userId,
      LIVE_REFRESH_CREDIT_COST,
      "ai_suggestions_live_refresh",
      "AI Suggestions live refresh",
      {
        projectId: parsedInput.projectId,
        mode: "paid_live_refresh",
      },
      idempotencyKey
    )

    if (!creditResult.success) {
      if (creditResult.error === "INSUFFICIENT_CREDITS") {
        throw new Error("INSUFFICIENT_CREDITS")
      }
      throw new Error("LIVE_REFRESH_CREDIT_DEDUCT_FAILED")
    }

    const job = await prisma.suggestionLiveRefreshJob.create({
      data: {
        user_id: userId,
        project_id: parsedInput.projectId,
        status: "queued",
        provider: "dataforseo",
        credits_charged: LIVE_REFRESH_CREDIT_COST,
        idempotency_key: idempotencyKey,
      },
      select: {
        id: true,
        status: true,
      },
    })

    try {
      const publishResult = await qstash.publishJSON({
        url: webhookUrl,
        body: {
          type: "ai_suggestions_live_refresh",
          jobId: job.id,
        },
        retries: 3,
      })

      console.log("[LiveRefresh] QStash publish success", {
        jobId: job.id,
        messageId: publishResult.messageId,
        webhookUrl,
        idempotencyKey,
      })
    } catch (error) {
      const rawMsg = error instanceof Error ? error.message.trim() : "UNKNOWN"
      const errorDetail = `QSTASH_PUBLISH_FAILED: url=${webhookUrl} err=${rawMsg}`.slice(0, 240)

      console.error("[LiveRefresh] QStash publish failed", {
        jobId: job.id,
        webhookUrl,
        error: rawMsg,
        idempotencyKey,
      })

      await prisma.suggestionLiveRefreshJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          error_message: errorDetail,
          failed_at: new Date(),
        },
      })

      // Refund using the SAME idempotency key used for the debit transaction
      await creditBanker.refund(
        userId,
        LIVE_REFRESH_CREDIT_COST,
        idempotencyKey,
        "AI Suggestions live refresh queue failure"
      )

      if (rawMsg.toLowerCase().includes("loopback")) {
        throw new Error("LIVE_REFRESH_PUBLIC_URL_INVALID")
      }
      throw new Error("LIVE_REFRESH_QUEUE_FAILED")
    }

    await redis.set(cooldownKey, "1", { ex: LIVE_REFRESH_COOLDOWN_SECONDS })
    const currentDaily = await redis.incr(dailyCapKey)
    if (currentDaily === 1) {
      await redis.expire(dailyCapKey, 60 * 60 * 24)
    }

    return {
      success: true,
      jobId: job.id,
      status: "queued",
      remainingCredits: creditResult.remaining,
      duplicate: false,
    }
  })
