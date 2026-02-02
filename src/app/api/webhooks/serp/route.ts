import "server-only"

import { NextResponse } from "next/server"

import type { DataForSEOResponse } from "@/lib/seo/dataforseo"
import { createAdminClient } from "@/lib/supabase/server"
import {
  mapLiveSerpData,
  mergeKeywordWithLiveData,
} from "@/features/keyword-research/utils/data-mapper"
import { normalizeSerpFeatureTypes } from "@/features/keyword-research/utils/serp-feature-normalizer"
import type { RawSerpItem } from "@/features/keyword-research/utils/serp-parser"
import type { Keyword } from "@/features/keyword-research/types"

export const runtime = "nodejs"

const FALLBACK_COUNTRY = "US"

function parseCachedKeywords(data: unknown): Keyword[] {
  return Array.isArray(data) ? (data as Keyword[]) : []
}

function normalizeKeywordKey(keyword: string): string {
  return keyword.trim().toLowerCase()
}

function normalizeCountryCode(value: string | null | undefined): string {
  const normalized = value?.trim().toUpperCase()
  return normalized && normalized.length > 0 ? normalized : FALLBACK_COUNTRY
}

function generateStableId(keyword: string, countryCode: string): number {
  const key = `${normalizeKeywordKey(keyword)}_${normalizeCountryCode(countryCode)}`
  let hash = 2166136261
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const stable = hash >>> 0
  return stable === 0 ? 1 : stable
}

function parseQueueTag(tag: unknown): { idempotencyKey?: string; refundAmount?: number } {
  if (typeof tag !== "string" || tag.trim().length === 0) return {}
  try {
    const parsed = JSON.parse(tag) as { idempotencyKey?: string; refundAmount?: number }
    return parsed ?? {}
  } catch {
    return {}
  }
}

function deriveKeywordText(
  resultKeyword: unknown,
  taskKeyword: unknown,
  fallback: string | null
): string {
  if (typeof resultKeyword === "string" && resultKeyword.trim()) return resultKeyword
  if (typeof taskKeyword === "string" && taskKeyword.trim()) return taskKeyword
  if (typeof fallback === "string" && fallback.trim()) return fallback
  return ""
}

export async function POST(request: Request) {
  const admin = createAdminClient()

  let payload: DataForSEOResponse<unknown>
  try {
    payload = (await request.json()) as DataForSEOResponse<unknown>
  } catch (error) {
    console.error("[SERP_WEBHOOK] Invalid JSON payload", error)
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const tasks = payload.tasks ?? []
  if (tasks.length === 0) {
    return NextResponse.json({ success: true })
  }

  for (const task of tasks) {
    const taskId = task?.id
    if (!taskId) continue

    const { data: taskRow, error: taskRowError } = await admin
      .from("kw_serp_tasks")
      .select("keyword_slug, user_id")
      .eq("task_id", taskId)
      .maybeSingle()

    if (taskRowError) {
      console.error("[SERP_WEBHOOK] Failed to load task row", taskRowError)
      continue
    }

    if (!taskRow) continue

    const taskData = (task as { data?: Record<string, unknown> }).data
    const taskTag = parseQueueTag(taskData?.tag)
    const idempotencyKey = taskTag.idempotencyKey
    const refundAmount = typeof taskTag.refundAmount === "number" ? taskTag.refundAmount : 0

    if (task.status_code !== 20000) {
      await admin
        .from("kw_serp_tasks")
        .update({ status: "failed" })
        .eq("task_id", taskId)

      if (refundAmount > 0 && idempotencyKey) {
        await admin.rpc("refund_credits_atomic", {
          p_user_id: taskRow.user_id,
          p_amount: refundAmount,
          p_idempotency_key: idempotencyKey,
        })
      }

      continue
    }

    const result = Array.isArray(task.result)
      ? (task.result[0] as Record<string, unknown>)
      : undefined
    const items = Array.isArray(result?.items) ? (result.items as RawSerpItem[]) : []
    const itemTypes = Array.isArray(result?.item_types) ? (result.item_types as string[]) : []

    const { data: cacheRow, error: cacheError } = await admin
      .from("kw_cache")
      .select(
        "raw_data, analysis_data, country_code, language_code, device_type, match_type, keyword"
      )
      .eq("slug", taskRow.keyword_slug)
      .maybeSingle()

    if (cacheError) {
      console.error("[SERP_WEBHOOK] Failed to load cache row", cacheError)
      continue
    }

    const labsKeywords = parseCachedKeywords(cacheRow?.raw_data)
    const analysisKeywords = parseCachedKeywords(cacheRow?.analysis_data)

    const keywordText = deriveKeywordText(
      result?.keyword,
      taskData?.keyword,
      cacheRow?.keyword ?? null
    )
    const lookupKey = normalizeKeywordKey(keywordText)

    const baseKeyword =
      labsKeywords.find((item) => normalizeKeywordKey(item.keyword) === lookupKey) ??
      analysisKeywords.find((item) => normalizeKeywordKey(item.keyword) === lookupKey) ??
      labsKeywords[0] ??
      analysisKeywords[0] ??
      {
        id: generateStableId(keywordText, cacheRow?.country_code ?? FALLBACK_COUNTRY),
        keyword: keywordText,
        countryCode: normalizeCountryCode(cacheRow?.country_code),
        intent: ["I"],
        volume: 0,
        trend: Array.from({ length: 12 }, () => 0),
        kd: 0,
        cpc: 0,
        weakSpots: { reddit: null, quora: null, pinterest: null, ranked: [] },
        serpFeatures: [],
        geoScore: null,
        hasAio: false,
      }

    const resolvedKeyword = keywordText || (baseKeyword as Keyword).keyword
    const resolvedKey = normalizeKeywordKey(resolvedKeyword)
    const liveUpdate = mapLiveSerpData({ keyword: resolvedKeyword, items }, baseKeyword)

    const normalizedFeatures = normalizeSerpFeatureTypes(itemTypes)
    const mergedFeatures = Array.from(
      new Set([...(liveUpdate.serpFeatures ?? []), ...normalizedFeatures])
    )

    const nowIso = new Date().toISOString()
    const updatedKeyword: Keyword = {
      ...mergeKeywordWithLiveData(baseKeyword as Keyword, liveUpdate),
      keyword: resolvedKeyword,
      serpFeatures: mergedFeatures,
      hasAio: mergedFeatures.includes("ai_overview") || liveUpdate.hasAio,
      lastRefreshedAt: nowIso,
      lastSerpUpdate: nowIso,
      isRefreshing: false,
    }

    const updatedAnalysis = [...analysisKeywords]
    const existingIndex = updatedAnalysis.findIndex(
      (item) => normalizeKeywordKey(item.keyword) === resolvedKey
    )

    if (existingIndex >= 0) {
      updatedAnalysis[existingIndex] = updatedKeyword
    } else {
      updatedAnalysis.push(updatedKeyword)
    }

    await admin
      .from("kw_cache")
      .update({
        analysis_data: updatedAnalysis,
        last_serp_update: nowIso,
        last_accessed_at: nowIso,
      })
      .eq("slug", taskRow.keyword_slug)

    await admin
      .from("kw_serp_tasks")
      .update({ status: "completed" })
      .eq("task_id", taskId)
  }

  return NextResponse.json({ success: true })
}
