// AI Visibility Tracker Types
// Track how your content appears in AI responses (ChatGPT, Claude, Perplexity, etc.)

export type AIPlatform = 'chatgpt' | 'claude' | 'perplexity' | 'gemini' | 'copilot' | 'you-com'

export type CitationType = 'direct-quote' | 'paraphrase' | 'reference' | 'recommendation' | 'source-link'

export type VisibilityTrend = 'rising' | 'stable' | 'declining'

export interface AIPlatformConfig {
  id: AIPlatform
  name: string
  logo: string
  color: string
  bgColor: string
  marketShare: number // % of AI search market
  citationStyle: string
  description: string
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
  chatgpt: number
  claude: number
  perplexity: number
  gemini: number
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
