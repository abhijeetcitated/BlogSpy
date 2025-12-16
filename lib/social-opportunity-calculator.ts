// ============================================
// SOCIAL OPPORTUNITY CALCULATOR
// ============================================
// Calculate Pinterest + X + Instagram opportunity
// Higher score = More opportunity for social presence
// ============================================

import {
  type SocialOpportunity,
  type SocialPlatformData,
  getOpportunityLevel,
} from "@/types/platform-opportunity.types"

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if keyword is social-friendly based on patterns
 */
function isSocialFriendlyKeyword(keyword: string): boolean {
  const socialPatterns = [
    /ideas/i,
    /inspiration/i,
    /aesthetic/i,
    /style/i,
    /outfit/i,
    /fashion/i,
    /decor/i,
    /design/i,
    /recipe/i,
    /food/i,
    /travel/i,
    /destination/i,
    /photography/i,
    /art/i,
    /craft/i,
    /diy/i,
    /wedding/i,
    /party/i,
    /gift/i,
    /holiday/i,
    /trend/i,
    /viral/i,
    /lifestyle/i,
    /fitness/i,
    /workout/i,
    /beauty/i,
    /makeup/i,
    /skincare/i,
    /hair/i,
    /home/i,
    /garden/i,
  ]
  
  return socialPatterns.some(pattern => pattern.test(keyword))
}

/**
 * Check if keyword is Pinterest-friendly (visual content)
 */
function isPinterestFriendly(keyword: string): boolean {
  return /ideas|inspiration|aesthetic|design|decor|recipe|diy|craft|wedding|fashion|outfit|style/i.test(keyword)
}

/**
 * Check if keyword is X-friendly (discussions/news)
 */
function isXFriendly(keyword: string): boolean {
  return /news|update|opinion|debate|trend|viral|breaking|latest|2024|2025/i.test(keyword)
}

/**
 * Check if keyword is Instagram-friendly (lifestyle/visual)
 */
function isInstagramFriendly(keyword: string): boolean {
  return /lifestyle|fitness|beauty|fashion|travel|food|photography|aesthetic|influencer/i.test(keyword)
}

/**
 * Generate deterministic score from keyword ID
 */
function getHashedScore(id: number, platform: string, baseMin: number, baseMax: number): number {
  const hash = (id * 29 + platform.charCodeAt(0) * 37) % 100
  const range = baseMax - baseMin
  return Math.round(baseMin + (hash / 100) * range)
}

// ============================================
// MAIN CALCULATOR
// ============================================

/**
 * Calculate social platform opportunity for a keyword
 */
export function calculateSocialOpportunity(
  keywordId: number,
  keyword: string
): SocialOpportunity {
  const isSocialFriendly = isSocialFriendlyKeyword(keyword)
  
  // Base scores
  const baseBonus = isSocialFriendly ? 15 : 0
  
  // Pinterest opportunity
  const pinterestBase = getHashedScore(keywordId, "pinterest", 25, 80)
  const pinterestBonus = isPinterestFriendly(keyword) ? 20 : 0
  const pinterestScore = Math.min(100, pinterestBase + baseBonus + pinterestBonus)
  
  // X opportunity
  const twitterBase = getHashedScore(keywordId, "twitter", 20, 70)
  const twitterBonus = isXFriendly(keyword) ? 20 : 0
  const twitterScore = Math.min(100, twitterBase + baseBonus + twitterBonus)
  
  // Instagram opportunity
  const instagramBase = getHashedScore(keywordId, "instagram", 25, 75)
  const instagramBonus = isInstagramFriendly(keyword) ? 20 : 0
  const instagramScore = Math.min(100, instagramBase + baseBonus + instagramBonus)
  
  // Pinterest platform data
  const pinterest: SocialPlatformData = {
    platform: "pinterest",
    opportunityScore: pinterestScore,
    hasEngagementOpportunity: pinterestScore >= 55,
    hashtagVolume: Math.round(getHashedScore(keywordId, "pinvol", 100, 50000)),
    avgEngagement: Math.round(getHashedScore(keywordId, "pineng", 50, 5000)),
  }
  
  // X platform data
  const xPlatform: SocialPlatformData = {
    platform: "x",
    opportunityScore: twitterScore,
    hasEngagementOpportunity: twitterScore >= 50,
    hashtagVolume: Math.round(getHashedScore(keywordId, "twvol", 500, 100000)),
    avgEngagement: Math.round(getHashedScore(keywordId, "tweng", 10, 1000)),
  }
  
  // Instagram platform data
  const instagram: SocialPlatformData = {
    platform: "instagram",
    opportunityScore: instagramScore,
    hasEngagementOpportunity: instagramScore >= 55,
    hashtagVolume: Math.round(getHashedScore(keywordId, "igvol", 1000, 500000)),
    avgEngagement: Math.round(getHashedScore(keywordId, "igeng", 100, 10000)),
  }
  
  // Combined score (weighted: Pinterest 40%, Instagram 35%, X 25%)
  const combinedScore = Math.round(
    pinterest.opportunityScore * 0.4 + 
    instagram.opportunityScore * 0.35 + 
    xPlatform.opportunityScore * 0.25
  )
  
  // Generate recommendation
  let recommendation: string | undefined
  const bestPlatform = pinterestScore >= instagramScore && pinterestScore >= twitterScore
    ? "Pinterest"
    : instagramScore >= twitterScore
    ? "Instagram"
    : "X"
  
  if (combinedScore >= 70) {
    recommendation = `High social opportunity! Focus on ${bestPlatform} first.`
  } else if (combinedScore >= 50) {
    recommendation = `Moderate social potential. ${bestPlatform} shows best opportunity.`
  } else if (isSocialFriendly) {
    recommendation = "Social-friendly keyword but competitive. Create unique visual content."
  }
  
  return {
    score: combinedScore,
    level: getOpportunityLevel(combinedScore),
    pinterest,
    x: xPlatform,
    instagram,
    isSocialFriendly,
    recommendation,
  }
}

/**
 * Generate mock social opportunity for keyword ID (for table display)
 */
export function generateMockSocialOpportunity(keywordId: number, keyword: string): SocialOpportunity {
  return calculateSocialOpportunity(keywordId, keyword)
}
