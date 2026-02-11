/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 📝 SAVE KEYWORD — Supabase CRUD for tracked keywords
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Manages tracked keywords linked to a visibility config.
 * Table: ai_visibility_keywords (user_id, config_id, keyword, category, last_results, etc.)
 *
 * Note: This table may not exist yet in Supabase — create via migration if needed.
 * Uses authAction wrapper for auth + rate limiting.
 */

"use server"

import { authAction, z } from "@/lib/safe-action"
import { createAdminClient } from "@/lib/supabase/server"
import type { TrackedKeyword } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// RESPONSE TYPE (preserved for barrel exports)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export type KeywordResponse = {
  success: boolean
  data?: TrackedKeyword | TrackedKeyword[]
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const addKeywordSchema = z.object({
  configId: z.string().uuid("Invalid config ID"),
  keyword: z.string().min(2, "Keyword must be at least 2 characters").max(200),
  category: z.string().max(50).optional(),
})

const getKeywordsSchema = z.object({
  configId: z.string().uuid("Invalid config ID"),
})

const deleteKeywordSchema = z.object({
  id: z.string().uuid("Invalid keyword ID"),
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DB ROW MAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface KeywordRow {
  id: string
  user_id: string
  config_id: string
  keyword: string
  category: string | null
  last_results: Record<string, unknown> | null
  last_checked_at: string | null
  created_at: string
}

function mapRowToTrackedKeyword(row: KeywordRow): TrackedKeyword {
  return {
    id: row.id,
    userId: row.user_id,
    configId: row.config_id,
    keyword: row.keyword,
    category: row.category ?? undefined,
    lastResults: row.last_results as TrackedKeyword["lastResults"],
    lastCheckedAt: row.last_checked_at ?? undefined,
    createdAt: row.created_at,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Add a tracked keyword to a config.
 * Prevents duplicates (same keyword + config).
 */
export const addTrackedKeyword = authAction
  .schema(addKeywordSchema)
  .action(async ({ parsedInput, ctx }): Promise<KeywordResponse> => {
    const supabase = createAdminClient()
    const { configId, keyword, category } = parsedInput

    // Verify config belongs to user
    const { data: config, error: configErr } = await supabase
      .from("ai_visibility_configs")
      .select("id")
      .eq("id", configId)
      .eq("user_id", ctx.userId)
      .single()

    if (configErr || !config) {
      return { success: false, error: "Configuration not found" }
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from("ai_visibility_keywords")
      .select("id")
      .eq("config_id", configId)
      .eq("keyword", keyword.trim().toLowerCase())
      .single()

    if (existing) {
      return { success: false, error: "Keyword already tracked" }
    }

    // Insert
    const { data, error } = await supabase
      .from("ai_visibility_keywords")
      .insert({
        user_id: ctx.userId,
        config_id: configId,
        keyword: keyword.trim().toLowerCase(),
        category: category ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error("[addKeyword] Insert error:", error)
      return { success: false, error: "Failed to add keyword" }
    }

    return { success: true, data: mapRowToTrackedKeyword(data as KeywordRow) }
  })

/**
 * Get all tracked keywords for a config.
 */
export const getTrackedKeywords = authAction
  .schema(getKeywordsSchema)
  .action(async ({ parsedInput, ctx }): Promise<KeywordResponse> => {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("ai_visibility_keywords")
      .select("*")
      .eq("config_id", parsedInput.configId)
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[getKeywords] Query error:", error)
      return { success: false, error: "Failed to load keywords" }
    }

    return {
      success: true,
      data: (data as KeywordRow[]).map(mapRowToTrackedKeyword),
    }
  })

/**
 * Delete a tracked keyword.
 */
export const deleteTrackedKeyword = authAction
  .schema(deleteKeywordSchema)
  .action(async ({ parsedInput, ctx }): Promise<KeywordResponse> => {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from("ai_visibility_keywords")
      .delete()
      .eq("id", parsedInput.id)
      .eq("user_id", ctx.userId)

    if (error) {
      console.error("[deleteKeyword] Delete error:", error)
      return { success: false, error: "Failed to delete keyword" }
    }

    return { success: true }
  })
