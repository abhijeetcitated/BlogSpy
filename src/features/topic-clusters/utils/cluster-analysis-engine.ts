// ============================================
// CLUSTER ANALYSIS ENGINE
// ============================================
// Mathematical logic to analyze keywords and identify:
// 1. Pillar keywords (main topics)
// 2. Sub-keywords (for H2, H3, body, FAQ placement)
// 3. Cluster articles (supporting content)
// 4. Internal linking opportunities

import type {
  SourceKeyword,
  KeywordAnalysis,
  GeneratedPillar,
  GeneratedCluster,
  SubKeywordSuggestion,
  ClusterBuildResult,
  InternalLinkSuggestion,
  PillarScoringWeights,
  KeywordIntent
} from "../types/cluster-builder.types"
import { DEFAULT_PILLAR_WEIGHTS } from "../types/cluster-builder.types"

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Extract root topic from keyword (remove modifiers)
function extractRootTopic(keyword: string): string {
  const modifiers = [
    "best", "top", "how to", "what is", "guide to", "ultimate",
    "complete", "beginner", "advanced", "free", "cheap", "review",
    "vs", "versus", "comparison", "alternative", "2024", "2025",
    "for beginners", "for business", "for small business", "online"
  ]
  
  let root = keyword.toLowerCase()
  for (const mod of modifiers) {
    root = root.replace(new RegExp(`\\b${mod}\\b`, "gi"), "").trim()
  }
  
  // Clean up extra spaces
  return root.replace(/\s+/g, " ").trim()
}

// Extract modifiers from keyword
function extractModifiers(keyword: string): string[] {
  const allModifiers = [
    "best", "top", "how to", "what is", "guide", "ultimate",
    "complete", "beginner", "advanced", "free", "cheap", "review",
    "vs", "versus", "comparison", "alternative", "tips", "tricks",
    "examples", "template", "tool", "software", "app", "service"
  ]
  
  const found: string[] = []
  const lower = keyword.toLowerCase()
  
  for (const mod of allModifiers) {
    if (lower.includes(mod)) {
      found.push(mod)
    }
  }
  
  return found
}

// Detect keyword intent from text
function detectIntent(keyword: string): KeywordIntent {
  const lower = keyword.toLowerCase()
  
  // Transactional indicators
  if (/\b(buy|price|pricing|discount|deal|coupon|order|purchase|shop)\b/.test(lower)) {
    return "transactional"
  }
  
  // Commercial indicators
  if (/\b(best|top|review|comparison|vs|versus|alternative|recommend)\b/.test(lower)) {
    return "commercial"
  }
  
  // Navigational indicators (brand-specific)
  if (/\b(login|sign in|website|official|download)\b/.test(lower)) {
    return "navigational"
  }
  
  // Default to informational
  return "informational"
}

// Calculate semantic similarity between two keywords
function calculateSimilarity(keyword1: string, keyword2: string): number {
  const words1 = new Set(keyword1.toLowerCase().split(/\s+/))
  const words2 = new Set(keyword2.toLowerCase().split(/\s+/))
  
  const intersection = new Set([...words1].filter(w => words2.has(w)))
  const union = new Set([...words1, ...words2])
  
  // Jaccard similarity
  return intersection.size / union.size
}

// Check if keyword2 is a potential sub-keyword of keyword1
function isPotentialChild(parent: string, child: string): boolean {
  const parentRoot = extractRootTopic(parent).toLowerCase()
  const childLower = child.toLowerCase()
  
  // Child should contain parent's root topic
  if (!childLower.includes(parentRoot) && parentRoot.length > 3) {
    // Check if parent words are in child
    const parentWords = parentRoot.split(/\s+/)
    const matchingWords = parentWords.filter(w => childLower.includes(w))
    if (matchingWords.length < parentWords.length * 0.5) {
      return false
    }
  }
  
  // Child should be longer (more specific)
  const childWords = child.split(/\s+/).length
  const parentWords = parent.split(/\s+/).length
  
  return childWords > parentWords
}

// ============================================
// PILLAR SCORING
// ============================================

// Calculate pillar score for a keyword
function calculatePillarScore(
  keyword: SourceKeyword,
  allKeywords: SourceKeyword[],
  weights: PillarScoringWeights = DEFAULT_PILLAR_WEIGHTS
): number {
  let score = 0
  
  // 1. Volume Score (higher = better)
  // Normalize against max volume in dataset
  const maxVolume = Math.max(...allKeywords.map(k => k.volume))
  const volumeScore = (keyword.volume / maxVolume) * 100
  score += volumeScore * weights.volumeWeight
  
  // 2. Word Count Score (shorter = better for pillar)
  const wordCount = keyword.keyword.split(/\s+/).length
  let wordCountScore = 0
  if (wordCount <= 2) wordCountScore = 100
  else if (wordCount === 3) wordCountScore = 80
  else if (wordCount === 4) wordCountScore = 50
  else wordCountScore = 20
  score += wordCountScore * weights.wordCountWeight
  
  // 3. Intent Score (informational > commercial > others)
  let intentScore = 0
  if (keyword.intent === "informational") intentScore = 100
  else if (keyword.intent === "commercial") intentScore = 70
  else if (keyword.intent === "transactional") intentScore = 40
  else intentScore = 30
  score += intentScore * weights.intentWeight
  
  // 4. Broadness Score (fewer modifiers = broader topic)
  const modifiers = extractModifiers(keyword.keyword)
  const broadnessScore = Math.max(0, 100 - (modifiers.length * 25))
  score += broadnessScore * weights.broadnessWeight
  
  // 5. Child Count Score (more potential children = better pillar)
  const potentialChildren = allKeywords.filter(k => 
    k.id !== keyword.id && isPotentialChild(keyword.keyword, k.keyword)
  )
  const childCountScore = Math.min(100, potentialChildren.length * 10)
  score += childCountScore * weights.childCountWeight
  
  return Math.round(score)
}

// ============================================
// SUB-KEYWORD PLACEMENT
// ============================================

// Determine where a sub-keyword should be placed in content
function determinePlacement(
  subKeyword: SourceKeyword,
  pillarKeyword: string
): { placement: "h2" | "h3" | "body" | "faq"; reason: string } {
  const lower = subKeyword.keyword.toLowerCase()
  const wordCount = subKeyword.keyword.split(/\s+/).length
  
  // FAQ indicators - questions
  if (/^(what|how|why|when|where|who|is|can|does|will|should)\b/i.test(lower)) {
    return { 
      placement: "faq", 
      reason: "Question format - ideal for FAQ section" 
    }
  }
  
  // H2 indicators - main subtopics
  // High volume + short + contains pillar root
  const pillarRoot = extractRootTopic(pillarKeyword)
  if (
    subKeyword.volume > 2000 && 
    wordCount <= 4 && 
    lower.includes(pillarRoot.toLowerCase())
  ) {
    return { 
      placement: "h2", 
      reason: "High volume subtopic - main section heading" 
    }
  }
  
  // H2 for "types of", "benefits of", etc.
  if (/\b(types of|benefits of|features of|advantages of|ways to)\b/i.test(lower)) {
    return { 
      placement: "h2", 
      reason: "Major subtopic structure - section heading" 
    }
  }
  
  // H3 indicators - sub-subtopics
  if (wordCount >= 3 && wordCount <= 5 && subKeyword.volume >= 500) {
    return { 
      placement: "h3", 
      reason: "Specific subtopic - subsection heading" 
    }
  }
  
  // Long-tail variations go in body
  if (wordCount >= 5 || subKeyword.volume < 500) {
    return { 
      placement: "body", 
      reason: "Long-tail variation - mention in content" 
    }
  }
  
  // Default to body
  return { 
    placement: "body", 
    reason: "Supporting keyword - natural mention in content" 
  }
}

// ============================================
// MAIN ANALYSIS ENGINE
// ============================================

export interface AnalysisOptions {
  pillarThreshold: number       // Min pillar score to be considered pillar (default: 60)
  maxPillars: number            // Max number of pillars to generate (default: 5)
  minSubKeywords: number        // Min sub-keywords per pillar (default: 3)
  includeOrphans: boolean       // Include unclassified keywords (default: true)
  weights?: PillarScoringWeights
}

const DEFAULT_OPTIONS: AnalysisOptions = {
  pillarThreshold: 55,
  maxPillars: 5,
  minSubKeywords: 3,
  includeOrphans: true,
  weights: DEFAULT_PILLAR_WEIGHTS
}

// Analyze keywords and generate cluster structure
export function analyzeKeywords(
  keywords: SourceKeyword[],
  options: Partial<AnalysisOptions> = {}
): ClusterBuildResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Step 1: Analyze each keyword
  const analyzedKeywords = keywords.map(kw => ({
    ...kw,
    analysis: analyzeKeyword(kw, keywords, opts.weights)
  }))
  
  // Step 2: Sort by pillar score
  const sortedByPillarScore = [...analyzedKeywords]
    .sort((a, b) => (b.analysis?.pillarScore || 0) - (a.analysis?.pillarScore || 0))
  
  // Step 3: Select pillars
  const selectedPillars: SourceKeyword[] = []
  const usedKeywordIds = new Set<string>()
  
  for (const kw of sortedByPillarScore) {
    if (selectedPillars.length >= opts.maxPillars) break
    if ((kw.analysis?.pillarScore || 0) < opts.pillarThreshold) break
    
    // Check if this keyword's root topic is already covered
    const rootTopic = extractRootTopic(kw.keyword)
    const alreadyCovered = selectedPillars.some(p => {
      const pRoot = extractRootTopic(p.keyword)
      return calculateSimilarity(rootTopic, pRoot) > 0.7
    })
    
    if (!alreadyCovered) {
      selectedPillars.push(kw)
      usedKeywordIds.add(kw.id)
    }
  }
  
  // Step 4: Assign sub-keywords to each pillar
  const generatedPillars: GeneratedPillar[] = selectedPillars.map(pillar => {
    const subKeywords: SubKeywordSuggestion[] = []
    
    // Find potential sub-keywords
    for (const kw of analyzedKeywords) {
      if (usedKeywordIds.has(kw.id)) continue
      if (kw.id === pillar.id) continue
      
      // Check if this keyword is a potential child
      if (isPotentialChild(pillar.keyword, kw.keyword)) {
        const { placement, reason } = determinePlacement(kw, pillar.keyword)
        
        subKeywords.push({
          id: kw.id,
          keyword: kw.keyword,
          volume: kw.volume,
          kd: kw.kd,
          placement,
          placementReason: reason,
          importance: kw.volume > 1000 ? "primary" : "secondary",
          isConfirmed: false
        })
        
        usedKeywordIds.add(kw.id)
      }
    }
    
    // Group sub-keywords by placement
    const grouped = {
      h2: subKeywords.filter(sk => sk.placement === "h2"),
      h3: subKeywords.filter(sk => sk.placement === "h3"),
      body: subKeywords.filter(sk => sk.placement === "body"),
      faq: subKeywords.filter(sk => sk.placement === "faq")
    }
    
    // Calculate recommended content specs
    const totalSubKeywords = subKeywords.length
    const recommendedWordCount = Math.max(2000, 1500 + (totalSubKeywords * 200))
    const recommendedHeadings = Math.max(5, grouped.h2.length + grouped.h3.length + 3)
    
    return {
      id: pillar.id,
      keyword: pillar.keyword,
      volume: pillar.volume,
      kd: pillar.kd,
      intent: pillar.intent,
      pillarScore: pillar.analysis?.pillarScore || 0,
      subKeywords: grouped,
      clusterIds: [],
      recommendedWordCount,
      recommendedHeadings,
      isConfirmed: false,
      isEdited: false
    }
  })
  
  // Step 5: Generate clusters from remaining keywords
  const generatedClusters: GeneratedCluster[] = []
  
  for (const kw of analyzedKeywords) {
    if (usedKeywordIds.has(kw.id)) continue
    
    // Find best matching pillar
    let bestPillar: GeneratedPillar | null = null
    let bestScore = 0
    
    for (const pillar of generatedPillars) {
      const similarity = calculateSimilarity(kw.keyword, pillar.keyword)
      if (similarity > bestScore && similarity > 0.2) {
        bestScore = similarity
        bestPillar = pillar
      }
    }
    
    // Only create cluster if we have a pillar match with decent similarity
    if (bestPillar && bestScore > 0.2) {
      const cluster: GeneratedCluster = {
        id: kw.id,
        keyword: kw.keyword,
        volume: kw.volume,
        kd: kw.kd,
        intent: kw.intent,
        pillarId: bestPillar.id,
        pillarKeyword: bestPillar.keyword,
        relationshipStrength: Math.round(bestScore * 100),
        recommendedWordCount: Math.max(1500, 1000 + (kw.volume > 1000 ? 500 : 0)),
        recommendedHeadings: 5,
        isConfirmed: false,
        isEdited: false
      }
      
      generatedClusters.push(cluster)
      bestPillar.clusterIds.push(kw.id)
      usedKeywordIds.add(kw.id)
    }
  }
  
  // Step 6: Collect orphan keywords
  const orphanKeywords = opts.includeOrphans 
    ? analyzedKeywords.filter(kw => !usedKeywordIds.has(kw.id))
    : []
  
  // Step 7: Generate internal linking suggestions
  const linkingMatrix = generateLinkingMatrix(generatedPillars, generatedClusters)
  
  // Step 8: Calculate quality metrics
  const qualityScore = calculateQualityScore(generatedPillars, generatedClusters, keywords.length)
  const coverageScore = Math.round(((keywords.length - orphanKeywords.length) / keywords.length) * 100)
  const balanceScore = calculateBalanceScore(generatedPillars, generatedClusters)
  
  return {
    id: `cluster_${Date.now()}`,
    name: generatedPillars[0]?.keyword || "New Cluster",
    createdAt: new Date(),
    updatedAt: new Date(),
    totalKeywordsInput: keywords.length,
    sourceBreakdown: calculateSourceBreakdown(keywords),
    pillars: generatedPillars,
    clusters: generatedClusters,
    orphanKeywords,
    linkingMatrix,
    qualityScore,
    coverageScore,
    balanceScore
  }
}

// Analyze a single keyword
function analyzeKeyword(
  keyword: SourceKeyword,
  allKeywords: SourceKeyword[],
  weights?: PillarScoringWeights
): KeywordAnalysis {
  const rootTopic = extractRootTopic(keyword.keyword)
  const modifiers = extractModifiers(keyword.keyword)
  const pillarScore = calculatePillarScore(keyword, allKeywords, weights)
  
  // Find potential parents
  const potentialParentIds = allKeywords
    .filter(k => k.id !== keyword.id && isPotentialChild(k.keyword, keyword.keyword))
    .map(k => k.id)
  
  // Determine semantic group
  const semanticGroup = rootTopic || keyword.keyword
  
  return {
    isPillarCandidate: pillarScore >= 55,
    pillarScore,
    rootTopic,
    modifiers,
    wordCount: keyword.keyword.split(/\s+/).length,
    potentialParentIds,
    semanticGroup
  }
}

// Generate internal linking suggestions
function generateLinkingMatrix(
  pillars: GeneratedPillar[],
  clusters: GeneratedCluster[]
): InternalLinkSuggestion[] {
  const suggestions: InternalLinkSuggestion[] = []
  
  // Pillar → Cluster links
  for (const pillar of pillars) {
    const pillarClusters = clusters.filter(c => c.pillarId === pillar.id)
    
    for (const cluster of pillarClusters) {
      suggestions.push({
        fromId: pillar.id,
        fromKeyword: pillar.keyword,
        toId: cluster.id,
        toKeyword: cluster.keyword,
        anchorText: cluster.keyword,
        placementHint: "Within relevant section discussing " + extractRootTopic(cluster.keyword),
        relevanceScore: cluster.relationshipStrength,
        isRequired: true
      })
    }
  }
  
  // Cluster → Pillar links (mandatory back-links)
  for (const cluster of clusters) {
    const pillar = pillars.find(p => p.id === cluster.pillarId)
    if (pillar) {
      suggestions.push({
        fromId: cluster.id,
        fromKeyword: cluster.keyword,
        toId: pillar.id,
        toKeyword: pillar.keyword,
        anchorText: pillar.keyword + " guide",
        placementHint: "Introduction or conclusion - link back to main guide",
        relevanceScore: 100,
        isRequired: true
      })
    }
  }
  
  // Cluster ↔ Cluster links (related articles)
  for (let i = 0; i < clusters.length; i++) {
    for (let j = i + 1; j < clusters.length; j++) {
      const similarity = calculateSimilarity(clusters[i].keyword, clusters[j].keyword)
      if (similarity > 0.3) {
        // Bi-directional link suggestion
        suggestions.push({
          fromId: clusters[i].id,
          fromKeyword: clusters[i].keyword,
          toId: clusters[j].id,
          toKeyword: clusters[j].keyword,
          anchorText: clusters[j].keyword,
          placementHint: "Related content section",
          relevanceScore: Math.round(similarity * 100),
          isRequired: false
        })
        
        suggestions.push({
          fromId: clusters[j].id,
          fromKeyword: clusters[j].keyword,
          toId: clusters[i].id,
          toKeyword: clusters[i].keyword,
          anchorText: clusters[i].keyword,
          placementHint: "Related content section",
          relevanceScore: Math.round(similarity * 100),
          isRequired: false
        })
      }
    }
  }
  
  return suggestions
}

// Calculate quality score
function calculateQualityScore(
  pillars: GeneratedPillar[],
  clusters: GeneratedCluster[],
  totalKeywords: number
): number {
  let score = 0
  
  // Has at least 1 pillar
  if (pillars.length > 0) score += 20
  
  // Has 2-5 pillars (ideal range)
  if (pillars.length >= 2 && pillars.length <= 5) score += 20
  
  // Each pillar has sub-keywords
  const pillarsWithSubs = pillars.filter(p => 
    p.subKeywords.h2.length + p.subKeywords.h3.length + 
    p.subKeywords.body.length + p.subKeywords.faq.length > 0
  )
  score += Math.round((pillarsWithSubs.length / Math.max(1, pillars.length)) * 20)
  
  // Has clusters
  if (clusters.length > 0) score += 20
  
  // Good pillar to cluster ratio (1:3 to 1:6 is ideal)
  const ratio = clusters.length / Math.max(1, pillars.length)
  if (ratio >= 3 && ratio <= 6) score += 20
  else if (ratio >= 2 && ratio <= 8) score += 10
  
  return Math.min(100, score)
}

// Calculate balance score
function calculateBalanceScore(
  pillars: GeneratedPillar[],
  clusters: GeneratedCluster[]
): number {
  if (pillars.length === 0) return 0
  
  // Calculate cluster distribution across pillars
  const clusterCounts = pillars.map(p => clusters.filter(c => c.pillarId === p.id).length)
  const avgClusters = clusterCounts.reduce((a, b) => a + b, 0) / pillars.length
  
  // Calculate variance
  const variance = clusterCounts.reduce((sum, count) => 
    sum + Math.pow(count - avgClusters, 2), 0
  ) / pillars.length
  
  // Lower variance = more balanced
  const balanceScore = Math.max(0, 100 - (variance * 5))
  
  return Math.round(balanceScore)
}

// Calculate source breakdown
function calculateSourceBreakdown(keywords: SourceKeyword[]): Record<string, number> {
  const breakdown: Record<string, number> = {}
  
  for (const kw of keywords) {
    breakdown[kw.source] = (breakdown[kw.source] || 0) + 1
  }
  
  return breakdown
}

// ============================================
// EXPORT FOR TESTING
// ============================================

export {
  extractRootTopic,
  extractModifiers,
  detectIntent,
  calculateSimilarity,
  isPotentialChild,
  calculatePillarScore,
  determinePlacement
}
