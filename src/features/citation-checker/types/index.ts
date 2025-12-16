// Citation Checker Types

export type CitationStatus = "cited" | "not-cited" | "partial" | "unknown"
export type CitationPosition = "top" | "middle" | "bottom" | "inline"
export type CitationTrend = "improving" | "declining" | "stable" | "new"
export type SortByOption = "volume" | "status" | "position" | "traffic"
export type SortOrder = "asc" | "desc"

export interface Citation {
  id: string
  keyword: string
  searchVolume: number
  aiOverviewPresent: boolean
  citationStatus: CitationStatus
  citedDomains: string[]
  position?: CitationPosition
  snippetPreview?: string
  yourPosition?: number
  totalCitations: number
  competitorsCited: string[]
  lastChecked: string
  trend: CitationTrend
}

export interface CitationSummary {
  totalKeywordsChecked: number
  keywordsWithAIOverview: number
  keywordsCited: number
  keywordsPartialCited: number
  keywordsNotCited: number
  citationRate: number
  avgPosition: number
  topCompetitors: { domain: string; count: number }[]
  opportunityKeywords: number
}

export interface CompetitorComparison {
  domain: string
  citedCount: number
  notCitedCount: number
  citationRate: number
}

export interface CitationAnalysis {
  domain: string
  summary: CitationSummary
  citations: Citation[]
  topCitedKeywords: Citation[]
  missedOpportunities: Citation[]
  competitorComparison: CompetitorComparison[]
  lastAnalyzed: string
}

export interface CitationTrendPoint {
  date: string
  citedCount: number
  totalAIOverviews: number
  citationRate: number
}

export interface FilterState {
  searchQuery: string
  sortBy: SortByOption
  sortOrder: SortOrder
  statusFilter: CitationStatus[]
  showOnlyWithAI: boolean
}
