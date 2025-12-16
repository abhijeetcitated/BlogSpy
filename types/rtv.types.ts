// ============================================
// RTV (REALIZABLE TRAFFIC VOLUME) TYPES
// ============================================
// Traditional search volume is misleading
// AI Overview, Featured Snippets, Ads steal clicks
// RTV shows actual realistic traffic potential
// ============================================

/**
 * SERP Features that steal organic CTR
 */
export type CTRStealingFeature =
  | "ai_overview"        // Google AI Overview (biggest CTR killer)
  | "featured_snippet"   // Featured snippet box
  | "people_also_ask"    // PAA accordion
  | "video_carousel"     // Video results
  | "image_pack"         // Image pack
  | "local_pack"         // Local 3-pack
  | "shopping_ads"       // Shopping carousel
  | "top_ads"            // Top text ads (1-4)
  | "knowledge_panel"    // Knowledge panel
  | "top_stories"        // News carousel
  | "direct_answer"      // Instant answer box
  | "calculator"         // Calculator widget
  | "weather"            // Weather widget
  | "sports"             // Sports scores

/**
 * CTR Impact data for each SERP feature
 */
export interface CTRImpact {
  feature: CTRStealingFeature
  ctrLoss: number           // Percentage of CTR stolen (0-1)
  description: string       // Human readable description
  mitigationTip: string     // How to compete with this feature
}

/**
 * RTV Analysis result
 */
export interface RTVAnalysis {
  keyword: string
  rawVolume: number              // Original search volume
  rtv: number                    // Realizable Traffic Volume
  rtvPercentage: number          // RTV as % of raw volume
  organicCTR: number             // Expected organic CTR for position
  position: number               // Your ranking position (1-10)
  estimatedClicks: number        // Estimated monthly clicks
  serpFeatures: CTRStealingFeature[]  // Features present in SERP
  ctrBreakdown: CTRBreakdownItem[]    // Detailed CTR breakdown
  opportunityLevel: RTVOpportunityLevel
  recommendation: string
}

/**
 * CTR Breakdown item
 */
export interface CTRBreakdownItem {
  feature: CTRStealingFeature | "organic"
  label: string
  ctrShare: number          // Share of total CTR (0-1)
  volumeShare: number       // Estimated volume this gets
  color: string             // Display color
}

/**
 * RTV Opportunity levels
 */
export type RTVOpportunityLevel = "excellent" | "good" | "moderate" | "low" | "very_low"

/**
 * CTR loss rates by SERP feature (research-based estimates)
 * Source: Various CTR studies from Ahrefs, Semrush, SparkToro
 */
export const SERP_CTR_IMPACT: Record<CTRStealingFeature, CTRImpact> = {
  ai_overview: {
    feature: "ai_overview",
    ctrLoss: 0.40,  // AI Overview steals ~40% of clicks
    description: "AI Overview answers query directly",
    mitigationTip: "Optimize content to get cited in AI Overview"
  },
  featured_snippet: {
    feature: "featured_snippet",
    ctrLoss: 0.25,
    description: "Featured snippet shows answer directly",
    mitigationTip: "Structure content with lists, tables, definitions to win snippet"
  },
  people_also_ask: {
    feature: "people_also_ask",
    ctrLoss: 0.08,
    description: "PAA box captures some search intent",
    mitigationTip: "Answer PAA questions in your content"
  },
  video_carousel: {
    feature: "video_carousel",
    ctrLoss: 0.12,
    description: "Video results attract visual searchers",
    mitigationTip: "Create video content for this keyword"
  },
  image_pack: {
    feature: "image_pack",
    ctrLoss: 0.05,
    description: "Image pack captures visual searches",
    mitigationTip: "Optimize images with alt text and schema"
  },
  local_pack: {
    feature: "local_pack",
    ctrLoss: 0.20,
    description: "Local 3-pack dominates local intent",
    mitigationTip: "Optimize Google Business Profile for local pack"
  },
  shopping_ads: {
    feature: "shopping_ads",
    ctrLoss: 0.15,
    description: "Shopping ads capture buying intent",
    mitigationTip: "Consider Google Shopping campaigns"
  },
  top_ads: {
    feature: "top_ads",
    ctrLoss: 0.10,
    description: "Top ads capture high-intent clicks",
    mitigationTip: "Consider PPC for high-value keywords"
  },
  knowledge_panel: {
    feature: "knowledge_panel",
    ctrLoss: 0.08,
    description: "Knowledge panel answers entity queries",
    mitigationTip: "Build entity presence and Wikipedia page"
  },
  top_stories: {
    feature: "top_stories",
    ctrLoss: 0.10,
    description: "News carousel captures trending searches",
    mitigationTip: "Publish timely content for news inclusion"
  },
  direct_answer: {
    feature: "direct_answer",
    ctrLoss: 0.35,
    description: "Direct answer eliminates need to click",
    mitigationTip: "Target questions without direct answers"
  },
  calculator: {
    feature: "calculator",
    ctrLoss: 0.50,
    description: "Calculator widget handles query entirely",
    mitigationTip: "Avoid targeting calculator queries"
  },
  weather: {
    feature: "weather",
    ctrLoss: 0.60,
    description: "Weather widget shows info directly",
    mitigationTip: "Avoid targeting weather queries"
  },
  sports: {
    feature: "sports",
    ctrLoss: 0.45,
    description: "Sports widget shows scores directly",
    mitigationTip: "Avoid targeting live sports queries"
  }
}

/**
 * Base organic CTR by position (no SERP features)
 * Source: Advanced Web Ranking, Backlinko studies
 */
export const ORGANIC_CTR_BY_POSITION: Record<number, number> = {
  1: 0.316,   // 31.6% CTR for position 1
  2: 0.152,   // 15.2%
  3: 0.096,   // 9.6%
  4: 0.065,   // 6.5%
  5: 0.047,   // 4.7%
  6: 0.035,   // 3.5%
  7: 0.028,   // 2.8%
  8: 0.022,   // 2.2%
  9: 0.019,   // 1.9%
  10: 0.016,  // 1.6%
}

/**
 * RTV Opportunity thresholds
 */
export const RTV_THRESHOLDS = {
  EXCELLENT: 0.70,   // 70%+ of volume is realizable
  GOOD: 0.50,        // 50-69%
  MODERATE: 0.30,    // 30-49%
  LOW: 0.15,         // 15-29%
  VERY_LOW: 0,       // <15%
} as const

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get RTV opportunity level
 */
export function getRTVOpportunityLevel(rtvPercentage: number): RTVOpportunityLevel {
  if (rtvPercentage >= RTV_THRESHOLDS.EXCELLENT) return "excellent"
  if (rtvPercentage >= RTV_THRESHOLDS.GOOD) return "good"
  if (rtvPercentage >= RTV_THRESHOLDS.MODERATE) return "moderate"
  if (rtvPercentage >= RTV_THRESHOLDS.LOW) return "low"
  return "very_low"
}

/**
 * Get color for RTV opportunity level
 */
export function getRTVColor(level: RTVOpportunityLevel): string {
  const colors: Record<RTVOpportunityLevel, string> = {
    excellent: "text-emerald-600 dark:text-emerald-400",
    good: "text-cyan-600 dark:text-cyan-400",
    moderate: "text-amber-600 dark:text-amber-400",
    low: "text-orange-600 dark:text-orange-400",
    very_low: "text-red-600 dark:text-red-400",
  }
  return colors[level]
}

/**
 * Get background color for RTV opportunity level
 */
export function getRTVBgColor(level: RTVOpportunityLevel): string {
  const colors: Record<RTVOpportunityLevel, string> = {
    excellent: "bg-emerald-500/20 border-emerald-500/30",
    good: "bg-cyan-500/20 border-cyan-500/30",
    moderate: "bg-amber-500/20 border-amber-500/30",
    low: "bg-orange-500/20 border-orange-500/30",
    very_low: "bg-red-500/20 border-red-500/30",
  }
  return colors[level]
}

/**
 * Get SERP feature display name
 */
export function getSERPFeatureName(feature: CTRStealingFeature): string {
  const names: Record<CTRStealingFeature, string> = {
    ai_overview: "AI Overview",
    featured_snippet: "Featured Snippet",
    people_also_ask: "People Also Ask",
    video_carousel: "Videos",
    image_pack: "Images",
    local_pack: "Local Pack",
    shopping_ads: "Shopping",
    top_ads: "Ads",
    knowledge_panel: "Knowledge Panel",
    top_stories: "Top Stories",
    direct_answer: "Direct Answer",
    calculator: "Calculator",
    weather: "Weather",
    sports: "Sports",
  }
  return names[feature]
}

/**
 * Get SERP feature icon color
 */
export function getSERPFeatureColor(feature: CTRStealingFeature): string {
  const colors: Record<CTRStealingFeature, string> = {
    ai_overview: "text-purple-400 bg-purple-500/20",
    featured_snippet: "text-blue-400 bg-blue-500/20",
    people_also_ask: "text-cyan-400 bg-cyan-500/20",
    video_carousel: "text-red-400 bg-red-500/20",
    image_pack: "text-pink-400 bg-pink-500/20",
    local_pack: "text-green-400 bg-green-500/20",
    shopping_ads: "text-orange-400 bg-orange-500/20",
    top_ads: "text-amber-400 bg-amber-500/20",
    knowledge_panel: "text-indigo-400 bg-indigo-500/20",
    top_stories: "text-rose-400 bg-rose-500/20",
    direct_answer: "text-teal-400 bg-teal-500/20",
    calculator: "text-slate-400 bg-slate-500/20",
    weather: "text-sky-400 bg-sky-500/20",
    sports: "text-lime-400 bg-lime-500/20",
  }
  return colors[feature]
}

/**
 * Format volume number
 */
export function formatVolume(volume: number): string {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
  return volume.toString()
}
