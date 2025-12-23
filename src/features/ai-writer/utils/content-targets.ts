// ============================================
// AI WRITER - CONTENT TARGETS ANALYSIS
// ============================================
// Feature #5 & #6: Utilities for calculating
// word count and heading targets
// ============================================

import type {
  WordCountTarget,
  HeadingTarget,
  HeadingTargets,
  ContentTargets,
  TargetStatus,
  TargetProgress
} from '../types/content-targets.types'
import { DEFAULT_CONTENT_TARGETS, CONTENT_TYPE_TARGETS } from '../types/content-targets.types'

// ============================================
// TARGET STATUS CALCULATION
// ============================================

/**
 * Calculate target status based on current vs target values
 */
export function calculateTargetStatus(
  current: number,
  min: number,
  optimal: number,
  max: number
): TargetStatus {
  if (current < min * 0.7) return 'under'
  if (current < min) return 'approaching'
  if (current >= min && current <= max) {
    // Check if close to optimal
    const optimalRange = optimal * 0.15
    if (current >= optimal - optimalRange && current <= optimal + optimalRange) {
      return 'optimal'
    }
    return 'approaching'
  }
  return 'over'
}

/**
 * Calculate progress towards a target
 */
export function calculateTargetProgress(
  current: number,
  target: { min: number; optimal: number; max: number }
): TargetProgress {
  const status = calculateTargetStatus(current, target.min, target.optimal, target.max)
  
  // Calculate percentage (0-100, can exceed 100)
  let percentage: number
  if (target.optimal > 0) {
    percentage = Math.round((current / target.optimal) * 100)
  } else {
    percentage = current > 0 ? 100 : 0
  }
  
  // Calculate delta (negative means need more, positive means have excess)
  let delta = 0
  let message = ''
  
  switch (status) {
    case 'under':
      delta = current - target.min
      message = `Need ${Math.abs(delta)} more to reach minimum`
      break
    case 'approaching':
      if (current < target.optimal) {
        delta = current - target.optimal
        message = `${Math.abs(delta)} more to reach optimal`
      } else {
        delta = current - target.optimal
        message = `${delta} above optimal`
      }
      break
    case 'optimal':
      delta = 0
      message = 'Perfect! At optimal level'
      break
    case 'over':
      delta = current - target.max
      message = `${delta} over maximum (consider reducing)`
      break
  }
  
  return {
    percentage: Math.min(percentage, 150), // Cap at 150% for display
    status,
    message,
    delta
  }
}

// ============================================
// CONTENT ANALYSIS
// ============================================

/**
 * Count words in text
 */
export function countWords(text: string): number {
  const cleanText = text.trim()
  if (!cleanText) return 0
  return cleanText.split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Extract headings from HTML
 */
export function extractHeadingsFromHTML(html: string): {
  h1: string[]
  h2: string[]
  h3: string[]
  h4: string[]
} {
  const result = {
    h1: [] as string[],
    h2: [] as string[],
    h3: [] as string[],
    h4: [] as string[]
  }
  
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi
  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi
  const h4Regex = /<h4[^>]*>([\s\S]*?)<\/h4>/gi
  
  let match
  while ((match = h1Regex.exec(html)) !== null) {
    result.h1.push(match[1].replace(/<[^>]+>/g, '').trim())
  }
  while ((match = h2Regex.exec(html)) !== null) {
    result.h2.push(match[1].replace(/<[^>]+>/g, '').trim())
  }
  while ((match = h3Regex.exec(html)) !== null) {
    result.h3.push(match[1].replace(/<[^>]+>/g, '').trim())
  }
  while ((match = h4Regex.exec(html)) !== null) {
    result.h4.push(match[1].replace(/<[^>]+>/g, '').trim())
  }
  
  return result
}

/**
 * Count paragraphs from HTML
 */
export function countParagraphs(html: string): { count: number; avgLength: number } {
  const paragraphRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi
  const paragraphs: string[] = []
  let match
  
  while ((match = paragraphRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim()
    if (text.length > 10) { // Only count meaningful paragraphs
      paragraphs.push(text)
    }
  }
  
  const count = paragraphs.length
  const totalWords = paragraphs.reduce((sum, p) => sum + countWords(p), 0)
  const avgLength = count > 0 ? Math.round(totalWords / count) : 0
  
  return { count, avgLength }
}

/**
 * Count images in HTML
 */
export function countImages(html: string): number {
  const imgRegex = /<img[^>]*>/gi
  const matches = html.match(imgRegex)
  return matches ? matches.length : 0
}

/**
 * Count links in HTML
 */
export function countLinks(html: string, currentDomain?: string): {
  internal: number
  external: number
  total: number
} {
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi
  let internal = 0
  let external = 0
  let match
  
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]
    
    // Skip anchor links and javascript
    if (href.startsWith('#') || href.startsWith('javascript:')) {
      continue
    }
    
    // Check if internal or external
    if (href.startsWith('/') || href.startsWith('./') || 
        (currentDomain && href.includes(currentDomain))) {
      internal++
    } else if (href.startsWith('http')) {
      external++
    } else {
      internal++ // Relative links
    }
  }
  
  return { internal, external, total: internal + external }
}

// ============================================
// TARGET GENERATION FROM COMPETITORS
// ============================================

/**
 * Generate targets from competitor analysis
 */
export function generateTargetsFromCompetitors(
  competitors: {
    wordCount: number
    h1Count: number
    h2Count: number
    h3Count: number
    imageCount: number
    internalLinks: number
    externalLinks: number
  }[]
): Partial<ContentTargets> {
  if (competitors.length === 0) {
    return {}
  }
  
  // Calculate averages
  const avgWordCount = Math.round(
    competitors.reduce((sum, c) => sum + c.wordCount, 0) / competitors.length
  )
  const avgH2 = Math.round(
    competitors.reduce((sum, c) => sum + c.h2Count, 0) / competitors.length
  )
  const avgH3 = Math.round(
    competitors.reduce((sum, c) => sum + c.h3Count, 0) / competitors.length
  )
  const avgImages = Math.round(
    competitors.reduce((sum, c) => sum + c.imageCount, 0) / competitors.length
  )
  
  // Calculate min/max
  const wordCounts = competitors.map(c => c.wordCount)
  const minWordCount = Math.min(...wordCounts)
  const maxWordCount = Math.max(...wordCounts)
  
  return {
    wordCount: {
      min: Math.round(avgWordCount * 0.8),
      optimal: avgWordCount,
      max: Math.round(avgWordCount * 1.3),
      current: 0,
      competitorAvg: avgWordCount,
      competitorRange: { min: minWordCount, max: maxWordCount },
      source: 'competitor'
    },
    headings: {
      h1: { level: 'h1', min: 1, optimal: 1, max: 1, current: 0 },
      h2: { 
        level: 'h2', 
        min: Math.max(2, Math.round(avgH2 * 0.7)), 
        optimal: avgH2, 
        max: Math.round(avgH2 * 1.4), 
        current: 0,
        competitorAvg: avgH2
      },
      h3: { 
        level: 'h3', 
        min: Math.max(2, Math.round(avgH3 * 0.6)), 
        optimal: avgH3, 
        max: Math.round(avgH3 * 1.5), 
        current: 0,
        competitorAvg: avgH3
      }
    },
    images: {
      min: Math.max(1, Math.round(avgImages * 0.5)),
      optimal: avgImages,
      max: Math.round(avgImages * 1.5),
      current: 0,
      ratioPerWords: avgWordCount / Math.max(1, avgImages)
    },
    basedOnCompetitors: competitors.length,
    lastUpdated: new Date()
  }
}

/**
 * Generate targets from keyword type
 */
export function generateTargetsFromKeyword(
  keyword: string,
  intent?: 'informational' | 'commercial' | 'transactional' | 'navigational'
): Partial<ContentTargets> {
  const words = keyword.toLowerCase().split(' ')
  
  // Detect content type from keyword patterns
  let contentType = 'blog-post'
  
  if (words.includes('how') || words.includes('guide') || words.includes('tutorial')) {
    contentType = 'how-to-guide'
  } else if (words.includes('best') || words.includes('top') || /\d+/.test(keyword)) {
    contentType = 'listicle'
  } else if (words.includes('review') || words.includes('vs') || words.includes('comparison')) {
    contentType = 'product-review'
  } else if (words.includes('ultimate') || words.includes('complete') || words.includes('definitive')) {
    contentType = 'pillar-content'
  }
  
  // Adjust based on intent
  if (intent === 'transactional' || intent === 'navigational') {
    contentType = 'landing-page'
  }
  
  const typeTargets = CONTENT_TYPE_TARGETS[contentType]
  
  return {
    ...DEFAULT_CONTENT_TARGETS,
    ...typeTargets,
    targetKeyword: keyword,
    lastUpdated: new Date()
  }
}

// ============================================
// ANALYZE CURRENT CONTENT
// ============================================

/**
 * Analyze HTML content and return current counts
 */
export function analyzeContentCounts(html: string, currentDomain?: string): {
  wordCount: number
  headings: { h1: number; h2: number; h3: number; h4: number }
  paragraphs: { count: number; avgLength: number }
  images: number
  links: { internal: number; external: number; total: number }
} {
  // Extract text for word count
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  
  return {
    wordCount: countWords(text),
    headings: {
      h1: extractHeadingsFromHTML(html).h1.length,
      h2: extractHeadingsFromHTML(html).h2.length,
      h3: extractHeadingsFromHTML(html).h3.length,
      h4: extractHeadingsFromHTML(html).h4.length
    },
    paragraphs: countParagraphs(html),
    images: countImages(html),
    links: countLinks(html, currentDomain)
  }
}

/**
 * Update targets with current counts
 */
export function updateTargetsWithCurrent(
  targets: ContentTargets,
  html: string,
  currentDomain?: string
): ContentTargets {
  const counts = analyzeContentCounts(html, currentDomain)
  
  return {
    ...targets,
    wordCount: {
      ...targets.wordCount,
      current: counts.wordCount
    },
    headings: {
      h1: { ...targets.headings.h1, current: counts.headings.h1 },
      h2: { ...targets.headings.h2, current: counts.headings.h2 },
      h3: { ...targets.headings.h3, current: counts.headings.h3 },
      h4: targets.headings.h4 
        ? { ...targets.headings.h4, current: counts.headings.h4 }
        : undefined
    },
    paragraphs: {
      ...targets.paragraphs,
      currentCount: counts.paragraphs.count,
      currentAvgLength: counts.paragraphs.avgLength
    },
    images: {
      ...targets.images,
      current: counts.images
    },
    links: {
      internal: { ...targets.links.internal, current: counts.links.internal },
      external: { ...targets.links.external, current: counts.links.external }
    },
    lastUpdated: new Date()
  }
}

// ============================================
// PROGRESS HELPERS
// ============================================

/**
 * Get all target progresses
 */
export function getAllTargetProgress(targets: ContentTargets): {
  wordCount: TargetProgress
  h1: TargetProgress
  h2: TargetProgress
  h3: TargetProgress
  images: TargetProgress
  internalLinks: TargetProgress
  externalLinks: TargetProgress
  overall: TargetProgress
} {
  const wordCount = calculateTargetProgress(
    targets.wordCount.current,
    targets.wordCount
  )
  
  const h1 = calculateTargetProgress(
    targets.headings.h1.current,
    targets.headings.h1
  )
  
  const h2 = calculateTargetProgress(
    targets.headings.h2.current,
    targets.headings.h2
  )
  
  const h3 = calculateTargetProgress(
    targets.headings.h3.current,
    targets.headings.h3
  )
  
  const images = calculateTargetProgress(
    targets.images.current,
    targets.images
  )
  
  const internalLinks = calculateTargetProgress(
    targets.links.internal.current,
    { min: targets.links.internal.min, optimal: targets.links.internal.optimal, max: 20 }
  )
  
  const externalLinks = calculateTargetProgress(
    targets.links.external.current,
    { min: targets.links.external.min, optimal: targets.links.external.optimal, max: 10 }
  )
  
  // Calculate overall progress (weighted average)
  const weights = {
    wordCount: 0.40,
    h2: 0.20,
    h3: 0.15,
    images: 0.10,
    internalLinks: 0.08,
    externalLinks: 0.07
  }
  
  const overallPercentage = Math.round(
    wordCount.percentage * weights.wordCount +
    h2.percentage * weights.h2 +
    h3.percentage * weights.h3 +
    images.percentage * weights.images +
    internalLinks.percentage * weights.internalLinks +
    externalLinks.percentage * weights.externalLinks
  )
  
  // Determine overall status
  const optimalCount = [wordCount, h2, h3].filter(p => p.status === 'optimal').length
  const overCount = [wordCount, h2, h3, images].filter(p => p.status === 'over').length
  
  let overallStatus: TargetStatus = 'under'
  if (overallPercentage >= 90 && optimalCount >= 2) {
    overallStatus = 'optimal'
  } else if (overallPercentage >= 70) {
    overallStatus = 'approaching'
  } else if (overCount >= 2) {
    overallStatus = 'over'
  }
  
  return {
    wordCount,
    h1,
    h2,
    h3,
    images,
    internalLinks,
    externalLinks,
    overall: {
      percentage: Math.min(overallPercentage, 100),
      status: overallStatus,
      message: overallStatus === 'optimal' 
        ? 'Great! Content meets all targets'
        : overallStatus === 'approaching'
        ? 'Almost there! A few more improvements needed'
        : 'Keep writing to meet targets',
      delta: 0
    }
  }
}

/**
 * Get status color for display
 */
export function getStatusColor(status: TargetStatus): string {
  switch (status) {
    case 'under': return 'text-red-500'
    case 'approaching': return 'text-yellow-500'
    case 'optimal': return 'text-green-500'
    case 'over': return 'text-orange-500'
    default: return 'text-muted-foreground'
  }
}

/**
 * Get status background color
 */
export function getStatusBgColor(status: TargetStatus): string {
  switch (status) {
    case 'under': return 'bg-red-500'
    case 'approaching': return 'bg-yellow-500'
    case 'optimal': return 'bg-green-500'
    case 'over': return 'bg-orange-500'
    default: return 'bg-muted'
  }
}
