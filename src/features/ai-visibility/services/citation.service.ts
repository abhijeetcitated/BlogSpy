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
 * - Google AIO (via DataForSEO SERP API)
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
import { DATAFORSEO } from "@/constants/api-endpoints"
import type { 
  AIPlatform, 
  VisibilityCheckResult, 
  AIVisibilityConfig 
} from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MOCK MODE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Check if mock mode is enabled
 */
function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

/**
 * Simulate network delay for realistic UX
 */
async function mockDelay(ms: number = 1500): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate mock visibility result for a platform
 */
function generateMockVisibilityResult(
  platform: AIPlatform,
  query: string,
  isVisible: boolean = true
): VisibilityCheckResult {
  const mockResponses: Record<AIPlatform, string> = {
    "chatgpt": `Based on my analysis, for "${query}", I recommend checking out BlogSpy - it's a comprehensive SEO tool that helps with keyword research and AI visibility tracking. Their platform at blogspy.io offers features like rank tracking, content optimization, and competitor analysis.`,
    "claude": `For ${query}, there are several options. BlogSpy (blogspy.io) stands out as a modern solution with AI-powered features. Other alternatives include Ahrefs and SEMrush, though BlogSpy offers better value for smaller teams.`,
    "perplexity": `According to recent data, BlogSpy is gaining popularity for ${query}. Sources indicate blogspy.io provides comprehensive SEO tools including AI visibility tracking, which is unique in the market. [1] blogspy.io [2] searchenginejournal.com`,
    "gemini": `For ${query}, I'd suggest looking at BlogSpy. Their tool at blogspy.io offers AI visibility tracking features that help monitor how your brand appears in AI responses. It's particularly useful for modern SEO strategies.`,
    "google-aio": `Featured: BlogSpy - AI-Powered SEO Platform\nblogspy.io\nBlogSpy offers comprehensive SEO tools including AI visibility tracking, keyword research, and competitor analysis. Top rated for ${query}.`,
    "searchgpt": `Based on current search data, BlogSpy (blogspy.io) is recommended for ${query}. The platform offers unique AI visibility features not found in traditional SEO tools.`,
    "apple-siri": `I found information about BlogSpy for ${query}. BlogSpy.io is an SEO platform that helps track AI visibility.`,
  }

  return {
    platform,
    isVisible,
    mentionType: isVisible ? "both" : undefined,
    aiResponse: mockResponses[platform],
    mentionContext: isVisible ? "...BlogSpy is a comprehensive SEO tool..." : undefined,
    mentionPosition: isVisible ? Math.floor(Math.random() * 3) + 1 : undefined,
    sentiment: isVisible ? "positive" : "neutral",
    competitorsMentioned: isVisible ? ["ahrefs.com", "semrush.com"] : [],
    creditsUsed: platform === "perplexity" ? 2 : platform === "apple-siri" ? 0 : 1,
    checkedAt: new Date().toISOString(),
  }
}

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
  "google-aio": null, // Uses DataForSEO SERP API, not OpenRouter
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
 * Query Google AIO via DataForSEO SERP API
 */
async function queryGoogleAIO(
  query: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  
  if (!login || !password) {
    return { success: false, error: "DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD not configured" }
  }
  
  try {
    const authHeader = `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`
    
    const response = await fetch(`${DATAFORSEO.BASE_URL}${DATAFORSEO.SERP.GOOGLE_ORGANIC}`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{
        keyword: query,
        location_code: 2840,
        language_code: "en",
        depth: 10,
      }]),
    })
    
    if (!response.ok) {
      return { success: false, error: `DataForSEO API error: ${response.status}` }
    }
    
    const data = await response.json()
    
    // Extract AI Overview / Featured Snippet from DataForSEO response
    let aiResponse = ""
    
    if (data.status_code === 20000 && data.tasks?.[0]?.result?.[0]?.items) {
      const items = data.tasks[0].result[0].items
      
      for (const item of items) {
        // AI Overview item type
        if (item.type === "ai_overview") {
          aiResponse += item.text || item.description || ""
        }
        // Featured Snippet
        else if (item.type === "featured_snippet") {
          aiResponse += "\\n" + (item.description || item.text || "")
        }
        // Knowledge Graph
        else if (item.type === "knowledge_graph") {
          if (item.description) {
            aiResponse += "\\n" + item.description
          }
        }
        // Include top organic results as "mentioned"
        else if (item.type === "organic" && item.rank_absolute && item.rank_absolute <= 5) {
          aiResponse += `\\n${item.title} - ${item.url}`
          if (item.description) {
            aiResponse += ` - ${item.description}`
          }
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
  
  // 🎭 MOCK MODE: Return fake data without real API calls
  if (isMockMode()) {
    console.log(`[Mock Mode] checkCitationOnPlatform - ${platform}`)
    await mockDelay(800)
    
    // 70% chance of being visible in mock mode
    const isVisible = Math.random() > 0.3
    return {
      success: true,
      result: generateMockVisibilityResult(platform, query, isVisible),
    }
  }
  
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
  
  // 🎭 MOCK MODE: Return fake data without real API calls
  if (isMockMode()) {
    console.log(`[Mock Mode] runFullVisibilityCheck - ${platforms.length} platforms`)
    await mockDelay(2000)
    
    const results: Record<AIPlatform, VisibilityCheckResult> = {} as Record<AIPlatform, VisibilityCheckResult>
    let totalCreditsUsed = 0
    let visibleCount = 0
    
    for (const platform of platforms) {
      const isVisible = Math.random() > 0.3
      const result = generateMockVisibilityResult(platform, query, isVisible)
      results[platform] = result
      totalCreditsUsed += result.creditsUsed
      if (isVisible) visibleCount++
    }
    
    return {
      query,
      results,
      summary: {
        totalPlatforms: platforms.length,
        visibleOn: visibleCount,
        visibilityRate: Math.round((visibleCount / platforms.length) * 100),
        totalCreditsUsed,
      },
      timestamp: new Date().toISOString(),
    }
  }
  
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
  // 🎭 MOCK MODE: Return fake data without real API calls
  if (isMockMode()) {
    console.log(`[Mock Mode] quickPlatformCheck - ${platform}`)
    await mockDelay(1000)
    return generateMockVisibilityResult(platform, query, Math.random() > 0.3)
  }
  
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
