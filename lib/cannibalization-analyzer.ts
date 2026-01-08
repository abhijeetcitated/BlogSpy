// ============================================
// CANNIBALIZATION ANALYZER
// ============================================
// Detect and analyze keyword cannibalization
// Find pages competing for same keywords
// Generate fix recommendations
// ============================================

import {
  type CannibalizationAnalysis,
  type CannibalizationIssue,
  type CannibalizingPage,
  type CannibalizationType,
  type CannibalizationAction,
  type CannibalizationSeverity,
  calculateSeverity,
} from "@/types/cannibalization.types"

// ============================================
// MOCK DATA FOR DEMO
// ============================================

const MOCK_PAGES: CannibalizingPage[] = [
  {
    url: "/blog/best-seo-tools-2024",
    title: "Best SEO Tools 2024: Complete Guide",
    targetKeyword: "best seo tools",
    currentRank: 8,
    bestRank: 4,
    traffic: 2500,
    lastUpdated: "2024-09-15",
    wordCount: 3200,
    pageAuthority: 45,
    backlinks: 23,
    isPrimary: true
  },
  {
    url: "/blog/top-seo-software-review",
    title: "Top SEO Software Review & Comparison",
    targetKeyword: "best seo tools",
    currentRank: 15,
    bestRank: 12,
    traffic: 800,
    lastUpdated: "2024-06-20",
    wordCount: 2100,
    pageAuthority: 32,
    backlinks: 8,
    isPrimary: false
  },
  {
    url: "/guides/keyword-research-guide",
    title: "Complete Keyword Research Guide 2024",
    targetKeyword: "keyword research",
    currentRank: 5,
    bestRank: 3,
    traffic: 4200,
    lastUpdated: "2024-10-01",
    wordCount: 4500,
    pageAuthority: 52,
    backlinks: 45,
    isPrimary: true
  },
  {
    url: "/blog/how-to-do-keyword-research",
    title: "How to Do Keyword Research for Beginners",
    targetKeyword: "keyword research",
    currentRank: 22,
    bestRank: 18,
    traffic: 650,
    lastUpdated: "2024-03-10",
    wordCount: 1800,
    pageAuthority: 28,
    backlinks: 5,
    isPrimary: false
  },
  {
    url: "/tutorials/keyword-research-tutorial",
    title: "Keyword Research Tutorial: Step by Step",
    targetKeyword: "keyword research tutorial",
    currentRank: 12,
    bestRank: 8,
    traffic: 1200,
    lastUpdated: "2024-07-22",
    wordCount: 2800,
    pageAuthority: 38,
    backlinks: 12,
    isPrimary: false
  },
  {
    url: "/blog/ai-content-writing-tools",
    title: "AI Content Writing Tools: The Ultimate List",
    targetKeyword: "ai writing tools",
    currentRank: 6,
    bestRank: 4,
    traffic: 3800,
    lastUpdated: "2024-11-05",
    wordCount: 3600,
    pageAuthority: 48,
    backlinks: 34,
    isPrimary: true
  },
  {
    url: "/reviews/ai-writing-software-review",
    title: "AI Writing Software Review 2024",
    targetKeyword: "ai writing tools",
    currentRank: 18,
    bestRank: 14,
    traffic: 920,
    lastUpdated: "2024-05-18",
    wordCount: 2400,
    pageAuthority: 35,
    backlinks: 11,
    isPrimary: false
  },
  {
    url: "/blog/content-marketing-strategy",
    title: "Content Marketing Strategy Guide",
    targetKeyword: "content marketing",
    currentRank: 11,
    bestRank: 7,
    traffic: 2100,
    lastUpdated: "2024-08-30",
    wordCount: 3100,
    pageAuthority: 42,
    backlinks: 28,
    isPrimary: true
  },
  {
    url: "/guides/content-marketing-tips",
    title: "Content Marketing Tips for 2024",
    targetKeyword: "content marketing tips",
    currentRank: 9,
    bestRank: 6,
    traffic: 1850,
    lastUpdated: "2024-09-25",
    wordCount: 2600,
    pageAuthority: 40,
    backlinks: 19,
    isPrimary: false
  },
  {
    url: "/blog/link-building-strategies",
    title: "Link Building Strategies That Work in 2024",
    targetKeyword: "link building",
    currentRank: 7,
    bestRank: 5,
    traffic: 3200,
    lastUpdated: "2024-10-15",
    wordCount: 4200,
    pageAuthority: 50,
    backlinks: 56,
    isPrimary: true
  }
]

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

/**
 * Detect cannibalization between pages
 */
function detectCannibalization(pages: CannibalizingPage[]): CannibalizationIssue[] {
  const issues: CannibalizationIssue[] = []
  const keywordGroups = new Map<string, CannibalizingPage[]>()
  
  // Group pages by target keyword
  pages.forEach(page => {
    const keyword = page.targetKeyword.toLowerCase()
    if (!keywordGroups.has(keyword)) {
      keywordGroups.set(keyword, [])
    }
    keywordGroups.get(keyword)!.push(page)
  })
  
  // Find cannibalization issues
  keywordGroups.forEach((groupPages, keyword) => {
    if (groupPages.length > 1) {
      // Sort by traffic (primary first)
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
        keywordDifficulty: getEstimatedKD(keyword),
        pages: sortedPages,
        type: determineType(sortedPages),
        severity,
        overlapScore,
        trafficLoss,
        recommendedAction: action,
        recommendation: generateRecommendation(sortedPages, action),
        potentialGain: Math.round(trafficLoss * 0.7), // 70% recovery estimate
        detectedAt: new Date().toISOString()
      })
    }
  })
  
  // Also check for similar keywords (semantic overlap)
  const semanticIssues = detectSemanticOverlap(pages, issues)
  issues.push(...semanticIssues)
  
  return issues.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
}

/**
 * Detect semantic keyword overlap
 */
function detectSemanticOverlap(
  pages: CannibalizingPage[], 
  existingIssues: CannibalizationIssue[]
): CannibalizationIssue[] {
  const semanticGroups: Record<string, string[]> = {
    "seo": ["seo tools", "seo software", "search engine optimization"],
    "keyword": ["keyword research", "keyword analysis", "keyword tool"],
    "content": ["content marketing", "content strategy", "content writing"],
    "ai writing": ["ai writing", "ai content", "ai writer"],
    "link": ["link building", "backlinks", "link strategy"]
  }
  
  const issues: CannibalizationIssue[] = []
  const existingKeywords = new Set(existingIssues.map(i => i.keyword))
  
  Object.entries(semanticGroups).forEach(([theme, keywords]) => {
    const matchingPages = pages.filter(p => 
      keywords.some(k => 
        p.targetKeyword.toLowerCase().includes(k) || 
        k.includes(p.targetKeyword.toLowerCase())
      ) && !existingKeywords.has(p.targetKeyword.toLowerCase())
    )
    
    if (matchingPages.length > 1) {
      const uniqueKeywords = [...new Set(matchingPages.map(p => p.targetKeyword))]
      if (uniqueKeywords.length > 1) {
        const sortedPages = [...matchingPages].sort((a, b) => b.traffic - a.traffic)
        const overlapScore = calculateOverlapScore(sortedPages) * 0.7 // Lower for semantic
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
  
  return issues
}

/**
 * Calculate overlap score between pages
 */
function calculateOverlapScore(pages: CannibalizingPage[]): number {
  if (pages.length < 2) return 0
  
  const primary = pages[0]
  const others = pages.slice(1)
  
  let totalOverlap = 0
  others.forEach(page => {
    // Title similarity (simple word overlap)
    const titleWords1 = new Set(primary.title.toLowerCase().split(/\s+/))
    const titleWords2 = new Set(page.title.toLowerCase().split(/\s+/))
    const titleOverlap = [...titleWords1].filter(w => titleWords2.has(w)).length
    const titleScore = (titleOverlap / Math.max(titleWords1.size, titleWords2.size)) * 100
    
    // Keyword similarity
    const keywordScore = primary.targetKeyword === page.targetKeyword ? 100 : 50
    
    // Rank proximity (closer ranks = more competition)
    const rankDiff = Math.abs((primary.currentRank || 50) - (page.currentRank || 50))
    const rankScore = Math.max(0, 100 - rankDiff * 5)
    
    totalOverlap += (titleScore * 0.3 + keywordScore * 0.5 + rankScore * 0.2)
  })
  
  return others.length > 0 ? Math.round(totalOverlap / others.length) : 0
}

/**
 * Calculate estimated traffic loss
 */
function calculateTrafficLoss(pages: CannibalizingPage[]): number {
  if (pages.length < 2) return 0
  
  const totalTraffic = pages.reduce((sum, p) => sum + p.traffic, 0)
  const primaryTraffic = pages[0].traffic
  
  // Estimate: if consolidated, would get 40% more of total
  const potentialTraffic = totalTraffic * 1.4
  const loss = potentialTraffic - totalTraffic
  
  return Math.round(Math.max(0, loss))
}

/**
 * Determine cannibalization type
 */
function determineType(pages: CannibalizingPage[]): CannibalizationType {
  const keywords = pages.map(p => p.targetKeyword.toLowerCase())
  const uniqueKeywords = [...new Set(keywords)]
  
  if (uniqueKeywords.length === 1) {
    return "same_keyword"
  }
  
  // Check title overlap
  const titles = pages.map(p => p.title.toLowerCase())
  const commonWords = titles.reduce((common, title, i) => {
    if (i === 0) return new Set(title.split(/\s+/))
    const words = new Set(title.split(/\s+/))
    return new Set([...common].filter(w => words.has(w)))
  }, new Set<string>())
  
  if (commonWords.size > 3) {
    return "title_overlap"
  }
  
  // Check if rankings are split
  const rankedPages = pages.filter(p => p.currentRank && p.currentRank <= 20)
  if (rankedPages.length > 1) {
    return "ranking_split"
  }
  
  return "similar_keyword"
}

/**
 * Recommend action based on analysis
 */
function recommendAction(
  pages: CannibalizingPage[], 
  severity: CannibalizationSeverity
): CannibalizationAction {
  const primary = pages[0]
  const secondary = pages[1]
  
  // If secondary has very low traffic and authority
  if (secondary.traffic < primary.traffic * 0.2 && secondary.pageAuthority < primary.pageAuthority * 0.6) {
    return "redirect"
  }
  
  // If both have significant traffic
  if (secondary.traffic > primary.traffic * 0.4) {
    if (severity === "critical" || severity === "high") {
      return "merge"
    }
    return "differentiate"
  }
  
  // If secondary is outdated
  const secondaryAge = new Date().getTime() - new Date(secondary.lastUpdated).getTime()
  const daysSinceUpdate = secondaryAge / (1000 * 60 * 60 * 24)
  if (daysSinceUpdate > 180) {
    return "redirect"
  }
  
  // Default based on severity
  if (severity === "critical") return "merge"
  if (severity === "high") return "redirect"
  if (severity === "medium") return "canonical"
  return "differentiate"
}

/**
 * Generate detailed recommendation
 */
function generateRecommendation(
  pages: CannibalizingPage[], 
  action: CannibalizationAction
): string {
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

/**
 * Get estimated search volume (mock)
 */
function getEstimatedVolume(keyword: string): number {
  const volumes: Record<string, number> = {
    "best seo tools": 22000,
    "keyword research": 33000,
    "ai writing tools": 18000,
    "content marketing": 27000,
    "link building": 14000,
    "seo (semantic group)": 45000,
    "keyword (semantic group)": 38000,
    "content (semantic group)": 32000,
  }
  return volumes[keyword] || Math.floor(Math.random() * 20000) + 5000
}

/**
 * Get estimated KD (mock)
 */
function getEstimatedKD(keyword: string): number {
  const kds: Record<string, number> = {
    "best seo tools": 52,
    "keyword research": 48,
    "ai writing tools": 38,
    "content marketing": 55,
    "link building": 62,
  }
  return kds[keyword] || Math.floor(Math.random() * 40) + 30
}

// ============================================
// MAIN EXPORT FUNCTIONS
// ============================================

/**
 * Analyze site for cannibalization
 */
export function analyzeCannibalization(
  domain: string = "myblog.com",
  pages: CannibalizingPage[] = MOCK_PAGES
): CannibalizationAnalysis {
  const issues = detectCannibalization(pages)
  
  const issuesBySeverity = {
    critical: issues.filter(i => i.severity === "critical").length,
    high: issues.filter(i => i.severity === "high").length,
    medium: issues.filter(i => i.severity === "medium").length,
    low: issues.filter(i => i.severity === "low").length,
  }
  
  const totalTrafficLoss = issues.reduce((sum, i) => sum + i.trafficLoss, 0)
  const totalPotentialGain = issues.reduce((sum, i) => sum + i.potentialGain, 0)
  
  // Health score: 100 - penalty for issues
  const healthPenalty = 
    issuesBySeverity.critical * 20 +
    issuesBySeverity.high * 12 +
    issuesBySeverity.medium * 6 +
    issuesBySeverity.low * 2
  const healthScore = Math.max(0, 100 - healthPenalty)
  
  return {
    domain,
    totalPagesAnalyzed: pages.length,
    totalKeywordsAnalyzed: [...new Set(pages.map(p => p.targetKeyword))].length,
    issueCount: issues.length,
    issuesBySeverity,
    totalTrafficLoss,
    totalPotentialGain,
    healthScore,
    issues,
    analyzedAt: new Date().toISOString()
  }
}

/**
 * Generate mock analysis for demo
 */
export function generateMockCannibalizationAnalysis(): CannibalizationAnalysis {
  return analyzeCannibalization("myblog.com", MOCK_PAGES)
}

/**
 * Get cannibalization trend data (mock)
 */
export function getCannibalizationTrend(): { date: string; issues: number; healthScore: number }[] {
  return [
    { date: "Oct 1", issues: 8, healthScore: 52 },
    { date: "Oct 15", issues: 7, healthScore: 58 },
    { date: "Nov 1", issues: 6, healthScore: 64 },
    { date: "Nov 15", issues: 5, healthScore: 70 },
    { date: "Dec 1", issues: 4, healthScore: 76 },
    { date: "Dec 11", issues: 4, healthScore: 76 },
  ]
}

/**
 * Fix suggestion generator
 */
export function generateFixSuggestion(issue: CannibalizationIssue): {
  steps: string[]
  estimatedTime: string
  difficulty: "easy" | "medium" | "hard"
} {
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
