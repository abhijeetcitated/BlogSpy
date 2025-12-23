// =============================================================================
// COMPETITOR ANALYSIS UTILITIES - Live SERP Analysis Engine
// =============================================================================
// Industry-standard competitor analysis like Surfer SEO, Clearscope, Frase
// Production-ready algorithms for content gap detection and comparison
// =============================================================================

import type {
  SERPCompetitor,
  SERPAnalysis,
  ContentGapAnalysis,
  CompetitorComparison,
  HeadingBreakdown,
  CompetitorHeading,
  CompetitorOutlineSection,
  CompetitorTerm,
  CompetitorEntity,
  CompetitorEntityType,
  MissingTopic,
  MissingTerm,
  MissingEntity,
  MissingSection,
  MissingQuestion,
  StructuralGap,
  StructuralGapType,
  ContentMetrics,
  ComparisonScores,
  ScoreDetail,
  PositionPrediction,
  PositionFactor,
  CommonPattern,
  FeatureFrequency,
  CompetitorSearchIntent,
  AnalysisSettings
} from '@/src/features/ai-writer/types/tools/competitor-analysis.types';

// -----------------------------------------------------------------------------
// ID Generation Utility
// -----------------------------------------------------------------------------

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// -----------------------------------------------------------------------------
// HTML/Text Extraction Utilities
// -----------------------------------------------------------------------------

/**
 * Extract clean text from HTML content
 */
export function extractTextFromHTML(html: string): string {
  if (!html) return '';
  
  const tempDiv = typeof document !== 'undefined' 
    ? document.createElement('div')
    : null;
  
  if (tempDiv) {
    tempDiv.innerHTML = html;
    // Remove script and style elements
    tempDiv.querySelectorAll('script, style, noscript').forEach(el => el.remove());
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  
  // Server-side fallback
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract headings from HTML content
 */
export function extractHeadingsFromHTML(html: string): CompetitorHeading[] {
  const headings: CompetitorHeading[] = [];
  
  if (!html) return headings;
  
  // Match all heading tags
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  let match;
  let position = 0;
  
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]) as 1 | 2 | 3 | 4 | 5 | 6;
    const text = extractTextFromHTML(match[2]).trim();
    
    if (text) {
      headings.push({
        level,
        text,
        position: match.index,
        wordCount: 0 // Will be calculated based on section
      });
    }
    position++;
  }
  
  // Calculate word count for each section
  const fullText = extractTextFromHTML(html);
  const words = fullText.split(/\s+/);
  
  for (let i = 0; i < headings.length; i++) {
    const currentPos = headings[i].position;
    const nextPos = i < headings.length - 1 
      ? headings[i + 1].position 
      : html.length;
    
    const sectionHtml = html.substring(currentPos, nextPos);
    const sectionText = extractTextFromHTML(sectionHtml);
    headings[i].wordCount = sectionText.split(/\s+/).filter(w => w.length > 0).length;
  }
  
  return headings;
}

/**
 * Count headings by level
 */
export function countHeadingsByLevel(headings: CompetitorHeading[]): HeadingBreakdown {
  const breakdown: HeadingBreakdown = {
    h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0, total: 0
  };
  
  for (const heading of headings) {
    breakdown[`h${heading.level}` as keyof HeadingBreakdown]++;
    breakdown.total++;
  }
  
  return breakdown;
}

/**
 * Build outline structure from headings
 */
export function buildOutlineStructure(headings: CompetitorHeading[]): CompetitorOutlineSection[] {
  const outline: CompetitorOutlineSection[] = [];
  const stack: { section: CompetitorOutlineSection; level: number }[] = [];
  
  for (const heading of headings) {
    const section: CompetitorOutlineSection = {
      id: generateId(),
      level: heading.level,
      heading: heading.text,
      subSections: [],
      estimatedWordCount: heading.wordCount,
      topics: extractTopicsFromHeading(heading.text)
    };
    
    // Find parent section
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    
    if (stack.length === 0) {
      outline.push(section);
    } else {
      stack[stack.length - 1].section.subSections.push(section);
    }
    
    stack.push({ section, level: heading.level });
  }
  
  return outline;
}

/**
 * Extract topics from heading text
 */
function extractTopicsFromHeading(heading: string): string[] {
  const topics: string[] = [];
  const words = heading.toLowerCase().split(/\s+/);
  
  // Extract meaningful phrases (2-4 word combinations)
  for (let i = 0; i < words.length; i++) {
    for (let len = 2; len <= Math.min(4, words.length - i); len++) {
      const phrase = words.slice(i, i + len).join(' ');
      if (isValidTopic(phrase)) {
        topics.push(phrase);
      }
    }
  }
  
  return topics.slice(0, 5); // Top 5 topics per heading
}

/**
 * Check if phrase is a valid topic
 */
function isValidTopic(phrase: string): boolean {
  const stopPhrases = [
    'how to', 'what is', 'why do', 'when to', 'where to',
    'the best', 'a guide', 'an overview'
  ];
  
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can',
    'this', 'that', 'these', 'those', 'it', 'its', 'your', 'our', 'their'
  ]);
  
  const words = phrase.split(/\s+/);
  
  // Check if starts with stop phrase
  if (stopPhrases.some(sp => phrase.startsWith(sp))) return false;
  
  // Check if all words are stop words
  if (words.every(w => stopWords.has(w))) return false;
  
  // Must have at least one content word
  const contentWords = words.filter(w => !stopWords.has(w) && w.length > 2);
  return contentWords.length >= 1;
}

// -----------------------------------------------------------------------------
// Term Extraction Utilities
// -----------------------------------------------------------------------------

/**
 * Extract terms from content with frequency and importance
 */
export function extractTermsFromContent(
  content: string,
  headings: CompetitorHeading[]
): CompetitorTerm[] {
  const text = extractTextFromHTML(content).toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 2);
  const totalWords = words.length;
  
  // Count word frequencies
  const wordCounts = new Map<string, number>();
  for (const word of words) {
    const clean = word.replace(/[^a-z0-9]/g, '');
    if (clean.length > 2) {
      wordCounts.set(clean, (wordCounts.get(clean) || 0) + 1);
    }
  }
  
  // Extract bigrams and trigrams
  const ngrams = extractNGrams(words, 2, 3);
  for (const [ngram, count] of ngrams) {
    wordCounts.set(ngram, count);
  }
  
  // Filter stop words
  const stopWords = getStopWords();
  const filteredTerms: CompetitorTerm[] = [];
  
  // Get heading text and first paragraph
  const headingText = headings.map(h => h.text.toLowerCase()).join(' ');
  const firstParagraph = getFirstParagraph(content).toLowerCase();
  
  for (const [term, frequency] of wordCounts) {
    if (stopWords.has(term)) continue;
    if (term.split(' ').every(w => stopWords.has(w))) continue;
    
    const density = (frequency / totalWords) * 100;
    const inHeadings = headingText.includes(term);
    const inFirstParagraph = firstParagraph.includes(term);
    
    // Calculate importance score
    let importance = 0;
    importance += Math.min(frequency * 5, 40); // Frequency factor (max 40)
    importance += inHeadings ? 25 : 0; // Heading bonus
    importance += inFirstParagraph ? 20 : 0; // First paragraph bonus
    importance += density > 0.5 ? 15 : density > 0.2 ? 10 : 5; // Density factor
    
    filteredTerms.push({
      term,
      frequency,
      density,
      importance: Math.min(importance, 100),
      inHeadings,
      inFirstParagraph
    });
  }
  
  // Sort by importance and return top terms
  return filteredTerms
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 100);
}

/**
 * Extract n-grams from words
 */
function extractNGrams(
  words: string[],
  minN: number,
  maxN: number
): Map<string, number> {
  const ngrams = new Map<string, number>();
  const stopWords = getStopWords();
  
  for (let n = minN; n <= maxN; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const ngramWords = words.slice(i, i + n);
      
      // Skip if starts or ends with stop word
      if (stopWords.has(ngramWords[0]) || stopWords.has(ngramWords[n - 1])) {
        continue;
      }
      
      const ngram = ngramWords.join(' ').replace(/[^a-z0-9\s]/g, '').trim();
      if (ngram.length > 3) {
        ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
      }
    }
  }
  
  // Filter low frequency ngrams
  for (const [ngram, count] of ngrams) {
    if (count < 2) ngrams.delete(ngram);
  }
  
  return ngrams;
}

/**
 * Get first paragraph of content
 */
function getFirstParagraph(html: string): string {
  const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return pMatch ? extractTextFromHTML(pMatch[1]) : '';
}

/**
 * Get set of stop words
 */
function getStopWords(): Set<string> {
  return new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can',
    'this', 'that', 'these', 'those', 'it', 'its', 'i', 'you', 'he', 'she',
    'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
    'her', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
    'what', 'which', 'who', 'whom', 'where', 'when', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there',
    'then', 'once', 'if', 'because', 'while', 'although', 'though',
    'after', 'before', 'until', 'unless', 'since', 'during', 'about',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'under', 'again', 'further', 'once', 'any', 'many'
  ]);
}

// -----------------------------------------------------------------------------
// Entity Extraction Utilities
// -----------------------------------------------------------------------------

/**
 * Extract named entities from content
 */
export function extractEntitiesFromContent(content: string): CompetitorEntity[] {
  const text = extractTextFromHTML(content);
  const entities: Map<string, { type: CompetitorEntityType; count: number }> = new Map();
  
  // Pattern-based entity extraction
  const patterns: { regex: RegExp; type: CompetitorEntityType }[] = [
    // Organizations (capitalized words followed by Inc, Corp, LLC, etc.)
    { regex: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|Corp|LLC|Ltd|Co|Company|Group))?\.?\b/g, type: 'organization' },
    // Products (capitalized followed by version numbers or product indicators)
    { regex: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:\d+(?:\.\d+)*|Pro|Plus|Premium|Free|Basic))\b/g, type: 'product' },
    // Technologies (common tech patterns)
    { regex: /\b(?:API|SDK|AI|ML|SEO|SaaS|CRM|ERP|CMS|CDN|DNS|SSL|TLS|HTTP|REST|GraphQL|OAuth)\b/gi, type: 'technology' },
    // Brands (known patterns)
    { regex: /\b(?:Google|Microsoft|Apple|Amazon|Facebook|Meta|Twitter|LinkedIn|YouTube|Instagram|TikTok|Shopify|WordPress|HubSpot)\b/gi, type: 'brand' },
  ];
  
  for (const { regex, type } of patterns) {
    const matches = text.match(regex) || [];
    for (const match of matches) {
      const normalized = match.trim();
      if (normalized.length > 1) {
        const existing = entities.get(normalized.toLowerCase());
        if (existing) {
          existing.count++;
        } else {
          entities.set(normalized.toLowerCase(), { type, count: 1 });
        }
      }
    }
  }
  
  // Convert to array and sort by frequency
  const entityArray: CompetitorEntity[] = [];
  for (const [entity, data] of entities) {
    entityArray.push({
      entity,
      type: data.type,
      frequency: data.count,
      competitors: 1, // Will be updated in aggregation
      importance: data.count >= 5 ? 'critical' : data.count >= 3 ? 'high' : data.count >= 2 ? 'medium' : 'low'
    });
  }
  
  return entityArray
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 50);
}

// -----------------------------------------------------------------------------
// Content Metrics Calculation
// -----------------------------------------------------------------------------

/**
 * Calculate content metrics from HTML
 */
export function calculateContentMetrics(html: string): ContentMetrics {
  const text = extractTextFromHTML(html);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const headings = extractHeadingsFromHTML(html);
  
  // Count paragraphs
  const paragraphs = (html.match(/<p[^>]*>/gi) || []).length;
  
  // Count images
  const images = (html.match(/<img[^>]*>/gi) || []).length;
  
  // Count videos
  const videos = (html.match(/<video|<iframe[^>]*(?:youtube|vimeo)/gi) || []).length;
  
  // Count links
  const allLinks = html.match(/<a[^>]*href="([^"]*)"[^>]*>/gi) || [];
  let internalLinks = 0;
  let externalLinks = 0;
  
  for (const link of allLinks) {
    if (link.includes('http://') || link.includes('https://')) {
      externalLinks++;
    } else {
      internalLinks++;
    }
  }
  
  // Extract terms for unique count
  const terms = extractTermsFromContent(html, headings);
  const entities = extractEntitiesFromContent(html);
  
  return {
    wordCount: words.length,
    headingCount: countHeadingsByLevel(headings),
    paragraphCount: paragraphs,
    imageCount: images,
    videoCount: videos,
    internalLinks,
    externalLinks,
    readingTime: Math.ceil(words.length / 200), // ~200 wpm average reading speed
    uniqueTerms: terms.length,
    entityCount: entities.length
  };
}

/**
 * Calculate average metrics from multiple competitors
 */
export function calculateAverageMetrics(competitors: SERPCompetitor[]): ContentMetrics {
  if (competitors.length === 0) {
    return getEmptyMetrics();
  }
  
  const sum = competitors.reduce((acc, c) => ({
    wordCount: acc.wordCount + c.wordCount,
    headingCount: {
      h1: acc.headingCount.h1 + c.headingCount.h1,
      h2: acc.headingCount.h2 + c.headingCount.h2,
      h3: acc.headingCount.h3 + c.headingCount.h3,
      h4: acc.headingCount.h4 + c.headingCount.h4,
      h5: acc.headingCount.h5 + c.headingCount.h5,
      h6: acc.headingCount.h6 + c.headingCount.h6,
      total: acc.headingCount.total + c.headingCount.total
    },
    paragraphCount: acc.paragraphCount + c.paragraphCount,
    imageCount: acc.imageCount + c.imageCount,
    videoCount: acc.videoCount + c.videoCount,
    internalLinks: acc.internalLinks + c.internalLinks,
    externalLinks: acc.externalLinks + c.externalLinks,
    readingTime: acc.readingTime + c.estimatedReadTime,
    uniqueTerms: acc.uniqueTerms + c.topTerms.length,
    entityCount: acc.entityCount + c.entities.length
  }), getEmptyMetrics());
  
  const count = competitors.length;
  
  return {
    wordCount: Math.round(sum.wordCount / count),
    headingCount: {
      h1: Math.round(sum.headingCount.h1 / count),
      h2: Math.round(sum.headingCount.h2 / count),
      h3: Math.round(sum.headingCount.h3 / count),
      h4: Math.round(sum.headingCount.h4 / count),
      h5: Math.round(sum.headingCount.h5 / count),
      h6: Math.round(sum.headingCount.h6 / count),
      total: Math.round(sum.headingCount.total / count)
    },
    paragraphCount: Math.round(sum.paragraphCount / count),
    imageCount: Math.round(sum.imageCount / count),
    videoCount: Math.round(sum.videoCount / count),
    internalLinks: Math.round(sum.internalLinks / count),
    externalLinks: Math.round(sum.externalLinks / count),
    readingTime: Math.round(sum.readingTime / count),
    uniqueTerms: Math.round(sum.uniqueTerms / count),
    entityCount: Math.round(sum.entityCount / count)
  };
}

/**
 * Get empty metrics object
 */
function getEmptyMetrics(): ContentMetrics {
  return {
    wordCount: 0,
    headingCount: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0, total: 0 },
    paragraphCount: 0,
    imageCount: 0,
    videoCount: 0,
    internalLinks: 0,
    externalLinks: 0,
    readingTime: 0,
    uniqueTerms: 0,
    entityCount: 0
  };
}

// -----------------------------------------------------------------------------
// Content Gap Analysis
// -----------------------------------------------------------------------------

/**
 * Analyze content gaps between your content and competitors
 */
export function analyzeContentGaps(
  yourContent: string,
  competitors: SERPCompetitor[]
): ContentGapAnalysis {
  const yourHeadings = extractHeadingsFromHTML(yourContent);
  const yourTerms = extractTermsFromContent(yourContent, yourHeadings);
  const yourEntities = extractEntitiesFromContent(yourContent);
  const yourText = extractTextFromHTML(yourContent).toLowerCase();
  
  // Build competitor term map
  const competitorTermMap = new Map<string, { frequency: number; count: number; contexts: string[] }>();
  const competitorEntityMap = new Map<string, { type: CompetitorEntityType; count: number }>();
  const competitorHeadingMap = new Map<string, { level: number; count: number; positions: number[] }>();
  
  for (const competitor of competitors) {
    // Aggregate terms
    for (const term of competitor.topTerms) {
      const existing = competitorTermMap.get(term.term);
      if (existing) {
        existing.frequency += term.frequency;
        existing.count++;
      } else {
        competitorTermMap.set(term.term, {
          frequency: term.frequency,
          count: 1,
          contexts: []
        });
      }
    }
    
    // Aggregate entities
    for (const entity of competitor.entities) {
      const existing = competitorEntityMap.get(entity.entity);
      if (existing) {
        existing.count++;
      } else {
        competitorEntityMap.set(entity.entity, {
          type: entity.type,
          count: 1
        });
      }
    }
    
    // Aggregate headings
    for (const heading of competitor.headings) {
      const normalized = heading.text.toLowerCase().trim();
      const existing = competitorHeadingMap.get(normalized);
      if (existing) {
        existing.count++;
        existing.positions.push(heading.position);
      } else {
        competitorHeadingMap.set(normalized, {
          level: heading.level,
          count: 1,
          positions: [heading.position]
        });
      }
    }
  }
  
  // Find missing terms
  const yourTermSet = new Set(yourTerms.map(t => t.term));
  const missingTerms: MissingTerm[] = [];
  
  for (const [term, data] of competitorTermMap) {
    if (!yourTermSet.has(term) && data.count >= 3) { // At least 30% of competitors
      const avgFrequency = data.frequency / data.count;
      missingTerms.push({
        term,
        avgCompetitorFrequency: avgFrequency,
        competitorsCovering: data.count,
        importance: Math.min((data.count / competitors.length) * 100, 100),
        suggestedUsage: Math.max(1, Math.round(avgFrequency * 0.8)), // 80% of avg
        context: `Used by ${data.count}/${competitors.length} competitors`
      });
    }
  }
  
  // Find missing entities
  const yourEntitySet = new Set(yourEntities.map(e => e.entity));
  const missingEntities: MissingEntity[] = [];
  
  for (const [entity, data] of competitorEntityMap) {
    if (!yourEntitySet.has(entity) && data.count >= 2) {
      missingEntities.push({
        entity,
        type: data.type,
        competitorsCovering: data.count,
        relevance: (data.count / competitors.length) * 100,
        context: `Mentioned by ${data.count}/${competitors.length} competitors`
      });
    }
  }
  
  // Find missing sections
  const yourHeadingSet = new Set(yourHeadings.map(h => h.text.toLowerCase().trim()));
  const missingSections: MissingSection[] = [];
  
  for (const [heading, data] of competitorHeadingMap) {
    if (!yourHeadingSet.has(heading) && data.count >= 3) {
      const avgPosition = data.positions.reduce((a, b) => a + b, 0) / data.positions.length;
      missingSections.push({
        id: generateId(),
        heading: heading.charAt(0).toUpperCase() + heading.slice(1), // Capitalize
        level: data.level,
        competitorsCovering: data.count,
        avgPosition,
        avgWordCount: 200, // Estimate
        priority: data.count >= 7 ? 'critical' : data.count >= 5 ? 'high' : data.count >= 3 ? 'medium' : 'low',
        subtopics: []
      });
    }
  }
  
  // Find missing topics (grouped from missing terms/sections)
  const missingTopics = identifyMissingTopics(missingSections, missingTerms, competitors);
  
  // Find missing questions
  const missingQuestions = identifyMissingQuestions(competitors, yourText);
  
  // Find structural gaps
  const structuralGaps = identifyStructuralGaps(yourContent, competitors);
  
  // Calculate coverage scores
  const termCoverage = calculateTermCoverage(yourTerms, competitorTermMap);
  const entityCoverage = calculateEntityCoverage(yourEntities, competitorEntityMap);
  const structureCoverage = calculateStructureCoverage(yourHeadings, competitorHeadingMap);
  const topicCoverage = (termCoverage + entityCoverage + structureCoverage) / 3;
  
  // Calculate overall gap score (lower is better)
  const gapScore = 100 - topicCoverage;
  
  return {
    missingTopics: missingTopics.sort((a, b) => {
      const priorityOrder: Record<'critical' | 'high' | 'medium' | 'low', number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
    missingTerms: missingTerms.sort((a, b) => b.importance - a.importance).slice(0, 30),
    missingEntities: missingEntities.sort((a, b) => b.relevance - a.relevance).slice(0, 20),
    missingSections: missingSections.sort((a, b) => {
      const priorityOrder: Record<'critical' | 'high' | 'medium' | 'low', number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
    missingQuestions: missingQuestions.slice(0, 10),
    structuralGaps,
    gapScore,
    topicCoverage,
    termCoverage,
    entityCoverage,
    structureCoverage
  };
}

/**
 * Identify missing topics from sections and terms
 */
function identifyMissingTopics(
  missingSections: MissingSection[],
  missingTerms: MissingTerm[],
  competitors: SERPCompetitor[]
): MissingTopic[] {
  const topics: MissingTopic[] = [];
  
  // Group missing sections into topics
  for (const section of missingSections.slice(0, 10)) {
    const relatedTerms = missingTerms
      .filter(t => section.heading.toLowerCase().includes(t.term) || 
                   t.term.includes(section.heading.toLowerCase().split(' ')[0]))
      .map(t => t.term)
      .slice(0, 5);
    
    topics.push({
      id: section.id,
      topic: section.heading,
      description: `Topic covered by ${section.competitorsCovering} competitors`,
      competitorsCovering: section.competitorsCovering,
      competitorPercentage: (section.competitorsCovering / competitors.length) * 100,
      priority: section.priority,
      suggestedHeading: section.heading,
      suggestedWordCount: section.avgWordCount,
      relatedTerms
    });
  }
  
  return topics;
}

/**
 * Identify missing questions from competitors
 */
function identifyMissingQuestions(
  competitors: SERPCompetitor[],
  yourText: string
): MissingQuestion[] {
  const questions: MissingQuestion[] = [];
  const questionMap = new Map<string, number>();
  
  // Extract questions from competitor headings
  for (const competitor of competitors) {
    for (const heading of competitor.headings) {
      const text = heading.text.toLowerCase();
      if (text.includes('?') || 
          text.startsWith('what') ||
          text.startsWith('how') ||
          text.startsWith('why') ||
          text.startsWith('when') ||
          text.startsWith('where') ||
          text.startsWith('who') ||
          text.startsWith('which')) {
        questionMap.set(text, (questionMap.get(text) || 0) + 1);
      }
    }
  }
  
  // Filter questions not in your content
  for (const [question, frequency] of questionMap) {
    if (!yourText.includes(question) && frequency >= 2) {
      questions.push({
        question: question.charAt(0).toUpperCase() + question.slice(1),
        frequency,
        answerType: question.startsWith('how') ? 'steps' : 
                   question.startsWith('what is') ? 'definition' : 'paragraph',
        suggestedAnswerLength: 100,
        source: 'competitor-heading'
      });
    }
  }
  
  return questions.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Identify structural gaps
 */
function identifyStructuralGaps(
  yourContent: string,
  competitors: SERPCompetitor[]
): StructuralGap[] {
  const yourMetrics = calculateContentMetrics(yourContent);
  const gaps: StructuralGap[] = [];
  
  const metricsToCheck: { key: keyof ContentMetrics; type: StructuralGapType; name: string }[] = [
    { key: 'wordCount', type: 'word-count', name: 'Word Count' },
    { key: 'imageCount', type: 'image-count', name: 'Images' },
    { key: 'videoCount', type: 'video-count', name: 'Videos' },
    { key: 'internalLinks', type: 'internal-links', name: 'Internal Links' },
    { key: 'externalLinks', type: 'external-links', name: 'External Links' },
    { key: 'paragraphCount', type: 'paragraph-count', name: 'Paragraphs' }
  ];
  
  for (const { key, type, name } of metricsToCheck) {
    const values = competitors.map(c => {
      if (key === 'wordCount') return c.wordCount;
      if (key === 'imageCount') return c.imageCount;
      if (key === 'videoCount') return c.videoCount;
      if (key === 'internalLinks') return c.internalLinks;
      if (key === 'externalLinks') return c.externalLinks;
      if (key === 'paragraphCount') return c.paragraphCount;
      return 0;
    }).sort((a, b) => a - b);
    
    const min = values[0] || 0;
    const max = values[values.length - 1] || 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const current = yourMetrics[key] as number;
    
    // Determine if there's a gap
    if (current < avg * 0.7) { // More than 30% below average
      const priority = current < min ? 'critical' :
                      current < avg * 0.5 ? 'high' :
                      current < avg * 0.7 ? 'medium' : 'low';
      
      gaps.push({
        type,
        current,
        recommended: Math.round(avg),
        min,
        max,
        avg: Math.round(avg),
        priority,
        action: `Add ${Math.round(avg - current)} more ${name.toLowerCase()}`
      });
    }
  }
  
  return gaps;
}

/**
 * Calculate term coverage percentage
 */
function calculateTermCoverage(
  yourTerms: CompetitorTerm[],
  competitorTerms: Map<string, { frequency: number; count: number }>
): number {
  if (competitorTerms.size === 0) return 100;
  
  const yourTermSet = new Set(yourTerms.map(t => t.term));
  let covered = 0;
  let important = 0;
  
  for (const [term, data] of competitorTerms) {
    if (data.count >= 3) { // Important term (30%+ of competitors)
      important++;
      if (yourTermSet.has(term)) covered++;
    }
  }
  
  return important > 0 ? (covered / important) * 100 : 100;
}

/**
 * Calculate entity coverage percentage
 */
function calculateEntityCoverage(
  yourEntities: CompetitorEntity[],
  competitorEntities: Map<string, { type: CompetitorEntityType; count: number }>
): number {
  if (competitorEntities.size === 0) return 100;
  
  const yourEntitySet = new Set(yourEntities.map(e => e.entity));
  let covered = 0;
  let important = 0;
  
  for (const [entity, data] of competitorEntities) {
    if (data.count >= 2) { // Important entity
      important++;
      if (yourEntitySet.has(entity)) covered++;
    }
  }
  
  return important > 0 ? (covered / important) * 100 : 100;
}

/**
 * Calculate structure coverage percentage
 */
function calculateStructureCoverage(
  yourHeadings: CompetitorHeading[],
  competitorHeadings: Map<string, { level: number; count: number }>
): number {
  if (competitorHeadings.size === 0) return 100;
  
  const yourHeadingSet = new Set(yourHeadings.map(h => h.text.toLowerCase().trim()));
  let covered = 0;
  let important = 0;
  
  for (const [heading, data] of competitorHeadings) {
    if (data.count >= 3) { // Important heading
      important++;
      if (yourHeadingSet.has(heading)) covered++;
    }
  }
  
  return important > 0 ? (covered / important) * 100 : 100;
}

// -----------------------------------------------------------------------------
// Competitor Comparison
// -----------------------------------------------------------------------------

/**
 * Compare your content against competitors
 */
export function compareWithCompetitors(
  yourContent: string,
  competitors: SERPCompetitor[]
): CompetitorComparison {
  const yourMetrics = calculateContentMetrics(yourContent);
  const avgMetrics = calculateAverageMetrics(competitors);
  
  // Get min/max metrics
  const minMetrics = competitors.length > 0 
    ? getMinMetrics(competitors) 
    : getEmptyMetrics();
  const maxMetrics = competitors.length > 0 
    ? getMaxMetrics(competitors) 
    : getEmptyMetrics();
  
  // Get top competitor metrics
  const topCompetitor = competitors.length > 0 
    ? {
        wordCount: competitors[0].wordCount,
        headingCount: competitors[0].headingCount,
        paragraphCount: competitors[0].paragraphCount,
        imageCount: competitors[0].imageCount,
        videoCount: competitors[0].videoCount,
        internalLinks: competitors[0].internalLinks,
        externalLinks: competitors[0].externalLinks,
        readingTime: competitors[0].estimatedReadTime,
        uniqueTerms: competitors[0].topTerms.length,
        entityCount: competitors[0].entities.length
      }
    : getEmptyMetrics();
  
  // Calculate comparison scores
  const scores = calculateComparisonScores(yourMetrics, avgMetrics, topCompetitor);
  
  // Predict position
  const positionPrediction = predictPosition(yourMetrics, avgMetrics, competitors);
  
  return {
    yourContent: yourMetrics,
    competitorAverage: avgMetrics,
    competitorMin: minMetrics,
    competitorMax: maxMetrics,
    topCompetitor,
    scores,
    positionPrediction
  };
}

/**
 * Get minimum metrics from competitors
 */
function getMinMetrics(competitors: SERPCompetitor[]): ContentMetrics {
  return {
    wordCount: Math.min(...competitors.map(c => c.wordCount)),
    headingCount: {
      h1: Math.min(...competitors.map(c => c.headingCount.h1)),
      h2: Math.min(...competitors.map(c => c.headingCount.h2)),
      h3: Math.min(...competitors.map(c => c.headingCount.h3)),
      h4: Math.min(...competitors.map(c => c.headingCount.h4)),
      h5: Math.min(...competitors.map(c => c.headingCount.h5)),
      h6: Math.min(...competitors.map(c => c.headingCount.h6)),
      total: Math.min(...competitors.map(c => c.headingCount.total))
    },
    paragraphCount: Math.min(...competitors.map(c => c.paragraphCount)),
    imageCount: Math.min(...competitors.map(c => c.imageCount)),
    videoCount: Math.min(...competitors.map(c => c.videoCount)),
    internalLinks: Math.min(...competitors.map(c => c.internalLinks)),
    externalLinks: Math.min(...competitors.map(c => c.externalLinks)),
    readingTime: Math.min(...competitors.map(c => c.estimatedReadTime)),
    uniqueTerms: Math.min(...competitors.map(c => c.topTerms.length)),
    entityCount: Math.min(...competitors.map(c => c.entities.length))
  };
}

/**
 * Get maximum metrics from competitors
 */
function getMaxMetrics(competitors: SERPCompetitor[]): ContentMetrics {
  return {
    wordCount: Math.max(...competitors.map(c => c.wordCount)),
    headingCount: {
      h1: Math.max(...competitors.map(c => c.headingCount.h1)),
      h2: Math.max(...competitors.map(c => c.headingCount.h2)),
      h3: Math.max(...competitors.map(c => c.headingCount.h3)),
      h4: Math.max(...competitors.map(c => c.headingCount.h4)),
      h5: Math.max(...competitors.map(c => c.headingCount.h5)),
      h6: Math.max(...competitors.map(c => c.headingCount.h6)),
      total: Math.max(...competitors.map(c => c.headingCount.total))
    },
    paragraphCount: Math.max(...competitors.map(c => c.paragraphCount)),
    imageCount: Math.max(...competitors.map(c => c.imageCount)),
    videoCount: Math.max(...competitors.map(c => c.videoCount)),
    internalLinks: Math.max(...competitors.map(c => c.internalLinks)),
    externalLinks: Math.max(...competitors.map(c => c.externalLinks)),
    readingTime: Math.max(...competitors.map(c => c.estimatedReadTime)),
    uniqueTerms: Math.max(...competitors.map(c => c.topTerms.length)),
    entityCount: Math.max(...competitors.map(c => c.entities.length))
  };
}

/**
 * Calculate comparison scores
 */
function calculateComparisonScores(
  your: ContentMetrics,
  avg: ContentMetrics,
  top: ContentMetrics
): ComparisonScores {
  const contentLength = calculateScoreDetail(your.wordCount, avg.wordCount, top.wordCount, 'words');
  const structure = calculateScoreDetail(
    your.headingCount.total, 
    avg.headingCount.total, 
    top.headingCount.total, 
    'headings'
  );
  const termCoverage = calculateScoreDetail(your.uniqueTerms, avg.uniqueTerms, top.uniqueTerms, 'terms');
  const entityCoverage = calculateScoreDetail(your.entityCount, avg.entityCount, top.entityCount, 'entities');
  const readability = { score: 75, vsAverage: 0, vsTop: 0, status: 'good' as const, recommendation: 'Readability is acceptable' };
  const multimedia = calculateScoreDetail(your.imageCount, avg.imageCount, top.imageCount, 'images');
  const linking = calculateScoreDetail(
    your.internalLinks + your.externalLinks,
    avg.internalLinks + avg.externalLinks,
    top.internalLinks + top.externalLinks,
    'links'
  );
  
  const overall = Math.round(
    (contentLength.score + structure.score + termCoverage.score + 
     entityCoverage.score + readability.score + multimedia.score + linking.score) / 7
  );
  
  return {
    overall,
    contentLength,
    structure,
    termCoverage,
    entityCoverage,
    readability,
    multimedia,
    linking
  };
}

/**
 * Calculate score detail for a metric
 */
function calculateScoreDetail(
  your: number,
  avg: number,
  top: number,
  metric: string
): ScoreDetail {
  // Calculate percentage vs average and top
  const vsAverage = avg > 0 ? ((your - avg) / avg) * 100 : 0;
  const vsTop = top > 0 ? ((your - top) / top) * 100 : 0;
  
  // Calculate score (0-100)
  let score: number;
  if (avg === 0) {
    score = your > 0 ? 100 : 50;
  } else if (your >= avg) {
    score = Math.min(100, 75 + (vsAverage / 4));
  } else {
    score = Math.max(0, 75 - Math.abs(vsAverage) * 0.75);
  }
  
  // Determine status
  let status: 'excellent' | 'good' | 'needs-work' | 'poor';
  if (score >= 90) status = 'excellent';
  else if (score >= 70) status = 'good';
  else if (score >= 50) status = 'needs-work';
  else status = 'poor';
  
  // Generate recommendation
  let recommendation: string;
  if (vsAverage >= 20) {
    recommendation = `Your ${metric} count exceeds the average. Great job!`;
  } else if (vsAverage >= -10) {
    recommendation = `Your ${metric} count is close to the average.`;
  } else if (vsAverage >= -30) {
    recommendation = `Consider adding more ${metric} to match competitors.`;
  } else {
    recommendation = `Significantly below average. Add ${Math.round(avg - your)} more ${metric}.`;
  }
  
  return {
    score: Math.round(score),
    vsAverage: Math.round(vsAverage),
    vsTop: Math.round(vsTop),
    status,
    recommendation
  };
}

/**
 * Predict SERP position based on content analysis
 */
function predictPosition(
  your: ContentMetrics,
  avg: ContentMetrics,
  competitors: SERPCompetitor[]
): PositionPrediction {
  const factors: PositionFactor[] = [];
  let score = 50; // Base score
  
  // Word count factor
  const wordRatio = avg.wordCount > 0 ? your.wordCount / avg.wordCount : 1;
  if (wordRatio >= 1.2) {
    factors.push({
      factor: 'Content Length',
      impact: 'positive',
      weight: 15,
      description: 'Your content is longer than average'
    });
    score += 15;
  } else if (wordRatio >= 0.8) {
    factors.push({
      factor: 'Content Length',
      impact: 'neutral',
      weight: 5,
      description: 'Your content length is competitive'
    });
    score += 5;
  } else {
    factors.push({
      factor: 'Content Length',
      impact: 'negative',
      weight: -10,
      description: 'Your content is shorter than competitors'
    });
    score -= 10;
  }
  
  // Structure factor
  const structureRatio = avg.headingCount.total > 0 
    ? your.headingCount.total / avg.headingCount.total 
    : 1;
  if (structureRatio >= 1) {
    factors.push({
      factor: 'Content Structure',
      impact: 'positive',
      weight: 10,
      description: 'Well-structured with adequate headings'
    });
    score += 10;
  } else if (structureRatio >= 0.7) {
    factors.push({
      factor: 'Content Structure',
      impact: 'neutral',
      weight: 0,
      description: 'Structure is acceptable'
    });
  } else {
    factors.push({
      factor: 'Content Structure',
      impact: 'negative',
      weight: -5,
      description: 'Could use more headings for better structure'
    });
    score -= 5;
  }
  
  // Media factor
  if (your.imageCount >= avg.imageCount) {
    factors.push({
      factor: 'Visual Content',
      impact: 'positive',
      weight: 10,
      description: 'Good use of images'
    });
    score += 10;
  } else if (your.imageCount > 0) {
    factors.push({
      factor: 'Visual Content',
      impact: 'neutral',
      weight: 0,
      description: 'Some images present'
    });
  } else {
    factors.push({
      factor: 'Visual Content',
      impact: 'negative',
      weight: -5,
      description: 'Consider adding images'
    });
    score -= 5;
  }
  
  // Calculate estimated position
  // Score 100 = position 1, Score 0 = position 20+
  const estimatedPosition = Math.max(1, Math.min(20, Math.round(21 - (score / 5))));
  
  // Confidence based on factors
  const confidence = Math.min(80, 40 + factors.filter(f => f.impact !== 'neutral').length * 10);
  
  return {
    estimatedPosition,
    confidence,
    factors
  };
}

// -----------------------------------------------------------------------------
// Common Patterns Extraction
// -----------------------------------------------------------------------------

/**
 * Extract common patterns from competitors
 */
export function extractCommonPatterns(competitors: SERPCompetitor[]): {
  headings: CommonPattern[];
  terms: CommonPattern[];
  entities: CommonPattern[];
  questions: CommonPattern[];
} {
  const headingMap = new Map<string, { count: number; positions: number[] }>();
  const termMap = new Map<string, { count: number; importance: number }>();
  const entityMap = new Map<string, { count: number; type: CompetitorEntityType }>();
  const questionMap = new Map<string, number>();
  
  for (const competitor of competitors) {
    // Headings
    for (const heading of competitor.headings) {
      const normalized = heading.text.toLowerCase().trim();
      const existing = headingMap.get(normalized);
      if (existing) {
        existing.count++;
        existing.positions.push(heading.position);
      } else {
        headingMap.set(normalized, { count: 1, positions: [heading.position] });
      }
    }
    
    // Terms
    for (const term of competitor.topTerms.slice(0, 30)) {
      const existing = termMap.get(term.term);
      if (existing) {
        existing.count++;
        existing.importance = Math.max(existing.importance, term.importance);
      } else {
        termMap.set(term.term, { count: 1, importance: term.importance });
      }
    }
    
    // Entities
    for (const entity of competitor.entities) {
      const existing = entityMap.get(entity.entity);
      if (existing) {
        existing.count++;
      } else {
        entityMap.set(entity.entity, { count: 1, type: entity.type });
      }
    }
    
    // Questions
    for (const heading of competitor.headings) {
      if (heading.text.includes('?')) {
        questionMap.set(heading.text, (questionMap.get(heading.text) || 0) + 1);
      }
    }
  }
  
  const total = competitors.length;
  
  // Convert to CommonPattern arrays
  const headings: CommonPattern[] = Array.from(headingMap.entries())
    .map(([item, data]) => ({
      item,
      frequency: data.count,
      percentage: (data.count / total) * 100,
      avgPosition: data.positions.reduce((a, b) => a + b, 0) / data.positions.length,
      importance: data.count >= total * 0.7 ? 'critical' as const :
                 data.count >= total * 0.5 ? 'high' as const :
                 data.count >= total * 0.3 ? 'medium' as const : 'low' as const
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);
  
  const terms: CommonPattern[] = Array.from(termMap.entries())
    .map(([item, data]) => ({
      item,
      frequency: data.count,
      percentage: (data.count / total) * 100,
      avgPosition: 0.5,
      importance: data.count >= total * 0.7 ? 'critical' as const :
                 data.count >= total * 0.5 ? 'high' as const :
                 data.count >= total * 0.3 ? 'medium' as const : 'low' as const
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 30);
  
  const entities: CommonPattern[] = Array.from(entityMap.entries())
    .map(([item, data]) => ({
      item,
      frequency: data.count,
      percentage: (data.count / total) * 100,
      avgPosition: 0.5,
      importance: data.count >= total * 0.5 ? 'critical' as const :
                 data.count >= total * 0.3 ? 'high' as const :
                 data.count >= total * 0.2 ? 'medium' as const : 'low' as const
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);
  
  const questions: CommonPattern[] = Array.from(questionMap.entries())
    .map(([item, count]) => ({
      item,
      frequency: count,
      percentage: (count / total) * 100,
      avgPosition: 0.5,
      importance: count >= 3 ? 'high' as const : count >= 2 ? 'medium' as const : 'low' as const
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);
  
  return { headings, terms, entities, questions };
}

// -----------------------------------------------------------------------------
// Feature Frequency Analysis
// -----------------------------------------------------------------------------

/**
 * Calculate feature frequency across competitors
 */
export function calculateFeatureFrequency(competitors: SERPCompetitor[]): FeatureFrequency {
  const total = competitors.length || 1;
  
  return {
    faq: competitors.filter(c => c.hasFAQ).length / total * 100,
    tableOfContents: competitors.filter(c => c.hasTableOfContents).length / total * 100,
    video: competitors.filter(c => c.videoCount > 0).length / total * 100,
    infographic: 0, // Would need image analysis
    downloadable: 0, // Would need content analysis
    interactive: 0, // Would need content analysis
    schemaMarkup: competitors.filter(c => c.hasSchema).length / total * 100,
    authorBox: 0, // Would need content analysis
    lastUpdated: competitors.filter(c => c.lastUpdated !== null).length / total * 100,
    statistics: 0 // Would need content analysis
  };
}

// -----------------------------------------------------------------------------
// Export All Functions
// -----------------------------------------------------------------------------

export {
  DEFAULT_ANALYSIS_SETTINGS
} from '@/src/features/ai-writer/types/tools/competitor-analysis.types';

