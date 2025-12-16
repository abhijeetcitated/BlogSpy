// Cannibalization Mock Data Generator

import { MOCK_PAGES, SEMANTIC_GROUPS, KEYWORD_VOLUMES } from "../constants"
import { 
  calculateSeverity, 
  calculateOverlapScore, 
  calculateTrafficLoss 
} from "../utils/cannibalization-utils"
import type { 
  CannibalizationAnalysis, 
  CannibalizationIssue, 
  CannibalizingPage,
  CannibalizationType,
  CannibalizationAction,
  CannibalizationSeverity,
  CannibalizationTrend
} from "../types"

function determineType(pages: CannibalizingPage[]): CannibalizationType {
  const keywords = pages.map(p => p.targetKeyword.toLowerCase())
  const uniqueKeywords = [...new Set(keywords)]
  
  if (uniqueKeywords.length === 1) return "same_keyword"
  
  const titles = pages.map(p => p.title.toLowerCase())
  const commonWords = titles.reduce((common, title, i) => {
    if (i === 0) return new Set(title.split(/\s+/))
    const words = new Set(title.split(/\s+/))
    return new Set([...common].filter(w => words.has(w)))
  }, new Set<string>())
  
  if (commonWords.size > 3) return "title_overlap"
  
  const rankedPages = pages.filter(p => p.currentRank && p.currentRank <= 20)
  if (rankedPages.length > 1) return "ranking_split"
  
  return "similar_keyword"
}

function recommendAction(
  pages: CannibalizingPage[], 
  severity: CannibalizationSeverity
): CannibalizationAction {
  const primary = pages[0]
  const secondary = pages[1]
  
  if (secondary.traffic < primary.traffic * 0.2 && secondary.pageAuthority < primary.pageAuthority * 0.6) {
    return "redirect"
  }
  
  if (secondary.traffic > primary.traffic * 0.4) {
    if (severity === "critical" || severity === "high") return "merge"
    return "differentiate"
  }
  
  const secondaryAge = new Date().getTime() - new Date(secondary.lastUpdated).getTime()
  const daysSinceUpdate = secondaryAge / (1000 * 60 * 60 * 24)
  if (daysSinceUpdate > 180) return "redirect"
  
  if (severity === "critical") return "merge"
  if (severity === "high") return "redirect"
  if (severity === "medium") return "canonical"
  return "differentiate"
}

function generateRecommendation(pages: CannibalizingPage[], action: CannibalizationAction): string {
  const primary = pages[0]
  const secondary = pages[1]
  
  switch (action) {
    case "merge":
      return `Merge "${secondary.title}" into "${primary.title}". The primary page has ${primary.backlinks} backlinks vs ${secondary.backlinks}. Combine the unique content from both, then redirect.`
    case "redirect":
      return `301 redirect "${secondary.url}" to "${primary.url}". The secondary page only gets ${secondary.traffic} visits vs ${primary.traffic}. Preserve any unique value by updating the primary first.`
    case "differentiate":
      return `Differentiate content focus. Consider changing "${secondary.title}" to target a more specific long-tail variation or different search intent.`
    case "canonical":
      return `Add canonical tag on "${secondary.url}" pointing to "${primary.url}". This tells Google which version to prioritize while keeping both pages live.`
    case "noindex":
      return `Add noindex to "${secondary.url}". Keep the page accessible for users but remove from Google's index to consolidate ranking signals.`
    case "reoptimize":
      return `Reoptimize "${secondary.title}" for a different keyword. Current target "${secondary.targetKeyword}" conflicts with the primary page.`
    default:
      return "Review both pages and consolidate ranking signals."
  }
}

function getEstimatedVolume(keyword: string): number {
  return KEYWORD_VOLUMES[keyword] || Math.floor(Math.random() * 20000) + 5000
}

function detectCannibalization(pages: CannibalizingPage[]): CannibalizationIssue[] {
  const issues: CannibalizationIssue[] = []
  const keywordGroups = new Map<string, CannibalizingPage[]>()
  
  pages.forEach(page => {
    const keyword = page.targetKeyword.toLowerCase()
    if (!keywordGroups.has(keyword)) keywordGroups.set(keyword, [])
    keywordGroups.get(keyword)!.push(page)
  })
  
  keywordGroups.forEach((groupPages, keyword) => {
    if (groupPages.length > 1) {
      const sortedPages = [...groupPages].sort((a, b) => b.traffic - a.traffic)
      sortedPages[0].isPrimary = true
      sortedPages.slice(1).forEach(p => p.isPrimary = false)
      
      const overlapScore = calculateOverlapScore(sortedPages)
      const trafficLoss = calculateTrafficLoss(sortedPages)
      const severity = calculateSeverity(overlapScore, trafficLoss, sortedPages.length)
      const action = recommendAction(sortedPages, severity)
      
      issues.push({
        id: `cannibal-${keyword.replace(/\s+/g, '-')}`,
        keyword,
        searchVolume: getEstimatedVolume(keyword),
        keywordDifficulty: Math.floor(Math.random() * 40) + 30,
        pages: sortedPages,
        type: determineType(sortedPages),
        severity,
        overlapScore,
        trafficLoss,
        recommendedAction: action,
        recommendation: generateRecommendation(sortedPages, action),
        potentialGain: Math.round(trafficLoss * 0.7),
        detectedAt: new Date().toISOString()
      })
    }
  })
  
  // Semantic overlap detection
  const existingKeywords = new Set(issues.map(i => i.keyword))
  Object.entries(SEMANTIC_GROUPS).forEach(([theme, keywords]) => {
    const matchingPages = pages.filter(p => 
      keywords.some(k => 
        p.targetKeyword.toLowerCase().includes(k) || k.includes(p.targetKeyword.toLowerCase())
      ) && !existingKeywords.has(p.targetKeyword.toLowerCase())
    )
    
    if (matchingPages.length > 1) {
      const uniqueKeywords = [...new Set(matchingPages.map(p => p.targetKeyword))]
      if (uniqueKeywords.length > 1) {
        const sortedPages = [...matchingPages].sort((a, b) => b.traffic - a.traffic)
        const overlapScore = calculateOverlapScore(sortedPages) * 0.7
        const trafficLoss = calculateTrafficLoss(sortedPages) * 0.5
        
        if (overlapScore > 30) {
          issues.push({
            id: `semantic-${theme}`,
            keyword: `${theme} (semantic group)`,
            searchVolume: sortedPages.reduce((sum, p) => sum + (p.traffic * 3), 0),
            keywordDifficulty: 45,
            pages: sortedPages,
            type: "similar_keyword",
            severity: calculateSeverity(overlapScore, trafficLoss, sortedPages.length),
            overlapScore: Math.round(overlapScore),
            trafficLoss: Math.round(trafficLoss),
            recommendedAction: "differentiate",
            recommendation: `These pages target semantically similar keywords in the "${theme}" topic. Consider differentiating content focus or consolidating into a comprehensive pillar page.`,
            potentialGain: Math.round(trafficLoss * 0.5),
            detectedAt: new Date().toISOString()
          })
        }
      }
    }
  })
  
  return issues.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.severity] - order[b.severity]
  })
}

export function generateMockCannibalizationAnalysis(): CannibalizationAnalysis {
  const issues = detectCannibalization(MOCK_PAGES)
  
  const issuesBySeverity = {
    critical: issues.filter(i => i.severity === "critical").length,
    high: issues.filter(i => i.severity === "high").length,
    medium: issues.filter(i => i.severity === "medium").length,
    low: issues.filter(i => i.severity === "low").length,
  }
  
  const totalTrafficLoss = issues.reduce((sum, i) => sum + i.trafficLoss, 0)
  const totalPotentialGain = issues.reduce((sum, i) => sum + i.potentialGain, 0)
  
  const healthPenalty = 
    issuesBySeverity.critical * 20 +
    issuesBySeverity.high * 12 +
    issuesBySeverity.medium * 6 +
    issuesBySeverity.low * 2
  const healthScore = Math.max(0, 100 - healthPenalty)
  
  return {
    domain: "myblog.com",
    totalPagesAnalyzed: MOCK_PAGES.length,
    totalKeywordsAnalyzed: [...new Set(MOCK_PAGES.map(p => p.targetKeyword))].length,
    issueCount: issues.length,
    issuesBySeverity,
    totalTrafficLoss,
    totalPotentialGain,
    healthScore,
    issues,
    analyzedAt: new Date().toISOString()
  }
}

export function getCannibalizationTrend(): CannibalizationTrend[] {
  return [
    { date: "Oct 1", issues: 8, healthScore: 52 },
    { date: "Oct 15", issues: 7, healthScore: 58 },
    { date: "Nov 1", issues: 6, healthScore: 64 },
    { date: "Nov 15", issues: 5, healthScore: 70 },
    { date: "Dec 1", issues: 4, healthScore: 76 },
    { date: "Dec 11", issues: 4, healthScore: 76 },
  ]
}
