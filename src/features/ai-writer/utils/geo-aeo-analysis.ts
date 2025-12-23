// ============================================
// AI WRITER - GEO & AEO ANALYSIS UTILITIES
// ============================================
// Feature #2 & #3: Analysis functions for
// Generative Engine Optimization (GEO) and
// Answer Engine Optimization (AEO)
// ============================================

import {
  type GEOScore,
  type GEORecommendation,
  type AEOScore,
  type AEORecommendation,
  type SnippetOpportunity,
  type GEOConfig,
  type AEOConfig,
  DEFAULT_GEO_CONFIG,
  DEFAULT_AEO_CONFIG
} from '../types/geo-aeo.types'

// Simple ID generator (alternative to uuid)
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

// ============================================
// CONTENT EXTRACTION HELPERS
// ============================================

/**
 * Extract plain text from HTML content
 */
export function extractTextFromHTML(html: string): string {
  // Remove script and style tags first
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  
  // Replace block-level elements with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|hr)[^>]*>/gi, '\n')
  text = text.replace(/<br\s*\/?>/gi, '\n')
  
  // Remove all remaining tags
  text = text.replace(/<[^>]+>/g, ' ')
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim()
  
  return text
}

/**
 * Extract headings from HTML
 */
export function extractHeadings(html: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = []
  const regex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi
  let match
  
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      text: extractTextFromHTML(match[2])
    })
  }
  
  return headings
}

/**
 * Extract lists from HTML
 */
export function extractLists(html: string): {
  ordered: { items: string[] }[]
  unordered: { items: string[] }[]
} {
  const ordered: { items: string[] }[] = []
  const unordered: { items: string[] }[] = []
  
  // Extract ordered lists
  const olRegex = /<ol[^>]*>([\s\S]*?)<\/ol>/gi
  let match
  while ((match = olRegex.exec(html)) !== null) {
    const items: string[] = []
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
    let liMatch
    while ((liMatch = liRegex.exec(match[1])) !== null) {
      items.push(extractTextFromHTML(liMatch[1]))
    }
    if (items.length > 0) ordered.push({ items })
  }
  
  // Extract unordered lists
  const ulRegex = /<ul[^>]*>([\s\S]*?)<\/ul>/gi
  while ((match = ulRegex.exec(html)) !== null) {
    const items: string[] = []
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
    let liMatch
    while ((liMatch = liRegex.exec(match[1])) !== null) {
      items.push(extractTextFromHTML(liMatch[1]))
    }
    if (items.length > 0) unordered.push({ items })
  }
  
  return { ordered, unordered }
}

/**
 * Extract tables from HTML
 */
export function extractTables(html: string): number {
  const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi
  const matches = html.match(tableRegex)
  return matches ? matches.length : 0
}

/**
 * Extract external links from HTML
 */
export function extractExternalLinks(html: string): string[] {
  const links: string[] = []
  const regex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi
  let match
  
  while ((match = regex.exec(html)) !== null) {
    const href = match[1]
    // Check if external (starts with http and not same domain)
    if (href.startsWith('http') && !href.includes(window?.location?.hostname || '')) {
      links.push(href)
    }
  }
  
  return links
}

/**
 * Extract paragraphs from HTML
 */
export function extractParagraphs(html: string): string[] {
  const paragraphs: string[] = []
  const regex = /<p[^>]*>([\s\S]*?)<\/p>/gi
  let match
  
  while ((match = regex.exec(html)) !== null) {
    const text = extractTextFromHTML(match[1])
    if (text.length > 20) { // Only meaningful paragraphs
      paragraphs.push(text)
    }
  }
  
  return paragraphs
}

// ============================================
// GEO ANALYSIS FUNCTIONS
// ============================================

/**
 * Detect statistics and data points in text
 */
export function detectStatistics(text: string): number {
  const patterns = [
    /\d+%/g,                           // Percentages
    /\$[\d,.]+[BMK]?/gi,               // Dollar amounts
    /[\d,.]+\s*(million|billion|trillion)/gi,  // Large numbers
    /\d{1,3}(,\d{3})+/g,               // Numbers with commas
    /\d+\s*x\s*(more|less|higher|lower|faster|slower)/gi,  // Multipliers
    /according to\s+\w+/gi,            // Citations
    /study\s+(shows?|found|reveals?)/gi,  // Research references
    /data\s+(shows?|indicates?|reveals?)/gi, // Data references
    /\d+\s*(out of|in)\s*\d+/gi,       // Fractions
    /increased?\s+by\s+[\d.]+%/gi,     // Increase percentages
    /decreased?\s+by\s+[\d.]+%/gi,     // Decrease percentages
    /[\d.]+\s*(hours?|minutes?|seconds?|days?|weeks?|months?|years?)/gi, // Time units
  ]
  
  let count = 0
  for (const pattern of patterns) {
    const matches = text.match(pattern)
    if (matches) count += matches.length
  }
  
  return count
}

/**
 * Detect definitions in text
 */
export function detectDefinitions(text: string): number {
  const patterns = [
    /is\s+defined\s+as/gi,
    /refers\s+to/gi,
    /means\s+that/gi,
    /can\s+be\s+described\s+as/gi,
    /is\s+a\s+type\s+of/gi,
    /is\s+the\s+process\s+of/gi,
    /is\s+when/gi,
    /^\s*\w+\s+is\s+/gim,              // "X is Y" patterns at line start
    /what\s+is\s+\w+\?/gi,             // "What is X?" questions
  ]
  
  let count = 0
  for (const pattern of patterns) {
    const matches = text.match(pattern)
    if (matches) count += matches.length
  }
  
  return count
}

/**
 * Detect FAQ patterns in HTML
 */
export function detectFAQPatterns(html: string, text: string): number {
  let count = 0
  
  // Question patterns
  const questionPatterns = [
    /\?<\/h[2-4]>/gi,                  // Questions in headings
    /(what|how|why|when|where|who|which|can|does|is|are|should|will)\s+[^.?]*\?/gi,
  ]
  
  for (const pattern of questionPatterns) {
    const matches = html.match(pattern) || text.match(pattern)
    if (matches) count += matches.length
  }
  
  // Schema.org FAQ detection
  if (html.includes('FAQPage') || html.includes('faq-schema')) {
    count += 5 // Bonus for proper schema
  }
  
  return count
}

/**
 * Detect structured data types
 */
export function detectStructuredData(html: string): string[] {
  const types: string[] = []
  
  const schemaTypes = [
    'Article', 'BlogPosting', 'NewsArticle', 'TechArticle',
    'HowTo', 'FAQPage', 'QAPage', 'Recipe',
    'Product', 'Review', 'Organization', 'Person',
    'BreadcrumbList', 'WebPage', 'ItemList'
  ]
  
  for (const type of schemaTypes) {
    if (html.includes(`"@type":"${type}"`) || 
        html.includes(`"@type": "${type}"`) ||
        html.includes(`itemtype="https://schema.org/${type}"`)) {
      types.push(type)
    }
  }
  
  return types
}

/**
 * Calculate structured content score
 */
export function calculateStructuredContentScore(html: string): number {
  let score = 0
  const headings = extractHeadings(html)
  const lists = extractLists(html)
  const tables = extractTables(html)
  
  // Heading structure (max 30 points)
  if (headings.length >= 3) score += 15
  if (headings.some(h => h.level === 2)) score += 10
  if (headings.some(h => h.level === 3)) score += 5
  
  // Lists (max 25 points)
  if (lists.ordered.length >= 1) score += 15
  if (lists.unordered.length >= 2) score += 10
  
  // Tables (max 15 points)
  if (tables >= 1) score += 15
  
  // Consistent structure (max 15 points)
  const h2Count = headings.filter(h => h.level === 2).length
  const h3Count = headings.filter(h => h.level === 3).length
  if (h2Count >= 3 && h3Count >= 3) score += 15
  
  // Total list items quality (max 15 points)
  const totalListItems = [...lists.ordered, ...lists.unordered]
    .reduce((sum, list) => sum + list.items.length, 0)
  if (totalListItems >= 10) score += 15
  else if (totalListItems >= 5) score += 10
  else if (totalListItems >= 3) score += 5
  
  return Math.min(100, score)
}

/**
 * Calculate factual density score
 */
export function calculateFactualDensityScore(text: string): number {
  const wordCount = text.split(/\s+/).length
  const statistics = detectStatistics(text)
  const definitions = detectDefinitions(text)
  
  // Statistics per 500 words (max 40 points)
  const statsRatio = (statistics / wordCount) * 500
  const statsScore = Math.min(40, statsRatio * 8)
  
  // Definitions (max 30 points)
  const defScore = Math.min(30, definitions * 10)
  
  // External citations (max 30 points)
  const citationPatterns = /according to|source:|citation:|research by|study by|data from/gi
  const citations = (text.match(citationPatterns) || []).length
  const citationScore = Math.min(30, citations * 10)
  
  return Math.min(100, Math.round(statsScore + defScore + citationScore))
}

/**
 * Calculate authority signals score
 */
export function calculateAuthorityScore(html: string, text: string): number {
  let score = 0
  
  // External authoritative links (max 30 points)
  const externalLinks = extractExternalLinks(html)
  const authorityDomains = ['.gov', '.edu', '.org', 'wikipedia', 'scholar.google']
  const authoritativeLinks = externalLinks.filter(link => 
    authorityDomains.some(domain => link.includes(domain))
  )
  score += Math.min(30, authoritativeLinks.length * 10)
  
  // Expert mentions (max 25 points)
  const expertPatterns = /expert|researcher|professor|dr\.|phd|specialist|according to \w+ \w+,/gi
  const expertMentions = (text.match(expertPatterns) || []).length
  score += Math.min(25, expertMentions * 5)
  
  // Research/study references (max 25 points)
  const researchPatterns = /study|research|survey|report|analysis|findings|data shows/gi
  const researchRefs = (text.match(researchPatterns) || []).length
  score += Math.min(25, researchRefs * 5)
  
  // Year references for freshness (max 20 points)
  const currentYear = new Date().getFullYear()
  const yearPatterns = new RegExp(`(${currentYear}|${currentYear - 1})`, 'g')
  const recentYears = (text.match(yearPatterns) || []).length
  score += Math.min(20, recentYears * 5)
  
  return Math.min(100, score)
}

/**
 * Calculate comprehensiveness score
 */
export function calculateComprehensivenessScore(
  html: string, 
  text: string, 
  targetKeyword: string
): number {
  let score = 0
  const wordCount = text.split(/\s+/).length
  const headings = extractHeadings(html)
  const paragraphs = extractParagraphs(html)
  
  // Word count depth (max 30 points)
  if (wordCount >= 2000) score += 30
  else if (wordCount >= 1500) score += 25
  else if (wordCount >= 1000) score += 20
  else if (wordCount >= 500) score += 10
  
  // Topic coverage via headings (max 30 points)
  const keywordInHeadings = headings.filter(h => 
    h.text.toLowerCase().includes(targetKeyword.toLowerCase())
  ).length
  score += Math.min(30, keywordInHeadings * 10)
  
  // Unique sections (max 20 points)
  const h2Headings = headings.filter(h => h.level === 2)
  score += Math.min(20, h2Headings.length * 4)
  
  // Paragraph depth (max 20 points)
  const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length
  if (avgParagraphLength >= 150) score += 20
  else if (avgParagraphLength >= 100) score += 15
  else if (avgParagraphLength >= 50) score += 10
  
  return Math.min(100, score)
}

/**
 * Calculate citation readiness score
 * How easily can AI quote this content?
 */
export function calculateCitationReadinessScore(html: string, text: string): number {
  let score = 0
  const paragraphs = extractParagraphs(html)
  
  // Concise, quotable paragraphs (max 30 points)
  const quotableParagraphs = paragraphs.filter(p => {
    const words = p.split(/\s+/).length
    return words >= 20 && words <= 60 // Ideal quote length
  })
  score += Math.min(30, quotableParagraphs.length * 6)
  
  // Clear definitions (max 25 points)
  const definitions = detectDefinitions(text)
  score += Math.min(25, definitions * 8)
  
  // Standalone facts (max 25 points)
  const statistics = detectStatistics(text)
  score += Math.min(25, statistics * 5)
  
  // Structured takeaways (max 20 points)
  const takeawayPatterns = /key takeaway|in summary|bottom line|main point|importantly/gi
  const takeaways = (text.match(takeawayPatterns) || []).length
  score += Math.min(20, takeaways * 10)
  
  return Math.min(100, score)
}

/**
 * Calculate freshness score
 */
export function calculateFreshnessScore(text: string): number {
  let score = 50 // Base score
  
  const currentYear = new Date().getFullYear()
  
  // Current year mentions (+25 points)
  if (text.includes(String(currentYear))) {
    score += 25
  }
  
  // Last year mentions (+15 points)
  if (text.includes(String(currentYear - 1))) {
    score += 15
  }
  
  // "Latest", "recent", "updated" keywords (+10 points)
  const freshnessTerms = /latest|recent|updated|new|current|now|today|this year/gi
  const freshnessMatches = (text.match(freshnessTerms) || []).length
  score += Math.min(10, freshnessMatches * 2)
  
  // Old year penalty (-points for old years without context)
  const oldYears = []
  for (let y = currentYear - 5; y >= currentYear - 10; y--) {
    if (text.includes(String(y))) oldYears.push(y)
  }
  score -= Math.min(20, oldYears.length * 5)
  
  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate platform-specific GEO scores
 */
export function calculatePlatformScores(
  structuredContent: number,
  factualDensity: number,
  authoritySignals: number,
  comprehensiveness: number,
  citationReadiness: number
): GEOScore['platformScores'] {
  // Each platform has different preferences
  
  // ChatGPT: Comprehensive, well-structured
  const chatgpt = Math.round(
    structuredContent * 0.25 +
    factualDensity * 0.20 +
    authoritySignals * 0.15 +
    comprehensiveness * 0.25 +
    citationReadiness * 0.15
  )
  
  // Perplexity: Citation-heavy, factual
  const perplexity = Math.round(
    structuredContent * 0.15 +
    factualDensity * 0.30 +
    authoritySignals * 0.25 +
    comprehensiveness * 0.15 +
    citationReadiness * 0.15
  )
  
  // Gemini: Structured, comprehensive
  const gemini = Math.round(
    structuredContent * 0.30 +
    factualDensity * 0.15 +
    authoritySignals * 0.15 +
    comprehensiveness * 0.25 +
    citationReadiness * 0.15
  )
  
  // Claude: Authority, depth
  const claude = Math.round(
    structuredContent * 0.20 +
    factualDensity * 0.20 +
    authoritySignals * 0.25 +
    comprehensiveness * 0.20 +
    citationReadiness * 0.15
  )
  
  // Google AI: Similar to Gemini
  const googleAI = Math.round(
    structuredContent * 0.25 +
    factualDensity * 0.20 +
    authoritySignals * 0.20 +
    comprehensiveness * 0.20 +
    citationReadiness * 0.15
  )
  
  return { chatgpt, perplexity, gemini, claude, googleAI }
}

/**
 * Generate GEO recommendations
 */
export function generateGEORecommendations(
  components: GEOScore['components'],
  analysis: GEOScore['analysis']
): GEORecommendation[] {
  const recommendations: GEORecommendation[] = []
  
  // Structure recommendations
  if (components.structuredContent < 60) {
    recommendations.push({
      id: generateId(),
      category: 'structure',
      priority: components.structuredContent < 40 ? 'high' : 'medium',
      title: 'Add more structure to your content',
      description: 'AI systems prefer content with clear headings, lists, and tables for easy extraction.',
      impact: '+10-15 points',
      action: { type: 'add', target: 'Numbered lists and H2/H3 headings' }
    })
  }
  
  // Factual density recommendations
  if (components.factualDensity < 50) {
    recommendations.push({
      id: generateId(),
      category: 'facts',
      priority: 'high',
      title: 'Include more statistics and data',
      description: 'Add percentages, numbers, and research findings to increase factual density.',
      impact: '+10-20 points',
      action: { type: 'add', target: 'Statistics, percentages, and data points' }
    })
  }
  
  // Authority recommendations
  if (components.authoritySignals < 50) {
    recommendations.push({
      id: generateId(),
      category: 'authority',
      priority: 'high',
      title: 'Add authoritative sources',
      description: 'Link to .gov, .edu, research papers, and cite experts to boost authority.',
      impact: '+15-25 points',
      action: { type: 'add', target: 'Expert quotes and authoritative citations' }
    })
  }
  
  // Comprehensiveness recommendations
  if (components.comprehensiveness < 60) {
    recommendations.push({
      id: generateId(),
      category: 'coverage',
      priority: 'medium',
      title: 'Expand topic coverage',
      description: 'Cover more aspects of the topic with dedicated sections.',
      impact: '+5-10 points',
      action: { type: 'improve', target: 'Add more subtopics and sections' }
    })
  }
  
  // Freshness recommendations
  if (components.freshness < 50) {
    recommendations.push({
      id: generateId(),
      category: 'freshness',
      priority: 'medium',
      title: 'Update with recent data',
      description: `Include ${new Date().getFullYear()} statistics and mention recent developments.`,
      impact: '+5-10 points',
      action: { type: 'add', target: 'Current year statistics and updates' }
    })
  }
  
  // Citation readiness recommendations
  if (components.citationReadiness < 60) {
    recommendations.push({
      id: generateId(),
      category: 'citations',
      priority: 'medium',
      title: 'Add quotable takeaways',
      description: 'Include concise, standalone statements that AI can easily quote.',
      impact: '+5-15 points',
      action: { type: 'add', target: 'Key takeaway paragraphs (20-60 words)' }
    })
  }
  
  // Specific analysis-based recommendations
  if (analysis.definitionCount < 2) {
    recommendations.push({
      id: generateId(),
      category: 'citations',
      priority: 'high',
      title: 'Add clear definitions',
      description: 'Define key terms using "X is..." or "X refers to..." format.',
      impact: '+5-10 points',
      action: { type: 'add', target: 'Definition statements for key concepts' }
    })
  }
  
  if (analysis.questionsCovered < 3) {
    recommendations.push({
      id: generateId(),
      category: 'coverage',
      priority: 'medium',
      title: 'Answer common questions',
      description: 'Add FAQ section or address "What is", "How to", "Why" questions.',
      impact: '+5-10 points',
      action: { type: 'add', target: 'FAQ section with 3-5 questions' }
    })
  }
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  
  return recommendations.slice(0, 6) // Max 6 recommendations
}

/**
 * Calculate score grade
 */
export function calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 80) return 'A'
  if (score >= 60) return 'B'
  if (score >= 40) return 'C'
  if (score >= 20) return 'D'
  return 'F'
}

/**
 * Main GEO Analysis function
 */
export function analyzeGEO(
  html: string,
  targetKeyword: string,
  config: GEOConfig = DEFAULT_GEO_CONFIG
): GEOScore {
  const text = extractTextFromHTML(html)
  
  // Calculate component scores
  const structuredContent = calculateStructuredContentScore(html)
  const factualDensity = calculateFactualDensityScore(text)
  const authoritySignals = calculateAuthorityScore(html, text)
  const comprehensiveness = calculateComprehensivenessScore(html, text, targetKeyword)
  const citationReadiness = calculateCitationReadinessScore(html, text)
  const freshness = calculateFreshnessScore(text)
  
  // Calculate overall score with weights
  const score = Math.round(
    structuredContent * config.weights.structuredContent +
    factualDensity * config.weights.factualDensity +
    authoritySignals * config.weights.authoritySignals +
    comprehensiveness * config.weights.comprehensiveness +
    freshness * config.weights.freshness +
    citationReadiness * config.weights.citationReadiness
  )
  
  // Analysis details
  const analysis = {
    definitionCount: detectDefinitions(text),
    statisticsCount: detectStatistics(text),
    externalCitations: extractExternalLinks(html).length,
    structuredDataTypes: detectStructuredData(html),
    uniqueInsights: Math.floor(detectStatistics(text) / 3), // Approximate
    questionsCovered: detectFAQPatterns(html, text)
  }
  
  // Components
  const components = {
    structuredContent,
    factualDensity,
    authoritySignals,
    comprehensiveness,
    freshness,
    citationReadiness
  }
  
  // Generate recommendations
  const recommendations = generateGEORecommendations(components, analysis)
  
  // Platform scores
  const platformScores = calculatePlatformScores(
    structuredContent,
    factualDensity,
    authoritySignals,
    comprehensiveness,
    citationReadiness
  )
  
  return {
    score,
    grade: calculateGrade(score),
    components,
    analysis,
    recommendations,
    platformScores
  }
}

// ============================================
// AEO ANALYSIS FUNCTIONS
// ============================================

/**
 * Calculate direct answers score
 */
export function calculateDirectAnswersScore(html: string): number {
  let score = 0
  const paragraphs = extractParagraphs(html)
  
  // Ideal answer length: 40-60 words
  const idealAnswers = paragraphs.filter(p => {
    const words = p.split(/\s+/).length
    return words >= 30 && words <= 70
  })
  score += Math.min(50, idealAnswers.length * 10)
  
  // Paragraphs that start with the answer
  const directStarts = paragraphs.filter(p => 
    /^(the|a|an|it|this|here|yes|no|\w+\s+is\s+)/i.test(p)
  )
  score += Math.min(30, directStarts.length * 5)
  
  // Clear topic sentences
  score += Math.min(20, Math.floor(paragraphs.length / 2) * 5)
  
  return Math.min(100, score)
}

/**
 * Calculate list formats score
 */
export function calculateListFormatsScore(html: string): number {
  let score = 0
  const lists = extractLists(html)
  
  // Numbered lists are best for featured snippets
  score += Math.min(40, lists.ordered.length * 20)
  
  // Bulleted lists also good
  score += Math.min(30, lists.unordered.length * 15)
  
  // List items quality (3-8 items is ideal)
  for (const list of [...lists.ordered, ...lists.unordered]) {
    if (list.items.length >= 3 && list.items.length <= 8) {
      score += 10
    }
  }
  
  return Math.min(100, score)
}

/**
 * Calculate table formats score
 */
export function calculateTableFormatsScore(html: string): number {
  const tables = extractTables(html)
  
  if (tables >= 2) return 100
  if (tables === 1) return 70
  return 0
}

/**
 * Calculate FAQ structure score
 */
export function calculateFAQStructureScore(html: string, text: string): number {
  let score = 0
  
  const faqCount = detectFAQPatterns(html, text)
  
  // Q&A pairs
  score += Math.min(50, faqCount * 10)
  
  // FAQ schema markup
  if (html.includes('FAQPage') || html.includes('Question')) {
    score += 30
  }
  
  // Question headings
  const questionHeadings = extractHeadings(html).filter(h => h.text.includes('?'))
  score += Math.min(20, questionHeadings.length * 10)
  
  return Math.min(100, score)
}

/**
 * Calculate definition blocks score
 */
export function calculateDefinitionBlocksScore(text: string): number {
  let score = 0
  
  const definitions = detectDefinitions(text)
  
  // Definition patterns
  score += Math.min(60, definitions * 15)
  
  // "What is" questions answered
  const whatIsPatterns = /what\s+is\s+\w+\??/gi
  const whatIsCount = (text.match(whatIsPatterns) || []).length
  score += Math.min(40, whatIsCount * 10)
  
  return Math.min(100, score)
}

/**
 * Calculate step-by-step score
 */
export function calculateStepByStepScore(html: string, text: string): number {
  let score = 0
  
  // Numbered steps
  const stepPatterns = /step\s+\d+|step\s+#?\d+|^\d+\.\s+/gim
  const steps = (text.match(stepPatterns) || []).length
  score += Math.min(40, steps * 10)
  
  // How-to schema
  if (html.includes('HowTo') || html.includes('HowToStep')) {
    score += 30
  }
  
  // Ordered lists (steps)
  const lists = extractLists(html)
  score += Math.min(30, lists.ordered.length * 15)
  
  return Math.min(100, score)
}

/**
 * Detect snippet opportunities
 */
export function detectSnippetOpportunities(
  html: string, 
  targetKeyword: string
): SnippetOpportunity[] {
  const opportunities: SnippetOpportunity[] = []
  const paragraphs = extractParagraphs(html)
  const lists = extractLists(html)
  const headings = extractHeadings(html)
  
  // Check for "What is X" opportunity
  const hasDefinition = paragraphs.some(p => 
    p.toLowerCase().includes(`${targetKeyword.toLowerCase()} is`) ||
    p.toLowerCase().includes(`${targetKeyword.toLowerCase()} refers`)
  )
  
  if (!hasDefinition) {
    opportunities.push({
      id: generateId(),
      type: 'definition',
      targetQuery: `What is ${targetKeyword}`,
      currentScore: 20,
      position: { start: 0, end: 0 },
      suggestion: `Add a clear definition paragraph: "${targetKeyword} is..." within the first 100 words`
    })
  }
  
  // Check for "How to" opportunity
  const hasHowTo = headings.some(h => 
    h.text.toLowerCase().includes('how to') ||
    h.text.toLowerCase().includes('steps')
  )
  
  if (!hasHowTo && lists.ordered.length === 0) {
    opportunities.push({
      id: generateId(),
      type: 'how-to',
      targetQuery: `How to ${targetKeyword}`,
      currentScore: 15,
      position: { start: 0, end: 0 },
      suggestion: 'Add a numbered list with clear steps (3-8 items) under a "How to" heading'
    })
  }
  
  // Check for list snippet opportunity
  if (lists.ordered.length === 0 && lists.unordered.length < 2) {
    opportunities.push({
      id: generateId(),
      type: 'list',
      targetQuery: `Best ${targetKeyword}`,
      currentScore: 25,
      position: { start: 0, end: 0 },
      suggestion: 'Add a numbered list for "best/top X" type queries'
    })
  }
  
  // Check for table opportunity
  const tables = extractTables(html)
  if (tables === 0) {
    opportunities.push({
      id: generateId(),
      type: 'table',
      targetQuery: `${targetKeyword} comparison`,
      currentScore: 10,
      position: { start: 0, end: 0 },
      suggestion: 'Add a comparison table for data-rich queries'
    })
  }
  
  return opportunities
}

/**
 * Generate AEO recommendations
 */
export function generateAEORecommendations(
  components: AEOScore['components'],
  analysis: AEOScore['analysis'],
  targetKeyword: string
): AEORecommendation[] {
  const recommendations: AEORecommendation[] = []
  
  // Direct answers
  if (components.directAnswers < 50) {
    recommendations.push({
      id: generateId(),
      type: 'paragraph',
      priority: 'high',
      title: 'Add concise answer paragraphs',
      description: 'Write 40-60 word paragraphs that directly answer common questions.',
      example: `${targetKeyword} is [clear definition in 40-60 words].`,
      targetKeyword
    })
  }
  
  // List formats
  if (components.listFormats < 50) {
    recommendations.push({
      id: generateId(),
      type: 'list',
      priority: 'high',
      title: 'Add numbered lists',
      description: 'Include numbered lists with 3-8 items for step-by-step or ranking content.',
      example: '1. First step\n2. Second step\n3. Third step',
      targetKeyword
    })
  }
  
  // Tables
  if (components.tableFormats < 30) {
    recommendations.push({
      id: generateId(),
      type: 'table',
      priority: 'medium',
      title: 'Add comparison tables',
      description: 'Include tables for data, comparisons, or specifications.',
      targetKeyword
    })
  }
  
  // FAQ
  if (components.faqStructure < 50) {
    recommendations.push({
      id: generateId(),
      type: 'faq',
      priority: 'high',
      title: 'Add FAQ section',
      description: 'Include Q&A pairs using heading-based or schema-marked FAQ format.',
      example: `Q: What is ${targetKeyword}?\nA: [Clear answer]`,
      targetKeyword
    })
  }
  
  // Definitions
  if (components.definitionBlocks < 50) {
    recommendations.push({
      id: generateId(),
      type: 'definition',
      priority: 'high',
      title: 'Add clear definitions',
      description: 'Define key terms using "X is..." format early in the content.',
      example: `${targetKeyword} is [definition].`,
      targetKeyword
    })
  }
  
  // How-to
  if (components.stepByStep < 40) {
    recommendations.push({
      id: generateId(),
      type: 'how-to',
      priority: 'medium',
      title: 'Add step-by-step instructions',
      description: 'Include numbered instructions for "how to" queries.',
      targetKeyword
    })
  }
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  
  return recommendations.slice(0, 5)
}

/**
 * Main AEO Analysis function
 */
export function analyzeAEO(
  html: string,
  targetKeyword: string,
  config: AEOConfig = DEFAULT_AEO_CONFIG
): AEOScore {
  const text = extractTextFromHTML(html)
  const lists = extractLists(html)
  
  // Calculate component scores
  const directAnswers = calculateDirectAnswersScore(html)
  const listFormats = calculateListFormatsScore(html)
  const tableFormats = calculateTableFormatsScore(html)
  const faqStructure = calculateFAQStructureScore(html, text)
  const definitionBlocks = calculateDefinitionBlocksScore(text)
  const stepByStep = calculateStepByStepScore(html, text)
  
  // Calculate overall score with weights
  const score = Math.round(
    directAnswers * config.weights.directAnswers +
    listFormats * config.weights.listFormats +
    tableFormats * config.weights.tableFormats +
    faqStructure * config.weights.faqStructure +
    definitionBlocks * config.weights.definitionBlocks +
    stepByStep * config.weights.stepByStep
  )
  
  // Analysis details
  const paragraphs = extractParagraphs(html)
  const idealAnswers = paragraphs.filter(p => {
    const words = p.split(/\s+/).length
    return words >= 30 && words <= 70
  })
  
  const analysis = {
    answerParagraphs: idealAnswers.length,
    numberedLists: lists.ordered.length,
    bulletLists: lists.unordered.length,
    tablesFound: extractTables(html),
    faqPairs: detectFAQPatterns(html, text),
    definitionsFound: detectDefinitions(text),
    howToSteps: (text.match(/step\s+\d+|step\s+#?\d+/gi) || []).length
  }
  
  // Components
  const components = {
    directAnswers,
    listFormats,
    tableFormats,
    faqStructure,
    definitionBlocks,
    stepByStep
  }
  
  // Detect opportunities
  const snippetOpportunities = detectSnippetOpportunities(html, targetKeyword)
  
  // Generate recommendations
  const recommendations = generateAEORecommendations(components, analysis, targetKeyword)
  
  return {
    score,
    grade: calculateGrade(score),
    components,
    snippetOpportunities,
    analysis,
    recommendations
  }
}

// ============================================
// COMBINED ANALYSIS
// ============================================

/**
 * Perform complete GEO + AEO analysis
 */
export function analyzeGEOAEO(
  html: string,
  targetKeyword: string,
  geoConfig: GEOConfig = DEFAULT_GEO_CONFIG,
  aeoConfig: AEOConfig = DEFAULT_AEO_CONFIG
): { geo: GEOScore; aeo: AEOScore } {
  return {
    geo: analyzeGEO(html, targetKeyword, geoConfig),
    aeo: analyzeAEO(html, targetKeyword, aeoConfig)
  }
}
