// ============================================
// CONTENT CALENDAR TYPES
// ============================================

import { ReactNode } from "react"

export type ContentNiche = 
  | "technology"
  | "health"
  | "finance"
  | "travel"
  | "food"
  | "lifestyle"
  | "entertainment"
  | "fashion"
  | "sports"
  | "education"
  | "all"

export type EventUrgency = "urgent" | "upcoming" | "planned" | "future"

export type EventStatus = "not-started" | "in-progress" | "published"

export interface CalendarEvent {
  id: string
  name: string
  keyword: string
  date: string // "MM-DD" format
  month: number // 0-11
  year: number
  predictedVolume: string
  yoyGrowth: number
  difficulty: "easy" | "medium" | "hard"
  niche: ContentNiche
  matchScore: number // 0-100 based on user's niche
  daysUntil: number
  urgency: EventUrgency
  description: string
  suggestedKeywords: string[]
  competitorCount?: number
}

export interface MyPlanItem {
  eventId: string
  event: CalendarEvent
  status: EventStatus
  notes?: string
  targetDate?: string
  addedAt: Date | string
}

export interface ContentCalendarState {
  selectedNiche: ContentNiche
  myPlan: MyPlanItem[]
  expandedEventId: string | null
}

// Niche configuration - Updated for React components
export interface NicheConfig {
  value: ContentNiche | "all"
  label: string
  icon: ReactNode
  color: string
  bgColor?: string
  borderColor?: string
}
