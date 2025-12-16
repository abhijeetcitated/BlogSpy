// On-Page Checker Types

export interface PageStructureItem {
  tag: string
  content: string
  status: "good" | "error" | "warning"
}

export interface Issue {
  id: number
  title: string
  description: string
  element: string
  impact: "High" | "Medium" | "Low"
  canAiFix?: boolean
  aiSuggestion?: string
}

export interface PassedIssue {
  id: number
  title: string
  description: string
}

export interface IssuesData {
  errors: Issue[]
  warnings: Issue[]
  passed: PassedIssue[]
}

export interface NLPKeyword {
  keyword: string
  density: string
  volume: number
  status: "optimal" | "overused" | "underused"
  suggestion: string
}

export interface CurrentIssue {
  title: string
  description: string
  element: string
  impact: "High" | "Medium" | "Low"
  type: "error" | "warning"
}

export type PreviewDevice = "desktop" | "mobile"

export type IssueTabType = "errors" | "warnings" | "passed"

export interface ScoreInfo {
  score: number
  color: string
  glow: string
  message: string
}
