// ============================================
// PLATFORM OPPORTUNITY TYPES
// ============================================
// Types for Video, Commerce, and Social platform opportunities
// Used in Keyword Magic table for multi-platform discovery
// ============================================

/**
 * Opportunity Level (shared across all platforms)
 */
export type OpportunityLevel = 
  | "excellent"  // 80-100%
  | "high"       // 60-79%
  | "moderate"   // 40-59%
  | "low"        // 20-39%
  | "none"       // 0-19%

/**
 * Get opportunity level from score
 */
export function getOpportunityLevel(score: number): OpportunityLevel {
  if (score >= 80) return "excellent"
  if (score >= 60) return "high"
  if (score >= 40) return "moderate"
  if (score >= 20) return "low"
  return "none"
}

/**
 * Get color classes for opportunity level
 */
export function getPlatformOpportunityColor(level: OpportunityLevel): string {
  switch (level) {
    case "excellent":
      return "text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30 font-semibold"
    case "high":
      return "text-green-700 dark:text-green-400 bg-green-500/15 border-green-500/30 font-semibold"
    case "moderate":
      return "text-yellow-700 dark:text-yellow-400 bg-yellow-500/15 border-yellow-500/30 font-semibold"
    case "low":
      return "text-orange-700 dark:text-orange-400 bg-orange-500/15 border-orange-500/30 font-semibold"
    case "none":
      return "text-muted-foreground bg-muted/50 border-border"
  }
}

// ============================================
// VIDEO OPPORTUNITY TYPES (YouTube + TikTok)
// ============================================

export type VideoPlatform = "youtube" | "tiktok"

export interface VideoPlatformData {
  platform: VideoPlatform
  /** Opportunity score 0-100 */
  opportunityScore: number
  /** Is there weak competition? */
  hasWeakCompetition: boolean
  /** Average views of top content */
  avgTopViews?: number
  /** Number of results for keyword */
  resultCount?: number
}

export interface VideoOpportunity {
  /** Combined opportunity score 0-100 */
  score: number
  /** Opportunity level */
  level: OpportunityLevel
  /** YouTube specific data */
  youtube: VideoPlatformData
  /** TikTok specific data */
  tiktok: VideoPlatformData
  /** Is keyword video-friendly? */
  isVideoFriendly: boolean
  /** Recommendation */
  recommendation?: string
}

// ============================================
// COMMERCE OPPORTUNITY TYPES (Amazon)
// ============================================

export type CommercePlatform = "amazon" | "ebay" | "walmart"

export interface CommercePlatformData {
  platform: CommercePlatform
  /** Opportunity score 0-100 */
  opportunityScore: number
  /** Are there weak product listings? */
  hasWeakListings: boolean
  /** Average review count of top products */
  avgReviewCount?: number
  /** Number of products for keyword */
  productCount?: number
}

export interface CommerceOpportunity {
  /** Combined opportunity score 0-100 */
  score: number
  /** Opportunity level */
  level: OpportunityLevel
  /** Amazon specific data */
  amazon: CommercePlatformData
  /** Is keyword commerce-friendly? (Transactional/Commercial intent) */
  isCommerceFriendly: boolean
  /** Recommendation */
  recommendation?: string
}

// ============================================
// SOCIAL OPPORTUNITY TYPES (Pinterest + X + Instagram)
// ============================================

export type SocialPlatform = "pinterest" | "x" | "instagram"

export interface SocialPlatformData {
  platform: SocialPlatform
  /** Opportunity score 0-100 */
  opportunityScore: number
  /** Is there engagement opportunity? */
  hasEngagementOpportunity: boolean
  /** Hashtag volume (if applicable) */
  hashtagVolume?: number
  /** Average engagement of top content */
  avgEngagement?: number
}

export interface SocialOpportunity {
  /** Combined opportunity score 0-100 */
  score: number
  /** Opportunity level */
  level: OpportunityLevel
  /** Pinterest specific data */
  pinterest: SocialPlatformData
  /** X specific data */
  x: SocialPlatformData
  /** Instagram specific data */
  instagram: SocialPlatformData
  /** Is keyword social-friendly? */
  isSocialFriendly: boolean
  /** Recommendation */
  recommendation?: string
}
