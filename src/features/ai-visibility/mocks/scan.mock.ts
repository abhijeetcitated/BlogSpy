/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🎭 MOCK DATA - AI Visibility Scan
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Realistic mock responses for development and testing.
 * Simulates API latency with configurable delays.
 * 
 * @module ScanMock
 */

import type { 
  GoogleDataResult, 
  AIResponseResult, 
  FullScanResult,
} from "../types"
import type { AIPlatform } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MOCK DELAY HELPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Simulate API latency with random jitter
 */
export function mockDelay(baseMs: number = 1500): Promise<void> {
  const jitter = Math.random() * 500 // 0-500ms jitter
  return new Promise(resolve => setTimeout(resolve, baseMs + jitter))
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MOCK GOOGLE DATA
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function getMockGoogleData(keyword: string, brandName: string): GoogleDataResult {
  // Simulate ~60% visibility rate
  const isVisible = Math.random() > 0.4
  
  if (isVisible) {
    const sources: GoogleDataResult["source"][] = ["ai_overview", "featured_snippet", "organic"]
    const source = sources[Math.floor(Math.random() * sources.length)]
    
    return {
      status: "visible",
      rank: Math.floor(Math.random() * 5) + 1,
      snippet: `${brandName} provides comprehensive solutions for ${keyword}. Their platform includes advanced analytics, real-time monitoring, and AI-powered insights.`,
      source,
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
// MOCK AI RESPONSES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const MOCK_AI_RESPONSES: Record<AIPlatform, (keyword: string, brandName: string) => AIResponseResult> = {
  "google-aio": (keyword, brandName) => ({
    platform: "google-aio",
    status: Math.random() > 0.3 ? "visible" : "hidden",
    snippet: `Based on current search trends, ${brandName} is frequently mentioned in relation to ${keyword}. They offer competitive pricing and comprehensive features.`,
    mentionContext: `In the context of ${keyword}, ${brandName} stands out for its innovative approach.`,
    sentiment: "positive",
  }),
  
  "google-ai-mode": (keyword, brandName) => ({
    platform: "google-ai-mode",
    status: Math.random() > 0.35 ? "visible" : "hidden",
    snippet: `In an interactive AI session about ${keyword}, ${brandName} was highlighted for its comprehensive toolset and strong industry presence. Users can explore more by asking follow-up questions.`,
    mentionContext: `Google AI Mode cites ${brandName} in conversational context for ${keyword}.`,
    sentiment: Math.random() > 0.5 ? "positive" : "neutral",
  }),
  
  chatgpt: (keyword, brandName) => ({
    platform: "chatgpt",
    status: Math.random() > 0.35 ? "visible" : "hidden",
    snippet: `When considering ${keyword}, several options come to mind. ${brandName} is notable for its robust feature set and user-friendly interface. They provide excellent value for businesses looking to optimize their workflow.`,
    mentionContext: `${brandName} is mentioned as a recommended solution for ${keyword}.`,
    sentiment: Math.random() > 0.7 ? "positive" : "neutral",
  }),
  
  perplexity: (keyword, brandName) => ({
    platform: "perplexity",
    status: Math.random() > 0.3 ? "visible" : "hidden",
    snippet: `According to recent sources, ${brandName} offers solutions for ${keyword}. [1] Their platform has been reviewed positively by industry experts. [2]`,
    mentionContext: `Perplexity cites ${brandName} with source attribution for ${keyword}.`,
    sentiment: "positive",
  }),
  
  claude: (keyword, brandName) => ({
    platform: "claude",
    status: Math.random() > 0.4 ? "visible" : "hidden",
    snippet: `For ${keyword}, I'd suggest looking at ${brandName}. They have a strong reputation for quality and support. Their platform integrates well with existing workflows and offers competitive pricing.`,
    mentionContext: `Claude recommends ${brandName} in the ${keyword} category.`,
    sentiment: Math.random() > 0.6 ? "positive" : "neutral",
  }),
  
  gemini: (keyword, brandName) => ({
    platform: "gemini",
    status: Math.random() > 0.45 ? "visible" : "hidden",
    snippet: `When researching ${keyword}, ${brandName} appears as a reputable option. They offer a range of features including real-time analytics and AI-powered insights.`,
    mentionContext: `Gemini mentions ${brandName} for ${keyword} queries.`,
    sentiment: "neutral",
  }),
  

}

export function getMockAIResponse(keyword: string, brandName: string, platform: AIPlatform): AIResponseResult {
  const generator = MOCK_AI_RESPONSES[platform]
  if (generator) {
    return generator(keyword, brandName)
  }
  
  // Fallback
  return {
    platform,
    status: "hidden",
    snippet: "",
    mentionContext: null,
    sentiment: "neutral",
    error: "Platform not supported in mock mode",
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// FULL MOCK SCAN
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export async function getMockFullScanResult(
  keyword: string, 
  brandName: string,
  brandDomain: string,
): Promise<FullScanResult> {
  // Simulate realistic API delay (1.5-2.5s)
  await mockDelay(2000)
  
  const timestamp = new Date().toISOString()
  
  // Generate mock data for each platform
  const google = getMockGoogleData(keyword, brandName)
  const googleAiMode = getMockGoogleData(keyword, brandName)
  const chatgpt = getMockAIResponse(keyword, brandName, "chatgpt")
  const claude = getMockAIResponse(keyword, brandName, "claude")
  const gemini = getMockAIResponse(keyword, brandName, "gemini")
  const perplexity = getMockAIResponse(keyword, brandName, "perplexity")
  
  // Calculate overall score
  const visibilityResults = [
    google.status === "visible",
    googleAiMode.status === "visible",
    chatgpt.status === "visible",
    claude.status === "visible",
    gemini.status === "visible",
    perplexity.status === "visible",
  ]
  
  const visiblePlatforms = visibilityResults.filter(Boolean).length
  const totalPlatforms = 6
  const overallScore = Math.round((visiblePlatforms / totalPlatforms) * 100)
  
  return {
    keyword,
    brandName,
    timestamp,
    google,
    googleAiMode,
    chatgpt,
    claude,
    gemini,
    perplexity,
    overallScore,
    visiblePlatforms,
    totalPlatforms,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MOCK SCAN HISTORY
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function getMockScanHistory(limit: number = 10): Array<{
  id: string
  keyword: string
  scannedAt: string
  overallScore: number
  visiblePlatforms: number
}> {
  const keywords = [
    "best project management software",
    "top CRM tools 2024",
    "AI writing assistant",
    "cloud storage comparison",
    "email marketing platforms",
    "website builder review",
    "accounting software small business",
    "team collaboration tools",
    "customer support software",
    "SEO tools comparison",
  ]
  
  return keywords.slice(0, limit).map((keyword, index) => ({
    id: `mock-${Date.now()}-${index}`,
    keyword,
    scannedAt: new Date(Date.now() - index * 86400000).toISOString(),
    overallScore: Math.floor(Math.random() * 40) + 40, // 40-80%
    visiblePlatforms: Math.floor(Math.random() * 4) + 2, // 2-5 platforms
  }))
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MOCK CREDIT BALANCE
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function getMockCreditBalance(): { available: number; used: number; total: number } {
  return {
    available: 45,
    used: 5,
    total: 50,
  }
}
