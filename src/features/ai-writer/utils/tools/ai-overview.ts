/**
 * AI Overview Visibility Utilities
 * 
 * Functions for analyzing and optimizing content for AI search overviews
 */

import {
  AIOverviewAnalysis,
  AIOverviewFactor,
  AIOverviewMetrics,
  AIOverviewOptimization,
  AIOverviewSummary,
  AIOverviewSettings,
  ContentStructureAnalysis,
  AuthoritySignals,
  RelevanceSignals,
  FreshnessSignals,
  EngagementSignals,
  SnippetCandidate,
  VisibilityScore,
  ContentFormat,
  FactorCategory,
  OptimizationPriority,
  DEFAULT_AI_OVERVIEW_SETTINGS,
  DEFINITION_PATTERNS,
  LIST_PATTERNS,
  HOW_TO_PATTERNS,
  FAQ_PATTERNS,
  AUTHORITY_KEYWORDS,
  FRESHNESS_KEYWORDS,
  OPTIMAL_SNIPPET_LENGTH,
  CATEGORY_WEIGHTS,
  AIOverviewExportOptions
} from '@/src/features/ai-writer/types/tools/ai-overview.types';

// =============================================================================
// TEXT UTILITIES
// =============================================================================

function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function getSentences(text: string): string[] {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
}

function getParagraphs(text: string): string[] {
  return text.split(/\n\n+/).filter(p => p.trim().length > 0);
}

function getHeadings(text: string): string[] {
  const headingPatterns = [
    /^#{1,6}\s+(.+)$/gm,  // Markdown headings
    /^(.+)\n[=-]+$/gm,    // Underline headings
  ];
  
  const headings: string[] = [];
  headingPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      headings.push(match[1] || match[0]);
    }
  });
  
  return headings;
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just']);
  
  const keywords = words.filter(word => {
    const clean = word.replace(/[^a-z]/g, '');
    return clean.length > 3 && !stopWords.has(clean);
  });
  
  // Count frequency
  const freq: Record<string, number> = {};
  keywords.forEach(word => {
    const clean = word.replace(/[^a-z]/g, '');
    freq[clean] = (freq[clean] || 0) + 1;
  });
  
  // Sort by frequency
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

// =============================================================================
// STRUCTURE ANALYSIS
// =============================================================================

function analyzeStructure(text: string): ContentStructureAnalysis {
  const paragraphs = getParagraphs(text);
  const sentences = getSentences(text);
  const headings = getHeadings(text);
  
  // Check for definition
  let hasDefinition = false;
  let definitionPosition: number | null = null;
  
  for (const pattern of DEFINITION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      hasDefinition = true;
      definitionPosition = text.indexOf(match[0]);
      break;
    }
  }
  
  // Check for lists
  let hasLists = false;
  let listCount = 0;
  
  for (const pattern of LIST_PATTERNS) {
    const matches = text.match(new RegExp(pattern.source, 'gm'));
    if (matches) {
      hasLists = true;
      listCount += matches.length;
    }
  }
  
  // Check for headings and hierarchy
  const hasHeadings = headings.length > 0;
  const headingCount = headings.length;
  const headingHierarchy = checkHeadingHierarchy(text);
  
  // Check for tables
  const tableMatches = text.match(/\|[^|]+\|/g);
  const hasTables = !!tableMatches;
  const tableCount = hasTables ? Math.floor(tableMatches!.length / 2) : 0;
  
  // Check for FAQ
  let hasFAQ = false;
  let faqCount = 0;
  const questions = text.match(/\?/g);
  if (questions && questions.length >= 3) {
    hasFAQ = true;
    faqCount = questions.length;
  }
  
  // Check for how-to
  let hasHowTo = false;
  let stepsCount = 0;
  
  for (const pattern of HOW_TO_PATTERNS) {
    const matches = text.match(new RegExp(pattern.source, 'gim'));
    if (matches) {
      hasHowTo = true;
      stepsCount = Math.max(stepsCount, matches.length);
    }
  }
  
  // Calculate average paragraph length
  const totalParagraphWords = paragraphs.reduce((sum, p) => sum + countWords(p), 0);
  const averageParagraphLength = paragraphs.length > 0 ? totalParagraphWords / paragraphs.length : 0;
  
  return {
    hasDefinition,
    definitionPosition,
    hasLists,
    listCount,
    hasHeadings,
    headingCount,
    headingHierarchy,
    hasTables,
    tableCount,
    hasFAQ,
    faqCount,
    hasHowTo,
    stepsCount,
    paragraphCount: paragraphs.length,
    averageParagraphLength
  };
}

function checkHeadingHierarchy(text: string): boolean {
  const h1 = (text.match(/^#\s+/gm) || []).length;
  const h2 = (text.match(/^##\s+/gm) || []).length;
  const h3 = (text.match(/^###\s+/gm) || []).length;
  
  // Good hierarchy: H1 <= H2 <= H3
  return h1 <= h2 || h2 <= h3;
}

// =============================================================================
// AUTHORITY ANALYSIS
// =============================================================================

function analyzeAuthority(text: string): AuthoritySignals {
  const lowerText = text.toLowerCase();
  
  // Check for author
  const authorPatterns = [
    /by\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/,
    /author:\s*([^,\n]+)/i,
    /written\s+by\s+([^,\n]+)/i
  ];
  
  let hasAuthor = false;
  let authorCredentials: string | null = null;
  
  for (const pattern of authorPatterns) {
    const match = text.match(pattern);
    if (match) {
      hasAuthor = true;
      authorCredentials = match[1];
      break;
    }
  }
  
  // Check for citations
  const citationPatterns = [
    /\[\d+\]/g,
    /\((?:[A-Z][a-z]+(?:\s+et\s+al\.?)?,?\s*\d{4})\)/g,
    /according\s+to\s+[A-Z]/gi
  ];
  
  let hasCitations = false;
  let citationCount = 0;
  
  for (const pattern of citationPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      hasCitations = true;
      citationCount += matches.length;
    }
  }
  
  // Check for external links
  const externalLinkPattern = /https?:\/\/[^\s)]+/g;
  const externalLinks = text.match(externalLinkPattern) || [];
  const hasExternalLinks = externalLinks.length > 0;
  const externalLinkCount = externalLinks.length;
  
  // Check for internal links
  const internalLinkPattern = /\[([^\]]+)\]\(\/[^)]+\)/g;
  const internalLinks = text.match(internalLinkPattern) || [];
  const hasInternalLinks = internalLinks.length > 0;
  const internalLinkCount = internalLinks.length;
  
  // Check for statistics
  const statsPattern = /\d+(?:\.\d+)?%|\$\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})+/g;
  const stats = text.match(statsPattern) || [];
  const hasStatistics = stats.length > 0;
  const statisticsCount = stats.length;
  
  // Check for expert quotes
  const quotePattern = /"[^"]{20,}"/g;
  const quotes = text.match(quotePattern) || [];
  const hasExpertQuotes = quotes.length > 0;
  const quoteCount = quotes.length;
  
  return {
    hasAuthor,
    authorCredentials,
    hasCitations,
    citationCount,
    hasExternalLinks,
    externalLinkCount,
    hasInternalLinks,
    internalLinkCount,
    hasStatistics,
    statisticsCount,
    hasExpertQuotes,
    quoteCount
  };
}

// =============================================================================
// RELEVANCE ANALYSIS
// =============================================================================

function analyzeRelevance(text: string, query: string): RelevanceSignals {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
  
  // Primary keyword density
  const totalWords = countWords(text);
  const primaryKeywordCount = (lowerText.match(new RegExp(lowerQuery, 'gi')) || []).length;
  const primaryKeywordDensity = totalWords > 0 ? (primaryKeywordCount / totalWords) * 100 : 0;
  
  // Semantic keywords
  const contentKeywords = extractKeywords(text);
  const semanticKeywords = contentKeywords.filter(k => {
    return queryWords.some(qw => k.includes(qw) || qw.includes(k));
  });
  
  // Semantic coverage
  const semanticCoverage = queryWords.length > 0 
    ? (semanticKeywords.length / queryWords.length) * 100 
    : 0;
  
  // Topic depth (based on unique concepts)
  const uniqueConcepts = new Set(contentKeywords);
  const topicDepth = Math.min(100, uniqueConcepts.size * 5);
  
  // Query match
  const queryMatch = queryWords.filter(qw => lowerText.includes(qw)).length / queryWords.length * 100;
  
  // Intent alignment (simplified)
  const intentAlignment = calculateIntentAlignment(text, query);
  
  // Entity mentions
  const entityPattern = /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g;
  const entities = text.match(entityPattern) || [];
  const entityMentions = [...new Set(entities)].slice(0, 10);
  const entityCoverage = Math.min(100, entityMentions.length * 10);
  
  return {
    primaryKeywordDensity,
    semanticKeywords,
    semanticCoverage,
    topicDepth,
    queryMatch,
    intentAlignment,
    entityMentions,
    entityCoverage
  };
}

function calculateIntentAlignment(text: string, query: string): number {
  let score = 50;
  
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  
  // Check if content addresses the query type
  if (lowerQuery.startsWith('what is') || lowerQuery.startsWith('what are')) {
    if (DEFINITION_PATTERNS.some(p => p.test(text))) score += 25;
  } else if (lowerQuery.startsWith('how to') || lowerQuery.startsWith('how do')) {
    if (HOW_TO_PATTERNS.some(p => p.test(text))) score += 25;
  } else if (lowerQuery.includes(' vs ') || lowerQuery.includes('comparison')) {
    if (lowerText.includes('vs') || lowerText.includes('compared')) score += 25;
  } else if (lowerQuery.includes('best') || lowerQuery.includes('top')) {
    if (LIST_PATTERNS.some(p => p.test(text))) score += 25;
  }
  
  // Check for direct answer at beginning
  const firstSentence = getSentences(text)[0] || '';
  const queryWordsInFirst = query.toLowerCase().split(/\s+/).filter(w => 
    firstSentence.toLowerCase().includes(w)
  ).length;
  
  score += queryWordsInFirst * 5;
  
  return Math.min(100, score);
}

// =============================================================================
// FRESHNESS ANALYSIS
// =============================================================================

function analyzeFreshness(text: string): FreshnessSignals {
  // Check for dates
  const datePatterns = [
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/gi
  ];
  
  let hasDate = false;
  let dateFound: string | null = null;
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      hasDate = true;
      dateFound = match[0];
      break;
    }
  }
  
  // Check for updated date
  const updatedPattern = /(?:updated|modified|revised|last\s+updated)[\s:]*([^\n,]+)/i;
  const updatedMatch = text.match(updatedPattern);
  const hasUpdatedDate = !!updatedMatch;
  const updatedDateFound = updatedMatch ? updatedMatch[1].trim() : null;
  
  // Check for temporal terms
  const temporalTerms = FRESHNESS_KEYWORDS.filter(term => 
    text.toLowerCase().includes(term.toLowerCase())
  );
  
  // Check if content is evergreen
  const evergreenIndicators = ['always', 'typically', 'generally', 'fundamentals', 'basics', 'principles'];
  const isEvergreen = evergreenIndicators.some(ind => text.toLowerCase().includes(ind));
  
  // Calculate freshness score
  let freshnessScore = 50;
  if (hasDate) freshnessScore += 15;
  if (hasUpdatedDate) freshnessScore += 20;
  if (temporalTerms.length > 0) freshnessScore += temporalTerms.length * 5;
  if (isEvergreen) freshnessScore += 10;
  
  return {
    hasDate,
    dateFound,
    hasUpdatedDate,
    updatedDateFound,
    temporalTerms,
    isEvergreen,
    freshnessScore: Math.min(100, freshnessScore)
  };
}

// =============================================================================
// ENGAGEMENT ANALYSIS
// =============================================================================

function analyzeEngagement(text: string): EngagementSignals {
  const sentences = getSentences(text);
  
  // Readability (simplified Flesch-Kincaid)
  const words = countWords(text);
  const avgWordsPerSentence = sentences.length > 0 ? words / sentences.length : 0;
  const readabilityScore = Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 2));
  
  // Sentence variety
  const sentenceLengths = sentences.map(s => countWords(s));
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 0;
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
  const sentenceVariety = Math.min(100, Math.sqrt(variance) * 10);
  
  // Questions
  const questionCount = (text.match(/\?/g) || []).length;
  
  // Call to action
  const ctaPatterns = ['click', 'learn more', 'get started', 'try', 'sign up', 'subscribe', 'download', 'contact'];
  const callToActionCount = ctaPatterns.filter(cta => text.toLowerCase().includes(cta)).length;
  
  // Visual elements
  const imagePattern = /!\[([^\]]*)\]\([^)]+\)/g;
  const videoPattern = /(?:youtube|vimeo|video)/gi;
  const images = (text.match(imagePattern) || []).length;
  const videos = (text.match(videoPattern) || []).length;
  const visualElementCount = images + videos;
  
  // Interactive elements
  const interactiveElements: string[] = [];
  if (questionCount > 2) interactiveElements.push('Questions');
  if (callToActionCount > 0) interactiveElements.push('CTAs');
  if (visualElementCount > 0) interactiveElements.push('Visuals');
  if (text.includes('comment') || text.includes('share')) interactiveElements.push('Social');
  
  return {
    readabilityScore,
    sentenceVariety,
    questionCount,
    callToActionCount,
    visualElementCount,
    interactiveElements
  };
}

// =============================================================================
// SNIPPET EXTRACTION
// =============================================================================

function extractSnippetCandidates(text: string, query: string): SnippetCandidate[] {
  const candidates: SnippetCandidate[] = [];
  const sentences = getSentences(text);
  const paragraphs = getParagraphs(text);
  
  // Look for definition-style snippets
  for (const pattern of DEFINITION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const snippet = match[0];
      const wordCount = countWords(snippet);
      
      candidates.push({
        id: `snippet-def-${candidates.length}`,
        text: snippet,
        startIndex: text.indexOf(snippet),
        endIndex: text.indexOf(snippet) + snippet.length,
        format: 'definition',
        confidence: calculateSnippetConfidence(snippet, query, wordCount),
        reasons: ['Direct definition format', 'Begins with subject'],
        improvements: wordCount > OPTIMAL_SNIPPET_LENGTH.max 
          ? ['Consider shortening to ~50 words'] 
          : []
      });
    }
  }
  
  // Look for first paragraph answer
  if (paragraphs.length > 0) {
    const firstPara = paragraphs[0];
    const wordCount = countWords(firstPara);
    
    if (wordCount >= OPTIMAL_SNIPPET_LENGTH.min && wordCount <= OPTIMAL_SNIPPET_LENGTH.max * 1.5) {
      const queryWords = query.toLowerCase().split(/\s+/);
      const matchedWords = queryWords.filter(w => firstPara.toLowerCase().includes(w)).length;
      
      if (matchedWords >= queryWords.length * 0.5) {
        candidates.push({
          id: `snippet-para-${candidates.length}`,
          text: firstPara,
          startIndex: 0,
          endIndex: firstPara.length,
          format: 'general',
          confidence: calculateSnippetConfidence(firstPara, query, wordCount),
          reasons: ['First paragraph', 'Contains query terms'],
          improvements: []
        });
      }
    }
  }
  
  // Look for list-style snippets
  const listMatch = text.match(/(?:^|\n)((?:\s*[-â€¢*\d.]+\s+[^\n]+\n?){3,})/);
  if (listMatch) {
    const listSnippet = listMatch[1].trim();
    candidates.push({
      id: `snippet-list-${candidates.length}`,
      text: listSnippet,
      startIndex: text.indexOf(listSnippet),
      endIndex: text.indexOf(listSnippet) + listSnippet.length,
      format: 'list',
      confidence: 70,
      reasons: ['List format preferred for featured snippets'],
      improvements: ['Ensure 4-8 items for optimal display']
    });
  }
  
  // Sort by confidence
  candidates.sort((a, b) => b.confidence - a.confidence);
  
  return candidates;
}

function calculateSnippetConfidence(snippet: string, query: string, wordCount: number): number {
  let confidence = 50;
  
  // Word count scoring
  if (wordCount >= OPTIMAL_SNIPPET_LENGTH.min && wordCount <= OPTIMAL_SNIPPET_LENGTH.max) {
    confidence += 20;
  } else if (wordCount >= OPTIMAL_SNIPPET_LENGTH.min - 10 && wordCount <= OPTIMAL_SNIPPET_LENGTH.max + 10) {
    confidence += 10;
  }
  
  // Query term presence
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const matchedWords = queryWords.filter(w => snippet.toLowerCase().includes(w)).length;
  confidence += (matchedWords / queryWords.length) * 20;
  
  // Direct answer patterns
  if (DEFINITION_PATTERNS.some(p => p.test(snippet))) confidence += 10;
  
  return Math.min(100, confidence);
}

// =============================================================================
// FACTOR SCORING
// =============================================================================

function createFactors(
  structure: ContentStructureAnalysis,
  authority: AuthoritySignals,
  relevance: RelevanceSignals,
  freshness: FreshnessSignals,
  engagement: EngagementSignals
): AIOverviewFactor[] {
  const factors: AIOverviewFactor[] = [];
  
  // Structure factors
  factors.push({
    id: 'structure-definition',
    name: 'Direct Answer',
    category: 'structure',
    score: structure.hasDefinition ? 100 : 0,
    maxScore: 100,
    weight: 0.15,
    status: structure.hasDefinition ? 'pass' : 'fail',
    description: 'Content provides a direct definition or answer',
    details: structure.hasDefinition 
      ? ['Definition found at beginning of content']
      : ['No clear definition pattern detected'],
    recommendations: structure.hasDefinition 
      ? []
      : ['Add a direct answer within the first 100 words']
  });
  
  factors.push({
    id: 'structure-lists',
    name: 'List Structure',
    category: 'structure',
    score: Math.min(100, structure.listCount * 20),
    maxScore: 100,
    weight: 0.10,
    status: structure.hasLists ? 'pass' : 'warning',
    description: 'Content uses list formatting',
    details: [`${structure.listCount} list items detected`],
    recommendations: structure.listCount < 3 
      ? ['Add bullet points or numbered lists for scanability']
      : []
  });
  
  factors.push({
    id: 'structure-headings',
    name: 'Heading Structure',
    category: 'structure',
    score: structure.headingHierarchy ? 100 : structure.hasHeadings ? 50 : 0,
    maxScore: 100,
    weight: 0.10,
    status: structure.headingHierarchy ? 'pass' : structure.hasHeadings ? 'warning' : 'fail',
    description: 'Content has proper heading hierarchy',
    details: [`${structure.headingCount} headings found`],
    recommendations: !structure.headingHierarchy 
      ? ['Use proper H1 â†’ H2 â†’ H3 hierarchy']
      : []
  });
  
  // Authority factors
  factors.push({
    id: 'authority-citations',
    name: 'Citations & Sources',
    category: 'authority',
    score: Math.min(100, authority.citationCount * 15),
    maxScore: 100,
    weight: 0.15,
    status: authority.citationCount >= 3 ? 'pass' : authority.citationCount > 0 ? 'warning' : 'fail',
    description: 'Content cites authoritative sources',
    details: [`${authority.citationCount} citations found`],
    recommendations: authority.citationCount < 3 
      ? ['Add citations from authoritative sources']
      : []
  });
  
  factors.push({
    id: 'authority-statistics',
    name: 'Data & Statistics',
    category: 'authority',
    score: Math.min(100, authority.statisticsCount * 20),
    maxScore: 100,
    weight: 0.10,
    status: authority.hasStatistics ? 'pass' : 'warning',
    description: 'Content includes supporting data',
    details: [`${authority.statisticsCount} statistics found`],
    recommendations: !authority.hasStatistics 
      ? ['Include relevant statistics and data points']
      : []
  });
  
  // Relevance factors
  factors.push({
    id: 'relevance-keyword',
    name: 'Keyword Relevance',
    category: 'relevance',
    score: Math.min(100, relevance.queryMatch),
    maxScore: 100,
    weight: 0.20,
    status: relevance.queryMatch >= 80 ? 'pass' : relevance.queryMatch >= 50 ? 'warning' : 'fail',
    description: 'Content matches target query',
    details: [`${relevance.queryMatch.toFixed(0)}% query term coverage`],
    recommendations: relevance.queryMatch < 80 
      ? ['Include more query-related terms naturally']
      : []
  });
  
  factors.push({
    id: 'relevance-intent',
    name: 'Intent Alignment',
    category: 'relevance',
    score: relevance.intentAlignment,
    maxScore: 100,
    weight: 0.15,
    status: relevance.intentAlignment >= 70 ? 'pass' : relevance.intentAlignment >= 50 ? 'warning' : 'fail',
    description: 'Content matches search intent',
    details: [`${relevance.intentAlignment}% intent alignment`],
    recommendations: relevance.intentAlignment < 70 
      ? ['Better align content format with query intent']
      : []
  });
  
  // Freshness factors
  factors.push({
    id: 'freshness-date',
    name: 'Content Freshness',
    category: 'freshness',
    score: freshness.freshnessScore,
    maxScore: 100,
    weight: 0.10,
    status: freshness.freshnessScore >= 70 ? 'pass' : freshness.freshnessScore >= 40 ? 'warning' : 'fail',
    description: 'Content appears current and updated',
    details: freshness.hasUpdatedDate 
      ? [`Last updated: ${freshness.updatedDateFound}`]
      : freshness.hasDate 
        ? [`Date found: ${freshness.dateFound}`]
        : ['No date information found'],
    recommendations: !freshness.hasUpdatedDate 
      ? ['Add last updated date', 'Include recent references']
      : []
  });
  
  // Engagement factors
  factors.push({
    id: 'engagement-readability',
    name: 'Readability',
    category: 'engagement',
    score: engagement.readabilityScore,
    maxScore: 100,
    weight: 0.10,
    status: engagement.readabilityScore >= 60 ? 'pass' : engagement.readabilityScore >= 40 ? 'warning' : 'fail',
    description: 'Content is easy to read',
    details: [`Readability score: ${engagement.readabilityScore.toFixed(0)}`],
    recommendations: engagement.readabilityScore < 60 
      ? ['Use shorter sentences', 'Simplify vocabulary']
      : []
  });
  
  return factors;
}

// =============================================================================
// DETECT CONTENT FORMAT
// =============================================================================

function detectContentFormat(text: string): ContentFormat {
  const structure = analyzeStructure(text);
  
  if (structure.hasDefinition && structure.definitionPosition !== null && structure.definitionPosition < 200) {
    return 'definition';
  }
  
  if (structure.hasFAQ && structure.faqCount >= 3) {
    return 'faq';
  }
  
  if (structure.hasHowTo && structure.stepsCount >= 3) {
    return 'how_to';
  }
  
  if (structure.hasTables && structure.tableCount > 0) {
    return 'table';
  }
  
  if (structure.hasLists && structure.listCount >= 5) {
    return 'list';
  }
  
  if (text.toLowerCase().includes(' vs ') || text.toLowerCase().includes('comparison')) {
    return 'comparison';
  }
  
  return 'general';
}

function getRecommendedFormat(query: string): ContentFormat {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.startsWith('what is') || lowerQuery.startsWith('what are') || lowerQuery.includes('definition')) {
    return 'definition';
  }
  
  if (lowerQuery.startsWith('how to') || lowerQuery.startsWith('how do') || lowerQuery.includes('steps')) {
    return 'how_to';
  }
  
  if (lowerQuery.includes(' vs ') || lowerQuery.includes('compare') || lowerQuery.includes('difference')) {
    return 'comparison';
  }
  
  if (lowerQuery.includes('best') || lowerQuery.includes('top') || lowerQuery.includes('list')) {
    return 'list';
  }
  
  if (lowerQuery.includes('faq') || lowerQuery.includes('questions')) {
    return 'faq';
  }
  
  return 'definition';
}

// =============================================================================
// METRICS CALCULATION
// =============================================================================

function calculateMetrics(
  factors: AIOverviewFactor[],
  snippetCandidates: SnippetCandidate[],
  text: string
): AIOverviewMetrics {
  // Category scores
  const categoryScores: Record<FactorCategory, number> = {
    structure: 0,
    authority: 0,
    relevance: 0,
    freshness: 0,
    engagement: 0
  };
  
  const categoryCounts: Record<FactorCategory, number> = {
    structure: 0,
    authority: 0,
    relevance: 0,
    freshness: 0,
    engagement: 0
  };
  
  let passedFactors = 0;
  let warningFactors = 0;
  let failedFactors = 0;
  
  factors.forEach(factor => {
    categoryScores[factor.category] += factor.score * factor.weight;
    categoryCounts[factor.category] += factor.weight;
    
    if (factor.status === 'pass') passedFactors++;
    else if (factor.status === 'warning') warningFactors++;
    else failedFactors++;
  });
  
  // Normalize category scores
  Object.keys(categoryScores).forEach(category => {
    const cat = category as FactorCategory;
    if (categoryCounts[cat] > 0) {
      categoryScores[cat] = categoryScores[cat] / categoryCounts[cat];
    }
  });
  
  // Overall score
  let overallScore = 0;
  Object.keys(CATEGORY_WEIGHTS).forEach(category => {
    const cat = category as FactorCategory;
    overallScore += categoryScores[cat] * CATEGORY_WEIGHTS[cat];
  });
  
  const sentences = getSentences(text);
  const paragraphs = getParagraphs(text);
  
  return {
    overallScore: Math.round(overallScore),
    categoryScores,
    passedFactors,
    warningFactors,
    failedFactors,
    snippetCandidateCount: snippetCandidates.length,
    bestCandidateConfidence: snippetCandidates.length > 0 ? snippetCandidates[0].confidence : 0,
    structureScore: Math.round(categoryScores.structure),
    authorityScore: Math.round(categoryScores.authority),
    relevanceScore: Math.round(categoryScores.relevance),
    freshnessScore: Math.round(categoryScores.freshness),
    engagementScore: Math.round(categoryScores.engagement),
    wordCount: countWords(text),
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length
  };
}

// =============================================================================
// SUMMARY & OPTIMIZATIONS
// =============================================================================

function generateSummary(
  metrics: AIOverviewMetrics,
  factors: AIOverviewFactor[],
  detectedFormat: ContentFormat,
  recommendedFormat: ContentFormat
): AIOverviewSummary {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const quickWins: string[] = [];
  const priorityActions: string[] = [];
  
  factors.forEach(factor => {
    if (factor.status === 'pass') {
      strengths.push(factor.name);
    } else if (factor.status === 'fail') {
      weaknesses.push(factor.name);
      if (factor.recommendations.length > 0) {
        priorityActions.push(factor.recommendations[0]);
      }
    } else {
      // Warning - potential quick win
      if (factor.recommendations.length > 0) {
        quickWins.push(factor.recommendations[0]);
      }
    }
  });
  
  // Format alignment
  if (detectedFormat !== recommendedFormat) {
    priorityActions.unshift(`Consider restructuring content as ${recommendedFormat} format`);
  }
  
  // Estimate visibility
  let estimatedVisibility: AIOverviewSummary['estimatedVisibility'];
  if (metrics.overallScore >= 80) estimatedVisibility = 'very_high';
  else if (metrics.overallScore >= 65) estimatedVisibility = 'high';
  else if (metrics.overallScore >= 50) estimatedVisibility = 'moderate';
  else if (metrics.overallScore >= 35) estimatedVisibility = 'low';
  else estimatedVisibility = 'very_low';
  
  const verdict = metrics.overallScore >= 70
    ? 'Content is well-optimized for AI overviews'
    : metrics.overallScore >= 50
      ? 'Content has potential but needs improvements'
      : 'Significant optimization needed for AI overview visibility';
  
  return {
    verdict,
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    quickWins: quickWins.slice(0, 3),
    estimatedVisibility,
    priorityActions: priorityActions.slice(0, 5)
  };
}

function generateOptimizations(
  factors: AIOverviewFactor[],
  structure: ContentStructureAnalysis,
  relevance: RelevanceSignals,
  detectedFormat: ContentFormat,
  recommendedFormat: ContentFormat
): AIOverviewOptimization[] {
  const optimizations: AIOverviewOptimization[] = [];
  
  // Format optimization
  if (detectedFormat !== recommendedFormat) {
    optimizations.push({
      id: 'opt-format',
      priority: 'critical',
      category: 'structure',
      title: 'Align Content Format',
      description: `Your content format (${detectedFormat}) doesn't match the recommended format (${recommendedFormat}) for this query type.`,
      impact: 'high',
      effort: 'high',
      beforeAfter: {
        before: `Current format: ${detectedFormat}`,
        after: `Recommended: ${recommendedFormat}`
      }
    });
  }
  
  // Direct answer optimization
  if (!structure.hasDefinition) {
    optimizations.push({
      id: 'opt-definition',
      priority: 'high',
      category: 'structure',
      title: 'Add Direct Answer',
      description: 'Include a concise definition or direct answer in the first paragraph.',
      impact: 'high',
      effort: 'low',
      example: '[Topic] is [clear, concise definition in 40-60 words].'
    });
  }
  
  // List optimization
  if (!structure.hasLists) {
    optimizations.push({
      id: 'opt-lists',
      priority: 'medium',
      category: 'structure',
      title: 'Add Structured Lists',
      description: 'Use bullet points or numbered lists to break down key information.',
      impact: 'medium',
      effort: 'low'
    });
  }
  
  // Authority optimization
  factors.filter(f => f.category === 'authority' && f.status === 'fail').forEach(factor => {
    optimizations.push({
      id: `opt-${factor.id}`,
      priority: 'medium',
      category: 'authority',
      title: `Improve ${factor.name}`,
      description: factor.recommendations[0] || 'Add authoritative signals',
      impact: 'medium',
      effort: 'medium'
    });
  });
  
  // Relevance optimization
  if (relevance.queryMatch < 70) {
    optimizations.push({
      id: 'opt-relevance',
      priority: 'high',
      category: 'relevance',
      title: 'Improve Query Coverage',
      description: 'Include more terms related to the target query naturally in your content.',
      impact: 'high',
      effort: 'medium'
    });
  }
  
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  optimizations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return optimizations;
}

// =============================================================================
// VISIBILITY LEVEL
// =============================================================================

function getVisibilityLevel(score: number): VisibilityScore {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 50) return 'moderate';
  if (score >= 35) return 'poor';
  return 'critical';
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

export function analyzeAIOverview(
  content: string,
  query: string,
  settings: Partial<AIOverviewSettings> = {}
): AIOverviewAnalysis {
  const startTime = Date.now();
  
  const fullSettings: AIOverviewSettings = {
    ...DEFAULT_AI_OVERVIEW_SETTINGS,
    ...settings,
    targetQuery: query
  };
  
  // Analyze all dimensions
  const structure = analyzeStructure(content);
  const authority = analyzeAuthority(content);
  const relevance = analyzeRelevance(content, query);
  const freshness = analyzeFreshness(content);
  const engagement = analyzeEngagement(content);
  
  // Create factors
  const factors = createFactors(structure, authority, relevance, freshness, engagement);
  
  // Group factors by category
  const factorsByCategory: Record<FactorCategory, AIOverviewFactor[]> = {
    structure: [],
    authority: [],
    relevance: [],
    freshness: [],
    engagement: []
  };
  
  factors.forEach(factor => {
    factorsByCategory[factor.category].push(factor);
  });
  
  // Extract snippet candidates
  const snippetCandidates = extractSnippetCandidates(content, query);
  const bestCandidate = snippetCandidates.length > 0 ? snippetCandidates[0] : null;
  
  // Detect and recommend format
  const detectedFormat = detectContentFormat(content);
  const recommendedFormat = fullSettings.targetFormat === 'auto' 
    ? getRecommendedFormat(query)
    : fullSettings.targetFormat;
  
  // Calculate metrics
  const metrics = calculateMetrics(factors, snippetCandidates, content);
  
  // Generate summary and optimizations
  const summary = generateSummary(metrics, factors, detectedFormat, recommendedFormat);
  const optimizations = fullSettings.generateOptimizations
    ? generateOptimizations(factors, structure, relevance, detectedFormat, recommendedFormat)
    : [];
  
  return {
    id: `aio-${Date.now()}`,
    timestamp: new Date(),
    duration: Date.now() - startTime,
    
    content,
    targetQuery: query,
    
    overallScore: metrics.overallScore,
    visibilityLevel: getVisibilityLevel(metrics.overallScore),
    
    factors,
    factorsByCategory,
    
    structure,
    authority,
    relevance,
    freshness,
    engagement,
    
    snippetCandidates,
    bestCandidate,
    
    detectedFormat,
    recommendedFormat,
    
    summary,
    optimizations
  };
}

// =============================================================================
// EXPORT FUNCTION
// =============================================================================

export function exportAIOverviewReport(
  analysis: AIOverviewAnalysis,
  options: AIOverviewExportOptions
): string {
  const { format, includeAnalysis, includeOptimizations, includeSnippets } = options;
  
  if (format === 'json') {
    return JSON.stringify({
      query: analysis.targetQuery,
      score: analysis.overallScore,
      visibility: analysis.visibilityLevel,
      ...(includeAnalysis && { factors: analysis.factors }),
      ...(includeOptimizations && { optimizations: analysis.optimizations }),
      ...(includeSnippets && { snippetCandidates: analysis.snippetCandidates }),
      summary: analysis.summary
    }, null, 2);
  }
  
  // Markdown format
  let output = '# AI Overview Visibility Report\n\n';
  
  output += `## Target Query: "${analysis.targetQuery}"\n\n`;
  output += `**Overall Score:** ${analysis.overallScore}/100 (${analysis.visibilityLevel})\n\n`;
  
  output += '## Summary\n\n';
  output += `${analysis.summary.verdict}\n\n`;
  
  output += '### Strengths\n';
  analysis.summary.strengths.forEach(s => {
    output += `- âœ… ${s}\n`;
  });
  
  output += '\n### Areas for Improvement\n';
  analysis.summary.weaknesses.forEach(w => {
    output += `- âš ï¸ ${w}\n`;
  });
  
  if (includeSnippets && analysis.bestCandidate) {
    output += '\n## Best Snippet Candidate\n\n';
    output += `**Format:** ${analysis.bestCandidate.format}\n`;
    output += `**Confidence:** ${analysis.bestCandidate.confidence}%\n\n`;
    output += `> ${analysis.bestCandidate.text}\n`;
  }
  
  if (includeOptimizations && analysis.optimizations.length > 0) {
    output += '\n## Optimizations\n\n';
    analysis.optimizations.forEach(opt => {
      output += `### ${opt.title}\n`;
      output += `**Priority:** ${opt.priority} | **Impact:** ${opt.impact}\n\n`;
      output += `${opt.description}\n\n`;
    });
  }
  
  return output;
}

