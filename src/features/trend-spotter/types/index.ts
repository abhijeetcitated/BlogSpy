// ============================================
// TYPES: Trend Spotter Feature
// ============================================

// Season types
export type Season = "winter" | "spring" | "summer" | "fall"

// Event categories for the trend calendar
export type EventCategory = 
  | "Shopping" 
  | "Health" 
  | "Lifestyle" 
  | "Entertainment" 
  | "Travel" 
  | "Finance" 
  | "Environment" 
  | "Fashion" 
  | "Food" 
  | "Media" 
  | "Tech" 
  | "Sports" 
  | "Education" 
  | "All"

// Data sources for events
export type EventSource = 
  | "seasonal" 
  | "google_trends" 
  | "news" 
  | "industry" 
  | "custom" 
  | "historical"

// Industry/niche filter options
export type IndustryNiche = 
  | "All" 
  | "Tech" 
  | "Health" 
  | "Finance" 
  | "E-commerce" 
  | "SaaS" 
  | "Marketing" 
  | "Travel" 
  | "Food" 
  | "Fashion" 
  | "Education"

// Traffic impact levels
export type TrafficImpact = "high" | "medium" | "low"

// Calendar view modes
export type CalendarView = "grid" | "list" | "timeline"

// ============================================
// INTERFACES
// ============================================

// Country data structure
export interface Country {
  code: string
  name: string
  flag: string
}

// Country interest data for heatmap
export interface CountryInterest {
  volume: number
  percentage: number
}

// City/Region data
export interface CityData {
  name: string
  value: number
}

// Single event in the seasonal calendar
export interface SeasonalEvent {
  name: string
  keyword: string
  predictedVolume: string
  confidence: number
  category: EventCategory
  yoyGrowth: number
  trafficImpact: TrafficImpact
  exactDate: string // Format: "MM-DD"
  source: EventSource
  isCustom?: boolean
  lastYearRank?: number
  competitorCount?: number
}

// Monthly trend data
export interface SeasonalTrend {
  month: string
  monthIndex: number
  year: number
  season: Season
  events: SeasonalEvent[]
}

// Velocity chart data point
export interface VelocityDataPoint {
  month: string
  actual: number | null
  forecast: number | null
}

// News item for triggering events
export interface NewsItem {
  source: string
  logo: string
  headline: string
  time: string
  sentiment: "Positive" | "Neutral" | "Negative"
}

// Related topic item
export interface RelatedTopic {
  topic: string
  growth: string | null
  status: "Rising" | "Top"
}

// Breakout query item
export interface BreakoutQuery {
  query: string
  growth: string
  isBreakout: boolean
}

// Map marker for hotspots
export interface MapMarker {
  name: string
  coordinates: [number, number]
  intensity: number
}

// Tooltip state for map
export interface TooltipState {
  show: boolean
  content: string
  x: number
  y: number
}

// Platform option for filters
export interface PlatformOption {
  value: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
}

// Source configuration
export interface SourceConfig {
  label: string
  icon: string
  color: string
  bgColor: string
}

// Category configuration
export interface CategoryConfig {
  color: string
  bgColor: string
}

// Traffic impact configuration
export interface TrafficImpactConfig {
  label: string
  color: string
  bg: string
}

// ============================================
// PUBLISH TIMING TYPES
// ============================================

export type UrgencyLevel = "critical" | "high" | "medium" | "low"

export interface PublishTimingData {
  /** Current position on timeline (0-100) */
  currentPosition: number
  /** Start date of publish window */
  windowStart: string
  /** End date of publish window */
  windowEnd: string
  /** Days remaining in window */
  daysRemaining: number
  /** Optimal publish date */
  optimalDate: string
  /** Optimal day of week */
  optimalDay: string
  /** Urgency level */
  urgency: UrgencyLevel
  /** Urgency reason */
  urgencyReason: string
}

// ============================================
// CONTENT TYPE SUGGESTER TYPES
// ============================================

export type ContentType = "blog" | "video" | "social"

export interface ContentTypeSuggestion {
  type: ContentType
  label: string
  matchScore: number
  stars: number
  actionLabel: string
  actionUrl: string
}

export interface ContentTypeData {
  recommendations: ContentTypeSuggestion[]
  insight: string
  primaryType: ContentType
}

// ============================================
// TREND ALERT TYPES
// ============================================

export interface TrendAlertSettings {
  keyword: string
  velocityIncrease: boolean
  breakoutQuery: boolean
  competitorPublish: boolean
  notifyVia: {
    email: boolean
    push: boolean
    slack: boolean
  }
}
