// ============================================
// CONTENT DECAY TYPES
// ============================================
// Types for content decay tracking
// Matches content-decay-content.tsx
// ============================================

// Decay Reasons
export type DecayReason = 
  | "Competitor" 
  | "Outdated" 
  | "Missing Keywords" 
  | "Schema Issues" 
  | "Slow Load"

// Decay Status
export type DecayStatus = "critical" | "watch"

// Matrix Zone (for decay matrix visualization)
export type MatrixZone = "critical" | "watch" | "low" | "stable"

// Decay Article Interface
export interface DecayArticle {
  id: string
  title: string
  url: string
  currentRank: number
  previousRank: number
  trafficLoss: number
  decayReason: DecayReason
  trendData: number[]
  status: DecayStatus
  decayRate: number // 0-1 scale
  trafficValue: number // 0-1 scale
  lastUpdated: string
}

// Matrix Point (for visualization)
export interface MatrixPoint {
  x: number // decay rate
  y: number // traffic value
  id: string
  zone: MatrixZone
  articleId: string
}

// Recovered Article (success stories)
export interface RecoveredArticle {
  id: string
  title: string
  trafficGain: string
  daysAgo: number
}

// Decay Summary Stats
export interface DecaySummary {
  totalDecaying: number
  criticalCount: number
  watchCount: number
  totalTrafficLoss: number
  avgDecayRate: number
  recentlyRecovered: RecoveredArticle[]
}

// Recovery Action
export interface RecoveryAction {
  id: string
  type: "update_content" | "add_keywords" | "fix_schema" | "improve_speed" | "refresh_date"
  label: string
  description: string
  priority: "high" | "medium" | "low"
  estimatedImpact: string
}

// Article with Recovery Plan
export interface DecayArticleWithPlan extends DecayArticle {
  recoveryActions: RecoveryAction[]
  estimatedRecoveryDays: number
  competitorAnalysis?: {
    domain: string
    rank: number
    contentAge: string
  }[]
}
