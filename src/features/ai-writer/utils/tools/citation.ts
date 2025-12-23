// =============================================================================
// CITATION/SOURCE UTILITIES - Production Level
// =============================================================================
// Smart citation detection and source suggestion algorithms
// =============================================================================

import {
  CitationSource,
  CitableClaim,
  CitationAnalysis,
  CitationMetrics,
  CitationIssue,
  CitationRecommendation,
  ExistingCitation,
  ClaimType,
  ClaimPosition,
  CitationPriority,
  SourceType,
  SourceAuthority,
  CitationSettings,
  Citation,
  CitationStyle,
  InsertPosition,
  DEFAULT_CITATION_SETTINGS,
  CLAIM_PATTERNS,
  CLAIM_TYPE_INFO,
  SOURCE_TYPE_INFO,
  AUTHORITY_INFO
} from '@/src/features/ai-writer/types/tools/citation.types';

// =============================================================================
// TEXT ANALYSIS UTILITIES
// =============================================================================

/**
 * Extract plain text from HTML content
 */
function extractText(content: string): string {
  return content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Split text into sentences
 */
function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [];
}

/**
 * Get paragraph index for a position
 */
function getParagraphIndex(content: string, position: number): number {
  const beforeText = content.substring(0, position);
  return (beforeText.match(/\n\n/g) || []).length;
}

/**
 * Get sentence index within a paragraph
 */
function getSentenceIndex(text: string, position: number, paragraphStart: number): number {
  const paragraphText = text.substring(paragraphStart, position);
  return (paragraphText.match(/[.!?]+/g) || []).length;
}

// =============================================================================
// CLAIM DETECTION
// =============================================================================

let claimIdCounter = 0;

/**
 * Detect citable claims in content
 */
export function detectClaims(
  content: string,
  settings: CitationSettings = DEFAULT_CITATION_SETTINGS
): CitableClaim[] {
  const text = extractText(content);
  const claims: CitableClaim[] = [];
  const sentences = splitSentences(text);
  
  let currentPosition = 0;
  
  sentences.forEach((sentence, sentenceIdx) => {
    const sentenceStart = text.indexOf(sentence, currentPosition);
    currentPosition = sentenceStart + sentence.length;
    
    const paragraphIndex = getParagraphIndex(text, sentenceStart);
    
    // Check for statistics
    if (settings.detectStatistics) {
      const statMatches = sentence.match(CLAIM_PATTERNS.statistic);
      if (statMatches) {
        claims.push(createClaim(
          sentence,
          'statistic',
          sentenceStart,
          sentenceStart + sentence.length,
          paragraphIndex,
          sentenceIdx,
          text
        ));
      }
    }
    
    // Check for research references
    if (settings.detectResearch) {
      if (CLAIM_PATTERNS.research.test(sentence)) {
        CLAIM_PATTERNS.research.lastIndex = 0;
        if (!claims.some(c => c.position.start === sentenceStart)) {
          claims.push(createClaim(
            sentence,
            'research',
            sentenceStart,
            sentenceStart + sentence.length,
            paragraphIndex,
            sentenceIdx,
            text
          ));
        }
      }
    }
    
    // Check for quotes
    if (settings.detectQuotes) {
      const quoteMatches = sentence.match(CLAIM_PATTERNS.quote);
      if (quoteMatches && quoteMatches.length > 0) {
        if (!claims.some(c => c.position.start === sentenceStart)) {
          claims.push(createClaim(
            sentence,
            'quote',
            sentenceStart,
            sentenceStart + sentence.length,
            paragraphIndex,
            sentenceIdx,
            text
          ));
        }
      }
    }
    
    // Check for "according to" statements
    if (CLAIM_PATTERNS.according.test(sentence)) {
      CLAIM_PATTERNS.according.lastIndex = 0;
      if (!claims.some(c => c.position.start === sentenceStart)) {
        claims.push(createClaim(
          sentence,
          'fact',
          sentenceStart,
          sentenceStart + sentence.length,
          paragraphIndex,
          sentenceIdx,
          text
        ));
      }
    }
    
    // Check for factual claims
    if (settings.detectFacts) {
      if (CLAIM_PATTERNS.fact.test(sentence)) {
        CLAIM_PATTERNS.fact.lastIndex = 0;
        if (!claims.some(c => c.position.start === sentenceStart)) {
          claims.push(createClaim(
            sentence,
            'fact',
            sentenceStart,
            sentenceStart + sentence.length,
            paragraphIndex,
            sentenceIdx,
            text
          ));
        }
      }
    }
    
    // Check for comparisons
    if (CLAIM_PATTERNS.comparison.test(sentence)) {
      CLAIM_PATTERNS.comparison.lastIndex = 0;
      if (!claims.some(c => c.position.start === sentenceStart)) {
        claims.push(createClaim(
          sentence,
          'comparison',
          sentenceStart,
          sentenceStart + sentence.length,
          paragraphIndex,
          sentenceIdx,
          text
        ));
      }
    }
  });
  
  return claims;
}

/**
 * Create a claim object
 */
function createClaim(
  text: string,
  type: ClaimType,
  start: number,
  end: number,
  paragraphIndex: number,
  sentenceIndex: number,
  fullText: string
): CitableClaim {
  const priority = CLAIM_TYPE_INFO[type].defaultPriority;
  
  // Get surrounding context
  const contextStart = Math.max(0, start - 100);
  const contextEnd = Math.min(fullText.length, end + 100);
  let surroundingText = fullText.substring(contextStart, contextEnd);
  if (contextStart > 0) surroundingText = '...' + surroundingText;
  if (contextEnd < fullText.length) surroundingText = surroundingText + '...';
  
  return {
    id: `claim-${++claimIdCounter}`,
    text: text.trim(),
    type,
    position: {
      start,
      end,
      paragraphIndex,
      sentenceIndex
    },
    surroundingText,
    paragraph: paragraphIndex,
    needsCitation: true,
    citationPriority: priority,
    reason: getReasonForClaim(type),
    suggestedSources: [],
    status: 'uncited'
  };
}

/**
 * Get reason why claim needs citation
 */
function getReasonForClaim(type: ClaimType): string {
  const reasons: Record<ClaimType, string> = {
    'statistic': 'Statistics should always be cited to verify accuracy',
    'fact': 'Factual claims benefit from authoritative sources',
    'quote': 'Direct quotes must be attributed to their source',
    'research': 'Research findings should link to original study',
    'definition': 'Definitions gain credibility with authoritative sources',
    'comparison': 'Comparative claims need data to back them up',
    'prediction': 'Predictions benefit from expert or data sources',
    'historical': 'Historical facts should be verified by reliable sources',
    'expert-opinion': 'Expert opinions should be attributed'
  };
  
  return reasons[type];
}

// =============================================================================
// SOURCE DETECTION & GENERATION
// =============================================================================

let sourceIdCounter = 0;

/**
 * Find existing citations in content
 */
export function findExistingCitations(content: string): ExistingCitation[] {
  const citations: ExistingCitation[] = [];
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[1];
    const anchorText = match[2].replace(/<[^>]+>/g, '').trim();
    
    // Check if external link
    if (url.startsWith('http://') || url.startsWith('https://')) {
      citations.push({
        id: `existing-${++sourceIdCounter}`,
        url,
        anchorText,
        position: {
          start: match.index,
          end: match.index + match[0].length,
          paragraphIndex: getParagraphIndex(content, match.index),
          sentenceIndex: 0
        },
        isValid: true,
        issues: []
      });
    }
  }
  
  return citations;
}

/**
 * Generate suggested sources for a claim
 */
export function generateSourceSuggestions(
  claim: CitableClaim,
  settings: CitationSettings = DEFAULT_CITATION_SETTINGS
): CitationSource[] {
  // In a real implementation, this would call an API
  // For now, generate mock sources based on claim type
  return generateMockSources(claim, settings);
}

/**
 * Generate mock sources (for demo purposes)
 */
function generateMockSources(
  claim: CitableClaim,
  settings: CitationSettings
): CitationSource[] {
  const sources: CitationSource[] = [];
  const keywords = extractKeywords(claim.text);
  
  // Generate sources based on claim type
  const sourceConfigs = getSourceConfigsForType(claim.type);
  
  for (const config of sourceConfigs) {
    if (settings.preferredSourceTypes.length > 0 && 
        !settings.preferredSourceTypes.includes(config.type)) {
      continue;
    }
    
    const authorityScore = calculateSourceAuthority(config.type, config.domain);
    
    if (authorityScore < settings.minSourceAuthority) {
      continue;
    }
    
    sources.push({
      id: `source-${++sourceIdCounter}`,
      title: config.title.replace('{keyword}', keywords[0] || 'topic'),
      url: `https://${config.domain}/${keywords.join('-').toLowerCase()}`,
      domain: config.domain,
      type: config.type,
      authority: getAuthorityLevel(authorityScore),
      authorityScore,
      snippet: config.snippet.replace('{keyword}', keywords[0] || 'topic'),
      publishedDate: generateRecentDate(),
      author: config.author,
      organization: config.organization,
      domainAuthority: authorityScore,
      trustFlow: Math.round(authorityScore * 0.9),
      isHttps: true,
      isDoFollow: true,
      relevanceScore: calculateRelevanceScore(claim, keywords),
      matchingKeywords: keywords.slice(0, 3),
      matchingClaims: [claim.id]
    });
  }
  
  // Sort by relevance and authority
  sources.sort((a, b) => 
    (b.relevanceScore + b.authorityScore) - (a.relevanceScore + a.authorityScore)
  );
  
  return sources.slice(0, 5);
}

/**
 * Source config type for claims
 */
interface SourceConfig {
  type: SourceType;
  domain: string;
  title: string;
  snippet: string;
  author?: string;
  organization?: string;
}

/**
 * Get source configurations by claim type
 */
function getSourceConfigsForType(type: ClaimType): SourceConfig[] {
  const configs: Record<ClaimType, SourceConfig[]> = {
    'statistic': [
      {
        type: 'statistics' as SourceType,
        domain: 'statista.com',
        title: '{keyword} Statistics & Data - Statista',
        snippet: 'Comprehensive statistics and data about {keyword}...',
        organization: 'Statista'
      },
      {
        type: 'government' as SourceType,
        domain: 'data.gov',
        title: 'Official {keyword} Data - Data.gov',
        snippet: 'Government data and statistics on {keyword}...',
        organization: 'U.S. Government'
      },
      {
        type: 'research' as SourceType,
        domain: 'pewresearch.org',
        title: '{keyword} Research Report - Pew Research',
        snippet: 'Research findings and analysis on {keyword}...',
        organization: 'Pew Research Center'
      }
    ],
    'research': [
      {
        type: 'academic' as SourceType,
        domain: 'scholar.google.com',
        title: 'Academic Study on {keyword}',
        snippet: 'Peer-reviewed research examining {keyword}...',
        organization: 'Academic Institution'
      },
      {
        type: 'research' as SourceType,
        domain: 'nature.com',
        title: '{keyword} Study - Nature',
        snippet: 'Scientific research published in Nature about {keyword}...',
        organization: 'Nature Publishing'
      }
    ],
    'fact': [
      {
        type: 'official' as SourceType,
        domain: 'britannica.com',
        title: '{keyword} - Encyclopedia Britannica',
        snippet: 'Authoritative information about {keyword}...',
        organization: 'Britannica'
      },
      {
        type: 'news' as SourceType,
        domain: 'reuters.com',
        title: '{keyword} - Reuters',
        snippet: 'Factual reporting on {keyword}...',
        organization: 'Reuters'
      }
    ],
    'quote': [
      {
        type: 'news' as SourceType,
        domain: 'nytimes.com',
        title: 'Interview: {keyword} - NY Times',
        snippet: 'Original interview and quotes about {keyword}...',
        organization: 'The New York Times'
      }
    ],
    'definition': [
      {
        type: 'official' as SourceType,
        domain: 'merriam-webster.com',
        title: '{keyword} Definition - Merriam-Webster',
        snippet: 'Official definition of {keyword}...',
        organization: 'Merriam-Webster'
      }
    ],
    'comparison': [
      {
        type: 'industry' as SourceType,
        domain: 'gartner.com',
        title: '{keyword} Comparison Report - Gartner',
        snippet: 'Industry analysis comparing {keyword}...',
        organization: 'Gartner'
      }
    ],
    'prediction': [
      {
        type: 'industry' as SourceType,
        domain: 'mckinsey.com',
        title: '{keyword} Outlook - McKinsey',
        snippet: 'Expert predictions and forecasts for {keyword}...',
        organization: 'McKinsey & Company'
      }
    ],
    'historical': [
      {
        type: 'academic' as SourceType,
        domain: 'jstor.org',
        title: 'History of {keyword} - JSTOR',
        snippet: 'Historical analysis of {keyword}...',
        organization: 'JSTOR'
      }
    ],
    'expert-opinion': [
      {
        type: 'expert' as SourceType,
        domain: 'forbes.com',
        title: 'Expert Analysis: {keyword} - Forbes',
        snippet: 'Expert opinions and analysis on {keyword}...',
        organization: 'Forbes'
      }
    ]
  };
  
  return configs[type] || configs['fact'];
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  
  // Return unique words by frequency
  const wordCounts = new Map<string, number>();
  words.forEach(w => wordCounts.set(w, (wordCounts.get(w) || 0) + 1));
  
  return Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Calculate source authority score
 */
function calculateSourceAuthority(type: SourceType, domain: string): number {
  let score = 50;
  
  // Type bonus
  const typeBonus = SOURCE_TYPE_INFO[type].authorityBonus;
  score += typeBonus;
  
  // Domain-specific bonuses
  const highAuthorityDomains = [
    'gov', 'edu', 'nature.com', 'science.org', 'britannica.com',
    'reuters.com', 'nytimes.com', 'who.int', 'cdc.gov'
  ];
  
  if (highAuthorityDomains.some(d => domain.includes(d))) {
    score += 15;
  }
  
  return Math.min(100, score);
}

/**
 * Get authority level from score
 */
function getAuthorityLevel(score: number): SourceAuthority {
  if (score >= AUTHORITY_INFO.high.minScore) return 'high';
  if (score >= AUTHORITY_INFO.medium.minScore) return 'medium';
  return 'low';
}

/**
 * Calculate relevance score
 */
function calculateRelevanceScore(claim: CitableClaim, keywords: string[]): number {
  let score = 50;
  
  // More keywords = higher relevance
  score += keywords.length * 5;
  
  // Higher priority claims need more relevant sources
  const priorityBonus = {
    'critical': 20,
    'high': 15,
    'medium': 10,
    'low': 5
  };
  score += priorityBonus[claim.citationPriority];
  
  return Math.min(100, score);
}

/**
 * Generate recent date string
 */
function generateRecentDate(): string {
  const now = new Date();
  const monthsAgo = Math.floor(Math.random() * 24);
  now.setMonth(now.getMonth() - monthsAgo);
  return now.toISOString().split('T')[0];
}

// =============================================================================
// METRICS CALCULATION
// =============================================================================

/**
 * Calculate citation metrics
 */
export function calculateMetrics(
  claims: CitableClaim[],
  existingCitations: ExistingCitation[]
): CitationMetrics {
  const totalClaims = claims.length;
  const citedClaims = claims.filter(c => c.status === 'cited').length;
  const uncitedClaims = totalClaims - citedClaims;
  
  // Coverage
  const citationCoverage = totalClaims > 0 
    ? Math.round((citedClaims / totalClaims) * 100) 
    : 100;
  
  // Critical coverage
  const criticalClaims = claims.filter(c => c.citationPriority === 'critical');
  const citedCritical = criticalClaims.filter(c => c.status === 'cited').length;
  const criticalCoverage = criticalClaims.length > 0
    ? Math.round((citedCritical / criticalClaims.length) * 100)
    : 100;
  
  // Source type distribution
  const sourceTypeDistribution: Record<SourceType, number> = {
    'academic': 0,
    'government': 0,
    'news': 0,
    'industry': 0,
    'research': 0,
    'statistics': 0,
    'expert': 0,
    'official': 0,
    'book': 0,
    'case-study': 0
  };
  
  // Average authority
  let totalAuthority = 0;
  let sourceCount = 0;
  
  existingCitations.forEach(c => {
    if (c.sourceInfo) {
      sourceTypeDistribution[c.sourceInfo.type]++;
      totalAuthority += c.sourceInfo.authorityScore;
      sourceCount++;
    }
  });
  
  const averageSourceAuthority = sourceCount > 0 
    ? Math.round(totalAuthority / sourceCount) 
    : 0;
  
  // Calculate scores
  const trustScore = Math.round(
    (citationCoverage * 0.4) + 
    (criticalCoverage * 0.4) + 
    (averageSourceAuthority * 0.2)
  );
  
  const authorityScore = averageSourceAuthority;
  
  const overallScore = Math.round(
    (citationCoverage * 0.3) + 
    (criticalCoverage * 0.3) + 
    (trustScore * 0.2) + 
    (authorityScore * 0.2)
  );
  
  return {
    totalClaims,
    citedClaims,
    uncitedClaims,
    citationCoverage,
    criticalCoverage,
    averageSourceAuthority,
    sourceTypeDistribution,
    overallScore,
    trustScore,
    authorityScore
  };
}

// =============================================================================
// ISSUE DETECTION
// =============================================================================

/**
 * Generate citation issues
 */
export function generateIssues(
  claims: CitableClaim[],
  existingCitations: ExistingCitation[],
  settings: CitationSettings
): CitationIssue[] {
  const issues: CitationIssue[] = [];
  let issueId = 0;
  
  // Check for missing critical citations
  const uncitedCritical = claims.filter(
    c => c.citationPriority === 'critical' && c.status !== 'cited'
  );
  
  for (const claim of uncitedCritical) {
    issues.push({
      id: `issue-${++issueId}`,
      type: 'missing-citation',
      severity: 'error',
      message: `Critical claim missing citation: "${claim.text.substring(0, 50)}..."`,
      claimId: claim.id,
      suggestion: 'Add a citation from an authoritative source.'
    });
  }
  
  // Check for weak sources
  for (const citation of existingCitations) {
    if (citation.sourceInfo && citation.sourceInfo.authorityScore < settings.minSourceAuthority) {
      issues.push({
        id: `issue-${++issueId}`,
        type: 'weak-source',
        severity: 'warning',
        message: `Low authority source: ${citation.url}`,
        suggestion: 'Consider replacing with a more authoritative source.'
      });
    }
  }
  
  // Check for uncited high-priority claims
  const uncitedHigh = claims.filter(
    c => c.citationPriority === 'high' && c.status !== 'cited'
  );
  
  if (uncitedHigh.length > 3) {
    issues.push({
      id: `issue-${++issueId}`,
      type: 'missing-citation',
      severity: 'warning',
      message: `${uncitedHigh.length} high-priority claims lack citations`,
      suggestion: 'Add citations to strengthen content credibility.'
    });
  }
  
  return issues;
}

// =============================================================================
// RECOMMENDATIONS
// =============================================================================

/**
 * Generate citation recommendations
 */
export function generateCitationRecommendations(
  metrics: CitationMetrics,
  claims: CitableClaim[],
  existingCitations: ExistingCitation[]
): CitationRecommendation[] {
  const recommendations: CitationRecommendation[] = [];
  let recId = 0;
  
  // Low citation coverage
  if (metrics.citationCoverage < 50) {
    const uncited = claims.filter(c => c.status !== 'cited');
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'high',
      title: 'Improve Citation Coverage',
      description: `Only ${metrics.citationCoverage}% of claims are cited.`,
      action: `Add citations to ${uncited.length} uncited claims.`,
      impact: 'Significantly improves content credibility and E-E-A-T signals.',
      affectedClaims: uncited.map(c => c.id)
    });
  }
  
  // Critical claims uncited
  if (metrics.criticalCoverage < 100) {
    const uncitedCritical = claims.filter(
      c => c.citationPriority === 'critical' && c.status !== 'cited'
    );
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'high',
      title: 'Cite Critical Claims',
      description: `${uncitedCritical.length} critical claims (statistics, quotes) need citations.`,
      action: 'Add authoritative sources for all statistics and quotes.',
      impact: 'Essential for content accuracy and trustworthiness.',
      affectedClaims: uncitedCritical.map(c => c.id)
    });
  }
  
  // Low authority sources
  if (metrics.averageSourceAuthority < 60) {
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'medium',
      title: 'Improve Source Quality',
      description: `Average source authority is ${metrics.averageSourceAuthority}/100.`,
      action: 'Replace weak sources with .gov, .edu, or industry-leading sites.',
      impact: 'Boosts content authority and search rankings.'
    });
  }
  
  // Diversify source types
  const usedTypes = Object.entries(metrics.sourceTypeDistribution)
    .filter(([_, count]) => count > 0).length;
  
  if (usedTypes < 3 && existingCitations.length > 3) {
    recommendations.push({
      id: `rec-${++recId}`,
      priority: 'low',
      title: 'Diversify Source Types',
      description: 'Content relies on limited source types.',
      action: 'Include academic, government, and industry sources.',
      impact: 'Creates well-rounded, comprehensive content.'
    });
  }
  
  return recommendations;
}

// =============================================================================
// CITATION GENERATION
// =============================================================================

/**
 * Generate citation for a claim
 */
export function generateCitation(
  claim: CitableClaim,
  source: CitationSource,
  style: CitationStyle = 'hyperlink'
): Citation {
  const insertPosition = getInsertPosition(claim.position, style);
  const anchorText = getAnchorText(claim, source);
  const citationText = formatCitation(source, style, anchorText);
  
  return {
    id: `citation-${Date.now()}`,
    claimId: claim.id,
    sourceId: source.id,
    source,
    anchorText,
    citationText,
    style,
    insertPosition,
    status: 'pending'
  };
}

/**
 * Get insert position for citation
 */
function getInsertPosition(claimPosition: ClaimPosition, style: CitationStyle): InsertPosition {
  if (style === 'footnote') {
    return {
      type: 'footnote',
      offset: claimPosition.end
    };
  }
  
  if (style === 'inline') {
    return {
      type: 'inline',
      offset: claimPosition.end
    };
  }
  
  return {
    type: 'end-of-sentence',
    offset: claimPosition.end
  };
}

/**
 * Get anchor text for citation
 */
function getAnchorText(claim: CitableClaim, source: CitationSource): string {
  // For statistics, use the stat as anchor
  if (claim.type === 'statistic') {
    const statMatch = claim.text.match(/(\d+(?:\.\d+)?%|\d{1,3}(?:,\d{3})*)/);
    if (statMatch) {
      return statMatch[1];
    }
  }
  
  // For research, use "study" or "research"
  if (claim.type === 'research') {
    return 'research';
  }
  
  // Default to source organization or domain
  return source.organization || source.domain;
}

/**
 * Format citation text
 */
function formatCitation(
  source: CitationSource,
  style: CitationStyle,
  anchorText: string
): string {
  switch (style) {
    case 'hyperlink':
      return `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${anchorText}</a>`;
    
    case 'inline':
      return `[${anchorText}](${source.url})`;
    
    case 'footnote':
      return `[^${source.id}]`;
    
    case 'bibliography':
      return `${source.author || source.organization}. "${source.title}." ${source.domain}, ${source.publishedDate}. ${source.url}`;
    
    default:
      return `<a href="${source.url}">${anchorText}</a>`;
  }
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Perform complete citation analysis
 */
export function analyzeCitations(
  content: string,
  settings: CitationSettings = DEFAULT_CITATION_SETTINGS
): CitationAnalysis {
  // Detect claims
  const claims = detectClaims(content, settings);
  
  // Find existing citations
  const existingCitations = findExistingCitations(content);
  
  // Generate source suggestions for each claim
  const allSources: CitationSource[] = [];
  
  claims.forEach(claim => {
    const sources = generateSourceSuggestions(claim, settings);
    claim.suggestedSources = sources;
    allSources.push(...sources);
  });
  
  // Deduplicate sources
  const uniqueSources = Array.from(
    new Map(allSources.map(s => [s.url, s])).values()
  );
  
  // Calculate metrics
  const metrics = calculateMetrics(claims, existingCitations);
  
  // Generate issues
  const issues = generateIssues(claims, existingCitations, settings);
  
  // Generate recommendations
  const recommendations = generateCitationRecommendations(metrics, claims, existingCitations);
  
  // Count claims by priority
  const criticalClaims = claims.filter(c => c.citationPriority === 'critical').length;
  const uncitedClaims = claims.filter(c => c.status !== 'cited').length;
  
  return {
    id: `citation-analysis-${Date.now()}`,
    contentId: '',
    analyzedAt: new Date().toISOString(),
    
    claims,
    totalClaims: claims.length,
    uncitedClaims,
    criticalClaims,
    
    existingCitations,
    existingCitationCount: existingCitations.length,
    
    suggestedSources: uniqueSources,
    topSources: uniqueSources
      .sort((a, b) => (b.authorityScore + b.relevanceScore) - (a.authorityScore + a.relevanceScore))
      .slice(0, 10),
    
    metrics,
    issues,
    recommendations
  };
}

// =============================================================================
// EXPORT REPORT
// =============================================================================

/**
 * Export citation report as markdown
 */
export function exportCitationReport(analysis: CitationAnalysis): string {
  const lines: string[] = [
    '# Citation Analysis Report',
    '',
    `Generated: ${new Date(analysis.analyzedAt).toLocaleString()}`,
    '',
    '## Summary',
    '',
    `- **Total Claims Found:** ${analysis.totalClaims}`,
    `- **Uncited Claims:** ${analysis.uncitedClaims}`,
    `- **Critical Claims:** ${analysis.criticalClaims}`,
    `- **Existing Citations:** ${analysis.existingCitationCount}`,
    `- **Overall Score:** ${analysis.metrics.overallScore}/100`,
    '',
    '## Metrics',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Citation Coverage | ${analysis.metrics.citationCoverage}% |`,
    `| Critical Coverage | ${analysis.metrics.criticalCoverage}% |`,
    `| Trust Score | ${analysis.metrics.trustScore}/100 |`,
    `| Authority Score | ${analysis.metrics.authorityScore}/100 |`,
    ''
  ];
  
  if (analysis.claims.filter(c => c.citationPriority === 'critical').length > 0) {
    lines.push('## Critical Claims', '');
    analysis.claims
      .filter(c => c.citationPriority === 'critical')
      .forEach(claim => {
        lines.push(`### ${claim.type.toUpperCase()}`);
        lines.push(`> ${claim.text}`);
        lines.push(`- Status: ${claim.status}`);
        lines.push(`- Reason: ${claim.reason}`);
        lines.push('');
      });
  }
  
  if (analysis.topSources.length > 0) {
    lines.push('## Suggested Sources', '');
    analysis.topSources.forEach(source => {
      lines.push(`### ${source.title}`);
      lines.push(`- URL: ${source.url}`);
      lines.push(`- Type: ${source.type}`);
      lines.push(`- Authority: ${source.authorityScore}/100`);
      lines.push('');
    });
  }
  
  return lines.join('\n');
}

