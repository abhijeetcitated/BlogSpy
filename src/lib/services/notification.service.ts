import "server-only"

import { Client } from "@upstash/qstash"
import { Redis } from "@upstash/redis"
import type { EmailPayload } from "@/types/alerts.types"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const qstash = new Client({
  token: process.env.QSTASH_TOKEN ?? "",
})

const SIGNUP_WARMUP_KEY = "citated:email:warmup:signup_count"
const SIGNUP_WARMUP_LIMIT = 100
const SIGNUP_WARMUP_DELAY_SECONDS = 60

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

function getWebhookUrl() {
  return `${getAppUrl().replace(/\/$/, "")}/api/webhooks/qstash`
}

function resolveDelaySeconds(input?: number) {
  if (!input || input <= 0) return undefined
  return input
}

async function publishEmail(payload: EmailPayload, delaySeconds?: number) {
  if (!process.env.QSTASH_TOKEN) {
    throw new Error("QSTASH_TOKEN is missing")
  }

  return qstash.publishJSON({
    url: getWebhookUrl(),
    body: {
      type: "email",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo,
      tags: payload.tags,
    },
    delay: resolveDelaySeconds(delaySeconds),
  })
}

export const notificationService = {
  async queueEmail(payload: EmailPayload, delaySeconds?: number) {
    return publishEmail(payload, delaySeconds)
  },
  async queueSignupEmail(payload: EmailPayload) {
    const count = await redis.incr(SIGNUP_WARMUP_KEY)
    let delaySeconds = 0

    if (count <= SIGNUP_WARMUP_LIMIT) {
      delaySeconds = (count - 1) * SIGNUP_WARMUP_DELAY_SECONDS
    }

    return publishEmail(payload, delaySeconds)
  },
}
