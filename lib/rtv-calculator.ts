// ============================================
// RTV (REALIZABLE TRAFFIC VOLUME) CALCULATOR
// ============================================
// Calculates realistic traffic potential
// Accounts for SERP features stealing CTR
// ============================================

import {
  type CTRStealingFeature,
  type RTVAnalysis,
  type CTRBreakdownItem,
  SERP_CTR_IMPACT,
  ORGANIC_CTR_BY_POSITION,
  getRTVOpportunityLevel,
  getSERPFeatureName,
  getSERPFeatureColor,
} from "@/types/rtv.types"

/**
 * Calculate RTV (Realizable Traffic Volume)
 */
export function calculateRTV(
  rawVolume: number,
  serpFeatures: CTRStealingFeature[],
  position: number = 1
): RTVAnalysis {
  // Calculate total CTR loss from SERP features
  let totalCTRLoss = 0
  const ctrBreakdown: CTRBreakdownItem[] = []
  
  // Add each SERP feature's CTR impact
  for (const feature of serpFeatures) {
    const impact = SERP_CTR_IMPACT[feature]
    if (impact) {
      // Diminishing returns - features don't stack linearly
      const adjustedLoss = impact.ctrLoss * (1 - totalCTRLoss * 0.3)
      totalCTRLoss = Math.min(totalCTRLoss + adjustedLoss, 0.85) // Max 85% loss
      
      ctrBreakdown.push({
        feature,
        label: getSERPFeatureName(feature),
        ctrShare: adjustedLoss,
        volumeShare: Math.round(rawVolume * adjustedLoss),
        color: getSERPFeatureColor(feature),
      })
    }
  }
  
  // Calculate remaining organic CTR pool
  const remainingCTRPool = 1 - totalCTRLoss
  
  // Get base CTR for position
  const baseCTR = ORGANIC_CTR_BY_POSITION[Math.min(position, 10)] || 0.01
  
  // Adjusted organic CTR (base CTR applied to remaining pool)
  const organicCTR = baseCTR * remainingCTRPool
  
  // Calculate RTV
  const rtv = Math.round(rawVolume * remainingCTRPool)
  const rtvPercentage = remainingCTRPool
  
  // Estimated clicks for your position
  const estimatedClicks = Math.round(rawVolume * organicCTR)
  
  // Add organic to breakdown
  ctrBreakdown.push({
    feature: "organic",
    label: "Organic Results",
    ctrShare: remainingCTRPool,
    volumeShare: rtv,
    color: "text-emerald-400 bg-emerald-500/20",
  })
  
  // Sort breakdown by CTR share (highest first)
  ctrBreakdown.sort((a, b) => b.ctrShare - a.ctrShare)
  
  // Determine opportunity level
  const opportunityLevel = getRTVOpportunityLevel(rtvPercentage)
  
  // Generate recommendation
  const recommendation = generateRTVRecommendation(
    serpFeatures,
    rtvPercentage,
    position,
    rawVolume
  )
  
  return {
    keyword: "",
    rawVolume,
    rtv,
    rtvPercentage,
    organicCTR,
    position,
    estimatedClicks,
    serpFeatures,
    ctrBreakdown,
    opportunityLevel,
    recommendation,
  }
}

/**
 * Generate recommendation based on RTV analysis
 */
function generateRTVRecommendation(
  serpFeatures: CTRStealingFeature[],
  rtvPercentage: number,
  position: number,
  rawVolume: number
): string {
  // Very low RTV
  if (rtvPercentage < 0.15) {
    if (serpFeatures.includes("ai_overview")) {
      return "⚠️ AI Overview dominates this SERP. Focus on getting cited in AI responses or target alternative keywords."
    }
    if (serpFeatures.includes("direct_answer") || serpFeatures.includes("calculator")) {
      return "🚫 Zero-click query. Google answers this directly. Consider targeting related long-tail keywords."
    }
    return "⚠️ Heavy SERP competition. Consider targeting less competitive variations of this keyword."
  }
  
  // Low RTV
  if (rtvPercentage < 0.30) {
    if (serpFeatures.includes("featured_snippet")) {
      return "🎯 Win the featured snippet to capture significant traffic despite low RTV."
    }
    if (serpFeatures.includes("video_carousel")) {
      return "🎬 Create video content to appear in video carousel and boost visibility."
    }
    return "📊 Moderate SERP competition. Focus on winning SERP features to maximize clicks."
  }
  
  // Moderate to Good RTV
  if (rtvPercentage < 0.70) {
    if (position > 3) {
      return `📈 Good RTV potential. Improve from #${position} to top 3 to capture ${Math.round(rawVolume * 0.15)}+ clicks.`
    }
    return "✅ Solid opportunity. Optimize content and build links to maintain/improve position."
  }
  
  // Excellent RTV
  return "🏆 Excellent RTV! Clean SERP with high organic click potential. Prioritize this keyword."
}

/**
 * Calculate RTV for multiple keywords
 */
export function calculateBulkRTV(
  keywords: Array<{
    keyword: string
    volume: number
    serpFeatures: CTRStealingFeature[]
    position?: number
  }>
): RTVAnalysis[] {
  return keywords.map(kw => ({
    ...calculateRTV(kw.volume, kw.serpFeatures, kw.position || 1),
    keyword: kw.keyword,
  }))
}

/**
 * Generate mock RTV data for demo
 */
export function generateMockRTV(seed: number, rawVolume: number = 10000): RTVAnalysis {
  // Use seed for consistent random
  const random = (min: number, max: number) => {
    const x = Math.sin(seed * 9999) * 10000
    const r = x - Math.floor(x)
    return Math.floor(r * (max - min + 1)) + min
  }
  
  // Possible SERP features
  const possibleFeatures: CTRStealingFeature[] = [
    "ai_overview",
    "featured_snippet",
    "people_also_ask",
    "video_carousel",
    "image_pack",
    "top_ads",
    "shopping_ads",
    "local_pack",
  ]
  
  // Select 1-4 random features based on seed
  const numFeatures = random(1, 4)
  const selectedFeatures: CTRStealingFeature[] = []
  
  for (let i = 0; i < numFeatures; i++) {
    const idx = (seed + i * 7) % possibleFeatures.length
    const feature = possibleFeatures[idx]
    if (!selectedFeatures.includes(feature)) {
      selectedFeatures.push(feature)
    }
  }
  
  // Random position 1-10
  const position = random(1, 10)
  
  return calculateRTV(rawVolume, selectedFeatures, position)
}

/**
 * Compare RTV between keywords
 */
export function compareRTV(
  rtv1: RTVAnalysis,
  rtv2: RTVAnalysis
): {
  winner: "first" | "second" | "tie"
  rtvDiff: number
  clicksDiff: number
  recommendation: string
} {
  const rtvDiff = rtv1.rtv - rtv2.rtv
  const clicksDiff = rtv1.estimatedClicks - rtv2.estimatedClicks
  
  let winner: "first" | "second" | "tie" = "tie"
  if (rtvDiff > 100) winner = "first"
  else if (rtvDiff < -100) winner = "second"
  
  let recommendation = ""
  if (winner === "first") {
    recommendation = `First keyword has ${Math.abs(rtvDiff).toLocaleString()} more realizable traffic.`
  } else if (winner === "second") {
    recommendation = `Second keyword has ${Math.abs(rtvDiff).toLocaleString()} more realizable traffic.`
  } else {
    recommendation = "Both keywords have similar RTV. Consider difficulty and intent."
  }
  
  return { winner, rtvDiff, clicksDiff, recommendation }
}

/**
 * Get RTV insights for a keyword
 */
export function getRTVInsights(analysis: RTVAnalysis): string[] {
  const insights: string[] = []
  
  // Volume vs RTV comparison
  const lostVolume = analysis.rawVolume - analysis.rtv
  const lostPercentage = Math.round((1 - analysis.rtvPercentage) * 100)
  
  insights.push(
    `📉 ${lostPercentage}% of search volume (${lostVolume.toLocaleString()} searches) is captured by SERP features.`
  )
  
  // Biggest CTR stealer
  const sortedFeatures = [...analysis.ctrBreakdown]
    .filter(item => item.feature !== "organic")
    .sort((a, b) => b.ctrShare - a.ctrShare)
  
  if (sortedFeatures.length > 0) {
    const biggest = sortedFeatures[0]
    insights.push(
      `🎯 ${biggest.label} is the biggest CTR stealer (${Math.round(biggest.ctrShare * 100)}% of clicks).`
    )
  }
  
  // Position insight
  if (analysis.position <= 3) {
    insights.push(
      `🏆 Position #${analysis.position} captures ~${Math.round(analysis.organicCTR * 100)}% of organic clicks.`
    )
  } else if (analysis.position <= 10) {
    const potentialGain = Math.round(
      analysis.rawVolume * (ORGANIC_CTR_BY_POSITION[1] - ORGANIC_CTR_BY_POSITION[analysis.position]) * analysis.rtvPercentage
    )
    insights.push(
      `📈 Moving to #1 could gain ~${potentialGain.toLocaleString()} additional clicks/month.`
    )
  }
  
  // Opportunity insight
  if (analysis.opportunityLevel === "excellent") {
    insights.push("✅ Clean SERP with high organic click potential. High priority keyword.")
  } else if (analysis.opportunityLevel === "very_low") {
    insights.push("⚠️ Consider targeting less competitive keyword variations.")
  }
  
  return insights
}
