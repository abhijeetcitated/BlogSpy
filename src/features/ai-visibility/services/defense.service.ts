/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ DEFENSE SERVICE - Hallucination Detection via OpenRouter
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * This service handles:
 * - Querying AI models about your brand
 * - Detecting hallucinations (wrong pricing, features, etc.)
 * - Sentiment analysis of AI responses
 * 
 * @see _INTEGRATION_GUIDE.ts for full architecture
 */

import { HallucinationLog, PlatformVisibility, DefenseResult } from "../types"

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
 * Generate mock defense result
 */
function generateMockDefenseResult(): DefenseResult {
  const platforms = ["chatgpt", "claude", "gemini", "perplexity"]
  const logs: HallucinationLog[] = []
  
  for (const platform of platforms) {
    // Pricing check
    logs.push({
      id: `${platform}-pricing-${Date.now()}`,
      platform,
      type: "pricing",
      status: Math.random() > 0.3 ? "accurate" : "error",
      message: Math.random() > 0.3 ? "Pricing Accurate" : "Pricing Error Detected",
      detail: Math.random() > 0.3 
        ? "Correctly mentions $29/mo" 
        : 'AI says "$49/mo" but actual is "$29/mo"',
      timestamp: new Date().toISOString(),
    })
    
    // Feature check
    logs.push({
      id: `${platform}-features-${Date.now()}`,
      platform,
      type: "feature",
      status: Math.random() > 0.2 ? "accurate" : "outdated",
      message: Math.random() > 0.2 ? "Features Accurate" : "Missing Features",
      detail: Math.random() > 0.2 
        ? "All key features mentioned correctly" 
        : "AI missing: AI Writer, Rank Tracker",
      timestamp: new Date().toISOString(),
    })
    
    // Description check
    logs.push({
      id: `${platform}-description-${Date.now()}`,
      platform,
      type: "fact",
      status: Math.random() > 0.4 ? "accurate" : "outdated",
      message: Math.random() > 0.4 ? "Description Accurate" : "Description May Be Outdated",
      detail: Math.random() > 0.4 
        ? "AI correctly describes your product" 
        : "AI description may need updating",
      timestamp: new Date().toISOString(),
    })
  }
  
  const errorCount = logs.filter((l) => l.status === "error").length
  const outdatedCount = logs.filter((l) => l.status === "outdated").length
  
  return {
    timestamp: new Date().toISOString(),
    logs,
    summary: {
      totalChecks: logs.length,
      errors: errorCount,
      outdated: outdatedCount,
      accurate: logs.length - errorCount - outdatedCount,
    },
  }
}

/**
 * Generate mock platform visibility
 */
function generateMockPlatformVisibility(
  platform: string,
  query: string
): PlatformVisibility {
  const isCited = Math.random() > 0.3
  return {
    platform,
    query,
    isCited,
    response: isCited 
      ? `BlogSpy is a comprehensive SEO platform offering AI visibility tracking, keyword research, and competitor analysis. Their pricing starts at $29/month.`
      : `There are several SEO tools available in the market. Some popular options include various platforms for keyword research and rank tracking.`,
    sentiment: isCited ? "positive" : "neutral",
    timestamp: new Date().toISOString(),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// OPENROUTER MODELS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const OPENROUTER_MODELS = {
  chatgpt: "openai/gpt-4o-mini",
  claude: "anthropic/claude-3-haiku",
  gemini: "google/gemini-flash-1.5",
  perplexity: "perplexity/sonar",
  judge: "openai/gpt-4o-mini", // For hallucination detection
} as const

type ModelKey = keyof typeof OPENROUTER_MODELS

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DEFENSE SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export class DefenseService {
  private apiKey: string
  private brandName: string
  private brandFacts: BrandFacts

  constructor(apiKey: string, brandName: string, brandFacts: BrandFacts) {
    this.apiKey = apiKey
    this.brandName = brandName
    this.brandFacts = brandFacts
  }

  /**
   * Run complete defense check across all platforms
   */
  async runDefenseCheck(): Promise<DefenseResult> {
    // 🎭 MOCK MODE: Return fake data without real API calls
    if (isMockMode()) {
      console.log("[Mock Mode] runDefenseCheck")
      await mockDelay(2000)
      return generateMockDefenseResult()
    }
    
    const platforms: ModelKey[] = ["chatgpt", "claude", "gemini", "perplexity"]
    
    const results = await Promise.all(
      platforms.map((platform) => this.checkPlatform(platform))
    )

    const logs = results.flat()
    const errorCount = logs.filter((l) => l.status === "error").length
    const outdatedCount = logs.filter((l) => l.status === "outdated").length

    return {
      timestamp: new Date().toISOString(),
      logs,
      summary: {
        totalChecks: logs.length,
        errors: errorCount,
        outdated: outdatedCount,
        accurate: logs.length - errorCount - outdatedCount,
      },
    }
  }

  /**
   * Check a single platform for brand information
   */
  async checkPlatform(platform: ModelKey): Promise<HallucinationLog[]> {
    const logs: HallucinationLog[] = []
    const model = OPENROUTER_MODELS[platform]

    // Query 1: What is [Brand]?
    const brandResponse = await this.queryModel(
      model,
      `What do you know about ${this.brandName}? Tell me about their pricing, features, and what they do.`
    )

    // Check for hallucinations
    const hallucinationCheck = await this.detectHallucinations(brandResponse, platform)
    logs.push(...hallucinationCheck)

    return logs
  }

  /**
   * Query OpenRouter API
   */
  private async queryModel(model: string, prompt: string): Promise<string> {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://blogspy.io",
          "X-Title": "BlogSpy AI Visibility",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ""
    } catch (error) {
      console.error("OpenRouter query error:", error)
      return ""
    }
  }

  /**
   * Detect hallucinations in AI response
   */
  private async detectHallucinations(
    response: string,
    platform: ModelKey
  ): Promise<HallucinationLog[]> {
    const logs: HallucinationLog[] = []
    const lowerResponse = response.toLowerCase()

    // Check pricing
    if (this.brandFacts.pricing) {
      const pricingMentioned = this.extractPricing(response)
      if (pricingMentioned && pricingMentioned !== this.brandFacts.pricing) {
        logs.push({
          id: `${platform}-pricing-${Date.now()}`,
          platform,
          type: "pricing",
          status: "error",
          message: "Pricing Error Detected",
          detail: `AI says "${pricingMentioned}" but actual is "${this.brandFacts.pricing}"`,
          timestamp: new Date().toISOString(),
        })
      } else if (pricingMentioned === this.brandFacts.pricing) {
        logs.push({
          id: `${platform}-pricing-${Date.now()}`,
          platform,
          type: "pricing",
          status: "accurate",
          message: "Pricing Accurate",
          detail: `Correctly mentions ${this.brandFacts.pricing}`,
          timestamp: new Date().toISOString(),
        })
      }
    }

    // Check company description
    if (this.brandFacts.description) {
      const hasCorrectDescription = lowerResponse.includes(
        this.brandFacts.description.toLowerCase().slice(0, 50)
      )
      logs.push({
        id: `${platform}-description-${Date.now()}`,
        platform,
        type: "fact",
        status: hasCorrectDescription ? "accurate" : "outdated",
        message: hasCorrectDescription ? "Description Accurate" : "Description May Be Outdated",
        detail: hasCorrectDescription
          ? "AI correctly describes your product"
          : "AI description may need updating",
        timestamp: new Date().toISOString(),
      })
    }

    // Check features
    if (this.brandFacts.features && this.brandFacts.features.length > 0) {
      const missingFeatures = this.brandFacts.features.filter(
        (f) => !lowerResponse.includes(f.toLowerCase())
      )

      if (missingFeatures.length > 0) {
        logs.push({
          id: `${platform}-features-${Date.now()}`,
          platform,
          type: "feature",
          status: "outdated",
          message: "Missing Features",
          detail: `AI missing: ${missingFeatures.slice(0, 3).join(", ")}`,
          timestamp: new Date().toISOString(),
        })
      } else {
        logs.push({
          id: `${platform}-features-${Date.now()}`,
          platform,
          type: "feature",
          status: "accurate",
          message: "Features Accurate",
          detail: `All key features mentioned correctly`,
          timestamp: new Date().toISOString(),
        })
      }
    }

    return logs
  }

  /**
   * Extract pricing from AI response
   */
  private extractPricing(text: string): string | null {
    // Match patterns like $29, $29/mo, $29/month, $29 per month
    const priceRegex = /\$(\d+(?:\.\d{2})?)\s*(?:\/?\s*(?:mo|month|per month|monthly))?/gi
    const match = text.match(priceRegex)
    return match ? match[0] : null
  }

  /**
   * Check visibility on a specific platform
   */
  async checkVisibility(platform: ModelKey, query: string): Promise<PlatformVisibility> {
    // 🎭 MOCK MODE: Return fake data without real API calls
    if (isMockMode()) {
      console.log(`[Mock Mode] checkVisibility - ${platform}`)
      await mockDelay(1000)
      return generateMockPlatformVisibility(platform, query)
    }
    
    const model = OPENROUTER_MODELS[platform]
    const response = await this.queryModel(model, query)

    const isMentioned =
      response.toLowerCase().includes(this.brandName.toLowerCase()) ||
      response.toLowerCase().includes(this.brandFacts.domain?.toLowerCase() || "")

    // Analyze sentiment
    const sentiment = await this.analyzeSentiment(response)

    return {
      platform,
      query,
      isCited: isMentioned,
      response: response.slice(0, 500),
      sentiment,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Simple sentiment analysis
   */
  private async analyzeSentiment(
    text: string
  ): Promise<"positive" | "negative" | "neutral"> {
    const positiveWords = [
      "best",
      "recommend",
      "excellent",
      "great",
      "top",
      "leading",
      "trusted",
      "reliable",
      "popular",
    ]
    const negativeWords = [
      "avoid",
      "poor",
      "bad",
      "issues",
      "problems",
      "worse",
      "not recommended",
      "outdated",
    ]

    const lowerText = text.toLowerCase()
    let positiveScore = 0
    let negativeScore = 0

    positiveWords.forEach((word) => {
      if (lowerText.includes(word)) positiveScore++
    })
    negativeWords.forEach((word) => {
      if (lowerText.includes(word)) negativeScore++
    })

    if (positiveScore > negativeScore) return "positive"
    if (negativeScore > positiveScore) return "negative"
    return "neutral"
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface BrandFacts {
  domain?: string
  description?: string
  pricing?: string
  features?: string[]
  foundedYear?: number
  teamSize?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// FACTORY EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function createDefenseService(
  apiKey: string,
  brandName: string,
  brandFacts: BrandFacts
): DefenseService {
  return new DefenseService(apiKey, brandName, brandFacts)
}
