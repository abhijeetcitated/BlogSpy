/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 💾 SAVE CONFIG — Supabase CRUD for ai_visibility_configs
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Real Supabase CRUD against ai_visibility_configs table (RLS-protected).
 * Table columns: id, user_id, project_name, tracked_domain, brand_keywords,
 *                competitor_domains, created_at, updated_at
 *
 * Uses authAction wrapper for auth + rate limiting.
 */

"use server"

import { authAction, z } from "@/lib/safe-action"
import { createAdminClient } from "@/lib/supabase/server"
import type { AIVisibilityConfig } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// RESPONSE TYPES (preserved for barrel exports)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export type SaveConfigResponse = {
  success: boolean
  data?: AIVisibilityConfig
  error?: string
}

export type GetConfigResponse = {
  success: boolean
  data?: AIVisibilityConfig
  error?: string
}

export type ListConfigResponse = {
  success: boolean
  data?: AIVisibilityConfig[]
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const saveConfigSchema = z.object({
  id: z.string().uuid().optional(),
  configId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  projectName: z.string().min(1, "Project name is required").max(100),
  trackedDomain: z.string().min(3, "Domain is required").max(253),
  brandKeywords: z.array(z.string().min(1).max(100)).min(1, "At least one brand keyword required").max(20),
  competitorDomains: z.array(z.string().max(253)).max(10).optional(),
})

const getConfigSchema = z.object({
  id: z.string().uuid("Invalid config ID"),
})

const deleteConfigSchema = z.object({
  id: z.string().uuid("Invalid config ID"),
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DB ROW → AIVisibilityConfig MAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface ConfigRow {
  id: string
  user_id: string
  project_id: string | null
  project_name: string
  tracked_domain: string
  brand_keywords: string[]
  competitor_domains: string[] | null
  created_at: string
  updated_at: string
}

function mapRowToConfig(row: ConfigRow): AIVisibilityConfig {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id ?? undefined,
    projectName: row.project_name,
    trackedDomain: row.tracked_domain,
    brandKeywords: row.brand_keywords,
    competitorDomains: row.competitor_domains ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Create or update a visibility config.
 * If `id` is provided, updates existing. Otherwise, creates new.
 */
export const saveVisibilityConfig = authAction
  .schema(saveConfigSchema)
  .action(async ({ parsedInput, ctx }): Promise<SaveConfigResponse> => {
    const supabase = createAdminClient()
    const { id, configId, projectId, projectName, trackedDomain, brandKeywords, competitorDomains } = parsedInput

    const cleanDomain = trackedDomain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "")

    const existingId = id || configId

    if (existingId) {
      // UPDATE existing
      const { data, error } = await supabase
        .from("ai_visibility_configs")
        .update({
          project_id: projectId ?? null,
          project_name: projectName,
          tracked_domain: cleanDomain,
          brand_keywords: brandKeywords,
          competitor_domains: competitorDomains ?? [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingId)
        .eq("user_id", ctx.userId)
        .select()
        .single()

      if (error) {
        console.error("[saveConfig] Update error:", error)
        return { success: false, error: "Failed to update configuration" }
      }

      return { success: true, data: mapRowToConfig(data as ConfigRow) }
    }

    // CREATE new
    const insertPayload = {
      user_id: ctx.userId,
      project_id: projectId ?? null,
      project_name: projectName,
      tracked_domain: cleanDomain,
      brand_keywords: brandKeywords,
      competitor_domains: competitorDomains ?? [],
    }

    console.log("[saveConfig] INSERT payload:", JSON.stringify(insertPayload))

    const { data, error } = await supabase
      .from("ai_visibility_configs")
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      console.error("[saveConfig] Insert error:", JSON.stringify(error))
      return { success: false, error: `Failed to create configuration: ${error.message}` }
    }

    return { success: true, data: mapRowToConfig(data as ConfigRow) }
  })

/**
 * Get a single config by ID (RLS ensures user can only see their own).
 */
export const getVisibilityConfig = authAction
  .schema(getConfigSchema)
  .action(async ({ parsedInput, ctx }): Promise<GetConfigResponse> => {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("ai_visibility_configs")
      .select("*")
      .eq("id", parsedInput.id)
      .eq("user_id", ctx.userId)
      .single()

    if (error || !data) {
      return { success: false, error: "Configuration not found" }
    }

    return { success: true, data: mapRowToConfig(data as ConfigRow) }
  })

/**
 * List all configs for the authenticated user.
 */
export const listVisibilityConfigs = authAction
  .schema(z.object({}))
  .action(async ({ ctx }): Promise<ListConfigResponse> => {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("ai_visibility_configs")
      .select("*")
      .eq("user_id", ctx.userId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("[listConfigs] Query error:", error)
      return { success: false, error: "Failed to load configurations" }
    }

    return {
      success: true,
      data: (data as ConfigRow[]).map(mapRowToConfig),
    }
  })

/**
 * Delete a config by ID.
 */
export const deleteVisibilityConfig = authAction
  .schema(deleteConfigSchema)
  .action(async ({ parsedInput, ctx }): Promise<SaveConfigResponse> => {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from("ai_visibility_configs")
      .delete()
      .eq("id", parsedInput.id)
      .eq("user_id", ctx.userId)

    if (error) {
      console.error("[deleteConfig] Delete error:", error)
      return { success: false, error: "Failed to delete configuration" }
    }

    return { success: true }
  })
