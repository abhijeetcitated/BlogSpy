// ============================================
// AI WRITER - Type Definitions
// ============================================

// NLP Keywords for SEO optimization
export interface NLPKeyword {
  text: string
  used: boolean
}

// Critical SEO issue configuration
export interface CriticalIssue {
  id: string
  text: string
  check: (stats: EditorStats) => boolean
}

// Editor statistics for SEO analysis
export interface EditorStats {
  wordCount: number
  characterCount: number
  headingCount: { h1: number; h2: number; h3: number }
  paragraphCount: number
  imageCount: number
  linkCount: number
  keywordDensity: number
  keywordCount: number
  content: string
}

// AI Action types
export type AIAction = "faq" | "conclusion" | "expand" | "rewrite" | "shorten" | null

// Competitor data
export interface CompetitorData {
  rank: number
  title: string
  domain: string
  wordCount: number
  headerCount: number
}
