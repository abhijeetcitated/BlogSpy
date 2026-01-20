/**
 * AI Visibility Dashboard Data - Fetch citations and trend data per config
 */

"use server"

import { authAction, z } from "@/src/lib/safe-action"
import { createServerClient } from "@/src/lib/supabase/server"
import type { AICitation, AICitationSource, AIVisibilityConfig, VisibilityTrendData } from "../types"
import type { FullScanResult } from "../services/scan.service"
import { generateTrendData } from "../utils"

const dashboardDataSchema = z.object({
  configId: z.string().uuid("Config ID is required"),
})

export interface DashboardDataResponse {
  success: boolean
  data?: {
    citations: AICitation[]
    trendData: VisibilityTrendData[]
  }
  error?: string
}

interface KeywordRow {
  id: string
  keyword: string
  last_results: FullScanResult | null
  last_checked_at: string | null
}

interface ConfigRow {
  id: string
  user_id: string
  project_id: string | null
  project_name: string | null
  tracked_domain: string
  brand_keywords: string[]
  competitor_domains: string[]
  created_at: string
  updated_at: string
}

const buildSource = (source: string): AICitationSource => {
  if (!source) return { name: "" }

  try {
    const url = new URL(source.startsWith("http") ? source : `https://${source}`)
    return {
      name: url.hostname.replace(/^www\./, ""),
      url: source.startsWith("http") ? source : `https://${source}`,
    }
  } catch {
    return { name: source }
  }
}

const buildCitation = ({
  id,
  platform,
  query,
  context,
  timestamp,
  sentiment,
  sources,
  config,
}: {
  id: string
  platform: AICitation["platform"]
  query: string
  context: string
  timestamp: string
  sentiment: AICitation["sentiment"]
  sources?: string[]
  config: AIVisibilityConfig
}): AICitation => {
  return {
    id,
    platform,
    query,
    citedUrl: `https://${config.trackedDomain}`,
    citedTitle: config.projectName || config.trackedDomain,
    sources: sources?.map(buildSource),
    citationType: "reference",
    context: context || "",
    position: 1,
    timestamp,
    sentiment,
    competitors: [],
  }
}

const extractCitations = (rows: KeywordRow[], config: AIVisibilityConfig): AICitation[] => {
  const citations: AICitation[] = []

  rows.forEach((row) => {
    if (!row.last_results) return

    const scan = row.last_results
    const timestamp = row.last_checked_at || scan.timestamp

    if (scan.google.status === "visible") {
      citations.push(
        buildCitation({
          id: `${row.id}-google`,
          platform: "google-aio",
          query: row.keyword,
          context: scan.google.snippet || "",
          timestamp,
          sentiment: "neutral",
          config,
        })
      )
    }

    if (scan.chatgpt.status === "visible") {
      citations.push(
        buildCitation({
          id: `${row.id}-chatgpt`,
          platform: "chatgpt",
          query: row.keyword,
          context: scan.chatgpt.mentionContext || scan.chatgpt.snippet,
          timestamp,
          sentiment: scan.chatgpt.sentiment,
          sources: scan.chatgpt.citations,
          config,
        })
      )
    }

    if (scan.claude.status === "visible") {
      citations.push(
        buildCitation({
          id: `${row.id}-claude`,
          platform: "claude",
          query: row.keyword,
          context: scan.claude.mentionContext || scan.claude.snippet,
          timestamp,
          sentiment: scan.claude.sentiment,
          sources: scan.claude.citations,
          config,
        })
      )
    }

    if (scan.gemini.status === "visible") {
      citations.push(
        buildCitation({
          id: `${row.id}-gemini`,
          platform: "gemini",
          query: row.keyword,
          context: scan.gemini.mentionContext || scan.gemini.snippet,
          timestamp,
          sentiment: scan.gemini.sentiment,
          sources: scan.gemini.citations,
          config,
        })
      )
    }

    if (scan.perplexity.status === "visible") {
      citations.push(
        buildCitation({
          id: `${row.id}-perplexity`,
          platform: "perplexity",
          query: row.keyword,
          context: scan.perplexity.mentionContext || scan.perplexity.snippet,
          timestamp,
          sentiment: scan.perplexity.sentiment,
          sources: scan.perplexity.citations,
          config,
        })
      )
    }

    if (scan.searchgpt.status === "visible") {
      citations.push(
        buildCitation({
          id: `${row.id}-searchgpt`,
          platform: "searchgpt",
          query: row.keyword,
          context: scan.searchgpt.snippet || "",
          timestamp,
          sentiment: "neutral",
          config,
        })
      )
    }

    if (scan.siri.status === "ready") {
      citations.push(
        buildCitation({
          id: `${row.id}-siri`,
          platform: "apple-siri",
          query: row.keyword,
          context: scan.siri.factors.join("; "),
          timestamp,
          sentiment: "neutral",
          config,
        })
      )
    }
  })

  return citations
}

export const getVisibilityDashboardData = authAction
  .schema(dashboardDataSchema)
  .action(async ({ parsedInput, ctx }): Promise<DashboardDataResponse> => {
    try {
      const supabase = await createServerClient()
      const userId = ctx.userId

      const { data: config, error: configError } = await supabase
        .from("ai_visibility_configs")
        .select("*")
        .eq("id", parsedInput.configId)
        .eq("user_id", userId)
        .single()

      if (configError || !config) {
        return {
          success: false,
          error: "Configuration not found",
        }
      }

      const { data: rows, error } = await supabase
        .from("ai_visibility_keywords")
        .select("id, keyword, last_results, last_checked_at")
        .eq("user_id", userId)
        .eq("config_id", parsedInput.configId)
        .not("last_results", "is", null)
        .order("last_checked_at", { ascending: false })

      if (error) {
        console.error("[getVisibilityDashboardData] Error:", error)
        return {
          success: false,
          error: "Failed to fetch dashboard data",
        }
      }

      const configRow = config as ConfigRow

      const mappedConfig: AIVisibilityConfig = {
        id: configRow.id,
        userId: configRow.user_id,
        projectId: configRow.project_id || "default",
        projectName: configRow.project_name || configRow.tracked_domain,
        trackedDomain: configRow.tracked_domain,
        brandKeywords: configRow.brand_keywords,
        competitorDomains: configRow.competitor_domains,
        createdAt: configRow.created_at,
        updatedAt: configRow.updated_at,
      }

      const citations = extractCitations((rows || []) as KeywordRow[], mappedConfig)

      return {
        success: true,
        data: {
          citations,
          trendData: generateTrendData(),
        },
      }
    } catch (error) {
      console.error("[getVisibilityDashboardData] Error:", error)
      return {
        success: false,
        error: "An unexpected error occurred",
      }
    }
  })
