/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 DATAFORSEO VISIBILITY SERVICE v2 — 6-Platform Parallel Scan Engine
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Core engine for AI Visibility feature. Scans 6 platforms in parallel:
 *
 * SERP APIs (Google):
 * 1. SERP Google Organic → AI Overview detection (ai_overview item type)
 *    Endpoint: /serp/google/organic/live/advanced | Cost: $0.004/page
 *
 * 2. SERP Google AI Mode → Full AI Mode conversational response + citations
 *    Endpoint: /serp/google/ai_mode/live/advanced | Cost: $0.004/page
 *
 * LLM Responses APIs (per-platform Live queries):
 * 3. ChatGPT   → /ai_optimization/chat_gpt/llm_responses/live   | $0.0006 + token cost
 * 4. Claude    → /ai_optimization/claude/llm_responses/live      | $0.0006 + token cost
 * 5. Gemini    → /ai_optimization/gemini/llm_responses/live      | $0.0006 + token cost
 * 6. Perplexity → /ai_optimization/perplexity/llm_responses/live | $0.0006 + token cost
 *
 * Total scan cost: ~$0.015 per keyword (6 parallel API calls)
 *
 * Architecture:
 * - All 6 calls run via Promise.allSettled — individual failures are isolated
 * - Failed platforms show friendly "temporarily busy" messages (never error/failed/broken)
 * - Score is calculated based on RESPONDED platforms only (fair scoring)
 * - Brand detection runs on each response to check if user's domain/brand is mentioned
 *
 * @see https://docs.dataforseo.com/v3/ai_optimization/
 * @see https://docs.dataforseo.com/v3/serp/google/ai_mode/
 */

import { getDataForSEOClient } from "@/lib/seo/dataforseo"
import { DATAFORSEO } from "@/constants/api-endpoints"
import type {
  AIPlatform,
  AICitation,
  FullScanResult,
  GoogleDataResult,
  AIResponseResult,
} from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTED TYPES (Public API — do NOT change signatures without updating consumers)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/** Input for a full visibility scan */
export interface VisibilityScanInput {
  keyword: string
  brandDomain: string
  brandKeywords: string[]
  competitorDomains?: string[]
  locationCode?: number // default 2840 (US)
  languageCode?: string // default "en"
  /** ISO alpha-2 country code for LLM web_search_country_iso_code (e.g., "IN", "US"). null = don't send. */
  countryIsoCode?: string | null
}

/** Visibility scan result with citations and platform status messages */
export interface VisibilityScanResult {
  scan: FullScanResult
  citations: AICitation[]
  /** Per-platform friendly status messages (only for platforms that had issues) */
  platformMessages: Record<string, string>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// INTERNAL TYPES — DataForSEO LLM Responses API
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/** DataForSEO LLM Response annotation (from sections[].annotations[] in API response) */
interface LLMResponseAnnotation {
  title?: string
  url?: string
}

/** DataForSEO LLM Response section (from items[].sections[] in API response) */
interface LLMResponseSection {
  type?: string        // "text"
  text?: string        // AI-generated text content
  annotations?: LLMResponseAnnotation[] | null // References (only when web_search is true)
}

/** DataForSEO LLM Response item (from items[] array in API response) */
interface LLMResponseItem {
  type?: string        // "message"
  sections?: LLMResponseSection[]
}

/** Parsed LLM Response result from DataForSEO API */
interface LLMResponseResult {
  platform: string
  model_name: string
  items: LLMResponseItem[]
  input_tokens?: number
  output_tokens?: number
  web_search?: boolean
}

/** DataForSEO SERP item */
interface SERPItem {
  type: string
  rank_group?: number
  rank_absolute?: number
  title?: string
  description?: string
  text?: string
  url?: string
  domain?: string
  sub_type?: string
  items?: Array<{
    type?: string
    title?: string
    url?: string
    description?: string
    domain?: string
    text?: string
  }>
}

/** DataForSEO SERP task result */
interface SERPResult {
  keyword: string
  items_count: number
  items?: SERPItem[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// PLATFORM CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface LLMPlatformConfig {
  platform: AIPlatform
  endpoint: string
  defaultModel: string
  /**
   * Claude: temperature and top_p are mutually exclusive.
   * When true, we skip sending temperature to avoid API errors.
   */
  skipTemperature?: boolean
  /**
   * GPT-5.x models reject max_output_tokens (DataForSEO returns 40501).
   * When true, we skip sending max_output_tokens in the request.
   */
  skipMaxOutputTokens?: boolean
  /** Optional fallback model if the primary model is unavailable (e.g., preview models) */
  fallbackModel?: string
  /** DataForSEO hard limit: 500 chars max per prompt */
  maxPromptLength: number
}

const LLM_PLATFORM_CONFIGS: Record<string, LLMPlatformConfig> = {
  chatgpt: {
    platform: "chatgpt",
    endpoint: DATAFORSEO.AI_OPTIMIZATION.CHATGPT,
    // GPT-5.2: current default on chatgpt.com (Feb 2026). Free users get "GPT-5.2 Instant".
    // gpt-4o is now classified as "legacy" (only Plus+). Verified working on DataForSEO.
    // IMPORTANT: GPT-5.x models REJECT max_output_tokens — must skip it.
    defaultModel: "gpt-5.2",
    skipMaxOutputTokens: true, // GPT-5.x does not accept max_output_tokens
    maxPromptLength: 500,
  },
  claude: {
    platform: "claude",
    endpoint: DATAFORSEO.AI_OPTIMIZATION.CLAUDE,
    // claude-sonnet-4-5: current default model on claude.ai (what real free users see)
    // Opus 4.6 released Feb 5, 2026 — but free users still get Sonnet 4.5
    defaultModel: "claude-sonnet-4-5",
    skipTemperature: true, // Claude: temp and top_p are mutually exclusive
    maxPromptLength: 500,
  },
  gemini: {
    platform: "gemini",
    endpoint: DATAFORSEO.AI_OPTIMIZATION.GEMINI,
    // Gemini 3 Flash is the new default (Dec 17, 2025, replaced 2.5 Flash).
    // DataForSEO has no gemini-3-flash yet — gemini-3-pro-preview is closest (same gen).
    // Fallback to gemini-2.5-flash if preview model becomes unavailable.
    defaultModel: "gemini-3-pro-preview",
    fallbackModel: "gemini-2.5-flash",
    maxPromptLength: 500,
  },
  perplexity: {
    platform: "perplexity",
    endpoint: DATAFORSEO.AI_OPTIMIZATION.PERPLEXITY,
    // sonar: Perplexity's default search engine for free users (built on Llama 3.3 70B)
    defaultModel: "sonar",
    maxPromptLength: 500,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// PSYCHOLOGY MESSAGES — Friendly platform status (NEVER say "error", "failed", or "broken")
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const PLATFORM_STATUS_MESSAGES: Record<string, { unavailable: string; timeout: string }> = {
  chatgpt: {
    unavailable: "ChatGPT is experiencing high demand right now. Your results from other platforms are ready!",
    timeout: "ChatGPT took longer than expected. We'll include it in your next scan.",
  },
  claude: {
    unavailable: "Claude is taking a quick break. We've scanned all other platforms successfully!",
    timeout: "Claude needed extra time. Other platform results are ready!",
  },
  gemini: {
    unavailable: "Gemini is briefly offline. All other platforms delivered your results!",
    timeout: "Gemini was slow to respond. Your other platform data is live!",
  },
  perplexity: {
    unavailable: "Perplexity is momentarily busy. Your scan from 5 other platforms is ready!",
    timeout: "Perplexity needed more time. Results from other platforms are ready!",
  },
  "google-aio": {
    unavailable: "Google AI Overview is refreshing. Your AI platform results are ready!",
    timeout: "Google AI Overview was slow to respond. Other results are live!",
  },
  "google-ai-mode": {
    unavailable: "Google AI Mode is updating. All other platforms scanned successfully!",
    timeout: "Google AI Mode took longer than usual. Your other platform results are ready!",
  },
}

function getPlatformMessage(platform: string, type: "unavailable" | "timeout"): string {
  return (
    PLATFORM_STATUS_MESSAGES[platform]?.[type] ||
    "This platform is temporarily unavailable. Your other platforms scanned successfully!"
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MOCK MODE
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

async function mockDelay(ms: number = 1500): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CORE: LLM Responses API (Generic for all 4 platforms)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch AI response from a specific LLM platform via DataForSEO LLM Responses API.
 *
 * Each platform has its own endpoint and configuration:
 * - ChatGPT: GPT-4o-mini with temperature 0.7
 * - Claude: Claude 3.5 Sonnet, NO temperature (temp and top_p are mutually exclusive)
 * - Gemini: Gemini 2.0 Flash with temperature 0.7
 * - Perplexity: Sonar model, web_search always ON (automatic for Sonar)
 *
 * @see https://docs.dataforseo.com/v3/ai_optimization/chat_gpt/llm_responses/live/
 */
async function fetchLLMResponse(
  platformKey: string,
  keyword: string,
  _locationCode: number = 2840,
  _languageCode: string = "en",
  countryIsoCode: string | null = null
): Promise<LLMResponseResult | null> {
  const config = LLM_PLATFORM_CONFIGS[platformKey]
  if (!config) return null

  if (isMockMode()) {
    await mockDelay(800)
    return generateMockLLMResponse(keyword, platformKey)
  }

  try {
    const client = getDataForSEOClient()

    // Build platform-specific request body
    // DataForSEO LLM Responses API field names:
    //   user_prompt (not prompt), model_name (not model), max_output_tokens (not max_tokens)
    const requestBody: Record<string, unknown> = {
      user_prompt: keyword.slice(0, config.maxPromptLength),
    }

    // GPT-5.x models REJECT max_output_tokens (DataForSEO returns 40501: "Invalid Field")
    // Only include it for models that support it
    if (!config.skipMaxOutputTokens) {
      requestBody.max_output_tokens = 1000
    }

    // Set model name (required field)
    if (config.defaultModel) {
      requestBody.model_name = config.defaultModel
    }

    // Claude: temperature and top_p are mutually exclusive — we skip temperature
    if (!config.skipTemperature) {
      requestBody.temperature = 0.7
    }

    // ── Enable web_search for richer annotations (citation URLs) ──
    // When true, LLMs search the web and return annotations with source URLs
    // This is crucial for competitor detection (we extract non-brand domains from citations)
    // Perplexity Sonar has this automatically; for ChatGPT/Claude/Gemini we enable explicitly
    requestBody.web_search = true

    // ── Country-specific web search grounding ──
    // web_search_country_iso_code: affects which web sources LLMs cite
    // Supported: ChatGPT (when web_search=true), Claude, Perplexity (Sonar)
    // NOT supported: Gemini (no country param in API)
    if (countryIsoCode && platformKey !== "gemini") {
      requestBody.web_search_country_iso_code = countryIsoCode
    }

    const { data } = await client.post(config.endpoint, [requestBody])

    // Check task-level status code
    const taskStatusCode = data?.tasks?.[0]?.status_code || data?.status_code

    if (taskStatusCode === 20000 && data?.tasks?.[0]?.result?.[0]) {
      const result = data.tasks[0].result[0]
      return {
        platform: platformKey,
        model_name: result.model_name || config.defaultModel,
        items: result.items || [],
        input_tokens: result.input_tokens,
        output_tokens: result.output_tokens,
        web_search: result.web_search,
      }
    }

    // If primary model failed and a fallback model is configured, retry with fallback
    if (config.fallbackModel && taskStatusCode !== 40200 && taskStatusCode !== 40210) {
      console.warn(
        `[LLM:${platformKey}] Primary model "${config.defaultModel}" returned ${taskStatusCode}. ` +
        `Retrying with fallback model "${config.fallbackModel}"...`
      )
      const fallbackBody = { ...requestBody, model_name: config.fallbackModel }
      try {
        const fallbackRes = await client.post(config.endpoint, [fallbackBody])
        const fbStatus = fallbackRes.data?.tasks?.[0]?.status_code
        if (fbStatus === 20000 && fallbackRes.data?.tasks?.[0]?.result?.[0]) {
          const fbResult = fallbackRes.data.tasks[0].result[0]
          console.info(`[LLM:${platformKey}] Fallback model "${config.fallbackModel}" succeeded.`)
          return {
            platform: platformKey,
            model_name: fbResult.model_name || config.fallbackModel,
            items: fbResult.items || [],
            input_tokens: fbResult.input_tokens,
            output_tokens: fbResult.output_tokens,
            web_search: fbResult.web_search,
          }
        }
      } catch (fallbackError) {
        console.warn(
          `[LLM:${platformKey}] Fallback model also failed:`,
          fallbackError instanceof Error ? fallbackError.message : fallbackError
        )
      }
    }

    // Handle DataForSEO-specific error codes
    if (taskStatusCode === 40200 || taskStatusCode === 40210) {
      // CRITICAL: Billing error — affects ALL platforms. Stop everything.
      console.error(
        `[LLM:${platformKey}] ⚠️ BILLING ERROR ${taskStatusCode}: ${data?.tasks?.[0]?.status_message}. All scans should be paused!`
      )
    } else if (taskStatusCode === 40202 || taskStatusCode === 40209) {
      // Rate limit or concurrent limit — temporary, next scan should work
      console.warn(
        `[LLM:${platformKey}] Rate limited (${taskStatusCode}): ${data?.tasks?.[0]?.status_message}`
      )
    } else {
      console.warn(
        `[LLM:${platformKey}] Status ${taskStatusCode}: ${data?.tasks?.[0]?.status_message}`
      )
    }

    return null
  } catch (error) {
    // Network/timeout errors
    const isTimeout =
      error instanceof Error &&
      (error.message.includes("timeout") || error.message.includes("ETIMEDOUT"))

    if (isTimeout) {
      console.warn(`[LLM:${platformKey}] Request timed out`)
    } else {
      console.error(
        `[LLM:${platformKey}] API error:`,
        error instanceof Error ? error.message : error
      )
    }

    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CORE: SERP Google AI Mode API
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Check Google AI Mode for keyword.
 * Returns the full conversational AI response + cited sources.
 *
 * @see https://docs.dataforseo.com/v3/serp/google/ai_mode/live/
 */
async function fetchGoogleAIMode(
  keyword: string,
  locationCode: number = 2840,
  languageCode: string = "en"
): Promise<SERPResult | null> {
  if (isMockMode()) {
    await mockDelay(600)
    return generateMockGoogleAIMode(keyword)
  }

  try {
    const client = getDataForSEOClient()
    const { data } = await client.post(DATAFORSEO.SERP.GOOGLE_AI_MODE, [
      {
        keyword,
        location_code: locationCode,
        language_code: languageCode,
      },
    ])

    const taskStatusCode = data?.tasks?.[0]?.status_code || data?.status_code
    if (taskStatusCode === 20000 && data?.tasks?.[0]?.result?.[0]) {
      return data.tasks[0].result[0] as SERPResult
    }

    console.warn(
      `[GoogleAIMode] Status ${taskStatusCode}: ${data?.tasks?.[0]?.status_message}`
    )
    return null
  } catch (error) {
    console.error(
      "[GoogleAIMode] API error:",
      error instanceof Error ? error.message : error
    )
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CORE: SERP Google Organic API (AI Overview detection)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Get Google organic rankings + detect AI Overview for a keyword.
 * AI Overview appears as item with type "ai_overview" in the SERP response.
 */
async function fetchGoogleOrganic(
  keyword: string,
  locationCode: number = 2840,
  languageCode: string = "en"
): Promise<SERPResult | null> {
  if (isMockMode()) {
    await mockDelay(500)
    return generateMockGoogleOrganic(keyword)
  }

  try {
    const client = getDataForSEOClient()
    const { data } = await client.post(DATAFORSEO.SERP.GOOGLE_ORGANIC, [
      {
        keyword,
        location_code: locationCode,
        language_code: languageCode,
        depth: 10,
      },
    ])

    const taskStatusCode = data?.tasks?.[0]?.status_code || data?.status_code
    if (taskStatusCode === 20000 && data?.tasks?.[0]?.result?.[0]) {
      return data.tasks[0].result[0] as SERPResult
    }

    console.warn(
      `[GoogleOrganic] Status ${taskStatusCode}: ${data?.tasks?.[0]?.status_message}`
    )
    return null
  } catch (error) {
    console.error(
      "[GoogleOrganic] API error:",
      error instanceof Error ? error.message : error
    )
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// BRAND DETECTION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Check if text contains brand mentions (domain or keywords).
 */
function detectBrandMention(
  text: string,
  brandDomain: string,
  brandKeywords: string[]
): boolean {
  if (!text) return false
  const lowerText = text.toLowerCase()

  // Check full domain
  if (lowerText.includes(brandDomain.toLowerCase())) return true

  // Check domain without TLD (e.g., "techyatri" from "techyatri.com")
  const domainWithoutTld = brandDomain.replace(/^www\./, "").split(".")[0].toLowerCase()
  if (domainWithoutTld.length >= 3 && lowerText.includes(domainWithoutTld)) return true

  // Check brand keywords
  for (const kw of brandKeywords) {
    if (kw.length >= 2 && lowerText.includes(kw.toLowerCase())) return true
  }

  return false
}

/**
 * Detect simple sentiment from text.
 */
function detectSentiment(text: string): "positive" | "neutral" | "negative" {
  if (!text) return "neutral"
  const lower = text.toLowerCase()

  const positiveWords = [
    "best", "top", "leading", "excellent", "powerful", "popular",
    "recommended", "great", "outstanding", "premier", "superior",
  ]
  const negativeWords = [
    "worst", "poor", "bad", "avoid", "limited", "weak",
    "outdated", "expensive", "lacking", "problematic",
  ]

  const posCount = positiveWords.filter((w) => lower.includes(w)).length
  const negCount = negativeWords.filter((w) => lower.includes(w)).length

  if (posCount > negCount) return "positive"
  if (negCount > posCount) return "negative"
  return "neutral"
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TRANSFORM: LLM Response → AIResponseResult
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Transform a single LLM platform response into AIResponseResult.
 * Handles brand detection, citation extraction, and sentiment analysis.
 *
 * When platform didn't respond (null), returns { status: "hidden" } without error.
 * The error message is set separately in runVisibilityScan for psychology messaging.
 */
function transformLLMResponse(
  result: LLMResponseResult | null,
  platform: AIPlatform,
  brandDomain: string,
  brandKeywords: string[]
): AIResponseResult {
  // Default: hidden (platform didn't return data or returned empty)
  if (!result || !result.items?.length) {
    return {
      platform,
      status: "hidden",
      snippet: "",
      mentionContext: null,
      sentiment: "neutral",
    }
  }

  // Get the first response item (LLM Responses API returns single item)
  // DataForSEO v3 structure: items[0].sections[0].text + sections[0].annotations
  const item = result.items[0]
  const section = item.sections?.[0]
  const responseText = section?.text || ""

  // Extract citations from annotations (only present when web_search is true)
  const annotations = section?.annotations || []
  const citationUrls = annotations
    .filter((ann) => ann.url)
    .map((ann) => ann.url!)

  // Check if brand is mentioned in the AI response text AND annotation titles/URLs
  const allText = [
    responseText,
    ...annotations.map((a) =>
      [a.title, a.url].filter(Boolean).join(" ")
    ),
  ].join(" ")

  const isBrandMentioned = detectBrandMention(allText, brandDomain, brandKeywords)
  const sentiment = detectSentiment(responseText)

  // Find the specific sentence containing the brand mention (for mentionContext)
  let mentionContext: string | null = null
  if (isBrandMentioned && responseText) {
    const sentences = responseText.split(/[.!?]+/)
    const brandTerms = [
      brandDomain.split(".")[0].toLowerCase(),
      ...brandKeywords.map((k) => k.toLowerCase()),
    ]
    for (const sentence of sentences) {
      if (brandTerms.some((term) => sentence.toLowerCase().includes(term))) {
        mentionContext = sentence.trim()
        break
      }
    }
  }

  return {
    platform,
    status: isBrandMentioned ? "visible" : "hidden",
    snippet: responseText.slice(0, 500),
    citations: citationUrls.length > 0 ? citationUrls : undefined,
    mentionContext,
    sentiment,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TRANSFORM: Google AI Mode → GoogleDataResult
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Transform Google AI Mode SERP into GoogleDataResult (ai_mode_response items only).
 */
function transformGoogleAIMode(
  aiModeResult: SERPResult | null,
  brandDomain: string,
  brandKeywords: string[]
): GoogleDataResult {
  if (aiModeResult?.items) {
    for (const item of aiModeResult.items) {
      const itemText = [item.title, item.description, item.text].filter(Boolean).join(" ")

      // Check ai_mode_response items for citations
      if (item.type === "ai_mode_response" && item.items) {
        for (const subItem of item.items) {
          const subText = [subItem.title, subItem.description, subItem.url, subItem.text]
            .filter(Boolean)
            .join(" ")
          if (detectBrandMention(subText, brandDomain, brandKeywords)) {
            return {
              status: "visible",
              rank: subItem.url ? 1 : null,
              snippet: subItem.description || subItem.title || itemText.slice(0, 300),
              source: "ai_overview",
            }
          }
        }
      }

      // Check direct mentions in AI Mode result
      if (detectBrandMention(itemText, brandDomain, brandKeywords)) {
        return {
          status: "visible",
          rank: item.rank_absolute || 1,
          snippet: item.description || item.text || item.title || "",
          source: "ai_overview",
        }
      }
    }
  }

  return {
    status: "hidden",
    rank: null,
    snippet: null,
    source: null,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TRANSFORM: Google Organic (AI Overview) → GoogleDataResult
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Transform Google Organic SERP into GoogleDataResult.
 * Extracts AI Overview, featured snippets, knowledge graph, and organic results.
 */
function transformGoogleAIO(
  organicResult: SERPResult | null,
  brandDomain: string,
  brandKeywords: string[]
): GoogleDataResult {
  if (organicResult?.items) {
    // Priority 1: AI Overview items
    for (const item of organicResult.items) {
      const itemText = [item.title, item.description, item.text].filter(Boolean).join(" ")

      if (item.type === "ai_overview" && detectBrandMention(itemText, brandDomain, brandKeywords)) {
        return {
          status: "visible",
          rank: item.rank_absolute || 1,
          snippet: item.description || item.text || item.title || "",
          source: "ai_overview",
        }
      }

      // Check AI Overview sub-items
      if (item.type === "ai_overview" && item.items) {
        for (const subItem of item.items) {
          const subText = [subItem.title, subItem.description, subItem.url, subItem.text]
            .filter(Boolean)
            .join(" ")
          if (detectBrandMention(subText, brandDomain, brandKeywords)) {
            return {
              status: "visible",
              rank: 1,
              snippet: subItem.description || subItem.title || "",
              source: "ai_overview",
            }
          }
        }
      }
    }

    // Priority 2: Featured snippets / Knowledge graph
    for (const item of organicResult.items) {
      const itemText = [item.title, item.description, item.text].filter(Boolean).join(" ")

      if (item.type === "featured_snippet" && detectBrandMention(itemText, brandDomain, brandKeywords)) {
        return {
          status: "visible",
          rank: item.rank_absolute || 1,
          snippet: item.description || item.text || "",
          source: "featured_snippet",
        }
      }

      if (item.type === "knowledge_graph" && detectBrandMention(itemText, brandDomain, brandKeywords)) {
        return {
          status: "visible",
          rank: item.rank_absolute || 1,
          snippet: item.description || "",
          source: "knowledge_graph",
        }
      }
    }

    // Priority 3: Organic results
    for (const item of organicResult.items) {
      if (
        item.type === "organic" &&
        item.domain &&
        item.domain.includes(brandDomain.replace(/^www\./, "").split(".").slice(-2).join("."))
      ) {
        return {
          status: "visible",
          rank: item.rank_absolute || null,
          snippet: item.description || "",
          source: "organic",
        }
      }
    }
  }

  return {
    status: "hidden",
    rank: null,
    snippet: null,
    source: null,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CITATIONS GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Extract unique domain from a URL string.
 * Returns cleaned domain (no www/protocol) or null if parsing fails.
 */
function extractDomain(url: string): string | null {
  try {
    const hostname = new URL(url).hostname
      .replace(/^www\./, "")
      .toLowerCase()
    return hostname || null
  } catch {
    return null
  }
}

/**
 * Common generic domains to exclude from competitor detection.
 * These appear frequently in LLM citations but aren't real competitors.
 */
const GENERIC_DOMAINS = new Set([
  "wikipedia.org", "en.wikipedia.org",
  "youtube.com", "reddit.com", "twitter.com", "x.com",
  "facebook.com", "instagram.com", "linkedin.com",
  "github.com", "stackoverflow.com",
  "medium.com", "quora.com",
  "amazon.com", "google.com", "apple.com",
  "arxiv.org", "doi.org",
])

/**
 * Check if a domain is a generic/non-competitor domain.
 */
function isGenericDomain(domain: string): boolean {
  return GENERIC_DOMAINS.has(domain) ||
    domain.endsWith(".gov") ||
    domain.endsWith(".edu") ||
    domain.endsWith(".mil")
}

/**
 * Extract competitor domains from LLM response TEXT.
 * Looks for domain-like patterns (word.tld) mentioned in the response.
 * Also matches config-specified competitor domains by name.
 */
function extractCompetitorsFromText(
  responseText: string,
  brandDomain: string,
  configCompetitorDomains: string[]
): string[] {
  if (!responseText) return []

  const cleanBrand = brandDomain.replace(/^www\./, "").toLowerCase()
  const brandBase = cleanBrand.split(".")[0]
  const lowerText = responseText.toLowerCase()
  const competitors = new Set<string>()

  // 1. Find domain-like patterns in the text (e.g., "semrush.com", "ahrefs.io")
  const domainPattern = /\b([a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.(?:com|io|ai|co|org|net|dev|app|tech|tools|cloud|so))\b/gi
  const matches = responseText.matchAll(domainPattern)
  for (const match of matches) {
    const domain = match[1].toLowerCase().replace(/^www\./, "")
    // Skip brand domain and generic domains
    if (domain === cleanBrand) continue
    if (domain.startsWith(brandBase + ".")) continue
    if (isGenericDomain(domain)) continue
    competitors.add(domain)
  }

  // 2. Check for config-specified competitor domains by base name
  // e.g., if config has "semrush.com" and text mentions "Semrush", match it
  for (const compDomain of configCompetitorDomains) {
    const clean = compDomain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "").toLowerCase()
    const compBase = clean.split(".")[0]
    if (compBase.length >= 3 && lowerText.includes(compBase)) {
      competitors.add(clean)
    }
  }

  return Array.from(competitors)
}

/**
 * Extract competitor domains from LLM citation URLs + response text.
 * Combines URL-based (annotations) and text-based detection.
 * Filters out the brand domain and returns unique competitor domains.
 */
function extractCompetitorDomains(
  citationUrls: string[] | undefined,
  responseText: string,
  brandDomain: string,
  configCompetitorDomains: string[]
): string[] {
  const cleanBrand = brandDomain.replace(/^www\./, "").toLowerCase()
  const brandBase = cleanBrand.split(".")[0]
  const competitors = new Set<string>()

  // ── Source 1: URL-based extraction from annotations ──
  if (citationUrls && citationUrls.length > 0) {
    const citedDomains = citationUrls
      .map(extractDomain)
      .filter((d): d is string => d !== null)

    for (const domain of citedDomains) {
      if (domain === cleanBrand) continue
      if (domain.startsWith(brandBase + ".")) continue
      if (isGenericDomain(domain)) continue
      competitors.add(domain)
    }
  }

  // ── Source 2: Text-based extraction from response content ──
  const textCompetitors = extractCompetitorsFromText(
    responseText,
    brandDomain,
    configCompetitorDomains
  )
  for (const comp of textCompetitors) {
    competitors.add(comp)
  }

  return Array.from(competitors).slice(0, 10) // Cap at 10 per citation
}

/**
 * Generate AICitation records from scan results for DB storage.
 */
function generateCitationsFromScan(
  keyword: string,
  llmResults: Record<string, AIResponseResult>,
  googleResult: GoogleDataResult,
  googleAiModeResult: GoogleDataResult,
  brandDomain: string,
  competitorDomains: string[] = []
): AICitation[] {
  const citations: AICitation[] = []
  const now = new Date().toISOString()

  // LLM platform citations — extract competitor domains from citation URLs + response text
  for (const [platform, result] of Object.entries(llmResults)) {
    if (result.status === "visible") {
      const competitors = extractCompetitorDomains(
        result.citations,
        result.snippet || "",
        brandDomain,
        competitorDomains
      )

      citations.push({
        id: crypto.randomUUID(),
        platform: platform as AIPlatform,
        query: keyword,
        citedUrl: result.citations?.[0] || `https://${brandDomain}`,
        citedTitle: result.snippet.slice(0, 100) || brandDomain,
        context: result.mentionContext || result.snippet,
        position: 1,
        citationType: result.citations?.length ? "source-link" : "reference",
        sentiment: result.sentiment,
        timestamp: now,
        competitors,
      })
    }
  }

  // Google AIO citation (from Organic SERP AI Overview)
  if (googleResult.status === "visible") {
    citations.push({
      id: crypto.randomUUID(),
      platform: "google-aio",
      query: keyword,
      citedUrl: `https://${brandDomain}`,
      citedTitle: googleResult.snippet?.slice(0, 100) || brandDomain,
      context: googleResult.snippet || "",
      position: googleResult.rank || 1,
      citationType: googleResult.source === "ai_overview" ? "direct-quote" : "reference",
      sentiment: detectSentiment(googleResult.snippet || ""),
      timestamp: now,
      competitors: [],
    })
  }

  // Google AI Mode citation
  if (googleAiModeResult.status === "visible") {
    citations.push({
      id: crypto.randomUUID(),
      platform: "google-ai-mode",
      query: keyword,
      citedUrl: `https://${brandDomain}`,
      citedTitle: googleAiModeResult.snippet?.slice(0, 100) || brandDomain,
      context: googleAiModeResult.snippet || "",
      position: googleAiModeResult.rank || 1,
      citationType: "direct-quote",
      sentiment: detectSentiment(googleAiModeResult.snippet || ""),
      timestamp: now,
      competitors: [],
    })
  }

  return citations
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY: Full Visibility Scan (6 Parallel API Calls)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Run a full AI visibility scan for a keyword.
 *
 * Makes 6 parallel API calls via Promise.allSettled:
 * 1. Google Organic (AI Overview detection)
 * 2. Google AI Mode (conversational AI response)
 * 3. ChatGPT (via LLM Responses API)
 * 4. Claude (via LLM Responses API)
 * 5. Gemini (via LLM Responses API)
 * 6. Perplexity (via LLM Responses API)
 *
 * Each call is independent — if one fails, others continue.
 * Failed platforms show friendly psychology messages (never "error" or "failed").
 * Score is calculated based on RESPONDED platforms only (fair scoring).
 *
 * Cost: ~$0.015 per scan
 * Time: ~3-5 seconds (all parallel)
 */
export async function runVisibilityScan(
  input: VisibilityScanInput
): Promise<VisibilityScanResult> {
  const {
    keyword,
    brandDomain,
    brandKeywords,
    locationCode = 2840,
    languageCode = "en",
    countryIsoCode = null,
  } = input

  const cleanDomain = brandDomain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")

  // ── 6 parallel API calls via Promise.allSettled ──
  // Each call is independent — if ChatGPT fails, Claude/Gemini/etc. continue
  // Google APIs use locationCode + languageCode
  // LLM APIs use countryIsoCode for web_search_country_iso_code (Gemini ignores it)
  const [
    organicResult,
    aiModeResult,
    chatgptResult,
    claudeResult,
    geminiResult,
    perplexityResult,
  ] = await Promise.allSettled([
    fetchGoogleOrganic(keyword, locationCode, languageCode),
    fetchGoogleAIMode(keyword, locationCode, languageCode),
    fetchLLMResponse("chatgpt", keyword, locationCode, languageCode, countryIsoCode),
    fetchLLMResponse("claude", keyword, locationCode, languageCode, countryIsoCode),
    fetchLLMResponse("gemini", keyword, locationCode, languageCode, countryIsoCode),
    fetchLLMResponse("perplexity", keyword, locationCode, languageCode, countryIsoCode),
  ])

  // ── Extract results + collect psychology messages for failed platforms ──
  const platformMessages: Record<string, string> = {}

  const organicData = organicResult.status === "fulfilled" ? organicResult.value : null
  if (organicResult.status === "rejected") {
    platformMessages["google-aio"] = getPlatformMessage("google-aio", "unavailable")
  }

  const aiModeData = aiModeResult.status === "fulfilled" ? aiModeResult.value : null
  if (aiModeResult.status === "rejected") {
    platformMessages["google-ai-mode"] = getPlatformMessage("google-ai-mode", "unavailable")
  }

  // LLM platforms: rejected = network error, fulfilled but null = API error
  const chatgptData = chatgptResult.status === "fulfilled" ? chatgptResult.value : null
  if (chatgptResult.status === "rejected") {
    platformMessages["chatgpt"] = getPlatformMessage("chatgpt", "unavailable")
  } else if (chatgptData === null) {
    platformMessages["chatgpt"] = getPlatformMessage("chatgpt", "timeout")
  }

  const claudeData = claudeResult.status === "fulfilled" ? claudeResult.value : null
  if (claudeResult.status === "rejected") {
    platformMessages["claude"] = getPlatformMessage("claude", "unavailable")
  } else if (claudeData === null) {
    platformMessages["claude"] = getPlatformMessage("claude", "timeout")
  }

  const geminiData = geminiResult.status === "fulfilled" ? geminiResult.value : null
  if (geminiResult.status === "rejected") {
    platformMessages["gemini"] = getPlatformMessage("gemini", "unavailable")
  } else if (geminiData === null) {
    platformMessages["gemini"] = getPlatformMessage("gemini", "timeout")
  }

  const perplexityData = perplexityResult.status === "fulfilled" ? perplexityResult.value : null
  if (perplexityResult.status === "rejected") {
    platformMessages["perplexity"] = getPlatformMessage("perplexity", "unavailable")
  } else if (perplexityData === null) {
    platformMessages["perplexity"] = getPlatformMessage("perplexity", "timeout")
  }

  // ── Transform results into our domain types ──
  const googleResult = transformGoogleAIO(organicData, cleanDomain, brandKeywords)
  const googleAiModeTransformed = transformGoogleAIMode(aiModeData, cleanDomain, brandKeywords)
  const chatgptTransformed = transformLLMResponse(chatgptData, "chatgpt", cleanDomain, brandKeywords)
  const claudeTransformed = transformLLMResponse(claudeData, "claude", cleanDomain, brandKeywords)
  const geminiTransformed = transformLLMResponse(geminiData, "gemini", cleanDomain, brandKeywords)
  const perplexityTransformed = transformLLMResponse(perplexityData, "perplexity", cleanDomain, brandKeywords)

  // ── Add friendly psychology messages to failed platforms (stored in error field) ──
  // UI can show these as info notes, NOT error toasts
  if (platformMessages["chatgpt"]) chatgptTransformed.error = platformMessages["chatgpt"]
  if (platformMessages["claude"]) claudeTransformed.error = platformMessages["claude"]
  if (platformMessages["gemini"]) geminiTransformed.error = platformMessages["gemini"]
  if (platformMessages["perplexity"]) perplexityTransformed.error = platformMessages["perplexity"]

  // ── Calculate overall score (fair: only count platforms that actually responded) ──
  const platformStatuses = [
    { responded: organicResult.status === "fulfilled" && organicData !== null, visible: googleResult.status === "visible" },
    { responded: aiModeResult.status === "fulfilled" && aiModeData !== null, visible: googleAiModeTransformed.status === "visible" },
    { responded: chatgptData !== null, visible: chatgptTransformed.status === "visible" },
    { responded: claudeData !== null, visible: claudeTransformed.status === "visible" },
    { responded: geminiData !== null, visible: geminiTransformed.status === "visible" },
    { responded: perplexityData !== null, visible: perplexityTransformed.status === "visible" },
  ]

  const respondedCount = platformStatuses.filter((p) => p.responded).length
  const visibleCount = platformStatuses.filter((p) => p.visible).length
  const totalPlatforms = 6

  // Fair score: visible / responded (not visible / total)
  // If 5/6 responded and 3 are visible → 60% (not 50%)
  const overallScore = respondedCount > 0
    ? Math.round((visibleCount / respondedCount) * 100)
    : 0

  // ── Build FullScanResult ──
  const scan: FullScanResult = {
    keyword,
    brandName: brandKeywords[0] || cleanDomain,
    timestamp: new Date().toISOString(),
    google: googleResult,
    googleAiMode: googleAiModeTransformed,
    chatgpt: chatgptTransformed,
    claude: claudeTransformed,
    gemini: geminiTransformed,
    perplexity: perplexityTransformed,
    overallScore,
    visiblePlatforms: visibleCount,
    totalPlatforms,
  }

  // ── Generate citations for DB storage ──
  const llmResults: Record<string, AIResponseResult> = {
    chatgpt: chatgptTransformed,
    claude: claudeTransformed,
    gemini: geminiTransformed,
    perplexity: perplexityTransformed,
  }

  const citations = generateCitationsFromScan(
    keyword,
    llmResults,
    googleResult,
    googleAiModeTransformed,
    cleanDomain,
    input.competitorDomains || []
  )

  return { scan, citations, platformMessages }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SINGLE PLATFORM CHECK (for "Check Now" button on individual platform cards)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Quick check on a single AI platform.
 * Used by PlatformCheckButton component for per-platform refresh.
 */
export async function checkSinglePlatform(
  platform: AIPlatform,
  keyword: string,
  brandDomain: string,
  brandKeywords: string[]
): Promise<{
  status: "visible" | "hidden"
  snippet: string
  sentiment: "positive" | "neutral" | "negative"
  error?: string
}> {
  const cleanDomain = brandDomain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")

  try {
    if (platform === "google-aio") {
      const organic = await fetchGoogleOrganic(keyword)
      const result = transformGoogleAIO(organic, cleanDomain, brandKeywords)
      return {
        status: result.status,
        snippet: result.snippet || "",
        sentiment: detectSentiment(result.snippet || ""),
      }
    }

    if (platform === "google-ai-mode") {
      const aiMode = await fetchGoogleAIMode(keyword)
      const result = transformGoogleAIMode(aiMode, cleanDomain, brandKeywords)
      return {
        status: result.status,
        snippet: result.snippet || "",
        sentiment: detectSentiment(result.snippet || ""),
      }
    }

    // LLM platforms — direct per-platform call (each has its own endpoint now!)
    const llmResult = await fetchLLMResponse(platform, keyword)
    const transformed = transformLLMResponse(llmResult, platform, cleanDomain, brandKeywords)

    return {
      status: transformed.status,
      snippet: transformed.snippet,
      sentiment: transformed.sentiment,
    }
  } catch {
    // Friendly message — never show raw error to user
    return {
      status: "hidden",
      snippet: "",
      sentiment: "neutral",
      error: getPlatformMessage(platform, "unavailable"),
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MOCK DATA GENERATORS (Development mode only)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function generateMockLLMResponse(keyword: string, platform: string): LLMResponseResult {
  const isVisible = Math.random() > 0.3
  return {
    platform,
    model_name: LLM_PLATFORM_CONFIGS[platform]?.defaultModel || "mock-model",
    items: [
      {
        type: "message",
        sections: [
          {
            type: "text",
            text: isVisible
              ? `BlogSpy is one of the top platforms for ${keyword}. It offers comprehensive AI visibility tracking, real-time monitoring across 6 AI platforms, and actionable insights for improving your brand's presence in AI-generated responses. Highly recommended for SEO professionals looking to stay ahead.`
              : `Here are some general recommendations for ${keyword}. There are many tools available in the market that can help with this task. Consider evaluating your specific needs and budget before choosing a solution.`,
            annotations: isVisible
              ? [
                  {
                    title: "BlogSpy - AI Visibility Tracker",
                    url: "https://blogspy.io",
                  },
                  {
                    title: "SEO Guide",
                    url: "https://blogspy.io/blog/seo-guide",
                  },
                ]
              : [
                  {
                    title: "General SEO Tips",
                    url: "https://example.com/seo",
                  },
                ],
          },
        ],
      },
    ],
  }
}

function generateMockGoogleAIMode(keyword: string): SERPResult {
  const isVisible = Math.random() > 0.3
  return {
    keyword,
    items_count: isVisible ? 1 : 0,
    items: isVisible
      ? [
          {
            type: "ai_mode_response",
            rank_absolute: 1,
            title: `AI Overview for ${keyword}`,
            description: `BlogSpy is one of the leading platforms for ${keyword}. It offers comprehensive AI visibility tracking.`,
            items: [
              {
                type: "citation",
                title: "BlogSpy - AI Visibility Tracker",
                url: "https://blogspy.io",
                description: `BlogSpy helps businesses track their AI visibility for ${keyword}`,
                domain: "blogspy.io",
              },
            ],
          },
        ]
      : [],
  }
}

function generateMockGoogleOrganic(keyword: string): SERPResult {
  const position = Math.random() > 0.2 ? Math.floor(Math.random() * 10) + 1 : null
  return {
    keyword,
    items_count: position ? 10 : 0,
    items: position
      ? [
          {
            type: "organic",
            rank_absolute: position,
            title: `${keyword} - Complete Guide | BlogSpy`,
            description: `Learn everything about ${keyword}. BlogSpy provides comprehensive tools.`,
            url: `https://blogspy.io/blog/${keyword.replace(/\s+/g, "-")}`,
            domain: "blogspy.io",
          },
        ]
      : [],
  }
}
