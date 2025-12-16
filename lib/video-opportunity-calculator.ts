// ============================================
// VIDEO OPPORTUNITY CALCULATOR
// ============================================
// Calculate YouTube + TikTok opportunity for keywords
// Higher score = More opportunity to rank
// ============================================

import {
  type VideoOpportunity,
  type VideoPlatformData,
  getOpportunityLevel,
} from "@/types/platform-opportunity.types"

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if keyword is video-friendly based on common patterns
 */
function isVideoFriendlyKeyword(keyword: string): boolean {
  const videoPatterns = [
    /how to/i,
    /tutorial/i,
    /guide/i,
    /review/i,
    /unboxing/i,
    /best\s+\d+/i,
    /top\s+\d+/i,
    /vs\.?/i,
    /comparison/i,
    /explained/i,
    /walkthrough/i,
    /demo/i,
    /setup/i,
    /install/i,
    /fix/i,
    /solve/i,
    /recipe/i,
    /workout/i,
    /fitness/i,
    /makeup/i,
    /hairstyle/i,
    /diy/i,
    /craft/i,
  ]
  
  return videoPatterns.some(pattern => pattern.test(keyword))
}

/**
 * Generate deterministic score from keyword ID
 */
function getHashedScore(id: number, platform: string, baseMin: number, baseMax: number): number {
  const hash = (id * 17 + platform.charCodeAt(0) * 31) % 100
  const range = baseMax - baseMin
  return Math.round(baseMin + (hash / 100) * range)
}

// ============================================
// MAIN CALCULATOR
// ============================================

/**
 * Calculate video platform opportunity for a keyword
 */
export function calculateVideoOpportunity(
  keywordId: number,
  keyword: string,
  volume?: number
): VideoOpportunity {
  const isVideoFriendly = isVideoFriendlyKeyword(keyword)
  
  // Base scores adjusted by video-friendliness
  const baseBonus = isVideoFriendly ? 20 : 0
  
  // YouTube opportunity (generally higher for most keywords)
  const youtubeBase = getHashedScore(keywordId, "youtube", 30, 85)
  const youtubeScore = Math.min(100, youtubeBase + baseBonus)
  
  // TikTok opportunity (higher for trending/lifestyle keywords)
  const tiktokBase = getHashedScore(keywordId, "tiktok", 25, 80)
  const isTikTokFriendly = /trend|viral|hack|tip|quick|easy|simple|aesthetic/i.test(keyword)
  const tiktokBonus = isTikTokFriendly ? 15 : 0
  const tiktokScore = Math.min(100, tiktokBase + baseBonus + tiktokBonus)
  
  // YouTube platform data
  const youtube: VideoPlatformData = {
    platform: "youtube",
    opportunityScore: youtubeScore,
    hasWeakCompetition: youtubeScore >= 60,
    avgTopViews: Math.round(getHashedScore(keywordId, "ytviews", 1000, 500000)),
    resultCount: Math.round(getHashedScore(keywordId, "ytcount", 100, 10000)),
  }
  
  // TikTok platform data
  const tiktok: VideoPlatformData = {
    platform: "tiktok",
    opportunityScore: tiktokScore,
    hasWeakCompetition: tiktokScore >= 60,
    avgTopViews: Math.round(getHashedScore(keywordId, "ttviews", 5000, 1000000)),
    resultCount: Math.round(getHashedScore(keywordId, "ttcount", 50, 5000)),
  }
  
  // Combined score (weighted average - YouTube 60%, TikTok 40%)
  const combinedScore = Math.round(youtube.opportunityScore * 0.6 + tiktok.opportunityScore * 0.4)
  
  // Generate recommendation
  let recommendation: string | undefined
  if (combinedScore >= 70) {
    recommendation = "High video opportunity! Create YouTube tutorial or TikTok short."
  } else if (combinedScore >= 50) {
    recommendation = "Moderate video potential. Consider video content."
  } else if (isVideoFriendly) {
    recommendation = "Video-friendly keyword but competitive. Focus on unique angle."
  }
  
  return {
    score: combinedScore,
    level: getOpportunityLevel(combinedScore),
    youtube,
    tiktok,
    isVideoFriendly,
    recommendation,
  }
}

/**
 * Generate mock video opportunity for keyword ID (for table display)
 */
export function generateMockVideoOpportunity(keywordId: number, keyword: string): VideoOpportunity {
  return calculateVideoOpportunity(keywordId, keyword)
}
