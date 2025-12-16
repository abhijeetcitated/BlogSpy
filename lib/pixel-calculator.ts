// ============================================
// PIXEL RANK CALCULATOR
// ============================================
// Calculates pixel-based ranking from SERP data
// Simulates actual SERP layout with all elements
// ============================================

import {
  type SERPElement,
  type SERPLayout,
  type PixelRankScore,
  type SERPElementType,
  SERP_ELEMENT_HEIGHTS,
  getPixelRankGrade,
  getVisibilityScore,
  getFoldStatus,
  estimateCTR,
} from "@/types/pixel.types"

/**
 * Calculate pixel rank from SERP elements
 */
export function calculatePixelRank(
  serpElements: SERPElementType[],
  yourOrganicPosition: number,
  yourDomain?: string
): PixelRankScore {
  // Build SERP layout
  const layout = buildSERPLayout(serpElements, yourOrganicPosition, yourDomain)
  
  // Calculate scores
  const pixelPosition = layout.yourPixelRank
  const visibilityScore = getVisibilityScore(pixelPosition)
  const grade = getPixelRankGrade(pixelPosition)
  const foldStatus = getFoldStatus(pixelPosition)
  const estimatedCTR = estimateCTR(pixelPosition)
  
  // Get competing elements (what's above your result)
  const competingElements = layout.elements
    .filter(el => el.pixelEnd < pixelPosition && el.type !== "organic")
    .map(el => el.type)
  
  return {
    pixelPosition,
    visibilityScore,
    grade,
    foldStatus,
    competingElements: [...new Set(competingElements)], // Unique
    estimatedCTR,
    organicRank: yourOrganicPosition,
  }
}

/**
 * Build complete SERP layout with pixel positions
 */
export function buildSERPLayout(
  serpElements: SERPElementType[],
  yourOrganicPosition: number = 1,
  yourDomain?: string
): SERPLayout {
  const elements: SERPElement[] = []
  let currentPixel = 0
  let organicCount = 0
  let yourPixelRank = 0
  
  // Process each SERP element
  for (const elementType of serpElements) {
    const height = SERP_ELEMENT_HEIGHTS[elementType] || 100
    
    const element: SERPElement = {
      type: elementType,
      pixelStart: currentPixel,
      pixelEnd: currentPixel + height,
      height,
    }
    
    // Track organic positions
    if (elementType === "organic") {
      organicCount++
      element.position = organicCount
      element.isYourSite = organicCount === yourOrganicPosition
      
      if (element.isYourSite) {
        yourPixelRank = currentPixel
        element.domain = yourDomain || "yoursite.com"
      }
    }
    
    elements.push(element)
    currentPixel += height
  }
  
  // If no organic results were added, add them
  if (organicCount === 0) {
    for (let i = 1; i <= 10; i++) {
      const height = SERP_ELEMENT_HEIGHTS.organic
      const element: SERPElement = {
        type: "organic",
        pixelStart: currentPixel,
        pixelEnd: currentPixel + height,
        height,
        position: i,
        isYourSite: i === yourOrganicPosition,
      }
      
      if (element.isYourSite) {
        yourPixelRank = currentPixel
        element.domain = yourDomain || "yoursite.com"
      }
      
      elements.push(element)
      currentPixel += height
    }
  }
  
  const viewportHeight = 800 // Standard viewport
  const aboveFoldElements = elements.filter(el => el.pixelEnd <= viewportHeight).length
  
  return {
    keyword: "",
    totalHeight: currentPixel,
    viewportHeight,
    elements,
    yourPosition: yourOrganicPosition,
    yourPixelRank,
    aboveFoldElements,
    requiresScroll: yourPixelRank > viewportHeight,
    scrollDepth: Math.max(0, yourPixelRank - viewportHeight),
  }
}

/**
 * Generate mock pixel rank data for demo purposes
 */
export function generateMockPixelRank(seed: number = 1): PixelRankScore {
  // Use seed to generate consistent random values
  const random = (min: number, max: number) => {
    const x = Math.sin(seed * 9999) * 10000
    const r = x - Math.floor(x)
    return Math.floor(r * (max - min + 1)) + min
  }
  
  // Generate organic position (1-10)
  const organicRank = random(1, 10)
  
  // Generate random SERP features
  const possibleFeatures: SERPElementType[] = [
    "ai_overview",
    "featured_snippet",
    "people_also_ask",
    "video_carousel",
    "image_pack",
    "top_ads",
    "shopping_ads",
  ]
  
  // Select 2-5 random features
  const numFeatures = random(2, 5)
  const selectedFeatures: SERPElementType[] = []
  
  for (let i = 0; i < numFeatures; i++) {
    const feature = possibleFeatures[random(0, possibleFeatures.length - 1)]
    if (!selectedFeatures.includes(feature)) {
      selectedFeatures.push(feature)
    }
  }
  
  // Build SERP with features + organic results
  const serpElements: SERPElementType[] = [
    ...selectedFeatures,
    ...Array(10).fill("organic") as SERPElementType[],
  ]
  
  return calculatePixelRank(serpElements, organicRank)
}

/**
 * Analyze pixel rank trend over time
 */
export function analyzePixelRankTrend(
  historicalData: { date: string; pixelPosition: number }[]
): {
  trend: "improving" | "declining" | "stable"
  averageChange: number
  bestPosition: number
  worstPosition: number
} {
  if (historicalData.length < 2) {
    return {
      trend: "stable",
      averageChange: 0,
      bestPosition: historicalData[0]?.pixelPosition || 0,
      worstPosition: historicalData[0]?.pixelPosition || 0,
    }
  }
  
  const positions = historicalData.map(d => d.pixelPosition)
  const bestPosition = Math.min(...positions)
  const worstPosition = Math.max(...positions)
  
  // Calculate average change
  let totalChange = 0
  for (let i = 1; i < positions.length; i++) {
    totalChange += positions[i - 1] - positions[i] // Negative = improving (lower px = better)
  }
  const averageChange = totalChange / (positions.length - 1)
  
  // Determine trend
  let trend: "improving" | "declining" | "stable" = "stable"
  if (averageChange > 20) trend = "improving"
  else if (averageChange < -20) trend = "declining"
  
  return {
    trend,
    averageChange: Math.round(averageChange),
    bestPosition,
    worstPosition,
  }
}

/**
 * Get recommendations based on pixel rank
 */
export function getPixelRankRecommendations(score: PixelRankScore): string[] {
  const recommendations: string[] = []
  
  // Based on grade
  if (score.grade === "F" || score.grade === "D") {
    recommendations.push("🚨 Critical: Your result requires significant scrolling. Focus on getting featured snippets.")
  }
  
  // Based on competing elements
  if (score.competingElements.includes("ai_overview")) {
    recommendations.push("💡 AI Overview is pushing you down. Optimize content to get cited in AI responses.")
  }
  
  if (score.competingElements.includes("featured_snippet")) {
    recommendations.push("🎯 Target the featured snippet with structured content (lists, tables, definitions).")
  }
  
  if (score.competingElements.includes("video_carousel")) {
    recommendations.push("🎬 Create video content to appear in the video carousel above organic results.")
  }
  
  if (score.competingElements.includes("people_also_ask")) {
    recommendations.push("❓ Answer PAA questions in your content to potentially appear in the PAA box.")
  }
  
  if (score.competingElements.includes("local_pack")) {
    recommendations.push("📍 Optimize Google Business Profile to appear in the local pack.")
  }
  
  if (score.competingElements.includes("shopping_ads") || score.competingElements.includes("top_ads")) {
    recommendations.push("💰 Consider PPC to appear above organic results for high-intent keywords.")
  }
  
  // Based on organic rank vs pixel position
  if (score.organicRank <= 3 && score.pixelPosition > 600) {
    recommendations.push("⚠️ Despite top-3 ranking, SERP features are hurting visibility. Focus on SERP feature optimization.")
  }
  
  // Based on CTR
  if (score.estimatedCTR < 0.05) {
    recommendations.push("📉 Low expected CTR. Improve title/description to stand out, or target less competitive SERPs.")
  }
  
  return recommendations.slice(0, 4) // Max 4 recommendations
}

/**
 * Compare pixel ranks between two time periods
 */
export function comparePixelRank(
  current: PixelRankScore,
  previous: PixelRankScore
): {
  pixelChange: number
  direction: "up" | "down" | "same"
  visibilityChange: number
  ctrChange: number
} {
  const pixelChange = previous.pixelPosition - current.pixelPosition // Positive = improved
  const visibilityChange = current.visibilityScore - previous.visibilityScore
  const ctrChange = current.estimatedCTR - previous.estimatedCTR
  
  let direction: "up" | "down" | "same" = "same"
  if (pixelChange > 50) direction = "up"
  else if (pixelChange < -50) direction = "down"
  
  return {
    pixelChange,
    direction,
    visibilityChange,
    ctrChange,
  }
}
