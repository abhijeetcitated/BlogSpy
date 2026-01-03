// Cannibalization Types

import type { SortDirection as SharedSortDirection } from "@/src/types/shared"

// Re-export shared types
export type SortDirection = SharedSortDirection

export type CannibalizationSeverity = "critical" | "high" | "medium" | "low"

export type CannibalizationType = 
  | "same_keyword"
  | "similar_keyword"
  | "title_overlap"
  | "content_overlap"
  | "ranking_split"

export type CannibalizationAction = 
  | "merge"
  | "redirect"
  | "differentiate"
  | "canonical"
  | "noindex"
  | "reoptimize"

// Sort types (feature-specific)
export type CannibalizationSortField = "severity" | "trafficLoss" | "overlapScore" | "pages" | null
export type SortField = CannibalizationSortField
export type FilterSeverity = "all" | CannibalizationSeverity

export interface CannibalizingPage {
  url: string
  title: string
  targetKeyword: string
  currentRank: number | null
  bestRank: number | null
  traffic: number
  lastUpdated: string
  wordCount: number
  pageAuthority: number
  backlinks: number
  isPrimary: boolean
  // Additional metrics for comparison modal
  position?: number
  impressions?: number
  clicks?: number
  ctr?: number
  metaDescription?: string
  contentSnippet?: string
}

export interface CannibalizationIssue {
  id: string
  keyword: string
  searchVolume: number
  keywordDifficulty: number
  pages: CannibalizingPage[]
  type: CannibalizationType
  severity: CannibalizationSeverity
  overlapScore: number
  trafficLoss: number
  recommendedAction: CannibalizationAction
  recommendation: string
  potentialGain: number
  detectedAt: string
}

export interface CannibalizationAnalysis {
  domain: string
  totalPagesAnalyzed: number
  totalKeywordsAnalyzed: number
  issueCount: number
  issuesBySeverity: {
    critical: number
    high: number
    medium: number
    low: number
  }
  totalTrafficLoss: number
  totalPotentialGain: number
  healthScore: number
  issues: CannibalizationIssue[]
  analyzedAt: string
}

export interface CannibalizationTrend {
  date: string
  issues: number
  healthScore: number
}

export interface FixSuggestion {
  steps: string[]
  estimatedTime: string
  difficulty: "easy" | "medium" | "hard"
}
