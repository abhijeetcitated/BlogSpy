/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 💾 SAVE CONFIG ACTION - AI Visibility Configuration
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * REFACTORED: Now uses authAction wrapper for consistent auth/rate-limiting.
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

import { authAction, z } from "@/src/lib/safe-action"
import { createServerClient } from "@/src/lib/supabase/server"
import type { AIVisibilityConfig } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const saveConfigSchema = z.object({
  trackedDomain: z.string().min(1, "Tracked domain is required"),
  projectName: z.string().min(1, "Project name is required").optional(),
  brandKeywords: z.array(z.string()).min(1, "At least one brand keyword is required"),
  competitorDomains: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  configId: z.string().uuid("Invalid config ID").optional(),
})

const getConfigSchema = z.object({
  configId: z.string().uuid("Invalid config ID").optional(),
  projectId: z.string().optional(),
})

const listConfigSchema = z.object({})

const deleteConfigSchema = z.object({
  configId: z.string().uuid("Invalid config ID"),
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

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

export interface ListConfigResponse {
  success: boolean
  data?: AIVisibilityConfig[]
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTIONS (using authAction wrapper)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Saves or updates user's AI Visibility configuration.
 * Creates new config if none exists, updates if exists.
 */
export const saveVisibilityConfig = authAction
  .schema(saveConfigSchema)
  .action(async ({ parsedInput, ctx }): Promise<SaveConfigResponse> => {
    try {
      const supabase = await createServerClient()
      const userId = ctx.userId

      const now = new Date().toISOString()
      const projectName = parsedInput.projectName?.trim() || parsedInput.trackedDomain

      if (parsedInput.configId) {
        // Update existing config by ID
        const { data, error } = await supabase
          .from("ai_visibility_configs")
          .update({
            project_id: parsedInput.projectId || "default",
            project_name: projectName,
            tracked_domain: parsedInput.trackedDomain,
            brand_keywords: parsedInput.brandKeywords,
            competitor_domains: parsedInput.competitorDomains || [],
            updated_at: now,
          })
          .eq("id", parsedInput.configId)
          .eq("user_id", userId)
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
      }

      // Create new config
      const { data, error } = await supabase
        .from("ai_visibility_configs")
        .insert({
          user_id: userId,
          project_id: parsedInput.projectId || "default",
          project_name: projectName,
          tracked_domain: parsedInput.trackedDomain,
          brand_keywords: parsedInput.brandKeywords,
          competitor_domains: parsedInput.competitorDomains || [],
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
    } catch (error) {
      console.error("[saveVisibilityConfig] Error:", error)
      return {
        success: false,
        error: "An unexpected error occurred",
      }
    }
  })

/**
 * Gets user's AI Visibility configuration.
 * Returns null if no config exists (first-time user).
 */
export const getVisibilityConfig = authAction
  .schema(getConfigSchema)
  .action(async ({ parsedInput, ctx }): Promise<GetConfigResponse> => {
    try {
      const supabase = await createServerClient()
      const userId = ctx.userId

      let query = supabase
        .from("ai_visibility_configs")
        .select("*")
        .eq("user_id", userId)

      if (parsedInput.configId) {
        query = query.eq("id", parsedInput.configId)
      } else if (parsedInput.projectId) {
        query = query.eq("project_id", parsedInput.projectId)
      } else {
        query = query.order("updated_at", { ascending: false }).limit(1)
      }

      const { data, error } = await query.maybeSingle()

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
  })

/**
 * Lists all AI Visibility configs for the current user.
 */
export const listVisibilityConfigs = authAction
  .schema(listConfigSchema)
  .action(async ({ ctx }): Promise<ListConfigResponse> => {
    try {
      const supabase = await createServerClient()
      const userId = ctx.userId

      const { data, error } = await supabase
        .from("ai_visibility_configs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("[listVisibilityConfigs] Error:", error)
        return {
          success: false,
          error: "Failed to fetch configurations",
        }
      }

      return {
        success: true,
        data: (data || []).map(mapDbToConfig),
      }
    } catch (error) {
      console.error("[listVisibilityConfigs] Error:", error)
      return {
        success: false,
        error: "An unexpected error occurred",
      }
    }
  })

/**
 * Deletes user's AI Visibility configuration.
 */
export const deleteVisibilityConfig = authAction
  .schema(deleteConfigSchema)
  .action(async ({ parsedInput, ctx }): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = await createServerClient()
      const userId = ctx.userId

      const { error } = await supabase
        .from("ai_visibility_configs")
        .delete()
        .eq("id", parsedInput.configId)
        .eq("user_id", userId) // Security: only delete own config

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
  })

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface DbConfig {
  id: string
  user_id: string
  project_id: string | null
  project_name?: string | null
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
    projectName: db.project_name || db.tracked_domain,
    trackedDomain: db.tracked_domain,
    brandKeywords: db.brand_keywords,
    competitorDomains: db.competitor_domains,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}
