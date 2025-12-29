// AI Visibility Tracker Types
// Track how your content appears in AI responses (ChatGPT, Claude, Perplexity, Google AIO, etc.)

// Updated platforms: Added Google AIO, SearchGPT, Apple Siri. Removed You.com
export type AIPlatform = 
  | 'google-aio'   // Google AI Overviews (via Serper.dev)
  | 'chatgpt'      // ChatGPT (via OpenRouter)
  | 'perplexity'   // Perplexity (via OpenRouter)
  | 'searchgpt'    // SearchGPT (via OpenRouter - Coming Soon)
  | 'claude'       // Claude (via OpenRouter)
  | 'gemini'       // Gemini (via OpenRouter)
  | 'apple-siri'   // Apple Siri (Readiness check only - no API)

export type CitationType = 'direct-quote' | 'paraphrase' | 'reference' | 'recommendation' | 'source-link'

export type VisibilityTrend = 'rising' | 'stable' | 'declining'

// Hallucination risk levels for Trust Score feature
export type HallucinationRisk = 'low' | 'medium' | 'high' | 'critical'

// Verdict types for Hallucination Defense Log
export type HallucinationVerdict = 'accurate' | 'hallucination' | 'outdated'

export interface AIPlatformConfig {
  id: AIPlatform
  name: string
  logo: string
  color: string
  bgColor: string
  marketShare: number // % of AI search market
  citationStyle: string
  description: string
  apiSource: 'serper' | 'openrouter' | 'internal' // API source for tracking
  isComingSoon?: boolean // For SearchGPT
  isReadinessOnly?: boolean // For Apple Siri (no direct API)
}

// NEW: Trust & Hallucination Stats for CFO Header Cards
export interface TrustMetrics {
  trustScore: number // 0-100 (Correct AI Answers / Total Checks * 100)
  hallucinationRisk: HallucinationRisk
  hallucinationCount: number // Number of detected hallucinations
  revenueAtRisk: number // $ value of traffic at risk
  aiReadinessScore: number // 0-100 technical readiness
  lastChecked: string
}

// NEW: Hallucination Defense Log Entry
export interface HallucinationLogEntry {
  id: string
  attackScenario: string // e.g., "Pricing Inquiry", "Feature Check"
  targetModel: AIPlatform
  verdict: HallucinationVerdict
  aiResponse: string // What AI said
  actualData: string // What's actually true
  evidence: string // Full AI response text
  detectedAt: string
  isResolved: boolean
}

// NEW: AI Technical Audit Result
export interface AITechnicalAudit {
  robotsTxt: {
    gptBotAllowed: boolean
    claudeBotAllowed: boolean
    appleBotAllowed: boolean
    googleBotAllowed: boolean
  }
  llmsTxt: {
    exists: boolean
    url?: string
  }
  schema: {
    organizationExists: boolean
    productExists: boolean
    priceSpecExists: boolean
    faqExists: boolean
  }
  overallScore: number // 0-100
}

export interface AICitation {
  id: string
  platform: AIPlatform
  query: string // The question/prompt that triggered the citation
  citedUrl: string
  citedTitle: string
  citationType: CitationType
  context: string // Surrounding text in AI response
  position: number // 1st, 2nd, 3rd mention in response
  timestamp: string
  sentiment: 'positive' | 'neutral' | 'negative'
  competitors: string[] // Other sites mentioned alongside
}

export interface ContentVisibility {
  contentId: string
  url: string
  title: string
  totalCitations: number
  platformBreakdown: Record<AIPlatform, number>
  avgPosition: number
  citationTypes: Record<CitationType, number>
  topQueries: string[]
  competitors: CompetitorMention[]
  trend: VisibilityTrend
  trendPercent: number
  visibilityScore: number // 0-100
  lastCited: string
}

export interface CompetitorMention {
  domain: string
  mentionCount: number
  avgPosition: number
  overlapQueries: number // How many queries they're cited together
}

export interface AIVisibilityStats {
  totalCitations: number
  uniqueQueries: number
  avgPosition: number
  visibilityScore: number
  platformLeader: AIPlatform
  topCitedContent: string
  weekOverWeekChange: number
  competitorComparison: number // vs industry avg
}

export interface PlatformStats {
  platform: AIPlatform
  citations: number
  avgPosition: number
  topQueries: string[]
  trend: VisibilityTrend
  lastUpdated: string
}

export interface VisibilityTrendData {
  date: string
  googleAio: number  // NEW: Google AI Overviews
  chatgpt: number
  perplexity: number
  claude: number
  gemini: number
  appleSiri: number  // Apple Siri readiness
  total: number
}

export interface QueryAnalysis {
  query: string
  frequency: number
  platforms: AIPlatform[]
  yourPosition: number
  topCompetitor: string
  competitorPosition: number
  opportunity: 'high' | 'medium' | 'low'
}

export interface AIVisibilityFilters {
  dateRange: '7d' | '30d' | '90d' | 'all'
  platforms: AIPlatform[]
  citationType: CitationType | null
  sortBy: 'citations' | 'position' | 'date' | 'score'
  sortOrder: 'asc' | 'desc'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVICE TYPES - Used by services/ and actions/
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Bot access status from robots.txt check
 */
export interface BotAccessStatus {
  botId: string
  botName: string
  platform: string
  isAllowed: boolean
  reason: string
}

/**
 * Schema.org validation result
 */
export interface SchemaValidation {
  hasSchema: boolean
  schemas: string[]
  errors: string[]
}

/**
 * Complete tech audit result
 */
export interface TechAuditResult {
  domain: string
  timestamp: string
  robotsTxt: BotAccessStatus[]
  llmsTxt: { exists: boolean; content: string | null }
  schema: SchemaValidation
  overallScore: number
}

/**
 * Hallucination log entry from defense service
 */
export interface HallucinationLog {
  id: string
  platform: string
  type: "pricing" | "fact" | "feature"
  status: "accurate" | "error" | "outdated"
  message: string
  detail: string
  timestamp: string
}

/**
 * Defense check result
 */
export interface DefenseResult {
  timestamp: string
  logs: HallucinationLog[]
  summary: {
    totalChecks: number
    errors: number
    outdated: number
    accurate: number
  }
}

/**
 * Platform visibility check result
 */
export interface PlatformVisibility {
  platform: string
  query: string
  isCited: boolean
  response: string
  sentiment: "positive" | "negative" | "neutral"
  timestamp: string
}

/**
 * Google AIO check result
 */
export interface GoogleAIOResult {
  query: string
  isVisible: boolean
  source: "answer_box" | "knowledge_graph" | "ai_overview" | null
  position: number | null
  context: string | null
  timestamp: string
}

/**
 * Google ranking result
 */
export interface RankingResult {
  query: string
  position: number | null
  url: string | null
  title: string | null
  snippet: string | null
  timestamp: string
}

/**
 * Citation check result (combines AIO + organic rank)
 */
export interface CitationResult {
  query: string
  googleAIO: GoogleAIOResult
  organicRank: number | null
  isCitedInAIO: boolean
  timestamp: string
}
