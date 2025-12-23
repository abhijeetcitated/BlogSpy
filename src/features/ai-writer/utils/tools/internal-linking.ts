// =============================================================================
// INTERNAL LINKING UTILITIES - Production Level
// =============================================================================
// Smart internal linking analysis and suggestions
// =============================================================================

import {
  SitePage,
  LinkSuggestion,
  InternalLinkingAnalysis,
  LinkingMetrics,
  LinkingIssue,
  LinkingRecommendation,
  ExistingLinkInfo,
  LinkRelevance,
  InternalLinkType,
  MatchReason,
  SEOImpact,
  LinkTextPosition,
  LinkDistribution,
  AnchorTextSuggestion,
  AnchorTextType,
  InternalLinkingSettings,
  SiteStats,
  DEFAULT_INTERNAL_LINKING_SETTINGS,
  RELEVANCE_INFO,
  OPTIMAL_LINKS_PER_1000_WORDS,
  MAX_LINKS_PER_1000_WORDS
} from '@/src/features/ai-writer/types/tools/internal-linking.types';

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
 * Split text into paragraphs
 */
function splitParagraphs(text: string): string[] {
  return text.split(/\n\n+/).filter(p => p.trim().length > 0);
}

/**
 * Extract words from text
 */
function extractWords(text: string): string[] {
  return text.toLowerCase().match(/\b[a-z]+\b/g) || [];
}

/**
 * Find existing links in HTML content
 */
export function findExistingLinks(content: string): ExistingLinkInfo[] {
  const links: ExistingLinkInfo[] = [];
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match;
  let index = 0;

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[1];
    const anchorText = match[2].replace(/<[^>]+>/g, '').trim();
    
    // Check if internal link
    if (isInternalUrl(url)) {
      links.push({
        url,
        anchorText,
        position: {
          start: match.index,
          end: match.index + match[0].length,
          paragraphIndex: getParagraphIndex(content, match.index)
        },
        isValid: true,
        issues: []
      });
    }
    index++;
  }

  return links;
}

/**
 * Check if URL is internal
 */
function isInternalUrl(url: string): boolean {
  // Relative URLs are internal
  if (url.startsWith('/') || url.startsWith('#')) {
    return true;
  }
  
  // Same domain check would go here
  // For now, treat URLs without protocol as internal
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return true;
  }
  
  return false;
}

/**
 * Get paragraph index for a position
 */
function getParagraphIndex(content: string, position: number): number {
  const beforeText = content.substring(0, position);
  return (beforeText.match(/\n\n/g) || []).length;
}

// =============================================================================
// KEYWORD/PHRASE EXTRACTION
// =============================================================================

/**
 * Extract potential anchor text phrases from content
 */
export function extractLinkablePhrases(
  content: string,
  minLength: number = 2,
  maxLength: number = 8
): Array<{ phrase: string; position: LinkTextPosition; frequency: number }> {
  const text = extractText(content);
  const phrases: Map<string, Array<LinkTextPosition>> = new Map();
  
  // Extract n-grams
  const words = text.split(/\s+/);
  
  for (let n = minLength; n <= maxLength; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const phrase = words.slice(i, i + n).join(' ');
      
      // Skip if starts/ends with stop words
      if (isStopWord(words[i]) || isStopWord(words[i + n - 1])) {
        continue;
      }
      
      // Skip very short phrases
      if (phrase.length < 5) continue;
      
      // Find position in original text
      const position = findPhrasePosition(content, phrase, i);
      
      if (position) {
        if (!phrases.has(phrase.toLowerCase())) {
          phrases.set(phrase.toLowerCase(), []);
        }
        phrases.get(phrase.toLowerCase())!.push(position);
      }
    }
  }
  
  // Convert to array with frequency
  return Array.from(phrases.entries())
    .map(([phrase, positions]) => ({
      phrase,
      position: positions[0],
      frequency: positions.length
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

/**
 * Find phrase position in content
 */
function findPhrasePosition(
  content: string,
  phrase: string,
  wordIndex: number
): LinkTextPosition | null {
  const text = extractText(content);
  const index = text.toLowerCase().indexOf(phrase.toLowerCase());
  
  if (index === -1) return null;
  
  return {
    start: index,
    end: index + phrase.length,
    paragraphIndex: getParagraphIndex(content, index)
  };
}

/**
 * Check if word is a stop word
 */
function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'just',
    'now', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you',
    'he', 'she', 'we', 'they', 'my', 'your', 'his', 'her', 'our', 'their'
  ]);
  
  return stopWords.has(word.toLowerCase());
}

// =============================================================================
// RELEVANCE SCORING
// =============================================================================

/**
 * Calculate relevance score between content and a page
 */
export function calculateRelevanceScore(
  content: string,
  contentKeywords: string[],
  targetPage: SitePage
): { score: number; reasons: MatchReason[] } {
  let score = 0;
  const reasons: MatchReason[] = [];
  const text = extractText(content).toLowerCase();
  
  // Keyword match (30 points max)
  if (targetPage.primaryKeyword) {
    if (text.includes(targetPage.primaryKeyword.toLowerCase())) {
      score += 30;
      reasons.push('keyword-match');
    }
  }
  
  // Secondary keyword matches (20 points max)
  const secondaryMatches = targetPage.secondaryKeywords.filter(kw =>
    text.includes(kw.toLowerCase())
  );
  score += Math.min(secondaryMatches.length * 5, 20);
  if (secondaryMatches.length > 0 && !reasons.includes('keyword-match')) {
    reasons.push('keyword-match');
  }
  
  // Content keyword overlap (20 points max)
  const contentKeywordsLower = contentKeywords.map(k => k.toLowerCase());
  const pageKeywords = [
    targetPage.primaryKeyword,
    ...targetPage.secondaryKeywords,
    ...targetPage.tags
  ].filter(Boolean).map(k => k!.toLowerCase());
  
  const overlap = contentKeywordsLower.filter(k => pageKeywords.includes(k));
  const overlapScore = Math.min((overlap.length / Math.max(contentKeywordsLower.length, 1)) * 20, 20);
  score += overlapScore;
  if (overlapScore > 5) {
    reasons.push('semantic-similarity');
  }
  
  // Category match (10 points)
  // Would need current content categories to implement fully
  
  // Tag match (10 points max)
  const tagMatches = targetPage.tags.filter(tag => 
    text.includes(tag.toLowerCase())
  );
  score += Math.min(tagMatches.length * 3, 10);
  if (tagMatches.length > 0) {
    reasons.push('tag-match');
  }
  
  // Pillar content bonus (10 points)
  if (targetPage.isPillarContent) {
    score += 10;
    reasons.push('pillar-content');
  }
  
  // Orphan page bonus (5 points)
  if (targetPage.inboundLinks === 0) {
    score += 5;
    reasons.push('orphan-rescue');
  }
  
  return {
    score: Math.min(score, 100),
    reasons
  };
}

/**
 * Get relevance level from score
 */
export function getRelevanceLevel(score: number): LinkRelevance {
  if (score >= RELEVANCE_INFO.high.minScore) return 'high';
  if (score >= RELEVANCE_INFO.medium.minScore) return 'medium';
  return 'low';
}

// =============================================================================
// SUGGESTION GENERATION
// =============================================================================

let suggestionIdCounter = 0;

/**
 * Generate link suggestions
 */
export function generateLinkSuggestions(
  content: string,
  contentKeywords: string[],
  sitePages: SitePage[],
  existingLinks: ExistingLinkInfo[],
  settings: InternalLinkingSettings = DEFAULT_INTERNAL_LINKING_SETTINGS
): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];
  const text = extractText(content);
  const existingUrls = new Set(existingLinks.map(l => l.url));
  
  // Extract linkable phrases from content
  const phrases = extractLinkablePhrases(content);
  
  // For each site page, find matching opportunities
  for (const page of sitePages) {
    // Skip if already linked
    if (existingUrls.has(page.url) || existingUrls.has(page.slug)) {
      continue;
    }
    
    // Skip excluded URLs
    if (settings.excludeUrls.some(url => page.url.includes(url))) {
      continue;
    }
    
    // Calculate relevance
    const { score, reasons } = calculateRelevanceScore(content, contentKeywords, page);
    
    // Skip low relevance if setting enabled
    if (score < settings.minRelevanceScore) {
      continue;
    }
    
    // Find best anchor text opportunities
    const anchorOpportunities = findAnchorOpportunities(text, page, phrases);
    
    for (const anchor of anchorOpportunities.slice(0, 2)) { // Max 2 suggestions per page
      const seoImpact = calculateSEOImpact(page, score, anchor.text);
      
      suggestions.push({
        id: `link-suggestion-${++suggestionIdCounter}`,
        anchorText: anchor.text,
        position: anchor.position,
        targetPage: page,
        targetUrl: page.url,
        relevance: getRelevanceLevel(score),
        relevanceScore: score,
        matchReason: reasons,
        linkType: determineLinkType(page, anchor.position),
        suggestedPosition: determineLinkPosition(anchor.position.paragraphIndex, text),
        surroundingText: getSurroundingText(text, anchor.position),
        alternativeAnchors: anchor.alternatives,
        seoImpact,
        status: 'pending'
      });
    }
  }
  
  // Sort by relevance score
  suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // Limit total suggestions
  return suggestions.slice(0, settings.maxSuggestionsPerPage);
}

/**
 * Find anchor text opportunities for a page
 */
function findAnchorOpportunities(
  text: string,
  page: SitePage,
  phrases: Array<{ phrase: string; position: LinkTextPosition; frequency: number }>
): Array<{ text: string; position: LinkTextPosition; alternatives: string[] }> {
  const opportunities: Array<{ text: string; position: LinkTextPosition; alternatives: string[]; score: number }> = [];
  
  // Check for primary keyword match
  if (page.primaryKeyword) {
    const keywordLower = page.primaryKeyword.toLowerCase();
    const index = text.toLowerCase().indexOf(keywordLower);
    
    if (index !== -1) {
      opportunities.push({
        text: text.substring(index, index + page.primaryKeyword.length),
        position: {
          start: index,
          end: index + page.primaryKeyword.length,
          paragraphIndex: 0
        },
        alternatives: [page.title],
        score: 100
      });
    }
  }
  
  // Check for secondary keyword matches
  for (const keyword of page.secondaryKeywords) {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index !== -1) {
      opportunities.push({
        text: text.substring(index, index + keyword.length),
        position: {
          start: index,
          end: index + keyword.length,
          paragraphIndex: 0
        },
        alternatives: [page.title, page.primaryKeyword].filter(Boolean) as string[],
        score: 80
      });
    }
  }
  
  // Check for title match
  const titleIndex = text.toLowerCase().indexOf(page.title.toLowerCase());
  if (titleIndex !== -1) {
    opportunities.push({
      text: text.substring(titleIndex, titleIndex + page.title.length),
      position: {
        start: titleIndex,
        end: titleIndex + page.title.length,
        paragraphIndex: 0
      },
      alternatives: page.secondaryKeywords.slice(0, 3),
      score: 70
    });
  }
  
  // Check extracted phrases
  for (const phrase of phrases) {
    // Check if phrase relates to page keywords
    const phraseWords = phrase.phrase.toLowerCase().split(' ');
    const pageKeywords = [
      page.primaryKeyword,
      ...page.secondaryKeywords
    ].filter(Boolean).map(k => k!.toLowerCase());
    
    const hasOverlap = phraseWords.some(w => 
      pageKeywords.some(kw => kw.includes(w) || w.includes(kw))
    );
    
    if (hasOverlap) {
      opportunities.push({
        text: phrase.phrase,
        position: phrase.position,
        alternatives: [page.title],
        score: 50 + phrase.frequency * 5
      });
    }
  }
  
  // Sort by score and return unique positions
  opportunities.sort((a, b) => b.score - a.score);
  
  // Deduplicate by position (keep highest scoring)
  const seen = new Set<number>();
  return opportunities.filter(opp => {
    if (seen.has(opp.position.start)) return false;
    seen.add(opp.position.start);
    return true;
  });
}

/**
 * Calculate SEO impact of a link
 */
function calculateSEOImpact(
  targetPage: SitePage,
  relevanceScore: number,
  anchorText: string
): SEOImpact {
  // Link equity flow based on page authority
  const linkEquityFlow = Math.min((targetPage.pageAuthority || 50) + 10, 100);
  
  // Topical relevance
  const topicalRelevance = relevanceScore;
  
  // Anchor optimization (penalize generic anchors)
  const genericAnchors = ['click here', 'read more', 'learn more', 'link', 'here'];
  const isGeneric = genericAnchors.some(g => anchorText.toLowerCase().includes(g));
  const anchorOptimization = isGeneric ? 30 : Math.min(50 + anchorText.length * 2, 90);
  
  // Structural benefit (orphan pages benefit more)
  const structuralBenefit = targetPage.inboundLinks < 3 ? 80 : 50;
  
  // Overall impact
  const overallImpact = (
    linkEquityFlow * 0.3 +
    topicalRelevance * 0.3 +
    anchorOptimization * 0.2 +
    structuralBenefit * 0.2
  );
  
  return {
    linkEquityFlow,
    topicalRelevance,
    anchorOptimization,
    structuralBenefit,
    overallImpact
  };
}

/**
 * Determine link type based on target page
 */
function determineLinkType(page: SitePage, position: LinkTextPosition): InternalLinkType {
  if (page.isPillarContent) return 'pillar';
  if (page.topicCluster) return 'cluster';
  if (position.paragraphIndex === 0) return 'contextual';
  return 'contextual';
}

/**
 * Determine link position category
 */
function determineLinkPosition(
  paragraphIndex: number,
  text: string
): 'introduction' | 'body' | 'conclusion' {
  const paragraphs = splitParagraphs(text);
  
  if (paragraphIndex === 0) return 'introduction';
  if (paragraphIndex >= paragraphs.length - 2) return 'conclusion';
  return 'body';
}

/**
 * Get surrounding text for context
 */
function getSurroundingText(text: string, position: LinkTextPosition): string {
  const start = Math.max(0, position.start - 50);
  const end = Math.min(text.length, position.end + 50);
  
  let surrounding = text.substring(start, end);
  if (start > 0) surrounding = '...' + surrounding;
  if (end < text.length) surrounding = surrounding + '...';
  
  return surrounding;
}

// =============================================================================
// METRICS CALCULATION
// =============================================================================

/**
 * Calculate internal linking metrics
 */
export function calculateLinkingMetrics(
  content: string,
  existingLinks: ExistingLinkInfo[]
): LinkingMetrics {
  const text = extractText(content);
  const words = extractWords(text);
  const paragraphs = splitParagraphs(text);
  
  const wordCount = words.length;
  const paragraphCount = paragraphs.length;
  const internalLinkCount = existingLinks.length;
  
  // Calculate optimal link count
  const optimalLinkCount = Math.round((wordCount / 1000) * OPTIMAL_LINKS_PER_1000_WORDS);
  
  // Calculate ratios
  const linksPerWord = wordCount > 0 ? internalLinkCount / wordCount : 0;
  const linksPerParagraph = paragraphCount > 0 ? internalLinkCount / paragraphCount : 0;
  
  // Calculate distribution
  const distribution = calculateLinkDistribution(existingLinks, paragraphCount);
  
  // Calculate anchor text variety
  const anchors = existingLinks.map(l => l.anchorText.toLowerCase());
  const uniqueAnchors = new Set(anchors);
  const anchorTextVariety = anchors.length > 0 ? uniqueAnchors.size / anchors.length : 1;
  
  // Calculate overall score
  let score = 50;
  
  // Link count scoring
  if (internalLinkCount >= optimalLinkCount) {
    score += 20;
  } else if (internalLinkCount >= optimalLinkCount * 0.5) {
    score += 10;
  }
  
  // Distribution scoring
  if (distribution.introduction > 0 && distribution.body > 0 && distribution.conclusion > 0) {
    score += 15;
  }
  
  // Variety scoring
  if (anchorTextVariety >= 0.7) {
    score += 15;
  } else if (anchorTextVariety >= 0.5) {
    score += 8;
  }
  
  return {
    internalLinkCount,
    externalLinkCount: 0, // Would need to count external links
    optimalLinkCount,
    linksPerWord,
    linksPerParagraph,
    linkDistribution: distribution,
    averageRelevance: 0, // Would need relevance data
    anchorTextVariety,
    overallScore: Math.min(100, score)
  };
}

/**
 * Calculate link distribution across content
 */
function calculateLinkDistribution(
  links: ExistingLinkInfo[],
  totalParagraphs: number
): LinkDistribution {
  const distribution: LinkDistribution = {
    introduction: 0,
    body: 0,
    conclusion: 0,
    headings: 0,
    lists: 0
  };
  
  for (const link of links) {
    const parIndex = link.position.paragraphIndex;
    
    if (parIndex === 0) {
      distribution.introduction++;
    } else if (parIndex >= totalParagraphs - 2 && totalParagraphs > 2) {
      distribution.conclusion++;
    } else {
      distribution.body++;
    }
  }
  
  return distribution;
}

// =============================================================================
// ISSUE DETECTION
// =============================================================================

/**
 * Generate linking issues
 */
export function generateLinkingIssues(
  metrics: LinkingMetrics,
  existingLinks: ExistingLinkInfo[],
  wordCount: number
): LinkingIssue[] {
  const issues: LinkingIssue[] = [];
  
  // Too few links
  if (metrics.internalLinkCount < metrics.optimalLinkCount * 0.5) {
    issues.push({
      id: 'issue-too-few-links',
      type: 'too-few-links',
      severity: 'warning',
      message: `Only ${metrics.internalLinkCount} internal links found. Recommended: ${metrics.optimalLinkCount}`,
      suggestion: `Add ${metrics.optimalLinkCount - metrics.internalLinkCount} more internal links to improve site navigation and SEO.`
    });
  }
  
  // Too many links
  const maxLinks = Math.round((wordCount / 1000) * MAX_LINKS_PER_1000_WORDS);
  if (metrics.internalLinkCount > maxLinks) {
    issues.push({
      id: 'issue-too-many-links',
      type: 'too-many-links',
      severity: 'warning',
      message: `${metrics.internalLinkCount} internal links may be excessive. Maximum recommended: ${maxLinks}`,
      suggestion: 'Consider removing some less relevant internal links to avoid over-optimization.'
    });
  }
  
  // Poor distribution
  const { introduction, body, conclusion } = metrics.linkDistribution;
  if (introduction === 0 && body > 0) {
    issues.push({
      id: 'issue-no-intro-links',
      type: 'poor-distribution',
      severity: 'info',
      message: 'No internal links in the introduction section.',
      suggestion: 'Add an internal link early in the content to improve engagement.'
    });
  }
  
  // Duplicate anchor text
  const anchors = existingLinks.map(l => l.anchorText.toLowerCase());
  const anchorCounts = new Map<string, number>();
  anchors.forEach(a => anchorCounts.set(a, (anchorCounts.get(a) || 0) + 1));
  
  const duplicates = Array.from(anchorCounts.entries())
    .filter(([_, count]) => count > 1);
  
  if (duplicates.length > 0) {
    issues.push({
      id: 'issue-duplicate-anchors',
      type: 'same-anchor-text',
      severity: 'warning',
      message: `Found ${duplicates.length} duplicate anchor texts.`,
      suggestion: 'Vary anchor text to improve SEO and avoid over-optimization penalties.',
      affectedLinks: duplicates.map(([anchor]) => anchor)
    });
  }
  
  return issues;
}

// =============================================================================
// RECOMMENDATIONS
// =============================================================================

/**
 * Generate linking recommendations
 */
export function generateLinkingRecommendations(
  metrics: LinkingMetrics,
  suggestions: LinkSuggestion[],
  issues: LinkingIssue[]
): LinkingRecommendation[] {
  const recommendations: LinkingRecommendation[] = [];
  
  // High-relevance suggestions
  const highRelevance = suggestions.filter(s => s.relevance === 'high');
  if (highRelevance.length > 0) {
    recommendations.push({
      id: 'rec-high-relevance',
      priority: 'high',
      title: `Add ${highRelevance.length} High-Relevance Links`,
      description: `Found ${highRelevance.length} highly relevant linking opportunities.`,
      action: 'Review and add suggested internal links with high relevance scores.',
      impact: 'Improves topical authority and user navigation.'
    });
  }
  
  // Pillar content links
  const pillarLinks = suggestions.filter(s => s.linkType === 'pillar');
  if (pillarLinks.length > 0) {
    recommendations.push({
      id: 'rec-pillar-links',
      priority: 'high',
      title: 'Link to Pillar Content',
      description: `${pillarLinks.length} pillar content pages are relevant but not linked.`,
      action: 'Add links to related pillar content to strengthen topic clusters.',
      impact: 'Boosts topical authority and content hierarchy.'
    });
  }
  
  // Improve distribution
  if (metrics.linkDistribution.introduction === 0) {
    recommendations.push({
      id: 'rec-intro-link',
      priority: 'medium',
      title: 'Add Introduction Link',
      description: 'No internal links in the introduction.',
      action: 'Add an engaging internal link within the first paragraph.',
      impact: 'Improves early engagement and reduces bounce rate.'
    });
  }
  
  // Anchor text variety
  if (metrics.anchorTextVariety < 0.7) {
    recommendations.push({
      id: 'rec-anchor-variety',
      priority: 'medium',
      title: 'Diversify Anchor Text',
      description: `Anchor text variety is ${Math.round(metrics.anchorTextVariety * 100)}%.`,
      action: 'Use varied, natural anchor text for different links.',
      impact: 'Reduces over-optimization risk and improves user experience.'
    });
  }
  
  return recommendations;
}

// =============================================================================
// ANCHOR TEXT SUGGESTIONS
// =============================================================================

/**
 * Generate anchor text suggestions for a link
 */
export function generateAnchorTextSuggestions(
  targetPage: SitePage,
  context: string
): AnchorTextSuggestion[] {
  const suggestions: AnchorTextSuggestion[] = [];
  
  // Exact match keyword
  if (targetPage.primaryKeyword) {
    suggestions.push({
      text: targetPage.primaryKeyword,
      score: 70,
      type: 'exact-match',
      keyword: targetPage.primaryKeyword
    });
  }
  
  // Page title
  suggestions.push({
    text: targetPage.title,
    score: 80,
    type: 'natural'
  });
  
  // Partial matches
  for (const keyword of targetPage.secondaryKeywords.slice(0, 3)) {
    suggestions.push({
      text: keyword,
      score: 65,
      type: 'partial-match',
      keyword
    });
  }
  
  // Natural phrase from title
  const titleWords = targetPage.title.split(' ');
  if (titleWords.length >= 3) {
    suggestions.push({
      text: titleWords.slice(0, 3).join(' '),
      score: 75,
      type: 'natural'
    });
  }
  
  // Sort by score
  suggestions.sort((a, b) => b.score - a.score);
  
  return suggestions;
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Perform complete internal linking analysis
 */
export function analyzeInternalLinking(
  content: string,
  contentKeywords: string[],
  sitePages: SitePage[],
  settings: InternalLinkingSettings = DEFAULT_INTERNAL_LINKING_SETTINGS
): InternalLinkingAnalysis {
  const text = extractText(content);
  const wordCount = extractWords(text).length;
  
  // Find existing links
  const existingLinks = findExistingLinks(content);
  
  // Calculate metrics
  const metrics = calculateLinkingMetrics(content, existingLinks);
  
  // Generate suggestions
  const suggestions = generateLinkSuggestions(
    content,
    contentKeywords,
    sitePages,
    existingLinks,
    settings
  );
  
  // Generate issues
  const issues = generateLinkingIssues(metrics, existingLinks, wordCount);
  
  // Generate recommendations
  const recommendations = generateLinkingRecommendations(metrics, suggestions, issues);
  
  // Calculate site stats
  const siteStats: SiteStats = {
    totalPages: sitePages.length,
    averageLinksPerPage: sitePages.reduce((sum, p) => sum + p.inboundLinks, 0) / Math.max(sitePages.length, 1),
    orphanPageCount: sitePages.filter(p => p.inboundLinks === 0).length,
    topLinkedPages: sitePages
      .sort((a, b) => b.inboundLinks - a.inboundLinks)
      .slice(0, 5)
      .map(p => ({ pageId: p.id, linkCount: p.inboundLinks })),
    clusterCount: new Set(sitePages.map(p => p.topicCluster).filter(Boolean)).size
  };
  
  return {
    id: `internal-linking-${Date.now()}`,
    contentId: '',
    analyzedAt: new Date().toISOString(),
    existingLinks,
    existingLinkCount: existingLinks.length,
    suggestions,
    totalSuggestions: suggestions.length,
    highRelevanceSuggestions: suggestions.filter(s => s.relevance === 'high').length,
    metrics,
    issues,
    recommendations,
    siteStats
  };
}

// =============================================================================
// EXPORT REPORT
// =============================================================================

/**
 * Export internal linking report as markdown
 */
export function exportLinkingReport(analysis: InternalLinkingAnalysis): string {
  const lines: string[] = [
    '# Internal Linking Analysis Report',
    '',
    `Generated: ${new Date(analysis.analyzedAt).toLocaleString()}`,
    '',
    '## Summary',
    '',
    `- **Existing Internal Links:** ${analysis.existingLinkCount}`,
    `- **Optimal Link Count:** ${analysis.metrics.optimalLinkCount}`,
    `- **Link Suggestions:** ${analysis.totalSuggestions}`,
    `- **High Relevance Suggestions:** ${analysis.highRelevanceSuggestions}`,
    `- **Overall Score:** ${analysis.metrics.overallScore}/100`,
    '',
    '## Metrics',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Links per 100 words | ${(analysis.metrics.linksPerWord * 100).toFixed(2)} |`,
    `| Links per paragraph | ${analysis.metrics.linksPerParagraph.toFixed(2)} |`,
    `| Anchor text variety | ${Math.round(analysis.metrics.anchorTextVariety * 100)}% |`,
    '',
    '## Link Distribution',
    '',
    `- Introduction: ${analysis.metrics.linkDistribution.introduction}`,
    `- Body: ${analysis.metrics.linkDistribution.body}`,
    `- Conclusion: ${analysis.metrics.linkDistribution.conclusion}`,
    ''
  ];
  
  if (analysis.issues.length > 0) {
    lines.push('## Issues', '');
    for (const issue of analysis.issues) {
      lines.push(`### ${issue.message}`);
      lines.push(`- Severity: ${issue.severity}`);
      lines.push(`- Suggestion: ${issue.suggestion}`);
      lines.push('');
    }
  }
  
  if (analysis.recommendations.length > 0) {
    lines.push('## Recommendations', '');
    for (const rec of analysis.recommendations) {
      lines.push(`### ${rec.title}`);
      lines.push(`- Priority: ${rec.priority}`);
      lines.push(`- ${rec.description}`);
      lines.push(`- Action: ${rec.action}`);
      lines.push(`- Impact: ${rec.impact}`);
      lines.push('');
    }
  }
  
  lines.push('## Top Link Suggestions', '');
  for (const suggestion of analysis.suggestions.slice(0, 10)) {
    lines.push(`### Link to: ${suggestion.targetPage.title}`);
    lines.push(`- URL: ${suggestion.targetUrl}`);
    lines.push(`- Anchor Text: "${suggestion.anchorText}"`);
    lines.push(`- Relevance: ${suggestion.relevance} (${suggestion.relevanceScore}/100)`);
    lines.push(`- Reasons: ${suggestion.matchReason.join(', ')}`);
    lines.push('');
  }
  
  return lines.join('\n');
}

