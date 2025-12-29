/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 SAVE KEYWORD ACTION - Track Keywords for AI Visibility
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Server actions to manage tracked keywords for AI visibility monitoring.
 */

"use server"

import { createServerClient } from "@/src/lib/supabase/server"
import type { TrackedKeyword } from "../types"
import type { Json } from "@/types/supabase"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface AddKeywordInput {
  keyword: string
  category?: string
  configId: string
}

export interface KeywordResponse<T = TrackedKeyword> {
  success: boolean
  data?: T
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ADD KEYWORD ACTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Adds a new keyword to track in AI visibility
 */
export async function addTrackedKeyword(
  input: AddKeywordInput
): Promise<KeywordResponse<TrackedKeyword>> {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in",
      }
    }

    // Check if keyword already exists for this config
    const { data: existing } = await supabase
      .from("ai_visibility_keywords")
      .select("id")
      .eq("user_id", user.id)
      .eq("config_id", input.configId)
      .eq("keyword", input.keyword.toLowerCase())
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
        user_id: user.id,
        config_id: input.configId,
        keyword: input.keyword,
        category: input.category || null,
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
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// GET KEYWORDS ACTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Gets all tracked keywords for a config
 */
export async function getTrackedKeywords(
  configId: string
): Promise<KeywordResponse<TrackedKeyword[]>> {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in",
      }
    }

    const { data, error } = await supabase
      .from("ai_visibility_keywords")
      .select("*")
      .eq("user_id", user.id)
      .eq("config_id", configId)
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
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DELETE KEYWORD ACTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Deletes a tracked keyword
 */
export async function deleteTrackedKeyword(
  keywordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in",
      }
    }

    const { error } = await supabase
      .from("ai_visibility_keywords")
      .delete()
      .eq("id", keywordId)
      .eq("user_id", user.id)

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
}

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
