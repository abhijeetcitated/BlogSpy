"use server"
import "server-only"

// ============================================
// KEYWORD RESEARCH - SERP Task Polling Action
// ============================================

import { z } from "zod"

import { authenticatedAction } from "@/lib/safe-action"
import { createAdminClient, createClient } from "@/lib/supabase/server"

import type { Keyword } from "../types"

const CheckTaskStatusSchema = z.object({
  slugs: z.array(z.string().min(1)).min(1),
})

export type CheckTaskStatusResponse = {
  success: true
  data: Keyword[]
  pendingSlugs: string[]
  failedSlugs: string[]
}

type TaskRow = {
  keyword_slug: string
  status: string
}

type CacheRow = {
  slug: string
  keyword: string | null
  analysis_data: unknown
  last_serp_update: string | null
}

function normalizeKeywordKey(keyword: string): string {
  return keyword.trim().toLowerCase()
}

function parseCachedKeywords(data: unknown): Keyword[] {
  return Array.isArray(data) ? (data as Keyword[]) : []
}

export const checkTaskStatus = authenticatedAction
  .schema(CheckTaskStatusSchema)
  .action(async ({ parsedInput }): Promise<CheckTaskStatusResponse> => {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("PLG_LOGIN_REQUIRED")
    }

    const slugs = Array.from(
      new Set(parsedInput.slugs.map((slug) => slug.trim()).filter(Boolean))
    )

    if (slugs.length === 0) {
      return { success: true, data: [], pendingSlugs: [], failedSlugs: [] }
    }

    const { data: taskRows, error: taskError } = await supabase
      .from("kw_serp_tasks")
      .select("keyword_slug, status")
      .eq("user_id", user.id)
      .in("keyword_slug", slugs)

    if (taskError) {
      throw new Error(taskError.message)
    }

    const statusBySlug = new Map(
      (taskRows as TaskRow[] | null)?.map((row) => [row.keyword_slug, row.status]) ?? []
    )

    const pendingSlugs = new Set(
      slugs.filter((slug) => statusBySlug.get(slug) === "pending")
    )
    const failedSlugs = new Set(
      slugs.filter((slug) => statusBySlug.get(slug) === "failed")
    )

    const { data: cacheRows, error: cacheError } = await supabase
      .from("kw_cache")
      .select("slug, keyword, analysis_data, last_serp_update")
      .in("slug", slugs)

    if (cacheError) {
      throw new Error(cacheError.message)
    }

    const updatedKeywords: Keyword[] = []
    const completedSlugs: string[] = []

    ;(cacheRows as CacheRow[] | null)?.forEach((row) => {
      if (!row?.analysis_data || !row?.last_serp_update) return

      const analysisKeywords = parseCachedKeywords(row.analysis_data)
      if (analysisKeywords.length === 0) return

      const lookupKey = row.keyword ? normalizeKeywordKey(row.keyword) : null
      const match =
        (lookupKey
          ? analysisKeywords.find((keyword) => normalizeKeywordKey(keyword.keyword) === lookupKey)
          : null) ?? analysisKeywords[0]

      updatedKeywords.push({
        ...match,
        serpStatus: "completed",
        isRefreshing: false,
        lastSerpUpdate: row.last_serp_update ?? match.lastSerpUpdate ?? null,
      })

      completedSlugs.push(row.slug)
      pendingSlugs.delete(row.slug)
    })

    if (completedSlugs.length > 0) {
      const admin = createAdminClient()
      await admin
        .from("kw_serp_tasks")
        .update({ status: "completed" })
        .in("keyword_slug", completedSlugs)
    }

    return {
      success: true,
      data: updatedKeywords,
      pendingSlugs: Array.from(pendingSlugs),
      failedSlugs: Array.from(failedSlugs),
    }
  })

