/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 CITATION CHECK SERVICE - Detect Brand Mentions in AI Responses
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * This service queries AI platforms via OpenRouter and detects if the user's brand/domain
 * is mentioned in the AI's response.
 * 
 * Supported Platforms:
 * - ChatGPT (via OpenRouter - openai/gpt-4o-mini)
 * - Claude (via OpenRouter - anthropic/claude-3-haiku)
 * - Perplexity (via OpenRouter - perplexity/sonar)
 * - Gemini (via OpenRouter - google/gemini-flash-1.5)
 * - Google AIO (via Serper.dev API)
 * 
 * @example
 * ```ts
 * import { checkCitationOnPlatform, runFullVisibilityCheck } from "./citation.service"
 * 
 * // Check single platform
 * const result = await checkCitationOnPlatform({
 *   platform: "chatgpt",
 *   query: "best seo tools 2025",
 *   brandKeywords: ["blogspy", "blogspy.io"],
 * })
 * 
 * // Run full check across all platforms
 * const fullResult = await runFullVisibilityCheck({
 *   query: "best seo tools 2025",
 *   config: userConfig,
 * })
 * ```
 */

import { openrouter, MODELS, type OpenRouterModel } from "@/src/lib/ai/openrouter"
import type { 
  AIPlatform, 
  VisibilityCheckResult, 
  AIVisibilityConfig 
} from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface PlatformCheckInput {
  platform: AIPlatform
  query: string
  brandKeywords: string[]
  competitorDomains?: string[]
}

export interface PlatformCheckResult {
  success: boolean
  result?: VisibilityCheckResult
  error?: string
}

export interface FullVisibilityCheckInput {
  query: string
  config: AIVisibilityConfig
  platforms?: AIPlatform[]
}

export interface FullVisibilityCheckResult {
  query: string
  results: Record<AIPlatform, VisibilityCheckResult>
  summary: {
    totalPlatforms: number
    visibleOn: number
    visibilityRate: number
    totalCreditsUsed: number
  }
  timestamp: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// PLATFORM → MODEL MAPPING
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Maps AI platforms to their OpenRouter model identifiers
 */
const PLATFORM_MODEL_MAP: Record<AIPlatform, OpenRouterModel | null> = {
  "chatgpt": MODELS.GPT4O_MINI,
  "claude": MODELS.CLAUDE_3_HAIKU,
  "perplexity": MODELS.PERPLEXITY_SONAR,
  "gemini": MODELS.GEMINI_FLASH,
  "google-aio": null, // Uses Serper.dev API, not OpenRouter
  "searchgpt": MODELS.GPT4O_MINI, // Simulated via GPT-4
  "apple-siri": null, // Readiness check only, no API
}

/**
 * Credits consumed per platform check (for billing)
 */
const PLATFORM_CREDITS: Record<AIPlatform, number> = {
  "chatgpt": 1,
  "claude": 1,
  "perplexity": 2, // Slightly more expensive due to search
  "gemini": 1,
  "google-aio": 1,
  "searchgpt": 1,
  "apple-siri": 0, // No API call needed
}

/**
 * Platforms available for citation checking
 */
export const CHECKABLE_PLATFORMS: AIPlatform[] = [
  "chatgpt",
  "claude",
  "perplexity", 
  "gemini",
  "google-aio",
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// PROMPT TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * System prompt for citation check queries
 * We ask the AI to provide recommendations naturally
 */
const SYSTEM_PROMPT = `You are a helpful assistant that provides recommendations and information. 
When asked about products, services, or tools, provide honest and balanced recommendations based on your knowledge.
Include specific brand names and websites when relevant.
Be concise but informative.`

/**
 * Build the query prompt for a citation check
 */
function buildQueryPrompt(query: string): string {
  return `${query}

Please provide specific recommendations with brand names and websites if applicable.`
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// BRAND DETECTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface BrandDetection {
  isVisible: boolean
  mentionType: VisibilityCheckResult["mentionType"]
  mentionContext?: string
  mentionPosition?: number
  sentiment: VisibilityCheckResult["sentiment"]
}

/**
 * Detects if brand keywords are mentioned in AI response
 */
function detectBrandMention(
  response: string,
  brandKeywords: string[],
  domain: string
): BrandDetection {
  const responseLower = response.toLowerCase()
  
  // Check for domain mention
  const domainLower = domain.toLowerCase().replace("https://", "").replace("http://", "").replace("www.", "")
  const hasDomain = responseLower.includes(domainLower)
  
  // Check for brand name mentions
  let hasBrandName = false
  let firstMentionIndex = -1
  let mentionedBrand = ""
  
  for (const keyword of brandKeywords) {
    const keywordLower = keyword.toLowerCase()
    const index = responseLower.indexOf(keywordLower)
    if (index !== -1) {
      hasBrandName = true
      if (firstMentionIndex === -1 || index < firstMentionIndex) {
        firstMentionIndex = index
        mentionedBrand = keyword
      }
    }
  }
  
  // If neither found, not visible
  if (!hasDomain && !hasBrandName) {
    return {
      isVisible: false,
      mentionType: undefined,
      sentiment: "neutral",
    }
  }
  
  // Determine mention type
  let mentionType: VisibilityCheckResult["mentionType"]
  if (hasDomain && hasBrandName) {
    mentionType = "both"
  } else if (hasDomain) {
    mentionType = "domain-link"
  } else {
    mentionType = "brand-name"
  }
  
  // Extract context around the mention (50 chars before and after)
  let mentionContext: string | undefined
  if (firstMentionIndex !== -1) {
    const start = Math.max(0, firstMentionIndex - 50)
    const end = Math.min(response.length, firstMentionIndex + mentionedBrand.length + 50)
    mentionContext = response.slice(start, end)
    if (start > 0) mentionContext = "..." + mentionContext
    if (end < response.length) mentionContext = mentionContext + "..."
  }
  
  // Calculate mention position (1st, 2nd, 3rd mention overall)
  // Count how many other entities/brands appear before our brand
  const sentences = response.split(/[.!?]/)
  let mentionPosition = 1
  for (let i = 0; i < sentences.length; i++) {
    const sentLower = sentences[i].toLowerCase()
    if (brandKeywords.some(kw => sentLower.includes(kw.toLowerCase())) || 
        sentLower.includes(domainLower)) {
      break
    }
    // Count entities (simple heuristic: capitalized words that might be brand names)
    const capitalizedWords = sentences[i].match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b/g)
    if (capitalizedWords) {
      mentionPosition += Math.min(capitalizedWords.length, 3)
    }
  }
  mentionPosition = Math.min(mentionPosition, 10) // Cap at 10
  
  // Analyze sentiment (simple heuristic)
  const sentiment = analyzeSentiment(response, mentionedBrand || domain)
  
  return {
    isVisible: true,
    mentionType,
    mentionContext,
    mentionPosition,
    sentiment,
  }
}

/**
 * Simple sentiment analysis around brand mention
 */
function analyzeSentiment(
  response: string, 
  brand: string
): "positive" | "neutral" | "negative" {
  const responseLower = response.toLowerCase()
  const brandLower = brand.toLowerCase()
  const brandIndex = responseLower.indexOf(brandLower)
  
  if (brandIndex === -1) return "neutral"
  
  // Get context around brand (100 chars each side)
  const start = Math.max(0, brandIndex - 100)
  const end = Math.min(response.length, brandIndex + brand.length + 100)
  const context = responseLower.slice(start, end)
  
  // Positive indicators
  const positiveWords = [
    "best", "top", "excellent", "great", "recommended", "popular", 
    "leading", "powerful", "comprehensive", "reliable", "trusted",
    "favorite", "outstanding", "innovative", "impressive", "worth"
  ]
  
  // Negative indicators
  const negativeWords = [
    "worst", "avoid", "poor", "bad", "limited", "expensive",
    "difficult", "complicated", "unreliable", "outdated", "lacking",
    "disappointing", "frustrating", "inferior", "overpriced"
  ]
  
  let positiveScore = 0
  let negativeScore = 0
  
  for (const word of positiveWords) {
    if (context.includes(word)) positiveScore++
  }
  
  for (const word of negativeWords) {
    if (context.includes(word)) negativeScore++
  }
  
  if (positiveScore > negativeScore) return "positive"
  if (negativeScore > positiveScore) return "negative"
  return "neutral"
}

/**
 * Detect competitor mentions in response
 */
function detectCompetitors(
  response: string,
  competitorDomains: string[]
): string[] {
  const responseLower = response.toLowerCase()
  const mentioned: string[] = []
  
  for (const competitor of competitorDomains) {
    const competitorLower = competitor.toLowerCase()
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.", "")
    
    if (responseLower.includes(competitorLower)) {
      mentioned.push(competitor)
    }
  }
  
  return mentioned
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// PLATFORM QUERY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Query an AI platform via OpenRouter
 */
async function queryOpenRouterPlatform(
  model: OpenRouterModel,
  query: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const completion = await openrouter.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildQueryPrompt(query) },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })
    
    const response = completion.choices[0]?.message?.content
    
    if (!response) {
      return { success: false, error: "Empty response from AI" }
    }
    
    return { success: true, response }
  } catch (error) {
    console.error("[queryOpenRouterPlatform] Error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to query AI platform" 
    }
  }
}

/**
 * Query Google AIO via Serper.dev API
 */
async function queryGoogleAIO(
  query: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  const apiKey = process.env.SERPER_API_KEY
  
  if (!apiKey) {
    return { success: false, error: "SERPER_API_KEY not configured" }
  }
  
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        gl: "us",
        hl: "en",
      }),
    })
    
    if (!response.ok) {
      return { success: false, error: `Serper API error: ${response.status}` }
    }
    
    const data = await response.json()
    
    // Extract AI Overview / Featured Snippet
    let aiResponse = ""
    
    if (data.answerBox) {
      aiResponse += data.answerBox.answer || data.answerBox.snippet || ""
    }
    
    if (data.knowledgeGraph) {
      if (data.knowledgeGraph.description) {
        aiResponse += "\n" + data.knowledgeGraph.description
      }
    }
    
    // Also include top organic results as "mentioned"
    if (data.organic && Array.isArray(data.organic)) {
      const topResults = data.organic.slice(0, 5)
      for (const result of topResults) {
        aiResponse += `\n${result.title} - ${result.link}`
        if (result.snippet) {
          aiResponse += ` - ${result.snippet}`
        }
      }
    }
    
    if (!aiResponse.trim()) {
      return { success: true, response: "" }
    }
    
    return { success: true, response: aiResponse }
  } catch (error) {
    console.error("[queryGoogleAIO] Error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to query Google" 
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MAIN CHECK FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Check citation on a single platform
 */
export async function checkCitationOnPlatform(
  input: PlatformCheckInput
): Promise<PlatformCheckResult> {
  const { platform, query, brandKeywords, competitorDomains = [] } = input
  
  // Handle Apple Siri (readiness only)
  if (platform === "apple-siri") {
    return {
      success: true,
      result: {
        platform,
        isVisible: false,
        aiResponse: "Apple Siri does not have a public API for citation checking.",
        creditsUsed: 0,
        checkedAt: new Date().toISOString(),
        error: "Readiness check only - no API available",
      },
    }
  }
  
  // Handle SearchGPT (coming soon)
  if (platform === "searchgpt") {
    return {
      success: true,
      result: {
        platform,
        isVisible: false,
        aiResponse: "SearchGPT citation checking is coming soon.",
        creditsUsed: 0,
        checkedAt: new Date().toISOString(),
        error: "Coming soon",
      },
    }
  }
  
  // Query the appropriate platform
  let queryResult: { success: boolean; response?: string; error?: string }
  
  if (platform === "google-aio") {
    queryResult = await queryGoogleAIO(query)
  } else {
    const model = PLATFORM_MODEL_MAP[platform]
    if (!model) {
      return {
        success: false,
        error: `No model configured for platform: ${platform}`,
      }
    }
    queryResult = await queryOpenRouterPlatform(model, query)
  }
  
  if (!queryResult.success || !queryResult.response) {
    return {
      success: false,
      error: queryResult.error || "Failed to get response",
    }
  }
  
  // Extract domain from first brand keyword if it looks like a domain
  const domain = brandKeywords.find(kw => kw.includes(".")) || brandKeywords[0] || ""
  
  // Detect brand mention
  const detection = detectBrandMention(queryResult.response, brandKeywords, domain)
  
  // Detect competitors
  const competitorsMentioned = detectCompetitors(queryResult.response, competitorDomains)
  
  // If not visible but competitors are, mark as competitor-only
  if (!detection.isVisible && competitorsMentioned.length > 0) {
    detection.mentionType = "competitor-only"
  }
  
  return {
    success: true,
    result: {
      platform,
      isVisible: detection.isVisible,
      mentionType: detection.mentionType,
      aiResponse: queryResult.response,
      mentionContext: detection.mentionContext,
      mentionPosition: detection.mentionPosition,
      sentiment: detection.sentiment,
      competitorsMentioned,
      creditsUsed: PLATFORM_CREDITS[platform],
      checkedAt: new Date().toISOString(),
    },
  }
}

/**
 * Run visibility check across all platforms
 */
export async function runFullVisibilityCheck(
  input: FullVisibilityCheckInput
): Promise<FullVisibilityCheckResult> {
  const { query, config, platforms = CHECKABLE_PLATFORMS } = input
  
  const brandKeywords = [
    config.trackedDomain,
    ...config.brandKeywords,
  ]
  
  const results: Record<AIPlatform, VisibilityCheckResult> = {} as Record<AIPlatform, VisibilityCheckResult>
  let totalCreditsUsed = 0
  let visibleCount = 0
  
  // Run checks in parallel for speed
  const checkPromises = platforms.map(async (platform) => {
    const checkResult = await checkCitationOnPlatform({
      platform,
      query,
      brandKeywords,
      competitorDomains: config.competitorDomains,
    })
    
    if (checkResult.success && checkResult.result) {
      results[platform] = checkResult.result
      totalCreditsUsed += checkResult.result.creditsUsed
      if (checkResult.result.isVisible) {
        visibleCount++
      }
    } else {
      // Store error result
      results[platform] = {
        platform,
        isVisible: false,
        aiResponse: "",
        creditsUsed: 0,
        checkedAt: new Date().toISOString(),
        error: checkResult.error,
      }
    }
  })
  
  await Promise.all(checkPromises)
  
  return {
    query,
    results,
    summary: {
      totalPlatforms: platforms.length,
      visibleOn: visibleCount,
      visibilityRate: platforms.length > 0 
        ? Math.round((visibleCount / platforms.length) * 100) 
        : 0,
      totalCreditsUsed,
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Quick check on a single platform (for "Check Now" button)
 */
export async function quickPlatformCheck(
  platform: AIPlatform,
  query: string,
  config: AIVisibilityConfig
): Promise<VisibilityCheckResult> {
  const brandKeywords = [
    config.trackedDomain,
    ...config.brandKeywords,
  ]
  
  const result = await checkCitationOnPlatform({
    platform,
    query,
    brandKeywords,
    competitorDomains: config.competitorDomains,
  })
  
  if (result.success && result.result) {
    return result.result
  }
  
  return {
    platform,
    isVisible: false,
    aiResponse: "",
    creditsUsed: 0,
    checkedAt: new Date().toISOString(),
    error: result.error || "Check failed",
  }
}
