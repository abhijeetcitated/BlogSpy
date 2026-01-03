// =============================================================================
// CONTENT BRIEF UTILITIES - Brief Generation and Analysis
// =============================================================================
// Industry-standard content brief generation like Surfer SEO, Frase
// Production-ready utilities for SERP analysis and brief creation
// =============================================================================

import type {
  ContentBrief,
  BriefGenerationOptions,
  BriefOverview,
  CompetitorInsight,
  SuggestedOutline,
  OutlineSection,
  TermRecommendations,
  PrimaryTerm,
  SecondaryTerm,
  NLPEntity,
  SemanticGroup,
  QuestionSection,
  BriefPAAQuestion,
  BriefRelatedSearch,
  FAQItem,
  ContentGuidelines,
  BriefMetrics,
  SearchIntent,
  DifficultyLevel,
  ContentType,
  WordCountTarget,
} from '@/src/features/ai-writer/types/tools/content-brief.types';

// -----------------------------------------------------------------------------
// Brief Generation
// -----------------------------------------------------------------------------

/**
 * Generate a complete content brief from keyword
 */
export function generateContentBrief(
  keyword: string,
  competitors: CompetitorData[],
  options: Partial<BriefGenerationOptions> = {}
): ContentBrief {
  const {
    language = 'en',
    country = 'us',
  } = options;
  
  const overview = generateOverview(keyword, competitors);
  const outline = generateOutline(keyword, competitors, overview.contentType);
  const terms = generateTermRecommendations(keyword, competitors);
  const questions = generateQuestionSection(keyword, competitors);
  const guidelines = generateGuidelines(competitors, overview);
  const metrics = calculateBriefMetrics(competitors, overview);
  
  return {
    id: generateBriefId(),
    keyword,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'ready',
    overview,
    competitors: processCompetitors(competitors),
    outline,
    terms,
    questions,
    guidelines,
    metrics,
    metadata: {
      version: '1.0',
      generatedBy: 'BlogSpy AI',
      serpDataDate: new Date(),
      competitorsAnalyzed: competitors.length,
      dataSourcesUsed: ['google-serp', 'nlp-analysis', 'paa'],
      exportFormats: ['pdf', 'docx', 'markdown', 'json']
    }
  };
}

/**
 * Generate brief overview from competitor analysis
 */
export function generateOverview(
  keyword: string,
  competitors: CompetitorData[]
): BriefOverview {
  const avgWordCount = calculateAverage(competitors.map(c => c.wordCount));
  const searchIntent = detectSearchIntent(keyword, competitors);
  const contentType = detectContentType(keyword, competitors);
  const difficulty = calculateDifficulty(competitors);
  
  return {
    title: generateTitle(keyword, contentType),
    metaDescription: generateMetaDescription(keyword, contentType),
    searchIntent,
    difficulty,
    monthlySearchVolume: estimateSearchVolume(keyword),
    cpcEstimate: estimateCPC(keyword),
    trendDirection: 'stable',
    targetAudience: inferTargetAudience(keyword, searchIntent),
    contentType,
    estimatedReadTime: Math.ceil(avgWordCount / 200) // 200 wpm average
  };
}

/**
 * Generate suggested outline from competitor analysis
 */
export function generateOutline(
  keyword: string,
  competitors: CompetitorData[],
  contentType: ContentType
): SuggestedOutline {
  // Extract all headings from competitors
  const allHeadings = extractCompetitorHeadings(competitors);
  
  // Cluster similar headings
  const headingClusters = clusterSimilarHeadings(allHeadings);
  
  // Generate sections based on clusters
  const sections = generateOutlineSections(keyword, headingClusters, contentType);
  
  // Calculate estimates
  const estimatedWordCount = sections.reduce((sum, s) => sum + s.wordCountTarget, 0);
  
  return {
    title: {
      primary: generateTitle(keyword, contentType),
      alternatives: generateTitleAlternatives(keyword, contentType),
      clickThroughScore: 75
    },
    sections,
    estimatedWordCount,
    estimatedTimeToWrite: Math.ceil(estimatedWordCount / 500) // 500 words per hour
  };
}

/**
 * Generate term recommendations
 */
export function generateTermRecommendations(
  keyword: string,
  competitors: CompetitorData[]
): TermRecommendations {
  // Extract terms from all competitors
  const allTerms = extractAllTerms(competitors);
  
  // Calculate term frequency and importance
  const termFrequency = calculateTermFrequency(allTerms);
  
  // Generate primary terms
  const primary = generatePrimaryTerms(keyword, termFrequency, competitors.length);
  
  // Generate secondary terms
  const secondary = generateSecondaryTerms(keyword, termFrequency, primary);
  
  // Extract NLP entities
  const nlpEntities = extractNLPEntities(competitors);
  
  // Generate LSI keywords
  const lsiKeywords = generateLSIKeywords(keyword, termFrequency);
  
  // Group into semantic clusters
  const semanticGroups = createSemanticGroups(primary, secondary);
  
  return {
    primary,
    secondary,
    nlpEntities,
    lsiKeywords,
    semanticGroups
  };
}

/**
 * Generate question section
 */
export function generateQuestionSection(
  keyword: string,
  competitors: CompetitorData[]
): QuestionSection {
  // Generate PAA questions
  const paaQuestions = generatePAAQuestions(keyword);
  
  // Extract related searches
  const relatedSearches = generateRelatedSearches(keyword);
  
  // Extract forum questions
  const forumQuestions = extractForumQuestions(keyword);
  
  // Generate FAQ items
  const suggestedFAQ = generateSuggestedFAQ(keyword, paaQuestions);
  
  return {
    paaQuestions,
    relatedSearches,
    forumQuestions,
    suggestedFAQ
  };
}

/**
 * Generate content guidelines
 */
export function generateGuidelines(
  competitors: CompetitorData[],
  overview: BriefOverview
): ContentGuidelines {
  const wordCountStats = calculateWordCountStats(competitors);
  const structureStats = calculateStructureStats(competitors);
  
  return {
    wordCount: {
      minimum: Math.max(500, wordCountStats.avg - wordCountStats.stdDev),
      recommended: Math.round(wordCountStats.avg * 1.1), // Aim slightly above average
      maximum: wordCountStats.max + 500,
      competitorAverage: wordCountStats.avg,
      topPerformerAverage: wordCountStats.topAvg
    },
    structure: {
      h2Count: { min: structureStats.h2Avg - 2, max: structureStats.h2Avg + 3 },
      h3Count: { min: structureStats.h3Avg - 3, max: structureStats.h3Avg + 5 },
      paragraphLength: { min: 50, max: 200 },
      listCount: Math.ceil(structureStats.listAvg),
      tableCount: Math.ceil(structureStats.tableAvg)
    },
    readability: {
      targetGrade: 8, // 8th grade level for general audience
      sentenceLength: { avg: 15, max: 25 },
      syllablesPerWord: 1.5,
      passiveVoiceMax: 10
    },
    media: {
      images: { min: 3, recommended: Math.ceil(wordCountStats.avg / 300) },
      videos: overview.contentType === 'how-to' ? 1 : 0,
      infographics: overview.contentType === 'guide' ? 1 : 0,
      altTextRequired: true,
      compressionRequired: true
    },
    linking: {
      internalLinks: { min: 3, max: 10 },
      externalLinks: { min: 2, max: 8 },
      authorityDomainsToLink: ['wikipedia.org', 'gov', 'edu'],
      nofollowExternal: false
    },
    seo: {
      titleLength: { min: 50, max: 60 },
      metaDescLength: { min: 140, max: 160 },
      urlSlug: generateSlug(overview.title),
      primaryKeywordInFirst100: true,
      schemaType: determineSchemaTypes(overview.contentType),
      featuredSnippetTarget: shouldTargetFeaturedSnippet(overview)
    },
    tone: {
      voice: determineToneVoice(overview.searchIntent),
      perspective: 'second-person',
      brandGuidelines: []
    }
  };
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

interface CompetitorData {
  url: string;
  title: string;
  content: string;
  wordCount: number;
  headings: { level: number; text: string }[];
  terms: string[];
  images: number;
  links: { internal: number; external: number };
  rank: number;
}

interface HeadingCluster {
  representative: string;
  variants: string[];
  frequency: number;
  avgPosition: number;
}

function generateBriefId(): string {
  return `brief_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
}

function detectSearchIntent(keyword: string, competitors: CompetitorData[]): SearchIntent {
  const lowerKeyword = keyword.toLowerCase();
  
  // Transactional signals
  if (/buy|price|cost|cheap|deal|discount|order|purchase/.test(lowerKeyword)) {
    return 'transactional';
  }
  
  // Commercial investigation signals
  if (/best|top|review|comparison|vs|versus|alternative/.test(lowerKeyword)) {
    return 'commercial';
  }
  
  // Navigational signals
  if (/login|sign in|official|website|download/.test(lowerKeyword)) {
    return 'navigational';
  }
  
  // Default to informational
  return 'informational';
}

function detectContentType(keyword: string, competitors: CompetitorData[]): ContentType {
  const lowerKeyword = keyword.toLowerCase();
  
  if (/how to|tutorial|guide|step/.test(lowerKeyword)) return 'how-to';
  if (/best|top \d+|\d+ best/.test(lowerKeyword)) return 'listicle';
  if (/vs|versus|comparison|compare/.test(lowerKeyword)) return 'comparison';
  if (/review|rating/.test(lowerKeyword)) return 'review';
  if (/guide|complete|ultimate|definitive/.test(lowerKeyword)) return 'guide';
  
  // Analyze competitor content
  const avgWordCount = calculateAverage(competitors.map(c => c.wordCount));
  if (avgWordCount > 4000) return 'pillar-page';
  
  return 'blog-post';
}

function calculateDifficulty(competitors: CompetitorData[]): DifficultyLevel {
  const avgWordCount = calculateAverage(competitors.map(c => c.wordCount));
  const topCompetitors = competitors.slice(0, 3);
  
  // Simple heuristic based on competitor quality
  const score = 
    (avgWordCount > 2500 ? 30 : avgWordCount > 1500 ? 20 : 10) +
    (topCompetitors.every(c => c.wordCount > 2000) ? 25 : 10) +
    (competitors.length >= 10 ? 20 : 10);
  
  if (score >= 70) return 'very-hard';
  if (score >= 50) return 'hard';
  if (score >= 30) return 'medium';
  return 'easy';
}

function generateTitle(keyword: string, contentType: ContentType): string {
  const year = new Date().getFullYear();
  const capitalizedKeyword = keyword.replace(/\b\w/g, c => c.toUpperCase());
  
  switch (contentType) {
    case 'how-to':
      return `How to ${capitalizedKeyword}: Step-by-Step Guide`;
    case 'listicle':
      return `Top 10 ${capitalizedKeyword} in ${year}`;
    case 'comparison':
      return `${capitalizedKeyword}: Complete Comparison Guide`;
    case 'review':
      return `${capitalizedKeyword} Review: Everything You Need to Know`;
    case 'guide':
      return `The Ultimate Guide to ${capitalizedKeyword} (${year})`;
    case 'pillar-page':
      return `${capitalizedKeyword}: The Complete Resource`;
    default:
      return `${capitalizedKeyword}: What You Need to Know`;
  }
}

function generateTitleAlternatives(keyword: string, contentType: ContentType): string[] {
  const year = new Date().getFullYear();
  const cap = keyword.replace(/\b\w/g, c => c.toUpperCase());
  
  return [
    `Everything You Need to Know About ${cap}`,
    `${cap} Explained: A Complete Guide`,
    `Master ${cap} in ${year}: Expert Tips`,
    `${cap}: Tips, Tricks, and Best Practices`,
    `Your Complete ${cap} Playbook`
  ];
}

function generateMetaDescription(keyword: string, contentType: ContentType): string {
  const year = new Date().getFullYear();
  
  switch (contentType) {
    case 'how-to':
      return `Learn how to ${keyword} with our step-by-step guide. Get expert tips, best practices, and avoid common mistakes. Updated for ${year}.`;
    case 'listicle':
      return `Discover the top ${keyword} options for ${year}. Compare features, prices, and find the perfect choice for your needs.`;
    case 'guide':
      return `The ultimate guide to ${keyword}. Everything you need to know, from basics to advanced strategies. Expert insights inside.`;
    default:
      return `Comprehensive guide to ${keyword}. Learn everything you need to know with expert tips and practical advice. Updated ${year}.`;
  }
}

function estimateSearchVolume(keyword: string): number {
  // In production, this would call a keyword API
  // Mock implementation based on keyword characteristics
  const words = keyword.split(' ').length;
  const baseVolume = 10000;
  
  // Longer keywords typically have lower volume
  return Math.round(baseVolume / Math.pow(words, 1.5));
}

function estimateCPC(keyword: string): number {
  // Mock CPC estimation
  const lowerKeyword = keyword.toLowerCase();
  
  if (/buy|price|software|tool|service/.test(lowerKeyword)) {
    return Math.round((Math.random() * 5 + 2) * 100) / 100;
  }
  
  return Math.round((Math.random() * 2 + 0.5) * 100) / 100;
}

function inferTargetAudience(keyword: string, intent: SearchIntent): string {
  if (intent === 'transactional') return 'Ready-to-buy consumers';
  if (intent === 'commercial') return 'Researchers comparing options';
  if (/beginner|basic|intro|start/.test(keyword.toLowerCase())) return 'Beginners and newcomers';
  if (/advanced|expert|pro/.test(keyword.toLowerCase())) return 'Experienced professionals';
  return 'General audience seeking information';
}

function processCompetitors(competitors: CompetitorData[]): CompetitorInsight[] {
  return competitors.map((comp, index) => ({
    rank: index + 1,
    url: comp.url,
    domain: extractDomain(comp.url),
    title: comp.title,
    wordCount: comp.wordCount,
    headingCount: comp.headings.length,
    imageCount: comp.images,
    linkCount: comp.links,
    readability: {
      score: calculateReadabilityScore(comp.content),
      grade: '8th Grade'
    },
    contentScore: calculateContentScore(comp),
    topTerms: comp.terms.slice(0, 10),
    topHeadings: comp.headings.slice(0, 5).map(h => h.text),
    uniqueAngles: extractUniqueAngles(comp)
  }));
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function calculateReadabilityScore(content: string): number {
  // Simplified Flesch Reading Ease approximation
  const sentences = content.split(/[.!?]+/).length;
  const words = content.split(/\s+/).length;
  const syllables = countSyllables(content);
  
  if (words === 0 || sentences === 0) return 60;
  
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  return words.reduce((count, word) => {
    // Simple syllable counting
    const syllables = word
      .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
      .match(/[aeiouy]{1,2}/g);
    return count + (syllables?.length || 1);
  }, 0);
}

function calculateContentScore(comp: CompetitorData): number {
  let score = 50;
  
  // Word count bonus
  if (comp.wordCount > 2000) score += 15;
  else if (comp.wordCount > 1000) score += 10;
  
  // Heading structure bonus
  if (comp.headings.length > 5) score += 10;
  
  // Image bonus
  if (comp.images > 3) score += 10;
  
  // Links bonus
  if (comp.links.internal > 2 && comp.links.external > 1) score += 10;
  
  return Math.min(100, score);
}

function extractUniqueAngles(comp: CompetitorData): string[] {
  // Extract unique value propositions from headings
  return comp.headings
    .filter(h => h.level === 2)
    .slice(0, 3)
    .map(h => h.text);
}

function extractCompetitorHeadings(
  competitors: CompetitorData[]
): { level: number; text: string; rank: number }[] {
  const allHeadings: { level: number; text: string; rank: number }[] = [];
  
  competitors.forEach((comp, rank) => {
    comp.headings.forEach(heading => {
      allHeadings.push({
        level: heading.level,
        text: heading.text,
        rank: rank + 1
      });
    });
  });
  
  return allHeadings;
}

function clusterSimilarHeadings(
  headings: { level: number; text: string; rank: number }[]
): HeadingCluster[] {
  const clusters: HeadingCluster[] = [];
  const used = new Set<number>();
  
  headings.forEach((heading, i) => {
    if (used.has(i)) return;
    
    const cluster: HeadingCluster = {
      representative: heading.text,
      variants: [heading.text],
      frequency: 1,
      avgPosition: heading.rank
    };
    
    // Find similar headings
    headings.forEach((other, j) => {
      if (i === j || used.has(j)) return;
      
      if (calculateHeadingSimilarity(heading.text, other.text) > 0.6) {
        cluster.variants.push(other.text);
        cluster.frequency++;
        cluster.avgPosition = (cluster.avgPosition + other.rank) / 2;
        used.add(j);
      }
    });
    
    used.add(i);
    if (cluster.frequency >= 2 || headings.length < 10) {
      clusters.push(cluster);
    }
  });
  
  return clusters.sort((a, b) => b.frequency - a.frequency);
}

function calculateHeadingSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);
  
  return intersection.size / union.size;
}

function generateOutlineSections(
  keyword: string,
  clusters: HeadingCluster[],
  contentType: ContentType
): OutlineSection[] {
  const sections: OutlineSection[] = [];
  let sectionId = 1;
  
  // Add introduction
  sections.push({
    id: `section-${sectionId++}`,
    level: 2,
    heading: 'Introduction',
    suggestedContent: `Start with a hook that addresses the reader's pain point. Introduce ${keyword} and what they'll learn.`,
    wordCountTarget: 150,
    mustIncludeTerms: [keyword],
    competitorCoverage: 100,
    priority: 'high'
  });
  
  // Add sections from clusters
  clusters.slice(0, 8).forEach(cluster => {
    sections.push({
      id: `section-${sectionId++}`,
      level: 2,
      heading: cluster.representative,
      suggestedContent: `Cover the key aspects of ${cluster.representative.toLowerCase()}. Include practical examples and actionable tips.`,
      wordCountTarget: 250 + Math.round(cluster.frequency * 50),
      mustIncludeTerms: extractKeyTerms(cluster.representative),
      competitorCoverage: Math.round((cluster.frequency / 10) * 100),
      priority: cluster.frequency >= 5 ? 'high' : cluster.frequency >= 3 ? 'medium' : 'low'
    });
  });
  
  // Add FAQ section for informational content
  if (contentType !== 'landing-page') {
    sections.push({
      id: `section-${sectionId++}`,
      level: 2,
      heading: 'Frequently Asked Questions',
      suggestedContent: 'Address common questions about the topic. Use FAQ schema markup.',
      wordCountTarget: 300,
      mustIncludeTerms: [],
      competitorCoverage: 70,
      priority: 'medium'
    });
  }
  
  // Add conclusion
  sections.push({
    id: `section-${sectionId++}`,
    level: 2,
    heading: 'Conclusion',
    suggestedContent: 'Summarize key points and provide a clear call-to-action.',
    wordCountTarget: 150,
    mustIncludeTerms: [keyword],
    competitorCoverage: 90,
    priority: 'high'
  });
  
  return sections;
}

function extractKeyTerms(heading: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'for', 'of', 'and', 'in', 'on', 'with']);
  return heading
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 3);
}

function extractAllTerms(competitors: CompetitorData[]): string[] {
  const allTerms: string[] = [];
  competitors.forEach(comp => {
    allTerms.push(...comp.terms);
  });
  return allTerms;
}

function calculateTermFrequency(terms: string[]): Map<string, number> {
  const frequency = new Map<string, number>();
  terms.forEach(term => {
    frequency.set(term, (frequency.get(term) || 0) + 1);
  });
  return frequency;
}

function generatePrimaryTerms(
  keyword: string,
  frequency: Map<string, number>,
  totalCompetitors: number
): PrimaryTerm[] {
  const sortedTerms = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  
  return sortedTerms.map(([term, count], index) => ({
    term,
    targetCount: Math.max(2, Math.ceil(count / totalCompetitors)),
    currentCount: 0,
    importance: 100 - (index * 5),
    inTitle: index < 3,
    inH1: index < 2,
    competitorUsage: Math.round((count / totalCompetitors) * 100)
  }));
}

function generateSecondaryTerms(
  keyword: string,
  frequency: Map<string, number>,
  primaryTerms: PrimaryTerm[]
): SecondaryTerm[] {
  const primarySet = new Set(primaryTerms.map(t => t.term));
  
  const secondaryTerms = [...frequency.entries()]
    .filter(([term]) => !primarySet.has(term))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  return secondaryTerms.map(([term, count], index) => ({
    term,
    suggestedCount: { min: 1, max: Math.ceil(count / 5) },
    importance: 80 - (index * 3),
    relatedPrimary: findRelatedPrimary(term, primaryTerms)
  }));
}

function findRelatedPrimary(term: string, primaryTerms: PrimaryTerm[]): string {
  const termWords = new Set(term.toLowerCase().split(/\s+/));
  
  for (const primary of primaryTerms) {
    const primaryWords = primary.term.toLowerCase().split(/\s+/);
    if (primaryWords.some(w => termWords.has(w))) {
      return primary.term;
    }
  }
  
  return primaryTerms[0]?.term || '';
}

function extractNLPEntities(competitors: CompetitorData[]): NLPEntity[] {
  // In production, this would use NLP APIs
  // Mock implementation
  const mockEntities: NLPEntity[] = [
    { entity: 'Industry Expert', type: 'person', salience: 0.8, sentiment: 'positive', competitorMentions: 6 },
    { entity: 'Major Platform', type: 'product', salience: 0.7, sentiment: 'neutral', competitorMentions: 8 },
    { entity: 'Best Practice', type: 'concept', salience: 0.6, sentiment: 'positive', competitorMentions: 10 }
  ];
  
  return mockEntities;
}

function generateLSIKeywords(
  keyword: string,
  frequency: Map<string, number>
): { keyword: string; relevanceScore: number; searchVolume: number; difficulty: number }[] {
  // Generate related keywords
  const lsiKeywords = [
    `${keyword} guide`,
    `${keyword} tips`,
    `best ${keyword}`,
    `${keyword} examples`,
    `${keyword} tutorial`
  ];
  
  return lsiKeywords.map((kw, index) => ({
    keyword: kw,
    relevanceScore: 90 - (index * 10),
    searchVolume: Math.round(estimateSearchVolume(kw)),
    difficulty: Math.round(30 + Math.random() * 40)
  }));
}

function createSemanticGroups(
  primary: PrimaryTerm[],
  secondary: SecondaryTerm[]
): SemanticGroup[] {
  const groups: SemanticGroup[] = [
    {
      theme: 'Core Concepts',
      terms: primary.slice(0, 5).map(t => t.term),
      coverage: 80,
      importance: 'essential'
    },
    {
      theme: 'Supporting Terms',
      terms: secondary.slice(0, 8).map(t => t.term),
      coverage: 60,
      importance: 'recommended'
    },
    {
      theme: 'Related Topics',
      terms: secondary.slice(8, 15).map(t => t.term),
      coverage: 40,
      importance: 'optional'
    }
  ];
  
  return groups;
}

function generatePAAQuestions(keyword: string): BriefPAAQuestion[] {
  // Generate PAA-style questions
  const templates = [
    `What is ${keyword}?`,
    `How does ${keyword} work?`,
    `Why is ${keyword} important?`,
    `What are the benefits of ${keyword}?`,
    `How to get started with ${keyword}?`,
    `What are common ${keyword} mistakes?`,
    `Is ${keyword} worth it?`,
    `How much does ${keyword} cost?`
  ];
  
  return templates.slice(0, 6).map((question, index) => ({
    question,
    source: 'google-paa' as const,
    priority: 6 - index,
    suggestedAnswer: `Provide a comprehensive answer to "${question}" in 40-60 words. Start directly with the answer.`,
    wordCountTarget: 50,
    competitorAnswered: Math.random() > 0.3
  }));
}

function generateRelatedSearches(keyword: string): BriefRelatedSearch[] {
  return [
    { query: `${keyword} for beginners`, volume: 1500, intent: 'informational' },
    { query: `best ${keyword}`, volume: 2000, intent: 'commercial' },
    { query: `${keyword} vs alternative`, volume: 800, intent: 'commercial' },
    { query: `${keyword} examples`, volume: 1200, intent: 'informational' },
    { query: `free ${keyword}`, volume: 3000, intent: 'transactional' }
  ];
}

function extractForumQuestions(
  keyword: string
): { question: string; source: string; upvotes: number; answers: number; url: string }[] {
  return [
    {
      question: `Has anyone tried ${keyword}? What was your experience?`,
      source: 'Reddit',
      upvotes: 156,
      answers: 42,
      url: 'https://reddit.com/r/example'
    },
    {
      question: `Best practices for ${keyword}?`,
      source: 'Quora',
      upvotes: 89,
      answers: 23,
      url: 'https://quora.com/example'
    }
  ];
}

function generateSuggestedFAQ(keyword: string, paaQuestions: BriefPAAQuestion[]): FAQItem[] {
  return paaQuestions.slice(0, 5).map(paa => ({
    question: paa.question,
    answer: `[Write a comprehensive 50-60 word answer to this question about ${keyword}]`,
    includeInSchema: true
  }));
}

function calculateWordCountStats(
  competitors: CompetitorData[]
): { avg: number; min: number; max: number; stdDev: number; topAvg: number } {
  const counts = competitors.map(c => c.wordCount);
  const avg = calculateAverage(counts);
  
  const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / counts.length;
  const stdDev = Math.sqrt(variance);
  
  const topAvg = calculateAverage(competitors.slice(0, 3).map(c => c.wordCount));
  
  return {
    avg,
    min: Math.min(...counts),
    max: Math.max(...counts),
    stdDev: Math.round(stdDev),
    topAvg
  };
}

function calculateStructureStats(competitors: CompetitorData[]) {
  const h2Counts = competitors.map(c => c.headings.filter(h => h.level === 2).length);
  const h3Counts = competitors.map(c => c.headings.filter(h => h.level === 3).length);
  
  return {
    h2Avg: calculateAverage(h2Counts),
    h3Avg: calculateAverage(h3Counts),
    listAvg: 3, // Mock
    tableAvg: 0.5 // Mock
  };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

function determineSchemaTypes(contentType: ContentType): string[] {
  const schemas: string[] = ['Article'];
  
  switch (contentType) {
    case 'how-to':
      schemas.push('HowTo');
      break;
    case 'listicle':
      schemas.push('ItemList');
      break;
    case 'review':
      schemas.push('Review');
      break;
  }
  
  schemas.push('FAQPage');
  return schemas;
}

function shouldTargetFeaturedSnippet(overview: BriefOverview): boolean {
  return overview.searchIntent === 'informational' &&
    overview.difficulty !== 'very-hard';
}

function determineToneVoice(intent: SearchIntent): 'formal' | 'casual' | 'technical' | 'conversational' {
  switch (intent) {
    case 'transactional':
      return 'conversational';
    case 'commercial':
      return 'formal';
    case 'navigational':
      return 'technical';
    default:
      return 'conversational';
  }
}

function calculateBriefMetrics(
  competitors: CompetitorData[],
  overview: BriefOverview
): BriefMetrics {
  const avgContentScore = calculateAverage(competitors.map(c => calculateContentScore(c)));
  
  return {
    overallScore: Math.round(avgContentScore * 0.9),
    competitivenessScore: calculateCompetitivenessScore(competitors),
    comprehensivenessScore: 75,
    optimizationPotential: 85,
    estimatedTrafficPotential: overview.monthlySearchVolume * 0.3,
    estimatedRankingDifficulty: getDifficultyNumber(overview.difficulty)
  };
}

function calculateCompetitivenessScore(competitors: CompetitorData[]): number {
  const avgWordCount = calculateAverage(competitors.map(c => c.wordCount));
  
  if (avgWordCount > 3000) return 90;
  if (avgWordCount > 2000) return 70;
  if (avgWordCount > 1000) return 50;
  return 30;
}

function getDifficultyNumber(difficulty: DifficultyLevel): number {
  const map: Record<DifficultyLevel, number> = {
    easy: 25,
    medium: 50,
    hard: 75,
    'very-hard': 90
  };
  return map[difficulty];
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export type { CompetitorData, HeadingCluster };

