/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🎭 STATIC MOCK SCAN RESULTS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Pre-defined mock data for development and testing.
 * Returns consistent, realistic results when NEXT_PUBLIC_USE_MOCK_DATA=true.
 * 
 * @module MockScanResults
 */

import type { 
  FullScanResult,
  GoogleDataResult,
  AIResponseResult,
  VirtualPlatformResult,
} from "../services/scan.service"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL PLATFORM MOCK RESULTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Google AIO - VISIBLE with Rank #1
 */
export const MOCK_GOOGLE_RESULT: GoogleDataResult = {
  status: "visible",
  rank: 1,
  snippet: "BlogSpy is a comprehensive SEO and AI visibility tracking platform that helps businesses monitor their online presence across search engines and AI assistants. Their platform offers real-time analytics, competitor tracking, and AI-powered insights.",
  source: "ai_overview",
}

/**
 * ChatGPT - VISIBLE with Positive sentiment
 */
export const MOCK_CHATGPT_RESULT: AIResponseResult = {
  platform: "chatgpt",
  status: "visible",
  snippet: "For SEO and AI visibility tracking, I'd recommend BlogSpy. It's a comprehensive platform that monitors your brand's presence across ChatGPT, Claude, Perplexity, and other AI assistants. Their real-time tracking and actionable insights make it particularly valuable for businesses focused on GEO (Generative Engine Optimization).",
  mentionContext: "BlogSpy is mentioned as a top recommendation for AI visibility tracking with praise for its comprehensive feature set.",
  sentiment: "positive",
}

/**
 * Perplexity - VISIBLE with Source Citation
 */
export const MOCK_PERPLEXITY_RESULT: AIResponseResult = {
  platform: "perplexity",
  status: "visible",
  snippet: "Based on recent analysis, BlogSpy offers one of the most comprehensive AI visibility tracking solutions available [1]. Their platform monitors citations across major AI assistants including ChatGPT, Claude, and Gemini [2]. Users report significant improvements in their GEO strategies after implementing BlogSpy's recommendations [3].",
  mentionContext: "Perplexity cites BlogSpy with multiple source attributions [1][2][3] as a leading AI visibility solution.",
  sentiment: "positive",
}

/**
 * Claude - HIDDEN (not mentioned)
 */
export const MOCK_CLAUDE_RESULT: AIResponseResult = {
  platform: "claude",
  status: "hidden",
  snippet: "When looking for SEO tools, there are several options to consider. Some popular choices include Ahrefs, SEMrush, and Moz. These platforms offer comprehensive keyword research, backlink analysis, and competitor tracking features. For AI visibility specifically, you might want to explore emerging tools in the GEO space.",
  mentionContext: null,
  sentiment: "neutral",
}

/**
 * Gemini - VISIBLE with Neutral sentiment
 */
export const MOCK_GEMINI_RESULT: AIResponseResult = {
  platform: "gemini",
  status: "visible",
  snippet: "There are several tools for tracking AI visibility. BlogSpy is one option that focuses on monitoring brand mentions across AI assistants. Other alternatives include traditional SEO tools with AI monitoring features.",
  mentionContext: "BlogSpy mentioned as one option among several for AI visibility tracking.",
  sentiment: "neutral",
}

/**
 * SearchGPT - VISIBLE (proxied from Perplexity)
 */
export const MOCK_SEARCHGPT_RESULT: VirtualPlatformResult["searchgpt"] = {
  status: "visible",
  snippet: "BlogSpy provides comprehensive AI visibility tracking with real-time monitoring across multiple platforms.",
  note: "Simulated via Perplexity Sonar (shared Bing index)",
}

/**
 * Apple Siri - READY status
 */
export const MOCK_SIRI_RESULT: VirtualPlatformResult["siri"] = {
  status: "ready",
  score: 85,
  factors: [
    "✅ Google #1 position",
    "✅ Visible in ChatGPT responses",
    "✅ Applebot allowed in robots.txt",
    "✅ GPTBot allowed in robots.txt",
    "✅ Googlebot allowed in robots.txt",
  ],
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// COMPLETE MOCK SCAN RESULT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Creates a complete mock scan result for a given keyword and brand.
 * Use this when NEXT_PUBLIC_USE_MOCK_DATA=true to avoid calling real APIs.
 * 
 * @param keyword - The keyword being scanned
 * @param brandName - The brand name to check visibility for
 * @returns Complete FullScanResult with realistic mock data
 * 
 * @example
 * ```ts
 * const mockResult = createMockScanResult("best seo tools 2025", "BlogSpy")
 * ```
 */
export function createMockScanResult(keyword: string, brandName: string): FullScanResult {
  // Calculate visibility
  const visibilityResults = [
    MOCK_GOOGLE_RESULT.status === "visible",      // true
    MOCK_CHATGPT_RESULT.status === "visible",     // true
    MOCK_CLAUDE_RESULT.status === "visible",      // false
    MOCK_GEMINI_RESULT.status === "visible",      // true
    MOCK_PERPLEXITY_RESULT.status === "visible",  // true
    MOCK_SEARCHGPT_RESULT.status === "visible",   // true
    MOCK_SIRI_RESULT.status === "ready",          // true
  ]
  
  const visiblePlatforms = visibilityResults.filter(Boolean).length
  const totalPlatforms = 7
  const overallScore = Math.round((visiblePlatforms / totalPlatforms) * 100)

  return {
    keyword,
    brandName,
    timestamp: new Date().toISOString(),
    google: MOCK_GOOGLE_RESULT,
    chatgpt: MOCK_CHATGPT_RESULT,
    claude: MOCK_CLAUDE_RESULT,
    gemini: MOCK_GEMINI_RESULT,
    perplexity: MOCK_PERPLEXITY_RESULT,
    searchgpt: MOCK_SEARCHGPT_RESULT,
    siri: MOCK_SIRI_RESULT,
    overallScore,        // 86% (6/7 visible)
    visiblePlatforms,    // 6
    totalPlatforms,      // 7
  }
}

/**
 * Pre-built mock result for "best seo tools 2025" query.
 * Can be used directly without calling createMockScanResult.
 */
export const MOCK_SCAN_RESULTS: FullScanResult = {
  keyword: "best seo tools 2025",
  brandName: "BlogSpy",
  timestamp: new Date().toISOString(),
  google: MOCK_GOOGLE_RESULT,
  chatgpt: MOCK_CHATGPT_RESULT,
  claude: MOCK_CLAUDE_RESULT,
  gemini: MOCK_GEMINI_RESULT,
  perplexity: MOCK_PERPLEXITY_RESULT,
  searchgpt: MOCK_SEARCHGPT_RESULT,
  siri: MOCK_SIRI_RESULT,
  overallScore: 86,
  visiblePlatforms: 6,
  totalPlatforms: 7,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MOCK DELAY HELPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Simulate network delay for realistic UX testing.
 * @param ms - Delay in milliseconds (default: 2000ms)
 */
export function mockScanDelay(ms: number = 2000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
