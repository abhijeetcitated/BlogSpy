/**
 * Featured Snippet Optimizer Utilities
 * 
 * Production-grade utilities for analyzing and optimizing content
 * for featured snippets in search results
 */

import {
  SnippetType,
  SnippetQuality,
  OptimizationImpact,
  ContentElement,
  QueryIntent,
  TargetQuery,
  ContentSection,
  SnippetCandidate,
  SnippetIssue,
  SnippetOptimization,
  SnippetMetrics,
  FormatAnalysis,
  SnippetOptimizerResult,
  SnippetRecommendation,
  SnippetOptimizerSettings,
  SnippetExportOptions,
  SNIPPET_TRIGGER_PATTERNS,
  SNIPPET_TEMPLATES,
  QUALITY_THRESHOLDS,
  OPTIMAL_WORD_COUNTS
} from '@/src/features/ai-writer/types/tools/snippet-optimizer.types';

// =============================================================================
// TEXT UTILITIES
// =============================================================================

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

function getAverageWordLength(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const totalLength = words.reduce((sum, word) => sum + word.length, 0);
  return totalLength / words.length;
}

function calculateReadability(text: string): number {
  const words = countWords(text);
  const sentences = countSentences(text);
  const syllables = countSyllables(text);

  if (sentences === 0 || words === 0) return 0;

  // Flesch Reading Ease formula
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, score));
}

function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let count = 0;

  for (const word of words) {
    count += countWordSyllables(word);
  }

  return count;
}

function countWordSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

// =============================================================================
// QUERY ANALYSIS
// =============================================================================

export function analyzeQueryIntent(query: string): QueryIntent {
  const queryLower = query.toLowerCase();
  const triggerWords: string[] = [];
  const bestSnippetTypes: SnippetType[] = [];
  let snippetPotential = 0;

  // Check trigger patterns for each snippet type
  for (const [type, patterns] of Object.entries(SNIPPET_TRIGGER_PATTERNS) as [SnippetType, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(queryLower)) {
        const match = queryLower.match(pattern);
        if (match) triggerWords.push(match[0]);
        if (!bestSnippetTypes.includes(type)) {
          bestSnippetTypes.push(type);
        }
        snippetPotential += 15;
      }
    }
  }

  // Determine intent type
  let intentType: QueryIntent['type'] = 'informational';
  
  if (/buy|purchase|order|price|cost|cheap/i.test(queryLower)) {
    intentType = 'transactional';
    snippetPotential -= 20;
  } else if (/best|top|review|compare/i.test(queryLower)) {
    intentType = 'commercial';
    snippetPotential += 10;
  } else if (/login|sign in|website|\.com/i.test(queryLower)) {
    intentType = 'navigational';
    snippetPotential -= 30;
  }

  // Cap potential
  snippetPotential = Math.max(0, Math.min(100, snippetPotential + 40));

  return {
    type: intentType,
    snippetPotential,
    bestSnippetTypes: bestSnippetTypes.length > 0 ? bestSnippetTypes : ['paragraph', 'list'],
    triggerWords
  };
}

export function analyzeTargetQuery(query: string): TargetQuery {
  const intent = analyzeQueryIntent(query);

  return {
    query,
    intent,
    hasSnippet: false,
    suggestedFormat: intent.bestSnippetTypes[0] || 'paragraph'
  };
}

// =============================================================================
// CONTENT SECTION ANALYSIS
// =============================================================================

export function extractContentSections(content: string): ContentSection[] {
  const sections: ContentSection[] = [];
  let currentIndex = 0;

  // Extract headings
  const headingPattern = /^(#{1,6})\s+(.+)$/gm;
  let match;
  while ((match = headingPattern.exec(content)) !== null) {
    sections.push({
      id: `heading_${sections.length}`,
      type: 'heading',
      content: match[2],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      wordCount: countWords(match[2]),
      snippetScore: 0,
      snippetType: null,
      issues: [],
      optimizations: []
    });
  }

  // Extract lists
  const listPattern = /(?:^[-*+]\s+.+$\n?)+|(?:^\d+\.\s+.+$\n?)+/gm;
  while ((match = listPattern.exec(content)) !== null) {
    const section: ContentSection = {
      id: `list_${sections.length}`,
      type: 'list',
      content: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      wordCount: countWords(match[0]),
      snippetScore: 0,
      snippetType: 'list',
      issues: [],
      optimizations: []
    };
    section.snippetScore = scoreListSection(section);
    sections.push(section);
  }

  // Extract tables
  const tablePattern = /\|.+\|[\s\S]*?\|.+\|/g;
  while ((match = tablePattern.exec(content)) !== null) {
    const section: ContentSection = {
      id: `table_${sections.length}`,
      type: 'table',
      content: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      wordCount: countWords(match[0]),
      snippetScore: 0,
      snippetType: 'table',
      issues: [],
      optimizations: []
    };
    section.snippetScore = scoreTableSection(section);
    sections.push(section);
  }

  // Extract paragraphs
  const paragraphs = content.split(/\n\n+/);
  let paragraphIndex = 0;
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (
      trimmed.length > 50 &&
      !trimmed.startsWith('#') &&
      !trimmed.startsWith('-') &&
      !trimmed.startsWith('*') &&
      !trimmed.startsWith('|') &&
      !/^\d+\./.test(trimmed)
    ) {
      const startIndex = content.indexOf(trimmed, paragraphIndex);
      const section: ContentSection = {
        id: `paragraph_${sections.length}`,
        type: 'paragraph',
        content: trimmed,
        startIndex,
        endIndex: startIndex + trimmed.length,
        wordCount: countWords(trimmed),
        snippetScore: 0,
        snippetType: 'paragraph',
        issues: [],
        optimizations: []
      };
      section.snippetScore = scoreParagraphSection(section);
      sections.push(section);
      paragraphIndex = startIndex + trimmed.length;
    }
  }

  // Sort by position
  sections.sort((a, b) => a.startIndex - b.startIndex);

  // Add issues and optimizations
  for (const section of sections) {
    section.issues = analyzeIssues(section);
    section.optimizations = generateSectionOptimizations(section);
  }

  return sections;
}

function scoreParagraphSection(section: ContentSection): number {
  let score = 50;
  const { min, max } = OPTIMAL_WORD_COUNTS.paragraph;

  // Word count scoring
  if (section.wordCount >= min && section.wordCount <= max) {
    score += 25;
  } else if (section.wordCount < min) {
    score -= (min - section.wordCount) * 2;
  } else {
    score -= (section.wordCount - max);
  }

  // Starts with definition pattern
  if (/^[A-Z][^.]+\s+(is|are|refers to|means)/i.test(section.content)) {
    score += 15;
  }

  // Contains actionable language
  if (/include|provide|help|allow|enable/i.test(section.content)) {
    score += 5;
  }

  // Readability
  const readability = calculateReadability(section.content);
  if (readability >= 60) score += 10;
  else if (readability < 30) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function scoreListSection(section: ContentSection): number {
  let score = 50;
  const lines = section.content.split('\n').filter(l => l.trim());
  const itemCount = lines.length;

  const { min, max } = OPTIMAL_WORD_COUNTS.list;

  // Item count scoring
  if (itemCount >= 5 && itemCount <= 8) {
    score += 25;
  } else if (itemCount < 5) {
    score -= (5 - itemCount) * 5;
  } else if (itemCount > 8) {
    score -= (itemCount - 8) * 3;
  }

  // Numbered list bonus
  if (/^\d+\./.test(lines[0])) {
    score += 10;
  }

  // Parallel structure
  const firstWords = lines.map(l => l.replace(/^[-*+\d.]\s*/, '').split(/\s+/)[0]?.toLowerCase());
  const uniqueFirstWords = new Set(firstWords);
  if (uniqueFirstWords.size <= itemCount / 2) {
    score += 10; // Good parallel structure
  }

  return Math.max(0, Math.min(100, score));
}

function scoreTableSection(section: ContentSection): number {
  let score = 50;
  const rows = section.content.split('\n').filter(r => r.includes('|'));

  // Row count
  const dataRows = rows.filter(r => !r.includes('---'));
  if (dataRows.length >= 3 && dataRows.length <= 6) {
    score += 20;
  }

  // Column count
  const columnCount = (rows[0]?.match(/\|/g) || []).length - 1;
  if (columnCount >= 2 && columnCount <= 4) {
    score += 15;
  } else if (columnCount > 5) {
    score -= 10;
  }

  // Has header separator
  if (rows.some(r => r.includes('---'))) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

// =============================================================================
// ISSUE DETECTION
// =============================================================================

function analyzeIssues(section: ContentSection): SnippetIssue[] {
  const issues: SnippetIssue[] = [];
  const optimal = section.snippetType ? OPTIMAL_WORD_COUNTS[section.snippetType] : null;

  // Length issues
  if (optimal) {
    if (section.wordCount < optimal.min) {
      issues.push({
        id: `issue_length_short_${section.id}`,
        type: 'length',
        severity: 'warning',
        message: `Content is too short (${section.wordCount} words, optimal: ${optimal.min}-${optimal.max})`,
        suggestion: `Add ${optimal.min - section.wordCount} more words to improve snippet potential`
      });
    } else if (section.wordCount > optimal.max * 1.5) {
      issues.push({
        id: `issue_length_long_${section.id}`,
        type: 'length',
        severity: 'warning',
        message: `Content is too long (${section.wordCount} words, optimal: ${optimal.min}-${optimal.max})`,
        suggestion: `Reduce to ${optimal.max} words for better snippet fit`
      });
    }
  }

  // Clarity issues
  const avgWordLength = getAverageWordLength(section.content);
  if (avgWordLength > 7) {
    issues.push({
      id: `issue_clarity_${section.id}`,
      type: 'clarity',
      severity: 'info',
      message: 'Content uses complex vocabulary',
      suggestion: 'Consider using simpler words for better readability'
    });
  }

  // Structure issues for paragraphs
  if (section.type === 'paragraph') {
    if (!/^[A-Z]/.test(section.content)) {
      issues.push({
        id: `issue_structure_start_${section.id}`,
        type: 'structure',
        severity: 'warning',
        message: 'Paragraph doesn\'t start with a capital letter',
        suggestion: 'Start with a clear, capitalized statement'
      });
    }

    if (section.content.split(/[.!?]/).length < 2) {
      issues.push({
        id: `issue_completeness_${section.id}`,
        type: 'completeness',
        severity: 'info',
        message: 'Single sentence paragraph',
        suggestion: 'Add supporting details for a more complete answer'
      });
    }
  }

  // List-specific issues
  if (section.type === 'list') {
    const lines = section.content.split('\n').filter(l => l.trim());
    if (lines.length < 3) {
      issues.push({
        id: `issue_list_items_${section.id}`,
        type: 'completeness',
        severity: 'error',
        message: 'List has too few items',
        suggestion: 'Add more items (aim for 5-8 items)'
      });
    }
  }

  return issues;
}

// =============================================================================
// OPTIMIZATION GENERATION
// =============================================================================

function generateSectionOptimizations(section: ContentSection): SnippetOptimization[] {
  const optimizations: SnippetOptimization[] = [];
  const template = section.snippetType ? SNIPPET_TEMPLATES[section.snippetType] : null;

  if (!template) return optimizations;

  // Format optimization
  if (section.type === 'paragraph' && section.wordCount > 80) {
    optimizations.push({
      id: `opt_format_${section.id}`,
      type: 'restructure',
      priority: 'medium',
      title: 'Consider converting to list format',
      description: 'Long paragraphs can be converted to lists for better snippet potential',
      currentContent: section.content.slice(0, 100) + '...',
      suggestedContent: convertParagraphToList(section.content),
      expectedImpact: '+15% snippet eligibility'
    });
  }

  // Add definition structure
  if (section.type === 'paragraph' && !/\s+(is|are)\s+/i.test(section.content)) {
    optimizations.push({
      id: `opt_definition_${section.id}`,
      type: 'rewrite',
      priority: 'high',
      title: 'Add definition structure',
      description: 'Start with a clear "X is Y" definition pattern',
      expectedImpact: '+20% snippet eligibility'
    });
  }

  // Improve list structure
  if (section.type === 'list') {
    const lines = section.content.split('\n').filter(l => l.trim());
    if (!lines[0].match(/^\d+\./)) {
      optimizations.push({
        id: `opt_numbered_list_${section.id}`,
        type: 'format_change',
        priority: 'medium',
        title: 'Convert to numbered list',
        description: 'Numbered lists often perform better for how-to snippets',
        expectedImpact: '+10% snippet eligibility'
      });
    }
  }

  return optimizations;
}

function convertParagraphToList(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  if (sentences.length < 3) return text;

  return sentences
    .map((s, i) => `${i + 1}. ${s.trim()}`)
    .join('\n');
}

// =============================================================================
// CANDIDATE EXTRACTION
// =============================================================================

export function extractSnippetCandidates(
  content: string,
  sections: ContentSection[],
  targetQuery?: string
): SnippetCandidate[] {
  const candidates: SnippetCandidate[] = [];

  for (const section of sections) {
    if (section.snippetScore < 30) continue;

    const candidate: SnippetCandidate = {
      id: `candidate_${section.id}`,
      content: section.content,
      type: section.snippetType || 'paragraph',
      score: section.snippetScore,
      quality: getQualityFromScore(section.snippetScore),
      wordCount: section.wordCount,
      targetQuery,
      strengths: [],
      weaknesses: []
    };

    // Analyze strengths and weaknesses
    const { strengths, weaknesses } = analyzeStrengthsWeaknesses(section);
    candidate.strengths = strengths;
    candidate.weaknesses = weaknesses;

    // Generate optimized version if score is not excellent
    if (candidate.quality !== 'excellent') {
      candidate.optimizedVersion = generateOptimizedVersion(section);
    }

    candidates.push(candidate);
  }

  // Sort by score
  candidates.sort((a, b) => b.score - a.score);

  return candidates;
}

function getQualityFromScore(score: number): SnippetQuality {
  if (score >= QUALITY_THRESHOLDS.excellent) return 'excellent';
  if (score >= QUALITY_THRESHOLDS.good) return 'good';
  if (score >= QUALITY_THRESHOLDS.moderate) return 'moderate';
  if (score >= QUALITY_THRESHOLDS.poor) return 'poor';
  return 'unoptimized';
}

function analyzeStrengthsWeaknesses(section: ContentSection): {
  strengths: string[];
  weaknesses: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const template = section.snippetType ? SNIPPET_TEMPLATES[section.snippetType] : null;
  const optimal = section.snippetType ? OPTIMAL_WORD_COUNTS[section.snippetType] : null;

  // Length analysis
  if (optimal) {
    if (section.wordCount >= optimal.min && section.wordCount <= optimal.max) {
      strengths.push('Optimal length for snippet');
    } else if (section.wordCount < optimal.min) {
      weaknesses.push('Too short for optimal snippet');
    } else {
      weaknesses.push('Too long for snippet box');
    }
  }

  // Structure analysis
  if (section.type === 'paragraph') {
    if (/^[A-Z][^.]+\s+(is|are|refers to)/i.test(section.content)) {
      strengths.push('Clear definition structure');
    } else {
      weaknesses.push('Missing definition pattern');
    }
  }

  if (section.type === 'list') {
    const lines = section.content.split('\n').filter(l => l.trim());
    if (lines.length >= 5 && lines.length <= 8) {
      strengths.push('Good number of list items');
    }
    if (/^\d+\./.test(lines[0])) {
      strengths.push('Numbered list format');
    }
  }

  // Readability
  const readability = calculateReadability(section.content);
  if (readability >= 60) {
    strengths.push('Good readability score');
  } else if (readability < 40) {
    weaknesses.push('Complex readability');
  }

  return { strengths, weaknesses };
}

function generateOptimizedVersion(section: ContentSection): string {
  let optimized = section.content;
  const template = section.snippetType ? SNIPPET_TEMPLATES[section.snippetType] : null;

  if (!template) return optimized;

  // Add definition structure for paragraphs
  if (section.type === 'paragraph' && !/\s+(is|are)\s+/.test(optimized)) {
    const firstSentence = optimized.split(/[.!?]/)[0];
    const rest = optimized.slice(firstSentence.length + 1).trim();
    
    // Try to restructure as definition
    const words = firstSentence.split(/\s+/);
    if (words.length > 3) {
      const subject = words.slice(0, 2).join(' ');
      const predicate = words.slice(2).join(' ');
      optimized = `${subject} is ${predicate}. ${rest}`;
    }
  }

  // Trim to optimal length
  const optimal = section.snippetType ? OPTIMAL_WORD_COUNTS[section.snippetType] : null;
  if (optimal && section.wordCount > optimal.max) {
    const sentences = optimized.split(/[.!?]+/);
    let result = '';
    let wordCount = 0;

    for (const sentence of sentences) {
      const sentenceWords = countWords(sentence);
      if (wordCount + sentenceWords <= optimal.max) {
        result += sentence.trim() + '. ';
        wordCount += sentenceWords;
      } else {
        break;
      }
    }

    optimized = result.trim();
  }

  return optimized;
}

// =============================================================================
// METRICS CALCULATION
// =============================================================================

export function calculateMetrics(
  candidates: SnippetCandidate[],
  sections: ContentSection[],
  issues: SnippetIssue[],
  optimizations: SnippetOptimization[]
): SnippetMetrics {
  const highQualityCandidates = candidates.filter(
    c => c.quality === 'excellent' || c.quality === 'good'
  );

  // Calculate individual scores
  const formatScore = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + (c.type === 'paragraph' ? c.score * 1.1 : c.score), 0) / candidates.length)
    : 0;

  const clarityScore = sections.length > 0
    ? Math.round(sections.reduce((sum, s) => sum + calculateReadability(s.content), 0) / sections.length)
    : 0;

  const relevanceScore = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)
    : 0;

  const structureScore = calculateStructureScore(sections);

  const completenessScore = Math.round(
    100 - (issues.filter(i => i.type === 'completeness').length * 10)
  );

  // Overall score
  const overallScore = Math.round(
    (formatScore * 0.2) +
    (clarityScore * 0.2) +
    (relevanceScore * 0.25) +
    (structureScore * 0.2) +
    (completenessScore * 0.15)
  );

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    quality: getQualityFromScore(overallScore),
    formatScore,
    clarityScore,
    relevanceScore,
    structureScore,
    completenessScore,
    candidateCount: candidates.length,
    highQualityCount: highQualityCandidates.length,
    issueCount: issues.length,
    optimizationCount: optimizations.length
  };
}

function calculateStructureScore(sections: ContentSection[]): number {
  if (sections.length === 0) return 0;

  let score = 50;

  // Has headings
  if (sections.some(s => s.type === 'heading')) {
    score += 15;
  }

  // Has mixed content types
  const types = new Set(sections.map(s => s.type));
  if (types.size >= 3) {
    score += 20;
  } else if (types.size >= 2) {
    score += 10;
  }

  // Has lists
  if (sections.some(s => s.type === 'list')) {
    score += 10;
  }

  return Math.min(100, score);
}

// =============================================================================
// FORMAT ANALYSIS
// =============================================================================

export function analyzeFormat(
  content: string,
  sections: ContentSection[],
  targetQuery?: string
): FormatAnalysis {
  const queryIntent = targetQuery ? analyzeQueryIntent(targetQuery) : null;

  // Detect current dominant format
  const formatCounts: Record<SnippetType, number> = {
    paragraph: 0,
    list: 0,
    table: 0,
    video: 0,
    definition: 0,
    comparison: 0,
    how_to: 0,
    calculation: 0
  };

  for (const section of sections) {
    if (section.snippetType) {
      formatCounts[section.snippetType]++;
    }
  }

  const currentFormat = (Object.entries(formatCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] as SnippetType) || null;

  // Recommend format based on query and content
  const recommendedFormat = queryIntent?.bestSnippetTypes[0] || 'paragraph';

  // Calculate format fit score
  const formatFitScore = currentFormat === recommendedFormat ? 85 : 60;

  // Generate alternatives
  const alternatives: FormatAnalysis['alternatives'] = [];
  
  if (queryIntent) {
    for (const type of queryIntent.bestSnippetTypes.slice(0, 3)) {
      alternatives.push({
        format: type,
        score: type === recommendedFormat ? 90 : 70,
        reason: `Matches "${queryIntent.triggerWords.join(', ')}" query pattern`
      });
    }
  }

  return {
    currentFormat,
    recommendedFormat,
    formatFitScore,
    alternatives
  };
}

// =============================================================================
// RECOMMENDATIONS
// =============================================================================

function generateRecommendations(
  metrics: SnippetMetrics,
  candidates: SnippetCandidate[],
  issues: SnippetIssue[],
  formatAnalysis: FormatAnalysis
): SnippetRecommendation[] {
  const recommendations: SnippetRecommendation[] = [];

  // Format recommendations
  if (formatAnalysis.currentFormat !== formatAnalysis.recommendedFormat) {
    recommendations.push({
      id: 'rec_format_change',
      priority: 'high',
      category: 'format',
      title: `Consider ${formatAnalysis.recommendedFormat} format`,
      description: `Your content primarily uses ${formatAnalysis.currentFormat || 'mixed'} format, but ${formatAnalysis.recommendedFormat} may perform better for your target query.`,
      action: `Restructure key content sections as ${formatAnalysis.recommendedFormat}`,
      impact: '+25% snippet eligibility'
    });
  }

  // Content recommendations
  if (metrics.clarityScore < 60) {
    recommendations.push({
      id: 'rec_clarity',
      priority: 'medium',
      category: 'content',
      title: 'Improve content clarity',
      description: 'Your content readability score is below optimal for featured snippets.',
      action: 'Use shorter sentences and simpler vocabulary',
      impact: '+15% snippet eligibility'
    });
  }

  // Structure recommendations
  if (metrics.structureScore < 70) {
    recommendations.push({
      id: 'rec_structure',
      priority: 'medium',
      category: 'structure',
      title: 'Improve content structure',
      description: 'Add more structural elements like headings and lists.',
      action: 'Break up content with clear headings and bulleted lists',
      impact: '+20% snippet eligibility'
    });
  }

  // Issue-based recommendations
  const errorIssues = issues.filter(i => i.severity === 'error');
  if (errorIssues.length > 0) {
    recommendations.push({
      id: 'rec_fix_errors',
      priority: 'high',
      category: 'content',
      title: `Fix ${errorIssues.length} critical issue(s)`,
      description: 'Address critical issues that prevent snippet eligibility.',
      action: errorIssues.map(i => i.suggestion).join('; '),
      impact: '+30% snippet eligibility'
    });
  }

  // Candidate-based recommendations
  if (candidates.length === 0) {
    recommendations.push({
      id: 'rec_no_candidates',
      priority: 'high',
      category: 'content',
      title: 'Add snippet-optimized content',
      description: 'No strong snippet candidates were found in your content.',
      action: 'Add a clear, concise answer paragraph at the beginning of your content',
      impact: 'Required for snippet eligibility'
    });
  }

  return recommendations;
}

// =============================================================================
// MAIN ANALYZER FUNCTION
// =============================================================================

export function analyzeForSnippets(
  content: string,
  settings: SnippetOptimizerSettings
): SnippetOptimizerResult {
  // Extract sections
  const sections = extractContentSections(content);

  // Extract candidates
  const candidates = extractSnippetCandidates(content, sections, settings.targetQuery);

  // Collect all issues and optimizations
  const issues = sections.flatMap(s => s.issues);
  const optimizations = sections.flatMap(s => s.optimizations);

  // Analyze format
  const formatAnalysis = analyzeFormat(content, sections, settings.targetQuery);

  // Calculate metrics
  const metrics = calculateMetrics(candidates, sections, issues, optimizations);

  // Generate recommendations
  const recommendations = generateRecommendations(metrics, candidates, issues, formatAnalysis);

  // Generate target queries
  const targetQueries: TargetQuery[] = settings.targetQuery
    ? [analyzeTargetQuery(settings.targetQuery)]
    : [];

  // Generate optimized content if enabled
  const optimizedContent = settings.generateOptimizedVersion
    ? generateOptimizedContent(content, candidates, recommendations)
    : undefined;

  return {
    id: `result_${Date.now()}`,
    timestamp: new Date(),
    content,
    targetQueries,
    metrics,
    formatAnalysis,
    candidates,
    sections,
    issues,
    optimizations,
    recommendations,
    optimizedContent
  };
}

function generateOptimizedContent(
  content: string,
  candidates: SnippetCandidate[],
  recommendations: SnippetRecommendation[]
): string {
  // For now, return the best optimized candidate version if available
  const bestCandidate = candidates.find(c => c.optimizedVersion);
  if (bestCandidate?.optimizedVersion) {
    return content.replace(bestCandidate.content, bestCandidate.optimizedVersion);
  }
  return content;
}

// =============================================================================
// EXPORT FUNCTION
// =============================================================================

export function exportSnippetReport(
  result: SnippetOptimizerResult,
  options: SnippetExportOptions
): string {
  if (options.format === 'json') {
    return JSON.stringify({
      timestamp: result.timestamp,
      metrics: result.metrics,
      candidates: options.includeCandidates ? result.candidates : undefined,
      recommendations: result.recommendations,
      optimizedContent: options.includeOptimized ? result.optimizedContent : undefined
    }, null, 2);
  }

  if (options.format === 'html') {
    return `
<!DOCTYPE html>
<html>
<head><title>Featured Snippet Analysis Report</title></head>
<body>
<h1>Featured Snippet Analysis Report</h1>
<p>Generated: ${result.timestamp.toISOString()}</p>

<h2>Overall Score: ${result.metrics.overallScore}%</h2>
<p>Quality: ${result.metrics.quality}</p>

<h2>Metrics</h2>
<ul>
  <li>Format Score: ${result.metrics.formatScore}%</li>
  <li>Clarity Score: ${result.metrics.clarityScore}%</li>
  <li>Relevance Score: ${result.metrics.relevanceScore}%</li>
  <li>Structure Score: ${result.metrics.structureScore}%</li>
</ul>

<h2>Recommendations</h2>
<ul>
${result.recommendations.map(r => `<li><strong>${r.title}</strong>: ${r.description}</li>`).join('\n')}
</ul>

${options.includeCandidates ? `
<h2>Snippet Candidates</h2>
${result.candidates.map(c => `
<div>
  <h3>${c.type} (Score: ${c.score}%)</h3>
  <pre>${c.content}</pre>
</div>
`).join('\n')}
` : ''}

${options.includeOptimized && result.optimizedContent ? `
<h2>Optimized Content</h2>
<pre>${result.optimizedContent}</pre>
` : ''}
</body>
</html>`;
  }

  // Markdown format
  let md = `# Featured Snippet Analysis Report\n\n`;
  md += `Generated: ${result.timestamp.toISOString()}\n\n`;
  md += `## Overall Score: ${result.metrics.overallScore}%\n\n`;
  md += `Quality: **${result.metrics.quality}**\n\n`;
  md += `## Metrics\n\n`;
  md += `| Metric | Score |\n|--------|-------|\n`;
  md += `| Format | ${result.metrics.formatScore}% |\n`;
  md += `| Clarity | ${result.metrics.clarityScore}% |\n`;
  md += `| Relevance | ${result.metrics.relevanceScore}% |\n`;
  md += `| Structure | ${result.metrics.structureScore}% |\n`;
  md += `| Completeness | ${result.metrics.completenessScore}% |\n\n`;
  md += `## Recommendations\n\n`;
  
  for (const rec of result.recommendations) {
    md += `### ${rec.title}\n`;
    md += `${rec.description}\n\n`;
    md += `**Action:** ${rec.action}\n\n`;
    md += `**Expected Impact:** ${rec.impact}\n\n`;
  }

  if (options.includeCandidates && result.candidates.length > 0) {
    md += `## Snippet Candidates\n\n`;
    for (const candidate of result.candidates) {
      md += `### ${candidate.type} (Score: ${candidate.score}%)\n\n`;
      md += `\`\`\`\n${candidate.content}\n\`\`\`\n\n`;
    }
  }

  if (options.includeOptimized && result.optimizedContent) {
    md += `## Optimized Content\n\n`;
    md += `\`\`\`\n${result.optimizedContent}\n\`\`\`\n\n`;
  }

  return md;
}

