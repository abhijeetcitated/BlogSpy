// ============================================
// KEYWORD ANALYSIS ENGINE - Professional Logic
// ============================================
// Mathematical calculations for pillar/cluster identification

import type {
  KeywordData,
  SearchIntent,
  KeywordCharacteristics,
  TrendData,
  KeywordFilters,
  SortConfig,
  KOSFactors
} from "../types/keyword-pool.types"

import type {
  PillarCandidate,
  PillarScoring,
  ScoreBreakdown,
  ChildKeyword,
  SubKeywordPlacement,
  ClusterArticle,
  ClusterBuildConfig,
  AnalysisClusterBuildResult,
  CannibalizationRisk,
  LinkingSuggestion,
  BuildQualityMetrics,
} from "../types/cluster-analysis.types"

import { ANALYSIS_DEFAULT_CLUSTER_CONFIG, DEFAULT_PLACEMENT_RULES, ANALYSIS_DEFAULT_PILLAR_WEIGHTS } from "../types/cluster-analysis.types"
import { INTENT_INDICATORS, KOS_WEIGHTS } from "../types/keyword-pool.types"

// ============================================
// INTENT CLASSIFICATION
// ============================================

export function classifyIntent(keyword: string): { intent: SearchIntent; score: number } {
  const lowerKeyword = keyword.toLowerCase()
  const words = lowerKeyword.split(/\s+/)
  
  const scores: Record<SearchIntent, number> = {
    informational: 0,
    commercial: 0,
    transactional: 0,
    navigational: 0
  }
  
  // Check each word against indicators
  for (const word of words) {
    if (INTENT_INDICATORS.informational.some(ind => word.includes(ind))) {
      scores.informational += 2
    }
    if (INTENT_INDICATORS.commercial.some(ind => word.includes(ind))) {
      scores.commercial += 2
    }
    if (INTENT_INDICATORS.transactional.some(ind => word.includes(ind))) {
      scores.transactional += 2
    }
    if (INTENT_INDICATORS.navigational.some(ind => word.includes(ind))) {
      scores.navigational += 2
    }
  }
  
  // Also check full keyword for multi-word patterns
  if (/how to|what is|why|guide|tutorial|learn|tips|examples/.test(lowerKeyword)) {
    scores.informational += 3
  }
  if (/best|top \d+|review|vs|versus|comparison|alternative/.test(lowerKeyword)) {
    scores.commercial += 3
  }
  if (/buy|price|cheap|discount|deal|coupon|free trial/.test(lowerKeyword)) {
    scores.transactional += 3
  }
  
  // Find highest score
  const maxScore = Math.max(...Object.values(scores))
  const intent = (Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || "informational") as SearchIntent
  
  // Calculate confidence (0-100)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  const confidence = totalScore > 0 ? Math.min(100, Math.round((maxScore / totalScore) * 100)) : 50
  
  return { intent, score: confidence }
}

// ============================================
// KEYWORD CHARACTERISTICS EXTRACTION
// ============================================

export function extractCharacteristics(keyword: string): KeywordCharacteristics {
  const lowerKeyword = keyword.toLowerCase()
  const words = keyword.split(/\s+/)
  
  // Question words
  const questionWords = ["how", "what", "why", "when", "where", "who", "which", "can", "does", "is", "should", "will"]
  const foundQuestionWord = questionWords.find(q => lowerKeyword.startsWith(q + " ") || lowerKeyword.includes(" " + q + " "))
  
  // Modifiers
  const modifierPatterns = ["best", "top", "free", "cheap", "online", "easy", "quick", "simple", "ultimate", "complete", "beginner", "advanced", "professional"]
  const foundModifiers = modifierPatterns.filter(m => lowerKeyword.includes(m))
  
  // Year detection
  const yearMatch = keyword.match(/\b(20\d{2})\b/)
  const year = yearMatch ? parseInt(yearMatch[1]) : undefined
  
  // Location detection (common patterns)
  const locationPatterns = /\b(in|near|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/
  const locationMatch = keyword.match(locationPatterns)
  
  // Root topic extraction (remove modifiers, questions, years)
  let rootTopic = lowerKeyword
  questionWords.forEach(q => {
    rootTopic = rootTopic.replace(new RegExp(`^${q}\\s+(to\\s+)?`, "i"), "")
  })
  modifierPatterns.forEach(m => {
    rootTopic = rootTopic.replace(new RegExp(`\\b${m}\\b`, "gi"), "")
  })
  rootTopic = rootTopic.replace(/\b20\d{2}\b/g, "").replace(/\s+/g, " ").trim()
  
  return {
    wordCount: words.length,
    charLength: keyword.length,
    hasQuestionWord: !!foundQuestionWord,
    hasModifier: foundModifiers.length > 0,
    hasYear: !!year,
    hasLocation: !!locationMatch,
    hasNumber: /\d/.test(keyword),
    rootTopic,
    modifiers: foundModifiers,
    questionWord: foundQuestionWord,
    year,
    location: locationMatch?.[2]
  }
}

// ============================================
// KEYWORD OPPORTUNITY SCORE (KOS)
// ============================================

export function calculateKOS(keyword: KeywordData): { score: number; factors: KOSFactors } {
  // Volume score (log scale, normalized)
  const volumeScore = Math.min(100, (Math.log10(keyword.volume + 1) / Math.log10(100000)) * 100)
  
  // Difficulty score (inverted - lower KD = higher score)
  const difficultyScore = 100 - keyword.kd
  
  // CPC value score (higher CPC = more valuable, capped at $10)
  const cpcValue = Math.min(100, (keyword.cpc / 10) * 100)
  
  // Trend bonus
  let trendBonus = 50 // neutral
  if (keyword.trend.direction === "up") {
    trendBonus = 50 + (keyword.trend.changePercent / 2)
  } else if (keyword.trend.direction === "down") {
    trendBonus = Math.max(0, 50 - (Math.abs(keyword.trend.changePercent) / 2))
  }
  trendBonus = Math.min(100, trendBonus)
  
  // SERP opportunity
  const serpOpportunity = keyword.serpFeatures.rankingOpportunity
  
  // Competition score (inverted)
  const competitionScore = (1 - keyword.competition) * 100
  
  const factors: KOSFactors = {
    volumeScore,
    difficultyScore,
    cpcValue,
    trendBonus,
    serpOpportunity,
    competitionScore
  }
  
  // Weighted calculation
  const score = Math.round(
    volumeScore * KOS_WEIGHTS.volume +
    difficultyScore * KOS_WEIGHTS.difficulty +
    cpcValue * KOS_WEIGHTS.cpcValue +
    trendBonus * KOS_WEIGHTS.trend +
    serpOpportunity * KOS_WEIGHTS.serpOpportunity +
    competitionScore * KOS_WEIGHTS.competition
  )
  
  return { score: Math.min(100, Math.max(0, score)), factors }
}

// ============================================
// PILLAR SCORE CALCULATION
// ============================================

export function calculatePillarScore(
  keyword: KeywordData,
  allKeywords: KeywordData[],
  config: ClusterBuildConfig = ANALYSIS_DEFAULT_CLUSTER_CONFIG as ClusterBuildConfig
): PillarScoring {
  const characteristics = keyword.analysis?.clusterId 
    ? extractCharacteristics(keyword.keyword)
    : extractCharacteristics(keyword.keyword)
  
  const breakdown: ScoreBreakdown[] = []
  
  // 1. Volume Score (higher = better pillar)
  const maxVolume = Math.max(...allKeywords.map(k => k.volume))
  const volumeScore = Math.min(100, (keyword.volume / maxVolume) * 100)
  breakdown.push({
    factor: "Search Volume",
    score: Math.round(volumeScore),
    weight: config.weights.volume,
    weighted: Math.round(volumeScore * config.weights.volume),
    reason: `${keyword.volume.toLocaleString()} monthly searches`
  })
  
  // 2. Word Count Score (shorter = better pillar, 1-3 words ideal)
  let wordCountScore = 0
  if (characteristics.wordCount <= 2) wordCountScore = 100
  else if (characteristics.wordCount === 3) wordCountScore = 80
  else if (characteristics.wordCount === 4) wordCountScore = 50
  else wordCountScore = Math.max(0, 30 - (characteristics.wordCount - 4) * 10)
  breakdown.push({
    factor: "Word Count",
    score: wordCountScore,
    weight: config.weights.wordCount,
    weighted: Math.round(wordCountScore * config.weights.wordCount),
    reason: `${characteristics.wordCount} words (${characteristics.wordCount <= 3 ? "ideal" : "too specific"})`
  })
  
  // 3. Child Count Score (more potential children = better pillar)
  const potentialChildren = allKeywords.filter(k => {
    if (k.id === keyword.id) return false
    const kChars = extractCharacteristics(k.keyword)
    return kChars.rootTopic.includes(characteristics.rootTopic) ||
           characteristics.rootTopic.includes(kChars.rootTopic) ||
           k.keyword.toLowerCase().includes(characteristics.rootTopic)
  })
  const childCountScore = Math.min(100, (potentialChildren.length / Math.max(10, allKeywords.length * 0.3)) * 100)
  breakdown.push({
    factor: "Related Keywords",
    score: Math.round(childCountScore),
    weight: config.weights.childCount,
    weighted: Math.round(childCountScore * config.weights.childCount),
    reason: `${potentialChildren.length} related keywords found`
  })
  
  // 4. Intent Score (informational/commercial = better pillar)
  let intentScore = 0
  if (keyword.intent === "informational") intentScore = 100
  else if (keyword.intent === "commercial") intentScore = 80
  else if (keyword.intent === "transactional") intentScore = 40
  else intentScore = 20
  breakdown.push({
    factor: "Search Intent",
    score: intentScore,
    weight: config.weights.intent,
    weighted: Math.round(intentScore * config.weights.intent),
    reason: `${keyword.intent} intent (${intentScore >= 80 ? "good for pillar" : "better for cluster"})`
  })
  
  // 5. Broadness Score (no modifiers/questions = broader topic)
  let broadnessScore = 100
  if (characteristics.hasQuestionWord) broadnessScore -= 30
  if (characteristics.hasModifier) broadnessScore -= 20
  if (characteristics.hasYear) broadnessScore -= 15
  if (characteristics.hasNumber) broadnessScore -= 10
  broadnessScore = Math.max(0, broadnessScore)
  breakdown.push({
    factor: "Topic Broadness",
    score: broadnessScore,
    weight: config.weights.broadness,
    weighted: Math.round(broadnessScore * config.weights.broadness),
    reason: characteristics.hasModifier || characteristics.hasQuestionWord 
      ? "Has modifiers/questions (more specific)"
      : "Broad topic (good pillar)"
  })
  
  // 6. Traffic Potential Score
  const trafficScore = Math.min(100, (keyword.trafficPotential / Math.max(...allKeywords.map(k => k.trafficPotential))) * 100)
  breakdown.push({
    factor: "Traffic Potential",
    score: Math.round(trafficScore),
    weight: config.weights.trafficPotential,
    weighted: Math.round(trafficScore * config.weights.trafficPotential),
    reason: `${keyword.trafficPotential.toLocaleString()} potential monthly visits`
  })
  
  // 7. Trend Score
  let trendScore = 50
  if (keyword.trend.direction === "up") {
    trendScore = Math.min(100, 50 + keyword.trend.changePercent)
  } else if (keyword.trend.direction === "down") {
    trendScore = Math.max(0, 50 - Math.abs(keyword.trend.changePercent))
  }
  breakdown.push({
    factor: "Trend",
    score: Math.round(trendScore),
    weight: config.weights.trend,
    weighted: Math.round(trendScore * config.weights.trend),
    reason: keyword.trend.direction === "up" 
      ? `Rising +${keyword.trend.changePercent}%`
      : keyword.trend.direction === "down"
        ? `Declining ${keyword.trend.changePercent}%`
        : "Stable trend"
  })
  
  return {
    volumeScore: Math.round(volumeScore),
    wordCountScore,
    childCountScore: Math.round(childCountScore),
    intentScore,
    broadnessScore,
    trafficPotentialScore: Math.round(trafficScore),
    trendScore: Math.round(trendScore),
    breakdown
  }
}

// ============================================
// SUB-KEYWORD PLACEMENT
// ============================================

export function determinePlacement(
  keyword: KeywordData,
  pillarKeyword: KeywordData
): { placement: SubKeywordPlacement; score: number; reason: string } {
  const kwChars = extractCharacteristics(keyword.keyword)
  const pillarChars = extractCharacteristics(pillarKeyword.keyword)
  
  // FAQ check first (question words)
  if (kwChars.hasQuestionWord) {
    return {
      placement: "faq",
      score: 90,
      reason: `Question keyword: "${kwChars.questionWord}" detected`
    }
  }
  
  const wordCountDiff = kwChars.wordCount - pillarChars.wordCount
  
  // H2: High volume, 1-2 words more than pillar, same intent
  if (
    keyword.volume >= 500 &&
    wordCountDiff >= 1 && wordCountDiff <= 2 &&
    keyword.intent === pillarKeyword.intent
  ) {
    return {
      placement: "h2",
      score: 85,
      reason: `High volume (${keyword.volume}) subtopic, +${wordCountDiff} words from pillar`
    }
  }
  
  // H3: Medium volume, 2-4 words more, under an H2 topic
  if (
    keyword.volume >= 100 &&
    wordCountDiff >= 2 && wordCountDiff <= 4
  ) {
    return {
      placement: "h3",
      score: 75,
      reason: `Specific subtopic (${keyword.volume} vol), +${wordCountDiff} words from pillar`
    }
  }
  
  // Body: Long-tail, lower volume, natural integration
  return {
    placement: "body",
    score: 60,
    reason: `Long-tail variation for body content (${keyword.volume} vol)`
  }
}

// ============================================
// CLUSTER ARTICLE IDENTIFICATION
// ============================================

export function shouldBeClusterArticle(
  keyword: KeywordData,
  pillarKeyword: KeywordData,
  config: ClusterBuildConfig = ANALYSIS_DEFAULT_CLUSTER_CONFIG as ClusterBuildConfig
): { isCluster: boolean; reason: string; articleType: string } {
  
  // Different intent = separate article
  if (keyword.intent !== pillarKeyword.intent) {
    // High-intent keywords deserve separate articles
    if (keyword.intent === "transactional" && keyword.volume >= 500) {
      return {
        isCluster: true,
        reason: "Transactional intent (buy/price) needs dedicated landing page",
        articleType: "transactional-page"
      }
    }
    if (keyword.intent === "commercial" && pillarKeyword.intent === "informational") {
      return {
        isCluster: true,
        reason: "Commercial intent (comparison/review) different from informational pillar",
        articleType: "comparison-post"
      }
    }
  }
  
  // High volume keywords deserve separate articles
  if (keyword.volume >= config.clusterArticleMinVolume) {
    const kwChars = extractCharacteristics(keyword.keyword)
    
    // "vs" keywords = comparison posts
    if (keyword.keyword.toLowerCase().includes(" vs ") || keyword.keyword.toLowerCase().includes(" versus ")) {
      return {
        isCluster: true,
        reason: `Comparison keyword (${keyword.volume} vol) - needs dedicated comparison post`,
        articleType: "comparison-post"
      }
    }
    
    // "best" keywords = list posts
    if (kwChars.modifiers.includes("best") || kwChars.modifiers.includes("top")) {
      return {
        isCluster: true,
        reason: `List keyword (${keyword.volume} vol) - needs dedicated list post`,
        articleType: "list-post"
      }
    }
    
    // "how to" with high volume = tutorial
    if (kwChars.hasQuestionWord && kwChars.questionWord === "how") {
      return {
        isCluster: true,
        reason: `Tutorial keyword (${keyword.volume} vol) - needs step-by-step guide`,
        articleType: "how-to-tutorial"
      }
    }
    
    // High CPC = valuable enough for separate article
    if (keyword.cpc >= config.clusterArticleMinCPC) {
      return {
        isCluster: true,
        reason: `High-value keyword ($${keyword.cpc} CPC, ${keyword.volume} vol)`,
        articleType: "comprehensive-guide"
      }
    }
  }
  
  return {
    isCluster: false,
    reason: "Better as sub-keyword within pillar",
    articleType: ""
  }
}

// ============================================
// CANNIBALIZATION DETECTION
// ============================================

export function detectCannibalization(keywords: KeywordData[]): CannibalizationRisk[] {
  const risks: CannibalizationRisk[] = []
  
  for (let i = 0; i < keywords.length; i++) {
    for (let j = i + 1; j < keywords.length; j++) {
      const kw1 = keywords[i]
      const kw2 = keywords[j]
      
      const chars1 = extractCharacteristics(kw1.keyword)
      const chars2 = extractCharacteristics(kw2.keyword)
      
      // Same root topic
      if (chars1.rootTopic === chars2.rootTopic) {
        // Same intent = high risk
        if (kw1.intent === kw2.intent) {
          const riskScore = 80 + (20 * (1 - Math.abs(kw1.volume - kw2.volume) / Math.max(kw1.volume, kw2.volume)))
          risks.push({
            keyword1Id: kw1.id,
            keyword1: kw1.keyword,
            keyword2Id: kw2.id,
            keyword2: kw2.keyword,
            riskScore: Math.round(riskScore),
            riskLevel: riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low",
            reason: `Same root topic "${chars1.rootTopic}" and same ${kw1.intent} intent`,
            recommendation: riskScore >= 70 ? "merge" : "differentiate"
          })
        }
      }
      
      // Very similar keywords (one contains the other)
      if (kw1.keyword.toLowerCase().includes(kw2.keyword.toLowerCase()) ||
          kw2.keyword.toLowerCase().includes(kw1.keyword.toLowerCase())) {
        if (kw1.intent === kw2.intent) {
          risks.push({
            keyword1Id: kw1.id,
            keyword1: kw1.keyword,
            keyword2Id: kw2.id,
            keyword2: kw2.keyword,
            riskScore: 65,
            riskLevel: "medium",
            reason: "One keyword contains the other with same intent",
            recommendation: "merge"
          })
        }
      }
    }
  }
  
  return risks.sort((a, b) => b.riskScore - a.riskScore)
}

// ============================================
// FILTER & SORT KEYWORDS
// ============================================

export function filterKeywords(keywords: KeywordData[], filters: KeywordFilters): KeywordData[] {
  return keywords.filter(kw => {
    if (kw.volume < filters.volumeMin || kw.volume > filters.volumeMax) return false
    if (kw.kd < filters.kdMin || kw.kd > filters.kdMax) return false
    if (kw.cpc < filters.cpcMin || kw.cpc > filters.cpcMax) return false
    
    const chars = extractCharacteristics(kw.keyword)
    if (chars.wordCount < filters.wordCountMin || chars.wordCount > filters.wordCountMax) return false
    
    if (filters.intent !== "all" && kw.intent !== filters.intent) return false
    if (filters.trend !== "all" && kw.trend.direction !== filters.trend) return false
    if (filters.source !== "all" && kw.source !== filters.source) return false
    
    if (filters.hasSnippet !== null && kw.serpFeatures.featuredSnippet !== filters.hasSnippet) return false
    
    if (filters.searchQuery && !kw.keyword.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false
    
    return true
  })
}

export function sortKeywords(keywords: KeywordData[], sort: SortConfig): KeywordData[] {
  return [...keywords].sort((a, b) => {
    let comparison = 0
    
    switch (sort.field) {
      case "keyword":
        comparison = a.keyword.localeCompare(b.keyword)
        break
      case "volume":
        comparison = a.volume - b.volume
        break
      case "kd":
        comparison = a.kd - b.kd
        break
      case "cpc":
        comparison = a.cpc - b.cpc
        break
      case "trafficPotential":
        comparison = a.trafficPotential - b.trafficPotential
        break
      case "trend":
        comparison = a.trend.changePercent - b.trend.changePercent
        break
      case "opportunity":
        const kosA = calculateKOS(a)
        const kosB = calculateKOS(b)
        comparison = kosA.score - kosB.score
        break
    }
    
    return sort.direction === "desc" ? -comparison : comparison
  })
}

// ============================================
// LINKING MATRIX GENERATION
// ============================================

export function generateLinkingMatrix(
  pillars: PillarCandidate[],
  clusters: ClusterArticle[]
): LinkingSuggestion[] {
  const suggestions: LinkingSuggestion[] = []
  
  // Pillar to Pillar links (related topics)
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const p1Chars = extractCharacteristics(pillars[i].keyword)
      const p2Chars = extractCharacteristics(pillars[j].keyword)
      
      // Check if related
      if (p1Chars.rootTopic.includes(p2Chars.rootTopic.split(" ")[0]) ||
          p2Chars.rootTopic.includes(p1Chars.rootTopic.split(" ")[0])) {
        suggestions.push({
          sourceId: pillars[i].id,
          sourceType: "pillar",
          sourceKeyword: pillars[i].keyword,
          targetId: pillars[j].id,
          targetType: "pillar",
          targetKeyword: pillars[j].keyword,
          linkType: "related",
          strength: 60,
          anchorSuggestions: [pillars[j].keyword, `learn more about ${pillars[j].keyword}`]
        })
      }
    }
  }
  
  // Cluster to Pillar links (child to parent)
  for (const cluster of clusters) {
    const parentPillar = pillars.find(p => p.id === cluster.parentPillarId)
    if (parentPillar) {
      suggestions.push({
        sourceId: cluster.id,
        sourceType: "cluster",
        sourceKeyword: cluster.keyword,
        targetId: parentPillar.id,
        targetType: "pillar",
        targetKeyword: parentPillar.keyword,
        linkType: "contextual",
        strength: 90,
        anchorSuggestions: [
          parentPillar.keyword,
          `complete guide to ${parentPillar.keyword}`,
          `${parentPillar.keyword} overview`
        ]
      })
    }
  }
  
  // Cluster to Cluster links (siblings under same pillar)
  for (let i = 0; i < clusters.length; i++) {
    for (let j = i + 1; j < clusters.length; j++) {
      if (clusters[i].parentPillarId === clusters[j].parentPillarId) {
        suggestions.push({
          sourceId: clusters[i].id,
          sourceType: "cluster",
          sourceKeyword: clusters[i].keyword,
          targetId: clusters[j].id,
          targetType: "cluster",
          targetKeyword: clusters[j].keyword,
          linkType: "related",
          strength: 70,
          anchorSuggestions: [clusters[j].keyword, `related: ${clusters[j].keyword}`]
        })
      }
    }
  }
  
  return suggestions.sort((a, b) => b.strength - a.strength)
}


