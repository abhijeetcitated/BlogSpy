// ============================================
// SNIPPET STEALER TYPES
// ============================================
// Types for featured snippet optimization
// Matches snippet-stealer-content.tsx
// ============================================

// Snippet Types
export type SnippetType = "paragraph" | "list" | "table"

// Snippet Status
export type SnippetStatus = "unclaimed" | "ranking"

// View Mode
export type SnippetViewMode = "editor" | "preview"

// Filter Type
export type SnippetFilterType = "all" | "paragraph" | "list" | "table"

// Snippet Opportunity Interface
export interface SnippetOpportunity {
  id: string
  keyword: string
  snippetType: SnippetType
  volume: number
  status: SnippetStatus
  currentRank?: number
  competitorSnippet: string
  competitorWordCount: number
  competitorReadingLevel: string
  competitorKeywords: number
  targetKeywords: string[]
}

// Snippet Analysis
export interface SnippetAnalysis {
  wordCount: number
  readingLevel: string
  keywordCount: number
  keywordDensity: number
  hasNumberedList: boolean
  hasBulletList: boolean
  hasTable: boolean
  score: number // 0-100
}

// Snippet Draft
export interface SnippetDraft {
  id: string
  opportunityId: string
  keyword: string
  content: string
  analysis: SnippetAnalysis
  createdAt: string
  updatedAt: string
}

// Snippet Comparison
export interface SnippetComparison {
  yourContent: SnippetAnalysis
  competitorContent: SnippetAnalysis
  improvements: string[]
  warnings: string[]
}

// Snippet Suggestion
export interface SnippetSuggestion {
  type: "add_keyword" | "shorten" | "add_list" | "add_numbers" | "simplify"
  message: string
  priority: "high" | "medium" | "low"
}

// Reading Level
export type ReadingLevel = 
  | "Grade 1-3" 
  | "Grade 4-5" 
  | "Grade 6-8" 
  | "Grade 9-12" 
  | "College" 
  | "Graduate"
