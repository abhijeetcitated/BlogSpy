// ============================================
// COMMUNITY DECAY SCORE TYPES
// ============================================
// Track freshness decay on community platforms
// Reddit/Quora posts in SERPs age and become opportunities
// Older community content = Higher opportunity to outrank
// ============================================

/**
 * Community Platform Types
 */
export type CommunityPlatform = 
  | "reddit"
  | "quora" 
  | "medium"
  | "stackexchange"
  | "discourse"
  | "hackernews"

/**
 * Decay Level based on content age
 */
export type DecayLevel = 
  | "fresh"      // 0-30 days
  | "aging"      // 31-90 days
  | "stale"      // 91-180 days
  | "decayed"    // 181-365 days
  | "ancient"    // 365+ days

/**
 * Opportunity Level based on decay
 */
export type CommunityOpportunityLevel = 
  | "excellent"  // Ancient/decayed + high volume
  | "high"       // Stale content
  | "moderate"   // Aging content
  | "low"        // Fresh content
  | "none"       // No community content in SERP

/**
 * Community Source in SERP
 */
export interface CommunitySource {
  /** Platform type */
  platform: CommunityPlatform
  /** URL of the community post */
  url: string
  /** Title/Question */
  title: string
  /** SERP rank position */
  rankPosition: number
  /** Age in days since posted */
  ageInDays: number
  /** Age in days since last activity (comment/edit) */
  lastActivityDays: number
  /** Engagement metrics */
  engagement: {
    upvotes: number
    comments: number
    views?: number
  }
  /** Is this marked as outdated by the community? */
  hasOutdatedFlag: boolean
  /** Has controversial/mixed opinions? */
  hasControversy: boolean
  /** Subreddit or category */
  subreddit?: string
  /** Quality score (0-100) */
  qualityScore: number
}

/**
 * Community Decay Analysis Result
 */
export interface CommunityDecayAnalysis {
  /** Keyword analyzed */
  keyword: string
  /** Are there community sources in SERP? */
  hasCommunityContent: boolean
  /** Community sources found */
  communitySources: CommunitySource[]
  /** Number of community sources in top 10 */
  communityCountInTop10: number
  /** Overall decay score (0-100, higher = more decayed = bigger opportunity) */
  decayScore: number
  /** Decay level */
  decayLevel: DecayLevel
  /** Opportunity level */
  opportunityLevel: CommunityOpportunityLevel
  /** Average age of community content */
  avgContentAge: number
  /** Oldest community content age */
  maxContentAge: number
  /** Best opportunity source */
  bestOpportunity: CommunitySource | null
  /** Recommendations */
  recommendations: CommunityDecayRecommendation[]
  /** Analysis timestamp */
  analyzedAt: string
}

/**
 * Community Decay Recommendation
 */
export interface CommunityDecayRecommendation {
  id: string
  priority: 1 | 2 | 3 | 4 | 5
  title: string
  description: string
  platform: CommunityPlatform
  targetRank: number
  potentialGain: string
  action: string
  effort: "quick" | "medium" | "significant"
}

/**
 * Decay Alert for Dashboard
 */
export interface CommunityDecayAlert {
  keyword: string
  platform: CommunityPlatform
  ageInDays: number
  rankPosition: number
  decayScore: number
  message: string
  actionUrl: string
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Platform display info
 */
export const PLATFORM_INFO: Record<CommunityPlatform, {
  name: string
  color: string
  bgColor: string
  icon: string
  weaknessLevel: number // 1-5, how easy to outrank
}> = {
  reddit: {
    name: "Reddit",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    icon: "MessageSquare",
    weaknessLevel: 4, // Very easy to outrank with quality content
  },
  quora: {
    name: "Quora",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    icon: "HelpCircle",
    weaknessLevel: 4,
  },
  medium: {
    name: "Medium",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    icon: "FileText",
    weaknessLevel: 3,
  },
  stackexchange: {
    name: "Stack Exchange",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    icon: "Code",
    weaknessLevel: 2, // Harder to outrank for technical
  },
  discourse: {
    name: "Discourse",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    icon: "MessageCircle",
    weaknessLevel: 4,
  },
  hackernews: {
    name: "Hacker News",
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    icon: "Terminal",
    weaknessLevel: 3,
  },
}

/**
 * Decay thresholds in days
 */
export const DECAY_THRESHOLDS = {
  FRESH: 30,
  AGING: 90,
  STALE: 180,
  DECAYED: 365,
  ANCIENT: 730, // 2 years
} as const

/**
 * Decay score multipliers by age bracket
 */
export const DECAY_SCORE_MULTIPLIERS = {
  FRESH: 0.1,     // 0-30 days: minimal opportunity
  AGING: 0.4,     // 31-90 days: some opportunity
  STALE: 0.7,     // 91-180 days: good opportunity
  DECAYED: 0.9,   // 181-365 days: excellent opportunity
  ANCIENT: 1.0,   // 365+ days: maximum opportunity
} as const

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get decay level from age in days
 */
export function getDecayLevel(ageInDays: number): DecayLevel {
  if (ageInDays <= DECAY_THRESHOLDS.FRESH) return "fresh"
  if (ageInDays <= DECAY_THRESHOLDS.AGING) return "aging"
  if (ageInDays <= DECAY_THRESHOLDS.STALE) return "stale"
  if (ageInDays <= DECAY_THRESHOLDS.DECAYED) return "decayed"
  return "ancient"
}

/**
 * Get decay color based on level
 */
export function getDecayColor(level: DecayLevel): string {
  const colors = {
    fresh: "text-emerald-400",
    aging: "text-yellow-400",
    stale: "text-orange-400",
    decayed: "text-red-400",
    ancient: "text-red-500",
  }
  return colors[level]
}

/**
 * Get decay background color based on level
 */
export function getDecayBgColor(level: DecayLevel): string {
  const colors = {
    fresh: "bg-emerald-500/20 border-emerald-500/30",
    aging: "bg-yellow-500/20 border-yellow-500/30",
    stale: "bg-orange-500/20 border-orange-500/30",
    decayed: "bg-red-500/20 border-red-500/30",
    ancient: "bg-red-600/20 border-red-600/30",
  }
  return colors[level]
}

/**
 * Get opportunity color
 */
export function getOpportunityColor(level: CommunityOpportunityLevel): string {
  const colors = {
    excellent: "text-emerald-400",
    high: "text-green-400",
    moderate: "text-amber-400",
    low: "text-slate-400",
    none: "text-slate-500",
  }
  return colors[level]
}

/**
 * Get opportunity bg color
 */
export function getOpportunityBgColor(level: CommunityOpportunityLevel): string {
  const colors = {
    excellent: "bg-emerald-500/20 border-emerald-500/30",
    high: "bg-green-500/20 border-green-500/30",
    moderate: "bg-amber-500/20 border-amber-500/30",
    low: "bg-slate-500/20 border-slate-500/30",
    none: "bg-slate-600/20 border-slate-600/30",
  }
  return colors[level]
}

/**
 * Format age in human readable format
 */
export function formatAge(days: number): string {
  if (days < 7) return `${days}d`
  if (days < 30) return `${Math.floor(days / 7)}w`
  if (days < 365) return `${Math.floor(days / 30)}mo`
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  return months > 0 ? `${years}y ${months}mo` : `${years}y`
}

/**
 * Get decay level label
 */
export function getDecayLevelLabel(level: DecayLevel): string {
  const labels = {
    fresh: "Fresh",
    aging: "Aging",
    stale: "Stale",
    decayed: "Decayed",
    ancient: "Ancient",
  }
  return labels[level]
}

/**
 * Get opportunity level label
 */
export function getOpportunityLabel(level: CommunityOpportunityLevel): string {
  const labels = {
    excellent: "Excellent Opportunity",
    high: "High Opportunity",
    moderate: "Moderate Opportunity",
    low: "Low Opportunity",
    none: "No Opportunity",
  }
  return labels[level]
}

/**
 * Calculate decay score from age
 */
export function calculateDecayScoreFromAge(ageInDays: number): number {
  if (ageInDays <= DECAY_THRESHOLDS.FRESH) {
    return Math.round((ageInDays / DECAY_THRESHOLDS.FRESH) * 20)
  }
  if (ageInDays <= DECAY_THRESHOLDS.AGING) {
    return 20 + Math.round(((ageInDays - DECAY_THRESHOLDS.FRESH) / (DECAY_THRESHOLDS.AGING - DECAY_THRESHOLDS.FRESH)) * 25)
  }
  if (ageInDays <= DECAY_THRESHOLDS.STALE) {
    return 45 + Math.round(((ageInDays - DECAY_THRESHOLDS.AGING) / (DECAY_THRESHOLDS.STALE - DECAY_THRESHOLDS.AGING)) * 25)
  }
  if (ageInDays <= DECAY_THRESHOLDS.DECAYED) {
    return 70 + Math.round(((ageInDays - DECAY_THRESHOLDS.STALE) / (DECAY_THRESHOLDS.DECAYED - DECAY_THRESHOLDS.STALE)) * 20)
  }
  return Math.min(90 + Math.round((ageInDays - DECAY_THRESHOLDS.DECAYED) / 365 * 10), 100)
}

/**
 * Get opportunity level from decay score
 */
export function getOpportunityFromDecayScore(
  decayScore: number, 
  hasCommunityContent: boolean
): CommunityOpportunityLevel {
  if (!hasCommunityContent) return "none"
  if (decayScore >= 80) return "excellent"
  if (decayScore >= 60) return "high"
  if (decayScore >= 40) return "moderate"
  return "low"
}
