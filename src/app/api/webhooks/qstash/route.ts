import { NextResponse } from "next/server"
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { emailSender } from "@/lib/alerts"
import { processAISuggestionsLiveRefresh } from "@/features/dashboard/services/live-refresh-worker"

type QStashEmailPayload = {
  type: "email"
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: string[]
}

type QStashLiveRefreshPayload = {
  type: "ai_suggestions_live_refresh"
  jobId: string
}

type QStashPayload = QStashEmailPayload | QStashLiveRefreshPayload

const hasQstashSigningKeys =
  !!process.env.QSTASH_CURRENT_SIGNING_KEY && !!process.env.QSTASH_NEXT_SIGNING_KEY

async function handler(request: Request) {
  let payload: QStashPayload | null = null

  try {
    payload = (await request.json()) as QStashPayload
  } catch {
    payload = null
  }

  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (payload.type === "email") {
    if (!payload.to || !payload.subject || !payload.html) {
      return NextResponse.json({ error: "Missing email fields" }, { status: 400 })
    }

    const result = await emailSender.send({
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo,
      tags: payload.tags,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result.id })
  }

  if (payload.type === "ai_suggestions_live_refresh") {
    if (!payload.jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 })
    }

    const result = await processAISuggestionsLiveRefresh(payload.jobId)
    if (!result.success) {
      // Terminal errors: don't retry (job not found, already completed/failed)
      const terminalErrors = ["JOB_NOT_FOUND", "JOB_ALREADY_TERMINAL"]
      const isTerminal = terminalErrors.includes(result.error ?? "")

      return NextResponse.json(
        { success: false, error: result.error ?? "LIVE_REFRESH_FAILED" },
        { status: isTerminal ? 200 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      refreshedKeywords: result.refreshedKeywords,
    })
  }

  return NextResponse.json({ error: "Unsupported payload type" }, { status: 400 })
}

export const POST = async (request: Request) => {
  if (!hasQstashSigningKeys) {
    return NextResponse.json(
      { error: "QStash signing keys are not configured" },
      { status: 503 }
    )
  }

  const verifiedHandler = verifySignatureAppRouter(handler)
  return verifiedHandler(request)
}
