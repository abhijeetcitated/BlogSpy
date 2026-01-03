// ============================================
// CONTENT DECAY - Type Definitions
// ============================================

import type { SortDirection as SharedSortDirection } from "@/src/types/shared"

// Re-export shared types
export type SortDirection = SharedSortDirection

// Core decay types
export type DecayReason = "Competitor" | "Outdated" | "Missing Keywords" | "Schema Issues" | "Slow Load"
export type DecayStatus = "critical" | "watch" | "fixed" | "ignored"
export type MatrixZone = "critical" | "watch" | "low" | "stable"

// Sort types (feature-specific)
export type ContentDecaySortField = "trafficLoss" | "rankDrop" | "decayRate" | "title"
export type SortField = ContentDecaySortField

// Alert types
export type AlertSeverity = "critical" | "warning" | "info"
export type AlertChannel = "email" | "slack" | "whatsapp" | "push"

// Article interface
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
  decayRate: number
  trafficValue: number
  lastUpdated: string
}

// Matrix visualization
export interface MatrixPoint {
  x: number
  y: number
  id: string
  zone: MatrixZone
  articleId: string
}

// Recovered articles
export interface RecoveredArticle {
  id: string
  title: string
  trafficGain: string
  daysAgo: number
}

// Alert system
export interface DecayAlert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  timestamp: string
  articleId: string | null
  actionTaken: boolean
  channel: AlertChannel
}

// Alert preferences
export interface AlertPreferences {
  email: boolean
  slack: boolean
  whatsapp: boolean
  push: boolean
  criticalOnly: boolean
  dailyDigest: boolean
  instantAlerts: boolean
}

// Display mappings
export type DecayReasonDisplay = Record<DecayReason, string>
