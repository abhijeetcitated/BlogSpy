// ============================================
// COMMERCE OPPORTUNITY CALCULATOR
// ============================================
// Calculate Amazon opportunity for keywords
// Higher score = More opportunity to rank in shopping
// ============================================

import {
  type CommerceOpportunity,
  type CommercePlatformData,
  getOpportunityLevel,
} from "@/types/platform-opportunity.types"

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if keyword has commerce/transactional intent
 */
function isCommerceFriendlyKeyword(keyword: string, intent?: string[]): boolean {
  // Check for transactional/commercial patterns
  const commercePatterns = [
    /buy/i,
    /price/i,
    /cheap/i,
    /best\s+/i,
    /top\s+\d+/i,
    /review/i,
    /vs\.?/i,
    /comparison/i,
    /alternative/i,
    /discount/i,
    /deal/i,
    /coupon/i,
    /sale/i,
    /where to buy/i,
    /for sale/i,
    /online/i,
    /amazon/i,
    /product/i,
    /order/i,
    /shipping/i,
  ]
  
  // Check if intent includes T (transactional) or C (commercial)
  if (intent && (intent.includes("T") || intent.includes("C"))) {
    return true
  }
  
  return commercePatterns.some(pattern => pattern.test(keyword))
}

/**
 * Generate deterministic score from keyword ID
 */
function getHashedScore(id: number, platform: string, baseMin: number, baseMax: number): number {
  const hash = (id * 23 + platform.charCodeAt(0) * 41) % 100
  const range = baseMax - baseMin
  return Math.round(baseMin + (hash / 100) * range)
}

// ============================================
// MAIN CALCULATOR
// ============================================

/**
 * Calculate commerce platform opportunity for a keyword
 */
export function calculateCommerceOpportunity(
  keywordId: number,
  keyword: string,
  intent?: string[]
): CommerceOpportunity {
  const isCommerceFriendly = isCommerceFriendlyKeyword(keyword, intent)
  
  // If not commerce-friendly, return low opportunity
  if (!isCommerceFriendly) {
    const lowScore = getHashedScore(keywordId, "amazon", 5, 25)
    
    return {
      score: lowScore,
      level: getOpportunityLevel(lowScore),
      amazon: {
        platform: "amazon",
        opportunityScore: lowScore,
        hasWeakListings: false,
        avgReviewCount: 0,
        productCount: 0,
      },
      isCommerceFriendly: false,
      recommendation: "Not a product-focused keyword",
    }
  }
  
  // Commerce-friendly keyword - calculate opportunity
  const amazonBase = getHashedScore(keywordId, "amazon", 35, 90)
  
  // Bonus for specific patterns
  let bonus = 0
  if (/best\s+/i.test(keyword)) bonus += 10
  if (/cheap|budget|affordable/i.test(keyword)) bonus += 15
  if (/review/i.test(keyword)) bonus += 5
  
  const amazonScore = Math.min(100, amazonBase + bonus)
  
  // Amazon platform data
  const amazon: CommercePlatformData = {
    platform: "amazon",
    opportunityScore: amazonScore,
    hasWeakListings: amazonScore >= 55,
    avgReviewCount: Math.round(getHashedScore(keywordId, "reviews", 10, 5000)),
    productCount: Math.round(getHashedScore(keywordId, "products", 50, 10000)),
  }
  
  // Generate recommendation
  let recommendation: string | undefined
  if (amazonScore >= 70) {
    recommendation = "High Amazon opportunity! Weak listings found."
  } else if (amazonScore >= 50) {
    recommendation = "Moderate commerce potential. Products exist but room for better listings."
  } else {
    recommendation = "Competitive market. Focus on unique product angle."
  }
  
  return {
    score: amazonScore,
    level: getOpportunityLevel(amazonScore),
    amazon,
    isCommerceFriendly: true,
    recommendation,
  }
}

/**
 * Generate mock commerce opportunity for keyword ID (for table display)
 */
export function generateMockCommerceOpportunity(
  keywordId: number, 
  keyword: string,
  intent?: string[]
): CommerceOpportunity {
  return calculateCommerceOpportunity(keywordId, keyword, intent)
}
