/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 SAVE KEYWORD ACTION - Track Keywords for AI Visibility
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * REFACTORED: Now uses authAction wrapper for consistent auth/rate-limiting.
 */

"use server"

import { authAction, z } from "@/src/lib/safe-action"
import { createServerClient } from "@/src/lib/supabase/server"
import type { TrackedKeyword } from "../types"
import type { Json } from "@/types/supabase"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const addKeywordSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  category: z.string().optional(),
  configId: z.string().optional(),
})

const getKeywordsSchema = z.object({
  configId: z.string().min(1, "Config ID is required"),
})

const deleteKeywordSchema = z.object({
  keywordId: z.string().uuid("Invalid keyword ID"),
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface KeywordResponse<T = TrackedKeyword> {
  success: boolean
  data?: T
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTIONS (using authAction wrapper)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Adds a new keyword to track in AI visibility
 */
export const addTrackedKeyword = authAction
  .schema(addKeywordSchema)
  .action(async ({ parsedInput, ctx }): Promise<KeywordResponse<TrackedKeyword>> => {
    try {
      const supabase = await createServerClient()
      const userId = ctx.userId

      // Use provided configId or generate one for demo mode
      const configId = parsedInput.configId || `demo_${userId}`

      // Check if keyword already exists for this config
      const { data: existing } = await supabase
        .from("ai_visibility_keywords")
        .select("id")
        .eq("user_id", userId)
        .eq("config_id", configId)
        .eq("keyword", parsedInput.keyword.toLowerCase())
        .single()

      if (existing) {
        return {
          success: false,
          error: "This keyword is already being tracked",
        }
      }

      // Insert new keyword
      const { data, error } = await supabase
        .from("ai_visibility_keywords")
        .insert({
          user_id: userId,
          config_id: configId,
          keyword: parsedInput.keyword,
          category: parsedInput.category || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("[addTrackedKeyword] Error:", error)
        return {
          success: false,
          error: "Failed to add keyword",
        }
      }

      return {
        success: true,
        data: mapDbToKeyword(data),
      }
    } catch (error) {
      console.error("[addTrackedKeyword] Error:", error)
      return {
        success: false,
        error: "An unexpected error occurred",
      }
    }
  })

/**
 * Gets all tracked keywords for a config
 */
export const getTrackedKeywords = authAction
  .schema(getKeywordsSchema)
  .action(async ({ parsedInput, ctx }): Promise<KeywordResponse<TrackedKeyword[]>> => {
    try {
      const supabase = await createServerClient()
      const userId = ctx.userId

      const { data, error } = await supabase
        .from("ai_visibility_keywords")
        .select("*")
        .eq("user_id", userId)
        .eq("config_id", parsedInput.configId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[getTrackedKeywords] Error:", error)
        return {
          success: false,
          error: "Failed to fetch keywords",
        }
      }

      return {
        success: true,
        data: data.map(mapDbToKeyword),
      }
    } catch (error) {
      console.error("[getTrackedKeywords] Error:", error)
      return {
        success: false,
        error: "An unexpected error occurred",
      }
    }
  })

/**
 * Deletes a tracked keyword
 */
export const deleteTrackedKeyword = authAction
  .schema(deleteKeywordSchema)
  .action(async ({ parsedInput, ctx }): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = await createServerClient()
      const userId = ctx.userId

      const { error } = await supabase
        .from("ai_visibility_keywords")
        .delete()
        .eq("id", parsedInput.keywordId)
        .eq("user_id", userId)

      if (error) {
        console.error("[deleteTrackedKeyword] Error:", error)
        return {
          success: false,
          error: "Failed to delete keyword",
        }
      }

      return { success: true }
    } catch (error) {
      console.error("[deleteTrackedKeyword] Error:", error)
      return {
        success: false,
        error: "An unexpected error occurred",
      }
    }
  })

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface DbKeyword {
  id: string
  user_id: string
  config_id: string
  keyword: string
  category: string | null
  search_volume: number | null
  priority: "high" | "medium" | "low"
  status: "active" | "paused" | "archived"
  last_results: Json | null
  last_checked_at: string | null
  created_at: string
  updated_at: string
}

function mapDbToKeyword(db: DbKeyword): TrackedKeyword {
  return {
    id: db.id,
    userId: db.user_id,
    configId: db.config_id,
    keyword: db.keyword,
    category: db.category || undefined,
    lastResults: db.last_results as unknown as TrackedKeyword["lastResults"],
    lastCheckedAt: db.last_checked_at || undefined,
    createdAt: db.created_at,
  }
}
