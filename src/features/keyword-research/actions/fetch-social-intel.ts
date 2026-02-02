"use server"
import "server-only"

import { z } from "zod"
import { authenticatedAction } from "@/lib/safe-action"
import { createAdminClient, createClient } from "@/lib/supabase/server"
import {
  fetchYouTubeResults,
  fetchRedditInsight,
  fetchPinterestInsight,
  fetchQuoraForensic,
  type SocialIntelPayload,
} from "../services/social.service"
import type { CommunityResult } from "../types"
import { buildCacheSlug } from "../utils/input-parser"
import { mapSocialIntel } from "../utils/social-mapper"
import { buildSocialIntelAnalysisPayload } from "../utils/data-mapper"

const FetchSocialIntelSchema = z.object({
  keywordId: z.string(),
  keyword: z.string().min(1, "Keyword is required"),
  country: z.string().default("US"),
  languageCode: z.string().optional(),
  deviceType: z.string().optional(),
  matchType: z.string().optional(),
  idempotency_key: z.string().optional(),
})

export type FetchSocialIntelResponse = {
  success: boolean
  data?: {
    youtube: SocialIntelPayload["youtube"]
    community: CommunityResult[]
    quora?: SocialIntelPayload["quora"]
    metrics?: ReturnType<typeof mapSocialIntel>
  }
  balance?: number
  isMock?: boolean
  error?: string
}

async function fetchSocialPayload(
  keyword: string,
  country: string,
  forceMock: boolean
): Promise<SocialIntelPayload> {
      const [youtube, reddit, pinterest, quora] = await Promise.all([
        fetchYouTubeResults(keyword, country, forceMock),
        fetchRedditInsight(keyword, forceMock),
        fetchPinterestInsight(keyword, forceMock),
        fetchQuoraForensic(keyword, country, forceMock),
      ])

      return { youtube, reddit, pinterest, quora }
    }

export const fetchSocialIntel = authenticatedAction
  .schema(FetchSocialIntelSchema)
  .action(async ({ parsedInput, ctx }): Promise<FetchSocialIntelResponse> => {
    const keyword = parsedInput.keyword.trim()
    const country = parsedInput.country.trim() || "US"
    const languageCode = parsedInput.languageCode?.trim().toLowerCase() || "en"
    const deviceType = parsedInput.deviceType?.trim().toLowerCase() || "desktop"
    const matchType = parsedInput.matchType?.trim() || "broad"

    const idempotencyKey =
      ctx.idempotencyKey ?? parsedInput.idempotency_key ?? crypto.randomUUID()
    const userId = ctx.userId

    const nowIso = new Date().toISOString()
    const slug = buildCacheSlug(keyword, country, languageCode, deviceType)

    try {
      const supabase = await createClient()
      const admin = createAdminClient()

      const { data: existingRow } = await admin
        .from("kw_cache")
        .select("analysis_data")
        .eq("slug", slug)
        .maybeSingle()

      const existingAnalysis =
        existingRow && typeof existingRow.analysis_data === "object" && existingRow.analysis_data
          ? (existingRow.analysis_data as Record<string, unknown>)
          : {}

      const cachedSocial = existingAnalysis.social_intel as
        | {
            youtube?: SocialIntelPayload["youtube"]
            community?: CommunityResult[]
            quora?: SocialIntelPayload["quora"]
            metrics?: ReturnType<typeof mapSocialIntel>
          }
        | undefined

      if (cachedSocial?.youtube && cachedSocial?.community) {
        return {
          success: true,
          data: {
            youtube: cachedSocial.youtube,
            community: cachedSocial.community,
            quora: cachedSocial.quora,
            metrics: cachedSocial.metrics,
          },
        }
      }

      if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
        console.warn(
          "[SOCIAL_INTEL] Missing DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD."
        )
      }

      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "deduct_credits_atomic",
        {
          p_user_id: userId,
          p_amount: 1,
          p_idempotency_key: idempotencyKey,
          p_description: `Social Intel Unlock: ${keyword}`,
        }
      )

      if (rpcError) {
        if (rpcError.message.includes("INSUFFICIENT_CREDITS")) {
          const insufficientError = new Error("INSUFFICIENT_CREDITS")
          ;(insufficientError as Error & { status?: number }).status = 402
          throw insufficientError
        }
        throw new Error(rpcError.message)
      }

      const rpcResult = Array.isArray(rpcData) ? rpcData[0] : rpcData
      const balance =
        rpcResult && typeof rpcResult.balance === "number" ? rpcResult.balance : undefined

      const envMissing = !process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD
      const usedMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"

      let payload: SocialIntelPayload
      try {
        if (envMissing && !usedMock) {
          throw new Error("DATAFORSEO_KEYS_MISSING")
        }
        payload = await fetchSocialPayload(keyword, country, usedMock)
      } catch (error) {
        console.error("DEBUG_SOCIAL_INTEL:", error)
        try {
          await supabase.rpc("refund_credits_atomic", {
            p_user_id: userId,
            p_amount: 1,
            p_idempotency_key: idempotencyKey,
          })
        } catch (refundError) {
          console.warn(
            "[SOCIAL_INTEL] Failed to refund credits after API failure",
            refundError instanceof Error ? refundError.message : "unknown error"
          )
        }
        throw new Error("API_FAILURE_REFUNDED")
      }

      const community: CommunityResult[] = [
        ...payload.reddit.threads.map(
          (thread): CommunityResult => ({
            platform: "reddit",
            title: thread.title,
            url: thread.url,
            subreddit: thread.subreddit,
            subredditMembers: thread.subredditMembers,
            score: thread.score,
            comments: thread.comments,
            author: thread.author,
          })
        ),
        ...payload.pinterest.pins,
      ]

      const metrics = mapSocialIntel(payload, keyword)

      const socialPayload = buildSocialIntelAnalysisPayload(payload, community, metrics, {
        fetchedAt: nowIso,
        isMock: usedMock,
        unlocked: true,
      })

      await admin.from("kw_cache").upsert(
        {
          slug,
          keyword,
          country_code: country,
          language_code: languageCode,
          device_type: deviceType,
          match_type: matchType,
          analysis_data: {
            ...existingAnalysis,
            social_intel: socialPayload,
          },
        },
        { onConflict: "slug" }
      )

      return {
        success: true,
        data: {
          youtube: payload.youtube,
          community,
          quora: payload.quora,
          metrics,
        },
        balance,
        isMock: usedMock,
      }
    } catch (error) {
      console.error("CRASH_DETECTED:", error)
      throw error instanceof Error ? error : new Error("API_FAILURE_REFUNDED")
    }
  })
