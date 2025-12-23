// ============================================
// AI WRITER - NLP Term Analysis Utilities
// ============================================
// Feature #1: Production-ready NLP analysis logic
// ============================================

import type { 
  NLPTerm, 
  NLPTermStatus, 
  NLPTermPriority,
  NLPTermCategory,
  NLPOptimizationScore,
  NLPRecommendation,
  NLPAnalysisResult,
  NLPConfig,
  TermPosition
} from '../types/nlp-terms.types'
import { DEFAULT_NLP_CONFIG } from '../types/nlp-terms.types'

/**
 * Count occurrences of a term in content (case-insensitive, word boundary)
 */
export function countTermOccurrences(
  content: string, 
  term: string, 
  config: Partial<NLPConfig> = {}
): number {
  const { caseSensitive = false, includePlurals = true, includeVariations = true } = config
  
  // Clean content - remove HTML tags
  const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')
  
  // Build regex pattern
  let pattern = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
  
  // Add plural variations
  if (includePlurals) {
    // Handle common plural patterns
    if (pattern.endsWith('y')) {
      pattern = `(${pattern}|${pattern.slice(0, -1)}ies)`
    } else if (pattern.endsWith('s') || pattern.endsWith('x') || pattern.endsWith('ch') || pattern.endsWith('sh')) {
      pattern = `(${pattern}|${pattern}es)`
    } else {
      pattern = `(${pattern}|${pattern}s)`
    }
  }
  
  // Add word boundaries for exact matching
  const flags = caseSensitive ? 'g' : 'gi'
  const regex = new RegExp(`\\b${pattern}\\b`, flags)
  
  const matches = cleanContent.match(regex)
  return matches ? matches.length : 0
}

/**
 * Find all positions of a term in content
 */
export function findTermPositions(
  content: string,
  term: string,
  config: Partial<NLPConfig> = {}
): TermPosition[] {
  const { caseSensitive = false } = config
  const positions: TermPosition[] = []
  
  // Clean content
  const cleanContent = content.replace(/<[^>]*>/g, ' ')
  
  const flags = caseSensitive ? 'g' : 'gi'
  const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, flags)
  
  let match
  while ((match = regex.exec(cleanContent)) !== null) {
    const start = match.index
    const end = start + match[0].length
    
    // Get surrounding context (50 chars each side)
    const contextStart = Math.max(0, start - 50)
    const contextEnd = Math.min(cleanContent.length, end + 50)
    const context = cleanContent.slice(contextStart, contextEnd)
    
    positions.push({
      term: match[0],
      start,
      end,
      context: context.trim(),
      isExact: match[0].toLowerCase() === term.toLowerCase()
    })
  }
  
  return positions
}

/**
 * Calculate term status based on usage counts
 */
export function calculateTermStatus(
  currentCount: number,
  targetCount: number,
  maxCount: number
): NLPTermStatus {
  if (currentCount === 0) return 'missing'
  if (currentCount < targetCount) return 'underused'
  if (currentCount > maxCount) return 'overused'
  return 'optimal'
}

/**
 * Get status color class for UI
 */
export function getStatusColor(status: NLPTermStatus): string {
  switch (status) {
    case 'missing': return 'text-red-400 bg-red-500/10 border-red-500/30'
    case 'underused': return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    case 'optimal': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    case 'overused': return 'text-red-400 bg-red-500/10 border-red-500/30'
    default: return 'text-muted-foreground bg-muted border-border'
  }
}

/**
 * Get priority color class for UI
 */
export function getPriorityColor(priority: NLPTermPriority): string {
  switch (priority) {
    case 'primary': return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    case 'secondary': return 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    case 'supporting': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    case 'avoid': return 'text-red-400 bg-red-500/10 border-red-500/30'
    default: return 'text-muted-foreground bg-muted border-border'
  }
}

/**
 * Get priority badge variant
 */
export function getPriorityBadge(priority: NLPTermPriority): {
  label: string
  className: string
} {
  switch (priority) {
    case 'primary':
      return { label: 'Must Use', className: 'bg-blue-500/20 text-blue-400 border-blue-500/40' }
    case 'secondary':
      return { label: 'Recommended', className: 'bg-purple-500/20 text-purple-400 border-purple-500/40' }
    case 'supporting':
      return { label: 'Optional', className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' }
    case 'avoid':
      return { label: 'Avoid', className: 'bg-red-500/20 text-red-400 border-red-500/40' }
    default:
      return { label: 'Unknown', className: 'bg-muted text-muted-foreground' }
  }
}

/**
 * Analyze content and update NLP terms
 */
export function analyzeNLPTerms(
  content: string,
  terms: NLPTerm[],
  config: Partial<NLPConfig> = {}
): NLPTerm[] {
  return terms.map(term => {
    const currentCount = countTermOccurrences(content, term.term, config)
    const status = calculateTermStatus(currentCount, term.targetCount, term.maxCount)
    
    return {
      ...term,
      currentCount,
      status
    }
  })
}

/**
 * Group terms by category for UI display
 */
export function groupTermsByCategory(terms: NLPTerm[]): NLPTermCategory[] {
  const categories: NLPTermCategory[] = [
    {
      id: 'primary',
      name: 'Must Use Keywords',
      description: 'Essential for ranking - use these throughout your content',
      priority: 'primary',
      terms: [],
      usedCount: 0,
      totalCount: 0,
      completionPercentage: 0,
      icon: 'Target',
      color: 'blue'
    },
    {
      id: 'secondary',
      name: 'Recommended Terms',
      description: 'Strong topical signals - include for better relevance',
      priority: 'secondary',
      terms: [],
      usedCount: 0,
      totalCount: 0,
      completionPercentage: 0,
      icon: 'Sparkles',
      color: 'purple'
    },
    {
      id: 'supporting',
      name: 'Supporting Keywords',
      description: 'LSI keywords for semantic depth',
      priority: 'supporting',
      terms: [],
      usedCount: 0,
      totalCount: 0,
      completionPercentage: 0,
      icon: 'Lightbulb',
      color: 'cyan'
    },
    {
      id: 'avoid',
      name: 'Terms to Avoid',
      description: 'Overused or spammy - limit usage',
      priority: 'avoid',
      terms: [],
      usedCount: 0,
      totalCount: 0,
      completionPercentage: 0,
      icon: 'AlertTriangle',
      color: 'red'
    }
  ]
  
  // Group terms
  terms.forEach(term => {
    const category = categories.find(c => c.priority === term.priority)
    if (category) {
      category.terms.push(term)
      category.totalCount++
      if (term.status === 'optimal' || (term.priority === 'avoid' && term.status === 'missing')) {
        category.usedCount++
      }
    }
  })
  
  // Calculate completion percentages
  categories.forEach(category => {
    if (category.totalCount > 0) {
      category.completionPercentage = Math.round((category.usedCount / category.totalCount) * 100)
    }
  })
  
  return categories.filter(c => c.terms.length > 0)
}

/**
 * Calculate overall NLP optimization score
 */
export function calculateNLPScore(terms: NLPTerm[]): NLPOptimizationScore {
  const primaryTerms = terms.filter(t => t.priority === 'primary')
  const secondaryTerms = terms.filter(t => t.priority === 'secondary')
  const supportingTerms = terms.filter(t => t.priority === 'supporting')
  const avoidTerms = terms.filter(t => t.priority === 'avoid')
  
  // Calculate completion for each category
  const primaryOptimal = primaryTerms.filter(t => t.status === 'optimal').length
  const primaryCompletion = primaryTerms.length > 0 
    ? Math.round((primaryOptimal / primaryTerms.length) * 100) 
    : 100
  
  const secondaryOptimal = secondaryTerms.filter(t => t.status === 'optimal').length
  const secondaryCompletion = secondaryTerms.length > 0 
    ? Math.round((secondaryOptimal / secondaryTerms.length) * 100) 
    : 100
  
  const supportingOptimal = supportingTerms.filter(t => t.status === 'optimal').length
  const supportingCompletion = supportingTerms.length > 0 
    ? Math.round((supportingOptimal / supportingTerms.length) * 100) 
    : 100
  
  // Count overused terms (penalty)
  const overusedCount = terms.filter(t => t.status === 'overused').length
  const avoidUsed = avoidTerms.filter(t => t.currentCount > 0).length
  
  // Find missing critical terms
  const missingCritical = primaryTerms
    .filter(t => t.status === 'missing')
    .map(t => t.term)
  
  // Calculate weighted score
  // Primary: 50% weight, Secondary: 30% weight, Supporting: 20% weight
  // Penalties: -5 per overused, -10 per avoid term used
  let score = (primaryCompletion * 0.5) + (secondaryCompletion * 0.3) + (supportingCompletion * 0.2)
  score -= (overusedCount * 5)
  score -= (avoidUsed * 10)
  score = Math.max(0, Math.min(100, Math.round(score)))
  
  // Calculate grade
  const grade = getGradeFromScore(score)
  
  // Generate recommendations
  const recommendations = generateNLPRecommendations(terms)
  
  return {
    score,
    grade,
    primaryCompletion,
    secondaryCompletion,
    supportingCompletion,
    overusedCount,
    missingCritical,
    recommendations
  }
}

/**
 * Get letter grade from numeric score
 */
export function getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

/**
 * Generate recommendations based on term analysis
 */
export function generateNLPRecommendations(terms: NLPTerm[]): NLPRecommendation[] {
  const recommendations: NLPRecommendation[] = []
  
  // Missing primary terms (highest priority)
  terms
    .filter(t => t.priority === 'primary' && t.status === 'missing')
    .forEach(term => {
      recommendations.push({
        id: `add-${term.id}`,
        type: 'add',
        term: term.term,
        message: `Add "${term.term}" to your content (use ${term.targetCount}-${term.maxCount} times)`,
        priority: 'high',
        action: {
          label: 'Add to content',
          handler: 'addTerm'
        }
      })
    })
  
  // Underused primary terms
  terms
    .filter(t => t.priority === 'primary' && t.status === 'underused')
    .forEach(term => {
      const needed = term.targetCount - term.currentCount
      recommendations.push({
        id: `increase-${term.id}`,
        type: 'add',
        term: term.term,
        message: `Use "${term.term}" ${needed} more time(s) (currently ${term.currentCount}/${term.targetCount})`,
        priority: 'high'
      })
    })
  
  // Overused terms
  terms
    .filter(t => t.status === 'overused')
    .forEach(term => {
      const excess = term.currentCount - term.maxCount
      recommendations.push({
        id: `reduce-${term.id}`,
        type: 'reduce',
        term: term.term,
        message: `Reduce "${term.term}" usage by ${excess} (currently ${term.currentCount}, max ${term.maxCount})`,
        priority: term.priority === 'primary' ? 'medium' : 'high',
        action: {
          label: 'Find & reduce',
          handler: 'findTerm'
        }
      })
    })
  
  // Avoid terms being used
  terms
    .filter(t => t.priority === 'avoid' && t.currentCount > 0)
    .forEach(term => {
      recommendations.push({
        id: `avoid-${term.id}`,
        type: 'replace',
        term: term.term,
        message: `Remove or replace "${term.term}" (found ${term.currentCount} times)`,
        priority: 'medium',
        action: {
          label: 'Find & replace',
          handler: 'replaceTerm'
        }
      })
    })
  
  // Missing secondary terms (medium priority)
  terms
    .filter(t => t.priority === 'secondary' && t.status === 'missing')
    .slice(0, 5) // Limit to top 5
    .forEach(term => {
      recommendations.push({
        id: `add-secondary-${term.id}`,
        type: 'add',
        term: term.term,
        message: `Consider adding "${term.term}" for better topical coverage`,
        priority: 'medium'
      })
    })
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

/**
 * Generate NLP terms from keyword data
 * This would typically come from an API but here we generate mock data
 */
export function generateNLPTermsFromKeyword(
  primaryKeyword: string,
  secondaryKeywords: string[] = [],
  config: Partial<NLPConfig> = {}
): NLPTerm[] {
  const mergedConfig = { ...DEFAULT_NLP_CONFIG, ...config }
  const terms: NLPTerm[] = []
  
  // Primary keyword
  terms.push({
    id: 'primary-main',
    term: primaryKeyword,
    priority: 'primary',
    targetCount: mergedConfig.primaryTargetMin,
    maxCount: mergedConfig.primaryTargetMax,
    currentCount: 0,
    status: 'missing',
    relevance: 100,
    source: 'target-keyword'
  })
  
  // Secondary keywords as primary
  secondaryKeywords.forEach((kw, i) => {
    terms.push({
      id: `primary-${i}`,
      term: kw,
      priority: 'primary',
      targetCount: mergedConfig.primaryTargetMin - 1,
      maxCount: mergedConfig.primaryTargetMax - 2,
      currentCount: 0,
      status: 'missing',
      relevance: 90 - (i * 5),
      source: 'target-keyword'
    })
  })
  
  return terms
}

/**
 * Perform full NLP analysis on content
 */
export function performNLPAnalysis(
  content: string,
  terms: NLPTerm[],
  config: Partial<NLPConfig> = {}
): NLPAnalysisResult {
  // Update term counts
  const analyzedTerms = analyzeNLPTerms(content, terms, config)
  
  // Calculate score
  const score = calculateNLPScore(analyzedTerms)
  
  // Find term positions for highlighting
  const termPositions = new Map<string, TermPosition[]>()
  analyzedTerms.forEach(term => {
    if (term.currentCount > 0) {
      const positions = findTermPositions(content, term.term, config)
      termPositions.set(term.id, positions)
    }
  })
  
  return {
    terms: analyzedTerms,
    score,
    termPositions,
    analysisTimestamp: Date.now()
  }
}

// Re-export default config
export { DEFAULT_NLP_CONFIG }
