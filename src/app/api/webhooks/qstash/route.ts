import { NextResponse } from "next/server"
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { emailSender } from "@/lib/alerts"

type QStashEmailPayload = {
  type: "email"
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: string[]
}

const hasQstashSigningKeys =
  !!process.env.QSTASH_CURRENT_SIGNING_KEY && !!process.env.QSTASH_NEXT_SIGNING_KEY

async function handler(request: Request) {
  let payload: QStashEmailPayload | null = null

  try {
    payload = (await request.json()) as QStashEmailPayload
  } catch {
    payload = null
  }

  if (!payload || payload.type !== "email") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

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