// Cannibalization Utility Functions

import type { 
  CannibalizationSeverity, 
  CannibalizationAction, 
  CannibalizationType,
  CannibalizationIssue,
  CannibalizingPage,
  SortField,
  SortDirection,
  FilterSeverity,
  FixSuggestion
} from "../types"
import { SEVERITY_ORDER } from "../constants"

// ============================================
// SEVERITY HELPERS
// ============================================

export function getSeverityColor(severity: CannibalizationSeverity): string {
  switch (severity) {
    case "critical": return "text-red-400"
    case "high": return "text-orange-400"
    case "medium": return "text-amber-400"
    case "low": return "text-yellow-400"
    default: return "text-slate-400"
  }
}

export function getSeverityBgColor(severity: CannibalizationSeverity): string {
  switch (severity) {
    case "critical": return "bg-red-500/20 border-red-500/30"
    case "high": return "bg-orange-500/20 border-orange-500/30"
    case "medium": return "bg-amber-500/20 border-amber-500/30"
    case "low": return "bg-yellow-500/20 border-yellow-500/30"
    default: return "bg-slate-500/20 border-slate-500/30"
  }
}

export function getSeverityBadgeColor(severity: CannibalizationSeverity): string {
  switch (severity) {
    case "critical": return "bg-red-500/20 text-red-400 border-red-500/30"
    case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "medium": return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "low": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/30"
  }
}

export function getSeverityLabel(severity: CannibalizationSeverity): string {
  switch (severity) {
    case "critical": return "Critical"
    case "high": return "High"
    case "medium": return "Medium"
    case "low": return "Low"
    default: return "Unknown"
  }
}

// ============================================
// ACTION HELPERS
// ============================================

export function getActionLabel(action: CannibalizationAction): string {
  const labels: Record<CannibalizationAction, string> = {
    merge: "Merge Pages",
    redirect: "301 Redirect",
    differentiate: "Differentiate Content",
    canonical: "Add Canonical",
    noindex: "Noindex Page",
    reoptimize: "Change Target Keyword"
  }
  return labels[action]
}

export function getActionDescription(action: CannibalizationAction): string {
  const descriptions: Record<CannibalizationAction, string> = {
    merge: "Combine both pages into a single, comprehensive article",
    redirect: "Redirect the weaker page to the stronger one with 301",
    differentiate: "Make the content focus on different aspects of the topic",
    canonical: "Point canonical tag to the primary page",
    noindex: "Remove weaker page from index while keeping it live",
    reoptimize: "Change one page to target a different keyword"
  }
  return descriptions[action]
}

export function getTypeLabel(type: CannibalizationType): string {
  const labels: Record<CannibalizationType, string> = {
    same_keyword: "Same Keyword",
    similar_keyword: "Similar Keywords",
    title_overlap: "Title Overlap",
    content_overlap: "Content Overlap",
    ranking_split: "Ranking Split"
  }
  return labels[type]
}

// ============================================
// HEALTH SCORE HELPERS
// ============================================

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "text-amber-600 dark:text-amber-400"
  if (score >= 40) return "text-orange-600 dark:text-orange-400"
  return "text-red-600 dark:text-red-400"
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Needs Attention"
  return "Critical"
}

// ============================================
// CALCULATION HELPERS
// ============================================

export function calculateSeverity(
  overlapScore: number,
  trafficLoss: number,
  pagesCount: number
): CannibalizationSeverity {
  const score = (overlapScore * 0.4) + (Math.min(trafficLoss / 100, 100) * 0.4) + (pagesCount * 10 * 0.2)
  
  if (score >= 70) return "critical"
  if (score >= 50) return "high"
  if (score >= 30) return "medium"
  return "low"
}

export function calculateOverlapScore(pages: CannibalizingPage[]): number {
  if (pages.length < 2) return 0
  
  const primary = pages[0]
  const others = pages.slice(1)
  
  let totalOverlap = 0
  others.forEach(page => {
    const titleWords1 = new Set(primary.title.toLowerCase().split(/\s+/))
    const titleWords2 = new Set(page.title.toLowerCase().split(/\s+/))
    const titleOverlap = [...titleWords1].filter(w => titleWords2.has(w)).length
    const titleScore = (titleOverlap / Math.max(titleWords1.size, titleWords2.size)) * 100
    
    const keywordScore = primary.targetKeyword === page.targetKeyword ? 100 : 50
    
    const rankDiff = Math.abs((primary.currentRank || 50) - (page.currentRank || 50))
    const rankScore = Math.max(0, 100 - rankDiff * 5)
    
    totalOverlap += (titleScore * 0.3 + keywordScore * 0.5 + rankScore * 0.2)
  })
  
  return others.length > 0 ? Math.round(totalOverlap / others.length) : 0
}

export function calculateTrafficLoss(pages: CannibalizingPage[]): number {
  if (pages.length < 2) return 0
  
  const totalTraffic = pages.reduce((sum, p) => sum + p.traffic, 0)
  const potentialTraffic = totalTraffic * 1.4
  
  return Math.round(Math.max(0, potentialTraffic - totalTraffic))
}

// ============================================
// SORTING & FILTERING
// ============================================

export function sortIssues(
  issues: CannibalizationIssue[],
  sortField: SortField,
  sortDirection: SortDirection
): CannibalizationIssue[] {
  if (!sortField) return issues
  
  return [...issues].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case "severity":
        comparison = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
        break
      case "trafficLoss":
        comparison = a.trafficLoss - b.trafficLoss
        break
      case "overlapScore":
        comparison = a.overlapScore - b.overlapScore
        break
      case "pages":
        comparison = a.pages.length - b.pages.length
        break
    }
    return sortDirection === "asc" ? comparison : -comparison
  })
}

export function filterIssues(
  issues: CannibalizationIssue[],
  searchQuery: string,
  filterSeverity: FilterSeverity
): CannibalizationIssue[] {
  let result = issues

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    result = result.filter(i => 
      i.keyword.toLowerCase().includes(query) ||
      i.pages.some(p => p.url.toLowerCase().includes(query) || p.title.toLowerCase().includes(query))
    )
  }

  if (filterSeverity !== "all") {
    result = result.filter(i => i.severity === filterSeverity)
  }

  return result
}

// ============================================
// FIX SUGGESTION GENERATOR
// ============================================

export function generateFixSuggestion(issue: CannibalizationIssue): FixSuggestion {
  const steps: string[] = []
  let estimatedTime = "30 mins"
  let difficulty: "easy" | "medium" | "hard" = "easy"
  
  switch (issue.recommendedAction) {
    case "redirect":
      steps.push("1. Review content on both pages for unique value")
      steps.push("2. Update primary page with any missing information")
      steps.push("3. Set up 301 redirect from secondary to primary")
      steps.push("4. Update internal links pointing to old URL")
      steps.push("5. Submit updated sitemap to Google Search Console")
      estimatedTime = "1-2 hours"
      difficulty = "easy"
      break
      
    case "merge":
      steps.push("1. Create comprehensive outline combining both pages")
      steps.push("2. Write new merged content preserving best elements")
      steps.push("3. Update images, links, and media")
      steps.push("4. Publish merged page on primary URL")
      steps.push("5. Set up 301 redirect from secondary URL")
      steps.push("6. Update internal links and sitemap")
      estimatedTime = "3-4 hours"
      difficulty = "medium"
      break
      
    case "differentiate":
      steps.push("1. Identify unique angle for secondary page")
      steps.push("2. Research alternative long-tail keywords")
      steps.push("3. Rewrite title and meta description")
      steps.push("4. Update content to focus on new angle")
      steps.push("5. Add unique value not in primary page")
      estimatedTime = "2-3 hours"
      difficulty = "medium"
      break
      
    case "canonical":
      steps.push("1. Add canonical tag to secondary page head")
      steps.push("2. Point canonical to primary page URL")
      steps.push("3. Verify implementation with browser tools")
      estimatedTime = "15 mins"
      difficulty = "easy"
      break
      
    case "noindex":
      steps.push("1. Add noindex meta tag to secondary page")
      steps.push("2. Remove page from sitemap")
      steps.push("3. Request removal in Google Search Console (optional)")
      estimatedTime = "15 mins"
      difficulty = "easy"
      break
      
    case "reoptimize":
      steps.push("1. Research new target keyword with lower competition")
      steps.push("2. Update page title and H1 for new keyword")
      steps.push("3. Rewrite meta description")
      steps.push("4. Adjust content to match new keyword intent")
      steps.push("5. Update internal links anchor text")
      estimatedTime = "2-3 hours"
      difficulty = "medium"
      break
  }
  
  return { steps, estimatedTime, difficulty }
}
