/**
 * Plagiarism Checker Utilities
 * 
 * Comprehensive plagiarism detection and analysis functions
 */

import {
  PlagiarismMatch,
  PlagiarismAnalysis,
  PlagiarismMetrics,
  PlagiarismSummary,
  PlagiarismRecommendation,
  PlagiarismSettings,
  MatchedSource,
  ContentSection,
  SourceStats,
  TextSegment,
  MatchType,
  SourceType,
  PlagiarismSeverity,
  ContentRisk,
  ComparisonResult,
  DocumentHighlight,
  HighlightRange,
  DEFAULT_PLAGIARISM_SETTINGS,
  MATCH_SEVERITY_THRESHOLDS
} from '@/src/features/ai-writer/types/tools/plagiarism.types';

// =============================================================================
// TEXT PROCESSING
// =============================================================================

/**
 * Normalize text for comparison
 */
export function normalizeText(text: string, caseSensitive: boolean = false): string {
  let normalized = text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim();
  
  if (!caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  
  return normalized;
}

/**
 * Split text into segments for scanning
 */
export function segmentText(text: string, minWords: number = 5): TextSegment[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const segments: TextSegment[] = [];
  
  let currentIndex = 0;
  sentences.forEach((sentence, index) => {
    const trimmed = sentence.trim();
    const words = trimmed.split(/\s+/);
    
    if (words.length >= minWords) {
      segments.push({
        id: `seg-${index}`,
        text: trimmed,
        startIndex: currentIndex,
        endIndex: currentIndex + trimmed.length,
        wordCount: words.length,
        sentenceCount: 1
      });
    }
    
    currentIndex += sentence.length;
  });
  
  return segments;
}

/**
 * Extract n-grams from text
 */
export function extractNGrams(text: string, n: number = 4): string[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const ngrams: string[] = [];
  
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  
  return ngrams;
}

/**
 * Calculate Jaccard similarity between two texts
 */
export function calculateJaccardSimilarity(text1: string, text2: string): number {
  const words1 = new Set(normalizeText(text1).split(/\s+/));
  const words2 = new Set(normalizeText(text2).split(/\s+/));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 0;
  return (intersection.size / union.size) * 100;
}

/**
 * Calculate cosine similarity using word vectors
 */
export function calculateCosineSimilarity(text1: string, text2: string): number {
  const words1 = normalizeText(text1).split(/\s+/);
  const words2 = normalizeText(text2).split(/\s+/);
  
  const allWords = [...new Set([...words1, ...words2])];
  
  const vector1 = allWords.map(w => words1.filter(x => x === w).length);
  const vector2 = allWords.map(w => words2.filter(x => x === w).length);
  
  const dotProduct = vector1.reduce((sum, v, i) => sum + v * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, v) => sum + v * v, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, v) => sum + v * v, 0));
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return (dotProduct / (magnitude1 * magnitude2)) * 100;
}

/**
 * Calculate Levenshtein distance
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Calculate similarity based on Levenshtein distance
 */
export function calculateLevenshteinSimilarity(text1: string, text2: string): number {
  const maxLength = Math.max(text1.length, text2.length);
  if (maxLength === 0) return 100;
  
  const distance = levenshteinDistance(text1, text2);
  return ((maxLength - distance) / maxLength) * 100;
}

// =============================================================================
// MATCH DETECTION
// =============================================================================

/**
 * Determine match type based on similarity
 */
export function determineMatchType(similarity: number, text1: string, text2: string): MatchType {
  const normalizedT1 = normalizeText(text1, false);
  const normalizedT2 = normalizeText(text2, false);
  
  // Exact match
  if (similarity >= 95 || normalizedT1 === normalizedT2) {
    return 'exact';
  }
  
  // Check for common phrases
  const commonPhrases = [
    'on the other hand', 'in conclusion', 'as a result', 'for example',
    'in other words', 'according to', 'in addition', 'furthermore',
    'however', 'therefore', 'consequently', 'nevertheless'
  ];
  
  if (commonPhrases.some(phrase => normalizedT1.includes(phrase))) {
    return 'common_phrase';
  }
  
  // Paraphrased vs similar
  if (similarity >= 70) {
    return 'paraphrased';
  }
  
  return 'similar';
}

/**
 * Determine severity based on match type and similarity
 */
export function determineSeverity(matchType: MatchType, similarity: number): PlagiarismSeverity {
  const thresholds = MATCH_SEVERITY_THRESHOLDS[matchType as keyof typeof MATCH_SEVERITY_THRESHOLDS] 
    || { critical: 90, high: 70, medium: 50 };
  
  if (similarity >= thresholds.critical) return 'critical';
  if (similarity >= thresholds.high) return 'high';
  if (similarity >= thresholds.medium) return 'medium';
  return 'low';
}

/**
 * Check if text is quoted
 */
export function isQuotedText(text: string, fullContent: string): boolean {
  const index = fullContent.indexOf(text);
  if (index === -1) return false;
  
  // Check for surrounding quotes
  const before = fullContent.substring(Math.max(0, index - 2), index);
  const after = fullContent.substring(index + text.length, index + text.length + 2);
  
  return (before.includes('"') || before.includes('"')) && 
         (after.includes('"') || after.includes('"'));
}

/**
 * Check if text has citation
 */
export function hasCitation(text: string, fullContent: string): boolean {
  const index = fullContent.indexOf(text);
  if (index === -1) return false;
  
  const afterText = fullContent.substring(index + text.length, index + text.length + 50);
  
  // Check for citation patterns
  const citationPatterns = [
    /\(\d{4}\)/, // (2024)
    /\[[\d,\s]+\]/, // [1, 2]
    /\([\w\s]+,\s*\d{4}\)/, // (Author, 2024)
    /et\s+al\./, // et al.
    /according\s+to/i,
    /source:/i
  ];
  
  return citationPatterns.some(pattern => pattern.test(afterText));
}

/**
 * Find matches in content (simulated for demo)
 */
export function findMatches(
  content: string,
  settings: PlagiarismSettings
): PlagiarismMatch[] {
  const segments = segmentText(content, settings.minWordCount);
  const matches: PlagiarismMatch[] = [];
  
  // Simulated web sources for demo
  const simulatedSources: MatchedSource[] = [
    {
      id: 'src-1',
      url: 'https://wikipedia.org/wiki/example',
      title: 'Wikipedia Article',
      domain: 'wikipedia.org',
      sourceType: 'web',
      snippet: '',
      credibilityScore: 75,
      indexed: true
    },
    {
      id: 'src-2',
      url: 'https://academic.edu/paper/123',
      title: 'Academic Paper on Topic',
      domain: 'academic.edu',
      sourceType: 'academic',
      snippet: '',
      credibilityScore: 90,
      indexed: true
    },
    {
      id: 'src-3',
      url: 'https://news.example.com/article',
      title: 'News Article',
      domain: 'news.example.com',
      sourceType: 'news',
      snippet: '',
      credibilityScore: 70,
      indexed: true
    }
  ];
  
  // Simulate finding matches
  segments.forEach((segment, index) => {
    // Random simulation - in production, this would query actual plagiarism APIs
    const shouldMatch = Math.random() < 0.15; // 15% chance of match for demo
    
    if (shouldMatch && segment.wordCount >= settings.minWordCount) {
      const similarity = 40 + Math.random() * 55; // 40-95% similarity
      
      if (similarity >= settings.minSimilarity) {
        const matchType = determineMatchType(similarity, segment.text, segment.text);
        const severity = determineSeverity(matchType, similarity);
        const source = simulatedSources[Math.floor(Math.random() * simulatedSources.length)];
        const isQuoted = isQuotedText(segment.text, content);
        const cited = hasCitation(segment.text, content);
        
        // Skip quoted/cited if settings say so
        if (!settings.checkQuotes && isQuoted) return;
        if (!settings.checkCitations && cited) return;
        
        matches.push({
          id: `match-${index}`,
          originalText: segment.text,
          matchedText: segment.text, // In real impl, this would be from source
          startIndex: segment.startIndex,
          endIndex: segment.endIndex,
          wordCount: segment.wordCount,
          matchType,
          similarity: Math.round(similarity),
          severity,
          source: {
            ...source,
            snippet: segment.text.substring(0, 100) + '...'
          },
          context: {
            before: content.substring(Math.max(0, segment.startIndex - 50), segment.startIndex),
            after: content.substring(segment.endIndex, Math.min(content.length, segment.endIndex + 50))
          },
          suggestions: generateSuggestions(matchType, similarity),
          isQuoted,
          hasCitation: cited,
          canExclude: true
        });
      }
    }
  });
  
  return matches.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Generate suggestions for a match
 */
function generateSuggestions(matchType: MatchType, similarity: number): string[] {
  const suggestions: string[] = [];
  
  if (matchType === 'exact') {
    suggestions.push('Rewrite this passage in your own words');
    suggestions.push('Add proper citation if quoting');
    suggestions.push('Use quotation marks if keeping original');
  } else if (matchType === 'paraphrased') {
    suggestions.push('Further paraphrase to make more original');
    suggestions.push('Add your own insights or analysis');
    suggestions.push('Cite the original source');
  } else if (matchType === 'similar') {
    suggestions.push('Verify if citation is needed');
    suggestions.push('Add more original analysis');
  }
  
  if (similarity > 80) {
    suggestions.push('Consider removing or significantly rewriting');
  }
  
  return suggestions;
}

// =============================================================================
// ANALYSIS
// =============================================================================

/**
 * Calculate plagiarism metrics
 */
export function calculateMetrics(
  content: string,
  matches: PlagiarismMatch[]
): PlagiarismMetrics {
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  
  const plagiarizedWords = matches.reduce((sum, m) => {
    if (!m.isQuoted && !m.hasCitation) {
      return sum + m.wordCount;
    }
    return sum;
  }, 0);
  
  const uniqueWords = totalWords - plagiarizedWords;
  const plagiarismScore = totalWords > 0 ? (plagiarizedWords / totalWords) * 100 : 0;
  const originalityScore = 100 - plagiarismScore;
  
  const similarities = matches.map(m => m.similarity);
  const averageSimilarity = similarities.length > 0 
    ? similarities.reduce((a, b) => a + b, 0) / similarities.length 
    : 0;
  const highestSimilarity = similarities.length > 0 ? Math.max(...similarities) : 0;
  
  const matchesBySeverity = {
    critical: matches.filter(m => m.severity === 'critical').length,
    high: matches.filter(m => m.severity === 'high').length,
    medium: matches.filter(m => m.severity === 'medium').length,
    low: matches.filter(m => m.severity === 'low').length
  };
  
  const matchesByType = {
    exact: matches.filter(m => m.matchType === 'exact').length,
    paraphrased: matches.filter(m => m.matchType === 'paraphrased').length,
    similar: matches.filter(m => m.matchType === 'similar').length,
    common_phrase: matches.filter(m => m.matchType === 'common_phrase').length
  };
  
  const sourcesFound = matches.length;
  const uniqueDomains = new Set(matches.map(m => m.source.domain)).size;
  const quotedContent = matches.filter(m => m.isQuoted).reduce((sum, m) => sum + m.wordCount, 0);
  const citedContent = matches.filter(m => m.hasCitation).reduce((sum, m) => sum + m.wordCount, 0);
  
  // Determine risk level
  let riskLevel: ContentRisk = 'safe';
  if (plagiarismScore > 40 || matchesBySeverity.critical > 2) {
    riskLevel = 'critical_risk';
  } else if (plagiarismScore > 25 || matchesBySeverity.critical > 0) {
    riskLevel = 'high_risk';
  } else if (plagiarismScore > 15 || matchesBySeverity.high > 2) {
    riskLevel = 'moderate_risk';
  } else if (plagiarismScore > 5) {
    riskLevel = 'low_risk';
  }
  
  // Confidence based on scan coverage
  const confidence = Math.min(95, 70 + (totalWords / 100));
  
  return {
    totalWords,
    scannedWords: totalWords,
    uniqueWords,
    plagiarizedWords,
    originalityScore: Math.round(originalityScore),
    plagiarismScore: Math.round(plagiarismScore),
    averageSimilarity: Math.round(averageSimilarity),
    highestSimilarity: Math.round(highestSimilarity),
    matchesBySeverity,
    matchesByType,
    sourcesFound,
    uniqueDomains,
    quotedContent,
    citedContent,
    riskLevel,
    confidence: Math.round(confidence)
  };
}

/**
 * Generate summary from analysis
 */
export function generateSummary(
  metrics: PlagiarismMetrics,
  matches: PlagiarismMatch[]
): PlagiarismSummary {
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  const positives: string[] = [];
  
  // Critical issues
  if (metrics.matchesBySeverity.critical > 0) {
    criticalIssues.push(`${metrics.matchesBySeverity.critical} critical matches found`);
  }
  if (metrics.highestSimilarity > 90) {
    criticalIssues.push(`Exact copy detected (${metrics.highestSimilarity}% similarity)`);
  }
  
  // Warnings
  if (metrics.matchesBySeverity.high > 0) {
    warnings.push(`${metrics.matchesBySeverity.high} high similarity matches`);
  }
  if (metrics.plagiarismScore > 15) {
    warnings.push(`${metrics.plagiarismScore}% content may need revision`);
  }
  
  // Positives
  if (metrics.originalityScore >= 85) {
    positives.push('High originality score');
  }
  if (metrics.citedContent > 0) {
    positives.push('Proper citations detected');
  }
  if (metrics.quotedContent > 0) {
    positives.push('Quoted content properly marked');
  }
  if (metrics.matchesBySeverity.critical === 0 && metrics.matchesBySeverity.high === 0) {
    positives.push('No critical or high severity matches');
  }
  
  // Main finding
  let mainFinding = '';
  if (metrics.originalityScore >= 90) {
    mainFinding = 'Content is highly original with minimal matches found.';
  } else if (metrics.originalityScore >= 75) {
    mainFinding = 'Content is mostly original with some similar passages found.';
  } else if (metrics.originalityScore >= 50) {
    mainFinding = 'Moderate originality. Several passages need attention.';
  } else {
    mainFinding = 'Significant plagiarism detected. Major revision required.';
  }
  
  // Estimate fix time (minutes)
  const estimatedFixTime = 
    metrics.matchesBySeverity.critical * 15 +
    metrics.matchesBySeverity.high * 10 +
    metrics.matchesBySeverity.medium * 5 +
    metrics.matchesBySeverity.low * 2;
  
  return {
    verdict: metrics.riskLevel,
    mainFinding,
    criticalIssues,
    warnings,
    positives,
    actionRequired: metrics.riskLevel !== 'safe' && metrics.riskLevel !== 'low_risk',
    estimatedFixTime
  };
}

/**
 * Generate recommendations
 */
export function generateRecommendations(
  matches: PlagiarismMatch[],
  metrics: PlagiarismMetrics
): PlagiarismRecommendation[] {
  const recommendations: PlagiarismRecommendation[] = [];
  
  // Group matches by severity
  const criticalMatches = matches.filter(m => m.severity === 'critical');
  const highMatches = matches.filter(m => m.severity === 'high');
  const exactMatches = matches.filter(m => m.matchType === 'exact');
  const uncitedMatches = matches.filter(m => !m.hasCitation && !m.isQuoted);
  
  // Critical: Rewrite exact matches
  if (exactMatches.length > 0) {
    recommendations.push({
      id: 'rec-exact',
      type: 'rewrite',
      priority: 'critical',
      title: 'Rewrite Exact Matches',
      description: `${exactMatches.length} passages are exact copies and need immediate rewriting.`,
      affectedMatches: exactMatches.map(m => m.id),
      suggestedAction: 'Completely rewrite these passages in your own words while maintaining the original meaning.',
      effort: 'significant',
      impact: 40
    });
  }
  
  // High: Add citations
  if (uncitedMatches.length > 0 && uncitedMatches.some(m => m.severity === 'critical' || m.severity === 'high')) {
    recommendations.push({
      id: 'rec-cite',
      type: 'cite',
      priority: 'high',
      title: 'Add Proper Citations',
      description: `${uncitedMatches.length} matches need proper source attribution.`,
      affectedMatches: uncitedMatches.map(m => m.id),
      suggestedAction: 'Add citations to acknowledge sources and avoid plagiarism claims.',
      effort: 'moderate',
      impact: 30
    });
  }
  
  // Medium: Paraphrase similar content
  const similarMatches = matches.filter(m => m.matchType === 'paraphrased' || m.matchType === 'similar');
  if (similarMatches.length > 0) {
    recommendations.push({
      id: 'rec-paraphrase',
      type: 'paraphrase',
      priority: 'medium',
      title: 'Improve Paraphrasing',
      description: `${similarMatches.length} passages are too similar to sources.`,
      affectedMatches: similarMatches.map(m => m.id),
      suggestedAction: 'Further paraphrase these sections while adding your own analysis.',
      effort: 'moderate',
      impact: 20
    });
  }
  
  // Low: Verify common phrases
  const commonPhrases = matches.filter(m => m.matchType === 'common_phrase');
  if (commonPhrases.length > 0) {
    recommendations.push({
      id: 'rec-verify',
      type: 'verify',
      priority: 'low',
      title: 'Verify Common Phrases',
      description: `${commonPhrases.length} common phrases detected. Usually not a concern.`,
      affectedMatches: commonPhrases.map(m => m.id),
      suggestedAction: 'Review if these are truly common phrases or need attention.',
      effort: 'minimal',
      impact: 5
    });
  }
  
  // Use quotation marks
  const highSimilarityUncited = matches.filter(m => m.similarity > 85 && !m.isQuoted && !m.hasCitation);
  if (highSimilarityUncited.length > 0) {
    recommendations.push({
      id: 'rec-quote',
      type: 'quote',
      priority: 'high',
      title: 'Use Quotation Marks',
      description: 'High similarity content should be quoted if keeping original text.',
      affectedMatches: highSimilarityUncited.map(m => m.id),
      suggestedAction: 'Either quote the text with proper citation or rewrite completely.',
      effort: 'minimal',
      impact: 25
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Extract sources with statistics
 */
export function extractSourceStats(matches: PlagiarismMatch[]): SourceStats[] {
  const sourceMap = new Map<string, SourceStats>();
  
  matches.forEach(match => {
    const domain = match.source.domain;
    const existing = sourceMap.get(domain);
    
    if (existing) {
      existing.matchCount++;
      existing.totalWords += match.wordCount;
      existing.averageSimilarity = (existing.averageSimilarity + match.similarity) / 2;
      existing.highestSimilarity = Math.max(existing.highestSimilarity, match.similarity);
    } else {
      sourceMap.set(domain, {
        sourceId: match.source.id,
        domain,
        matchCount: 1,
        totalWords: match.wordCount,
        averageSimilarity: match.similarity,
        highestSimilarity: match.similarity,
        sourceType: match.source.sourceType
      });
    }
  });
  
  return Array.from(sourceMap.values())
    .sort((a, b) => b.highestSimilarity - a.highestSimilarity);
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Perform complete plagiarism analysis
 */
export function analyzePlagiarism(
  content: string,
  settings: PlagiarismSettings = DEFAULT_PLAGIARISM_SETTINGS
): PlagiarismAnalysis {
  const startTime = Date.now();
  
  // Find matches
  const matches = findMatches(content, settings);
  
  // Extract unique sources
  const sources = matches.reduce((acc, match) => {
    if (!acc.find(s => s.id === match.source.id)) {
      acc.push(match.source);
    }
    return acc;
  }, [] as MatchedSource[]);
  
  // Calculate metrics
  const metrics = calculateMetrics(content, matches);
  
  // Generate summary and recommendations
  const summary = generateSummary(metrics, matches);
  const recommendations = generateRecommendations(matches, metrics);
  
  // Extract source stats
  const sourceStats = extractSourceStats(matches);
  
  // Split content into sections
  const sections = extractSections(content, matches);
  
  const duration = Date.now() - startTime;
  
  return {
    id: `scan-${Date.now()}`,
    content,
    timestamp: new Date(),
    status: 'completed',
    duration,
    metrics,
    matches,
    sources,
    sections,
    sourceStats,
    summary,
    recommendations,
    excludedMatches: []
  };
}

/**
 * Extract content sections with plagiarism info
 */
function extractSections(content: string, matches: PlagiarismMatch[]): ContentSection[] {
  // Split by headings or paragraphs
  const paragraphs = content.split(/\n\n+/);
  const sections: ContentSection[] = [];
  
  let currentIndex = 0;
  paragraphs.forEach((para, index) => {
    const trimmed = para.trim();
    if (trimmed.length === 0) {
      currentIndex += para.length + 2; // +2 for \n\n
      return;
    }
    
    const sectionMatches = matches.filter(m => 
      m.startIndex >= currentIndex && 
      m.endIndex <= currentIndex + trimmed.length
    );
    
    const wordCount = trimmed.split(/\s+/).length;
    const plagiarizedWords = sectionMatches.reduce((sum, m) => sum + m.wordCount, 0);
    const plagiarismScore = wordCount > 0 ? (plagiarizedWords / wordCount) * 100 : 0;
    
    sections.push({
      id: `section-${index}`,
      title: trimmed.substring(0, 50) + (trimmed.length > 50 ? '...' : ''),
      text: trimmed,
      startIndex: currentIndex,
      endIndex: currentIndex + trimmed.length,
      wordCount,
      plagiarismScore: Math.round(plagiarismScore),
      matches: sectionMatches,
      originalityScore: Math.round(100 - plagiarismScore)
    });
    
    currentIndex += para.length + 2;
  });
  
  return sections;
}

// =============================================================================
// COMPARISON & HIGHLIGHTING
// =============================================================================

/**
 * Compare two texts
 */
export function compareTexts(text1: string, text2: string): ComparisonResult {
  const similarity = calculateCosineSimilarity(text1, text2);
  const matchType = determineMatchType(similarity, text1, text2);
  
  // Find differences (simplified)
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  const differences: ComparisonResult['differences'] = [];
  
  // Very basic diff
  words1.forEach((word, i) => {
    if (i < words2.length && word !== words2[i]) {
      differences.push({
        type: 'modified',
        text: `${word} → ${words2[i]}`,
        position: i
      });
    }
  });
  
  return {
    text1,
    text2,
    similarity: Math.round(similarity),
    matchType,
    differences
  };
}

/**
 * Create highlighted document
 */
export function createHighlightedDocument(
  content: string,
  matches: PlagiarismMatch[]
): DocumentHighlight {
  const highlights: HighlightRange[] = matches.map(m => ({
    startIndex: m.startIndex,
    endIndex: m.endIndex,
    type: m.matchType,
    severity: m.severity,
    matchId: m.id
  }));
  
  // Sort by position
  highlights.sort((a, b) => a.startIndex - b.startIndex);
  
  // Generate HTML with highlights
  let html = '';
  let lastIndex = 0;
  
  highlights.forEach(h => {
    // Add text before highlight
    if (h.startIndex > lastIndex) {
      html += escapeHtml(content.substring(lastIndex, h.startIndex));
    }
    
    // Add highlighted text
    const severityClass = `plagiarism-${h.severity}`;
    const typeClass = `match-${h.type}`;
    html += `<mark class="${severityClass} ${typeClass}" data-match-id="${h.matchId}">`;
    html += escapeHtml(content.substring(h.startIndex, h.endIndex));
    html += '</mark>';
    
    lastIndex = h.endIndex;
  });
  
  // Add remaining text
  if (lastIndex < content.length) {
    html += escapeHtml(content.substring(lastIndex));
  }
  
  return {
    text: content,
    highlights,
    renderedHtml: html
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// =============================================================================
// EXPORT
// =============================================================================

/**
 * Export plagiarism report
 */
export function exportPlagiarismReport(
  analysis: PlagiarismAnalysis,
  format: 'markdown' | 'html' | 'json' | 'txt'
): string {
  if (format === 'json') {
    return JSON.stringify(analysis, null, 2);
  }
  
  if (format === 'markdown' || format === 'txt') {
    let report = `# Plagiarism Report\n\n`;
    report += `Generated: ${analysis.timestamp.toISOString()}\n`;
    report += `Duration: ${analysis.duration}ms\n\n`;
    
    report += `## Summary\n\n`;
    report += `- **Originality Score**: ${analysis.metrics.originalityScore}%\n`;
    report += `- **Risk Level**: ${analysis.summary.verdict}\n`;
    report += `- **Total Words**: ${analysis.metrics.totalWords}\n`;
    report += `- **Matches Found**: ${analysis.matches.length}\n\n`;
    
    report += `## Findings\n\n`;
    report += `${analysis.summary.mainFinding}\n\n`;
    
    if (analysis.summary.criticalIssues.length > 0) {
      report += `### Critical Issues\n`;
      analysis.summary.criticalIssues.forEach(i => {
        report += `- ⚠️ ${i}\n`;
      });
      report += '\n';
    }
    
    if (analysis.recommendations.length > 0) {
      report += `## Recommendations\n\n`;
      analysis.recommendations.forEach((rec, i) => {
        report += `${i + 1}. **${rec.title}** (${rec.priority})\n`;
        report += `   ${rec.description}\n\n`;
      });
    }
    
    if (analysis.matches.length > 0) {
      report += `## Matches\n\n`;
      analysis.matches.slice(0, 10).forEach((match, i) => {
        report += `### Match ${i + 1}\n`;
        report += `- **Type**: ${match.matchType}\n`;
        report += `- **Similarity**: ${match.similarity}%\n`;
        report += `- **Source**: ${match.source.domain}\n`;
        report += `- **Text**: "${match.originalText.substring(0, 100)}..."\n\n`;
      });
    }
    
    return report;
  }
  
  // HTML format
  return `<!DOCTYPE html>
<html>
<head>
  <title>Plagiarism Report</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .score { font-size: 48px; font-weight: bold; }
    .safe { color: green; }
    .risk { color: red; }
    .match { padding: 10px; border: 1px solid #ddd; margin: 10px 0; border-radius: 4px; }
    .critical { border-color: red; background: #fff0f0; }
    .high { border-color: orange; background: #fff8f0; }
  </style>
</head>
<body>
  <h1>Plagiarism Report</h1>
  <div class="score ${analysis.metrics.originalityScore >= 80 ? 'safe' : 'risk'}">
    ${analysis.metrics.originalityScore}% Original
  </div>
  <p>${analysis.summary.mainFinding}</p>
  <h2>Matches (${analysis.matches.length})</h2>
  ${analysis.matches.slice(0, 10).map(m => `
    <div class="match ${m.severity}">
      <strong>${m.similarity}% match</strong> (${m.matchType})
      <p>${m.originalText.substring(0, 150)}...</p>
      <small>Source: ${m.source.domain}</small>
    </div>
  `).join('')}
</body>
</html>`;
}

