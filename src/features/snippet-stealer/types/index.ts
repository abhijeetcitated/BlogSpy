// Snippet Stealer Types

export interface SnippetOpportunity {
  id: string
  keyword: string
  snippetType: "paragraph" | "list" | "table"
  volume: number
  status: "unclaimed" | "ranking"
  currentRank?: number
  competitorSnippet: string
  competitorWordCount: number
  competitorReadingLevel: string
  competitorKeywords: number
  targetKeywords: string[]
}

export type ViewMode = "editor" | "preview"

export type FilterType = "all" | "paragraph" | "list" | "table"

export interface WordCountStatus {
  color: string
  bg: string
  label: string
  ideal: boolean
}
