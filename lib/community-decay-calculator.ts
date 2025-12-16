// ============================================
// COMMUNITY DECAY CALCULATOR
// ============================================
// Analyze community content freshness in SERPs
// Higher decay = Better opportunity to outrank
// ============================================

import {
  type CommunityPlatform,
  type CommunitySource,
  type CommunityDecayAnalysis,
  type CommunityDecayRecommendation,
  type CommunityDecayAlert,
  type DecayLevel,
  PLATFORM_INFO,
  getDecayLevel,
  calculateDecayScoreFromAge,
  getOpportunityFromDecayScore,
  formatAge,
} from "@/types/community-decay.types"

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

/**
 * Analyze community content decay for a keyword
 */
export function analyzeCommunityDecay(
  keyword: string,
  communitySources: CommunitySource[]
): CommunityDecayAnalysis {
  const hasCommunityContent = communitySources.length > 0
  
  if (!hasCommunityContent) {
    return {
      keyword,
      hasCommunityContent: false,
      communitySources: [],
      communityCountInTop10: 0,
      decayScore: 0,
      decayLevel: "fresh",
      opportunityLevel: "none",
      avgContentAge: 0,
      maxContentAge: 0,
      bestOpportunity: null,
      recommendations: [],
      analyzedAt: new Date().toISOString(),
    }
  }

  // Calculate average and max age
  const ages = communitySources.map(s => s.ageInDays)
  const avgContentAge = Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
  const maxContentAge = Math.max(...ages)

  // Calculate decay score
  // Weighted by rank position - higher rank = more impact
  let totalWeight = 0
  let weightedDecayScore = 0
  
  for (const source of communitySources) {
    const positionWeight = 11 - source.rankPosition // Position 1 = weight 10, Position 10 = weight 1
    const decayScore = calculateDecayScoreFromAge(source.ageInDays)
    
    // Add bonus for outdated flags and low quality
    let bonus = 0
    if (source.hasOutdatedFlag) bonus += 10
    if (source.qualityScore < 50) bonus += 10
    if (source.hasControversy) bonus += 5
    
    weightedDecayScore += (Math.min(decayScore + bonus, 100)) * positionWeight
    totalWeight += positionWeight
  }

  const decayScore = Math.round(weightedDecayScore / totalWeight)
  const decayLevel = getDecayLevel(avgContentAge)
  const opportunityLevel = getOpportunityFromDecayScore(decayScore, true)

  // Find best opportunity (oldest + highest rank)
  const bestOpportunity = communitySources
    .filter(s => s.rankPosition <= 5)
    .sort((a, b) => {
      // Score by age + rank impact
      const aScore = a.ageInDays * (6 - a.rankPosition)
      const bScore = b.ageInDays * (6 - b.rankPosition)
      return bScore - aScore
    })[0] || communitySources[0]

  // Generate recommendations
  const recommendations = generateRecommendations(
    keyword,
    communitySources,
    decayScore
  )

  return {
    keyword,
    hasCommunityContent: true,
    communitySources,
    communityCountInTop10: communitySources.filter(s => s.rankPosition <= 10).length,
    decayScore,
    decayLevel,
    opportunityLevel,
    avgContentAge,
    maxContentAge,
    bestOpportunity,
    recommendations,
    analyzedAt: new Date().toISOString(),
  }
}

// ============================================
// RECOMMENDATION GENERATOR
// ============================================

function generateRecommendations(
  keyword: string,
  sources: CommunitySource[],
  decayScore: number
): CommunityDecayRecommendation[] {
  const recommendations: CommunityDecayRecommendation[] = []
  let idCounter = 1

  // Sort by opportunity (old + high rank)
  const sortedSources = [...sources].sort((a, b) => {
    const aScore = a.ageInDays * (11 - a.rankPosition)
    const bScore = b.ageInDays * (11 - b.rankPosition)
    return bScore - aScore
  })

  // Top target recommendations
  for (const source of sortedSources.slice(0, 3)) {
    const platformInfo = PLATFORM_INFO[source.platform]
    const decayLevel = getDecayLevel(source.ageInDays)
    
    if (decayLevel === "ancient" || decayLevel === "decayed") {
      recommendations.push({
        id: `rec_${idCounter++}`,
        priority: 1,
        title: `Outrank ${platformInfo.name} at #${source.rankPosition}`,
        description: `This ${platformInfo.name} post is ${formatAge(source.ageInDays)} old. Create comprehensive, updated content to easily outrank it.`,
        platform: source.platform,
        targetRank: source.rankPosition,
        potentialGain: source.rankPosition <= 3 ? "High traffic gain" : "Moderate traffic gain",
        action: "Write fresh, authoritative article with updated information",
        effort: "medium",
      })
    } else if (decayLevel === "stale") {
      recommendations.push({
        id: `rec_${idCounter++}`,
        priority: 2,
        title: `Target ${platformInfo.name} at #${source.rankPosition}`,
        description: `${formatAge(source.ageInDays)} old ${platformInfo.name} content. Good opportunity with quality content.`,
        platform: source.platform,
        targetRank: source.rankPosition,
        potentialGain: "Moderate traffic gain",
        action: "Create detailed guide with examples and visuals",
        effort: "medium",
      })
    }
  }

  // Reddit-specific recommendation
  const redditSource = sources.find(s => s.platform === "reddit")
  if (redditSource && redditSource.ageInDays > 180) {
    recommendations.push({
      id: `rec_${idCounter++}`,
      priority: 1,
      title: "Reddit Thread is Outdated",
      description: `r/${redditSource.subreddit || "unknown"} thread is ${formatAge(redditSource.ageInDays)} old with ${redditSource.engagement.upvotes} upvotes. Reddit content ages faster - easy target.`,
      platform: "reddit",
      targetRank: redditSource.rankPosition,
      potentialGain: "High - Reddit threads lose relevance quickly",
      action: "Create comprehensive article answering the same question with 2024/2025 data",
      effort: "quick",
    })
  }

  // Quora-specific recommendation
  const quoraSource = sources.find(s => s.platform === "quora")
  if (quoraSource && quoraSource.ageInDays > 365) {
    recommendations.push({
      id: `rec_${idCounter++}`,
      priority: 1,
      title: "Quora Answer is Ancient",
      description: `Quora answer is ${formatAge(quoraSource.ageInDays)} old. These often have thin content that's easy to beat.`,
      platform: "quora",
      targetRank: quoraSource.rankPosition,
      potentialGain: "High - Quora answers typically lack depth",
      action: "Write in-depth article with structured data and rich media",
      effort: "quick",
    })
  }

  // General content strategy
  if (decayScore >= 70) {
    recommendations.push({
      id: `rec_${idCounter++}`,
      priority: 2,
      title: "Multiple Decayed Sources Detected",
      description: `${sources.length} community source(s) with avg age ${formatAge(Math.round(sources.reduce((a, b) => a + b.ageInDays, 0) / sources.length))}. Create pillar content to capture multiple positions.`,
      platform: sources[0].platform,
      targetRank: Math.min(...sources.map(s => s.rankPosition)),
      potentialGain: "Very High - Multiple ranking opportunities",
      action: "Create comprehensive pillar content with FAQs, examples, and comparison tables",
      effort: "significant",
    })
  }

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 5)
}

// ============================================
// MOCK DATA GENERATOR
// ============================================

/**
 * Generate mock community decay analysis for demo
 */
export function generateMockCommunityDecay(
  keyword: string,
  hasWeakSpot: boolean = true
): CommunityDecayAnalysis {
  if (!hasWeakSpot) {
    return analyzeCommunityDecay(keyword, [])
  }

  // Generate mock sources
  const platforms: CommunityPlatform[] = ["reddit", "quora", "medium", "stackexchange"]
  const numSources = Math.floor(Math.random() * 3) + 1 // 1-3 sources

  const sources: CommunitySource[] = []
  const usedPlatforms = new Set<CommunityPlatform>()

  for (let i = 0; i < numSources; i++) {
    // Pick a random platform (avoid duplicates)
    let platform = platforms[Math.floor(Math.random() * platforms.length)]
    while (usedPlatforms.has(platform)) {
      platform = platforms[Math.floor(Math.random() * platforms.length)]
    }
    usedPlatforms.add(platform)

    // Random age between 60-800 days
    const ageInDays = Math.floor(Math.random() * 740) + 60
    
    sources.push({
      platform,
      url: `https://${platform}.com/example-${i}`,
      title: platform === "reddit" 
        ? `r/technology - ${keyword} discussion thread`
        : platform === "quora"
        ? `What is the best ${keyword}? - Quora`
        : `${keyword} explained - ${PLATFORM_INFO[platform].name}`,
      rankPosition: Math.floor(Math.random() * 7) + 3, // Rank 3-10
      ageInDays,
      lastActivityDays: ageInDays - Math.floor(Math.random() * 30),
      engagement: {
        upvotes: Math.floor(Math.random() * 500) + 10,
        comments: Math.floor(Math.random() * 100) + 5,
        views: Math.floor(Math.random() * 50000) + 1000,
      },
      hasOutdatedFlag: Math.random() > 0.7,
      hasControversy: Math.random() > 0.8,
      subreddit: platform === "reddit" ? ["technology", "webdev", "SEO", "marketing"][Math.floor(Math.random() * 4)] : undefined,
      qualityScore: Math.floor(Math.random() * 60) + 20, // Low quality: 20-80
    })
  }

  // Sort by rank position
  sources.sort((a, b) => a.rankPosition - b.rankPosition)

  return analyzeCommunityDecay(keyword, sources)
}

/**
 * Generate mock community decay for a specific seed (consistent results)
 */
export function generateMockCommunityDecayForId(
  id: number,
  keyword: string
): CommunityDecayAnalysis {
  // Use id as seed for consistent results
  const hasWeakSpot = id % 3 !== 0 // 2/3 have weak spots
  
  if (!hasWeakSpot) {
    return analyzeCommunityDecay(keyword, [])
  }

  const platforms: CommunityPlatform[] = ["reddit", "quora", "medium"]
  const platform = platforms[id % platforms.length]
  
  // Deterministic values based on id
  const ageInDays = 180 + (id * 47) % 400 // 180-580 days
  const rankPosition = 3 + (id % 7) // 3-9

  const sources: CommunitySource[] = [{
    platform,
    url: `https://${platform}.com/example-${id}`,
    title: platform === "reddit" 
      ? `r/technology - ${keyword} discussion`
      : `${keyword} explained - ${PLATFORM_INFO[platform].name}`,
    rankPosition,
    ageInDays,
    lastActivityDays: ageInDays - 20,
    engagement: {
      upvotes: 50 + (id * 23) % 400,
      comments: 10 + (id * 7) % 80,
    },
    hasOutdatedFlag: id % 4 === 0,
    hasControversy: id % 5 === 0,
    subreddit: platform === "reddit" ? "technology" : undefined,
    qualityScore: 30 + (id * 13) % 40,
  }]

  return analyzeCommunityDecay(keyword, sources)
}

// ============================================
// ALERT GENERATOR
// ============================================

/**
 * Generate decay alerts for dashboard
 */
export function generateDecayAlerts(
  analyses: CommunityDecayAnalysis[]
): CommunityDecayAlert[] {
  const alerts: CommunityDecayAlert[] = []

  for (const analysis of analyses) {
    if (analysis.decayScore >= 70 && analysis.bestOpportunity) {
      const source = analysis.bestOpportunity
      alerts.push({
        keyword: analysis.keyword,
        platform: source.platform,
        ageInDays: source.ageInDays,
        rankPosition: source.rankPosition,
        decayScore: analysis.decayScore,
        message: `${PLATFORM_INFO[source.platform].name} at #${source.rankPosition} is ${formatAge(source.ageInDays)} old - Easy target!`,
        actionUrl: `/dashboard/research/overview/${encodeURIComponent(analysis.keyword)}`,
      })
    }
  }

  return alerts.sort((a, b) => b.decayScore - a.decayScore)
}

/**
 * Get decay status summary
 */
export function getDecayStatusSummary(analysis: CommunityDecayAnalysis): {
  status: "opportunity" | "watch" | "none"
  message: string
  color: string
} {
  if (!analysis.hasCommunityContent) {
    return {
      status: "none",
      message: "No community content in SERP",
      color: "text-slate-400",
    }
  }

  if (analysis.decayScore >= 70) {
    return {
      status: "opportunity",
      message: `${analysis.communityCountInTop10} decayed source(s) - High opportunity!`,
      color: "text-emerald-400",
    }
  }

  if (analysis.decayScore >= 40) {
    return {
      status: "watch",
      message: `${analysis.communityCountInTop10} aging source(s) - Monitor for decay`,
      color: "text-amber-400",
    }
  }

  return {
    status: "none",
    message: "Community content still fresh",
    color: "text-slate-400",
  }
}
