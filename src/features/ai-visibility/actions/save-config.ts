/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 💾 SAVE CONFIG ACTION - AI Visibility Configuration
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Server action to save/update user's AI Visibility tracking configuration.
 * Stores domain, brand keywords, and competitor domains.
 * 
 * @example
 * ```tsx
 * const result = await saveVisibilityConfig({
 *   trackedDomain: "example.com",
 *   brandKeywords: ["Example", "Example Inc"],
 *   competitorDomains: ["competitor.com"]
 * })
 * ```
 */

"use server"

import { createServerClient } from "@/src/lib/supabase/server"
import type { AIVisibilityConfig } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface SaveConfigInput {
  trackedDomain: string
  brandKeywords: string[]
  competitorDomains?: string[]
  projectId?: string
}

export interface SaveConfigResponse {
  success: boolean
  data?: AIVisibilityConfig
  error?: string
}

export interface GetConfigResponse {
  success: boolean
  data?: AIVisibilityConfig | null
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SAVE CONFIG ACTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Saves or updates user's AI Visibility configuration.
 * Creates new config if none exists, updates if exists.
 */
export async function saveVisibilityConfig(
  input: SaveConfigInput
): Promise<SaveConfigResponse> {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: "You must be logged in to save configuration",
      }
    }

    // Check if config already exists for this user
    const { data: existingConfig } = await supabase
      .from("ai_visibility_configs")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", input.projectId || "default")
      .single()

    const now = new Date().toISOString()

    if (existingConfig) {
      // Update existing config
      const { data, error } = await supabase
        .from("ai_visibility_configs")
        .update({
          tracked_domain: input.trackedDomain,
          brand_keywords: input.brandKeywords,
          competitor_domains: input.competitorDomains || [],
          updated_at: now,
        })
        .eq("id", existingConfig.id)
        .select()
        .single()

      if (error) {
        console.error("[saveVisibilityConfig] Update error:", error)
        return {
          success: false,
          error: "Failed to update configuration",
        }
      }

      return {
        success: true,
        data: mapDbToConfig(data),
      }
    } else {
      // Create new config
      const { data, error } = await supabase
        .from("ai_visibility_configs")
        .insert({
          user_id: user.id,
          project_id: input.projectId || "default",
          tracked_domain: input.trackedDomain,
          brand_keywords: input.brandKeywords,
          competitor_domains: input.competitorDomains || [],
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) {
        console.error("[saveVisibilityConfig] Insert error:", error)
        return {
          success: false,
          error: "Failed to save configuration",
        }
      }

      return {
        success: true,
        data: mapDbToConfig(data),
      }
    }
  } catch (error) {
    console.error("[saveVisibilityConfig] Error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// GET CONFIG ACTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Gets user's AI Visibility configuration.
 * Returns null if no config exists (first-time user).
 */
export async function getVisibilityConfig(
  projectId?: string
): Promise<GetConfigResponse> {
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
      .from("ai_visibility_configs")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", projectId || "default")
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found (which is okay for new users)
      console.error("[getVisibilityConfig] Error:", error)
      return {
        success: false,
        error: "Failed to fetch configuration",
      }
    }

    return {
      success: true,
      data: data ? mapDbToConfig(data) : null,
    }
  } catch (error) {
    console.error("[getVisibilityConfig] Error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DELETE CONFIG ACTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Deletes user's AI Visibility configuration.
 */
export async function deleteVisibilityConfig(
  configId: string
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
      .from("ai_visibility_configs")
      .delete()
      .eq("id", configId)
      .eq("user_id", user.id) // Security: only delete own config

    if (error) {
      console.error("[deleteVisibilityConfig] Error:", error)
      return {
        success: false,
        error: "Failed to delete configuration",
      }
    }

    return { success: true }
  } catch (error) {
    console.error("[deleteVisibilityConfig] Error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface DbConfig {
  id: string
  user_id: string
  project_id: string | null
  tracked_domain: string
  brand_keywords: string[]
  competitor_domains: string[]
  created_at: string
  updated_at: string
}

function mapDbToConfig(db: DbConfig): AIVisibilityConfig {
  return {
    id: db.id,
    userId: db.user_id,
    projectId: db.project_id || "default",
    trackedDomain: db.tracked_domain,
    brandKeywords: db.brand_keywords,
    competitorDomains: db.competitor_domains,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}
