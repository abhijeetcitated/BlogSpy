import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { creditBanker } from "@/lib/services/credit-banker.service"

const STALE_JOB_THRESHOLD_MINUTES = 10

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization") || ""
  if (!secret || authHeader !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - STALE_JOB_THRESHOLD_MINUTES * 60 * 1000)

  // Find all queued jobs older than threshold
  const staleJobs = await prisma.suggestionLiveRefreshJob.findMany({
    where: {
      status: "queued",
      created_at: { lt: cutoff },
    },
    select: {
      id: true,
      user_id: true,
      credits_charged: true,
      idempotency_key: true,
      created_at: true,
    },
  })

  if (staleJobs.length === 0) {
    return NextResponse.json({
      success: true,
      reconciled: 0,
      message: "No stale jobs found",
    })
  }

  const results: Array<{ jobId: string; refunded: boolean; error?: string }> = []

  for (const job of staleJobs) {
    try {
      // Mark job as failed
      await prisma.suggestionLiveRefreshJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          error_message: `STALE_QUEUED_JOB_RECONCILED: queued since ${job.created_at.toISOString()}, exceeded ${STALE_JOB_THRESHOLD_MINUTES}m threshold`,
          failed_at: new Date(),
        },
      })

      // Refund credits if charged
      let refunded = false
      if (job.credits_charged > 0) {
        const refundResult = await creditBanker.refund(
          job.user_id,
          job.credits_charged,
          job.idempotency_key,
          `Stale queued job ${job.id} auto-reconciled`
        )
        refunded = refundResult.success
      }

      results.push({ jobId: job.id, refunded })

      console.log("[ReconcileJobs] Stale job reconciled", {
        jobId: job.id,
        userId: job.user_id,
        creditsCharged: job.credits_charged,
        refunded,
        staleSince: job.created_at.toISOString(),
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "UNKNOWN"
      results.push({ jobId: job.id, refunded: false, error: msg })

      console.error("[ReconcileJobs] Failed to reconcile job", {
        jobId: job.id,
        error: msg,
      })
    }
  }

  return NextResponse.json({
    success: true,
    reconciled: results.length,
    results,
  })
}
