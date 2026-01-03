/**
 * Topic Gap Analysis Utilities
 * 
 * Functions for identifying content gaps vs competitors:
 * - Topic extraction
 * - Gap identification
 * - Opportunity scoring
 */

import {
  Topic,
  TopicType,
  ContentDepth,
  TopicSection,
  TopicCluster,
  ContentGap,
  GapStatus,
  GapSeverity,
  GapSummary,
  CompetitorContent,
  CompetitorComparison,
  TopicGapMetrics,
  TopicGapAnalysis,
  TopicGapSummary,
  TopicRecommendation,
  QuickWin,
  TopicGapSettings,
  TopicGapExportFormat,
  DEFAULT_TOPIC_GAP_SETTINGS,
  GAP_SEVERITY_WEIGHTS
} from '@/src/features/ai-writer/types/tools/topic-gap.types';

// =============================================================================
// HELPERS
// =============================================================================

function generateId(): string {
  return `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getWordCount(text: string): number {
  return text.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
}

function determineDepth(wordCount: number, settings: TopicGapSettings): ContentDepth {
  if (wordCount >= settings.deepCoverageWordThreshold * 2) return 'comprehensive';
  if (wordCount >= settings.deepCoverageWordThreshold) return 'deep';
  if (wordCount >= settings.minWordCountForCoverage) return 'moderate';
  return 'surface';
}

// =============================================================================
// TOPIC EXTRACTION
// =============================================================================

/**
 * Common SEO/Content topics by category
 */
const TOPIC_PATTERNS: Record<string, Array<{ text: string; type: TopicType }>> = {
  general: [
    { text: 'benefits', type: 'subtopic' },
    { text: 'advantages', type: 'subtopic' },
    { text: 'disadvantages', type: 'subtopic' },
    { text: 'pros and cons', type: 'subtopic' },
    { text: 'how to', type: 'question' },
    { text: 'what is', type: 'question' },
    { text: 'why', type: 'question' },
    { text: 'best practices', type: 'subtopic' },
    { text: 'tips', type: 'subtopic' },
    { text: 'guide', type: 'subtopic' },
    { text: 'examples', type: 'subtopic' },
    { text: 'case study', type: 'subtopic' },
    { text: 'comparison', type: 'subtopic' },
    { text: 'alternatives', type: 'related' },
    { text: 'vs', type: 'related' },
    { text: 'tutorial', type: 'subtopic' },
    { text: 'step by step', type: 'subtopic' },
    { text: 'checklist', type: 'subtopic' },
    { text: 'tools', type: 'related' },
    { text: 'software', type: 'related' },
    { text: 'cost', type: 'subtopic' },
    { text: 'pricing', type: 'subtopic' },
    { text: 'free', type: 'long_tail' },
    { text: 'review', type: 'subtopic' },
    { text: 'statistics', type: 'subtopic' },
    { text: 'trends', type: 'subtopic' }
  ],
  seo: [
    { text: 'keyword research', type: 'main' },
    { text: 'on-page seo', type: 'main' },
    { text: 'off-page seo', type: 'main' },
    { text: 'technical seo', type: 'main' },
    { text: 'backlinks', type: 'subtopic' },
    { text: 'content optimization', type: 'subtopic' },
    { text: 'site speed', type: 'subtopic' },
    { text: 'mobile optimization', type: 'subtopic' },
    { text: 'schema markup', type: 'subtopic' },
    { text: 'internal linking', type: 'subtopic' },
    { text: 'meta tags', type: 'subtopic' },
    { text: 'title tags', type: 'subtopic' },
    { text: 'meta descriptions', type: 'subtopic' },
    { text: 'serp', type: 'related' },
    { text: 'rankings', type: 'subtopic' },
    { text: 'organic traffic', type: 'subtopic' }
  ]
};

/**
 * Extract topics from content
 */
export function extractTopics(
  content: string,
  keyword: string,
  settings: TopicGapSettings = DEFAULT_TOPIC_GAP_SETTINGS
): Topic[] {
  const topics: Map<string, Topic> = new Map();
  const textContent = content.replace(/<[^>]+>/g, ' ');
  const normalizedKeyword = normalizeText(keyword);
  
  // Add main keyword as topic
  const mainTopic: Topic = {
    id: generateId(),
    text: keyword,
    normalizedText: normalizedKeyword,
    type: 'main',
    relevance: 100,
    yourCoverage: 'none',
    competitorCoverage: 'none',
    wordCount: 0,
    sections: [],
    relatedTopics: [],
    questions: [],
    competitorsWithTopic: [],
    avgCompetitorDepth: 'none'
  };
  
  // Count keyword occurrences and calculate coverage
  const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
  const matches = textContent.match(keywordRegex);
  if (matches) {
    mainTopic.wordCount = matches.length * 50; // Estimate context words
    mainTopic.yourCoverage = determineDepth(mainTopic.wordCount, settings);
  }
  
  topics.set(normalizedKeyword, mainTopic);
  
  // Extract topics based on patterns
  const allPatterns = [
    ...TOPIC_PATTERNS.general,
    ...(TOPIC_PATTERNS[settings.industry || ''] || [])
  ];
  
  for (const pattern of allPatterns) {
    const topicText = `${keyword} ${pattern.text}`;
    const normalized = normalizeText(topicText);
    
    if (topics.has(normalized)) continue;
    
    const regex = new RegExp(`\\b${pattern.text}\\b`, 'gi');
    const found = regex.test(textContent);
    
    const topic: Topic = {
      id: generateId(),
      text: topicText,
      normalizedText: normalized,
      type: pattern.type,
      parentId: mainTopic.id,
      relevance: 60 + Math.random() * 30,
      yourCoverage: found ? 'moderate' : 'none',
      competitorCoverage: 'none',
      wordCount: found ? 100 : 0,
      sections: [],
      relatedTopics: [],
      questions: [],
      competitorsWithTopic: [],
      avgCompetitorDepth: 'none'
    };
    
    topics.set(normalized, topic);
  }
  
  // Extract questions
  if (settings.includeQuestions) {
    const questionPatterns = [
      `what is ${keyword}`,
      `how does ${keyword} work`,
      `why use ${keyword}`,
      `when to use ${keyword}`,
      `how to choose ${keyword}`,
      `${keyword} vs`,
      `best ${keyword}`,
      `${keyword} for beginners`,
      `${keyword} examples`,
      `${keyword} mistakes`
    ];
    
    for (const question of questionPatterns) {
      const normalized = normalizeText(question);
      if (topics.has(normalized)) continue;
      
      const found = textContent.toLowerCase().includes(question.toLowerCase());
      
      topics.set(normalized, {
        id: generateId(),
        text: question,
        normalizedText: normalized,
        type: 'question',
        parentId: mainTopic.id,
        relevance: 50 + Math.random() * 30,
        yourCoverage: found ? 'moderate' : 'none',
        competitorCoverage: 'none',
        wordCount: found ? 80 : 0,
        sections: [],
        relatedTopics: [],
        questions: [],
        competitorsWithTopic: [],
        avgCompetitorDepth: 'none'
      });
    }
  }
  
  // Extract headings as topics
  const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const headingText = match[1].replace(/<[^>]+>/g, '').trim();
    if (headingText.length < 3) continue;
    
    const normalized = normalizeText(headingText);
    if (topics.has(normalized)) continue;
    
    topics.set(normalized, {
      id: generateId(),
      text: headingText,
      normalizedText: normalized,
      type: 'subtopic',
      relevance: 70,
      yourCoverage: 'deep',
      competitorCoverage: 'none',
      wordCount: 150,
      sections: [{
        heading: headingText,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
        wordCount: 150,
        depth: 'moderate'
      }],
      relatedTopics: [],
      questions: [],
      competitorsWithTopic: [],
      avgCompetitorDepth: 'none'
    });
  }
  
  // Filter and sort
  return Array.from(topics.values())
    .filter(t => t.relevance >= settings.minRelevance)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, settings.maxTopics);
}

// =============================================================================
// GAP IDENTIFICATION
// =============================================================================

/**
 * Identify content gaps
 */
export function identifyGaps(
  topics: Topic[],
  settings: TopicGapSettings
): ContentGap[] {
  const gaps: ContentGap[] = [];
  
  for (const topic of topics) {
    // Missing topics
    if (topic.yourCoverage === 'none') {
      const severity = determineSeverity(topic);
      
      gaps.push({
        id: generateId(),
        topic: topic.text,
        type: topic.type,
        status: 'missing',
        severity,
        opportunityScore: calculateOpportunityScore(topic, 'missing'),
        searchVolume: topic.searchVolume,
        difficulty: topic.difficulty,
        reason: `"${topic.text}" is not covered in your content`,
        competitorsWithTopic: topic.competitorsWithTopic,
        avgCompetitorWords: 150,
        suggestedContent: `Add a section covering ${topic.text}`,
        suggestedWordCount: 150,
        questionsToAnswer: topic.questions,
        priority: GAP_SEVERITY_WEIGHTS[severity],
        effort: topic.type === 'main' ? 'high' : topic.type === 'subtopic' ? 'medium' : 'low',
        impact: severity === 'critical' ? 'high' : severity === 'high' ? 'medium' : 'low'
      });
    }
    
    // Undercovered topics
    else if (topic.yourCoverage === 'surface' && topic.type !== 'long_tail') {
      gaps.push({
        id: generateId(),
        topic: topic.text,
        type: topic.type,
        status: 'undercovered',
        severity: 'medium',
        opportunityScore: calculateOpportunityScore(topic, 'undercovered'),
        searchVolume: topic.searchVolume,
        difficulty: topic.difficulty,
        reason: `"${topic.text}" needs more depth`,
        competitorsWithTopic: topic.competitorsWithTopic,
        avgCompetitorWords: 200,
        suggestedContent: `Expand the section on ${topic.text}`,
        suggestedWordCount: 100,
        questionsToAnswer: topic.questions,
        priority: 2,
        effort: 'low',
        impact: 'medium'
      });
    }
  }
  
  // Sort by priority
  return gaps.sort((a, b) => b.priority - a.priority || b.opportunityScore - a.opportunityScore);
}

function determineSeverity(topic: Topic): GapSeverity {
  if (topic.type === 'main') return 'critical';
  if (topic.relevance >= 80) return 'high';
  if (topic.relevance >= 60) return 'medium';
  return 'low';
}

function calculateOpportunityScore(topic: Topic, status: GapStatus): number {
  let score = topic.relevance;
  
  if (topic.searchVolume) {
    score += Math.min(20, topic.searchVolume / 1000);
  }
  
  if (topic.competitorsWithTopic.length > 2) {
    score += 15;
  }
  
  if (status === 'missing') {
    score += 10;
  }
  
  return Math.min(100, Math.round(score));
}

// =============================================================================
// CLUSTERING
// =============================================================================

/**
 * Create topic clusters
 */
export function createTopicClusters(topics: Topic[]): TopicCluster[] {
  const clusters: TopicCluster[] = [];
  const mainTopics = topics.filter(t => t.type === 'main');
  
  for (const mainTopic of mainTopics) {
    const subtopics = topics.filter(
      t => t.parentId === mainTopic.id || 
           (t.type === 'subtopic' && t.normalizedText.includes(mainTopic.normalizedText))
    );
    
    const coveredSubtopics = subtopics.filter(t => t.yourCoverage !== 'none');
    const yourCoverage = subtopics.length > 0 
      ? Math.round((coveredSubtopics.length / subtopics.length) * 100)
      : 0;
    
    // Simulate competitor coverage
    const competitorCoverage = 70 + Math.random() * 20;
    
    clusters.push({
      id: generateId(),
      mainTopic: mainTopic.text,
      subtopics: subtopics.map(t => t.text),
      yourCoverage,
      competitorCoverage: Math.round(competitorCoverage),
      gapPercentage: Math.max(0, Math.round(competitorCoverage - yourCoverage)),
      opportunityScore: Math.round((competitorCoverage - yourCoverage) * 0.8)
    });
  }
  
  return clusters;
}

// =============================================================================
// METRICS CALCULATION
// =============================================================================

/**
 * Calculate topic gap metrics
 */
export function calculateTopicGapMetrics(
  topics: Topic[],
  gaps: ContentGap[],
  clusters: TopicCluster[]
): TopicGapMetrics {
  const topicsCovered = topics.filter(t => t.yourCoverage !== 'none').length;
  const topicsMissing = topics.filter(t => t.yourCoverage === 'none').length;
  const topicsUndercovered = topics.filter(t => t.yourCoverage === 'surface').length;
  
  const coverageRatio = topics.length > 0 ? topicsCovered / topics.length : 0;
  const overallScore = Math.round(coverageRatio * 100);
  
  // Calculate depth score
  const depthScores: number[] = topics
    .filter(t => t.yourCoverage !== 'none')
    .map(t => {
      switch (t.yourCoverage) {
        case 'comprehensive': return 100;
        case 'deep': return 80;
        case 'moderate': return 60;
        case 'surface': return 30;
        default: return 0;
      }
    });
  
  const depthScore = depthScores.length > 0
    ? Math.round(depthScores.reduce((a, b) => a + b, 0) / depthScores.length)
    : 0;
  
  // Calculate competitor parity
  const competitorParity = clusters.length > 0
    ? Math.round(clusters.reduce((sum, c) => sum + (100 - c.gapPercentage), 0) / clusters.length)
    : 70;
  
  // Calculate opportunity score
  const opportunityScore = gaps.length > 0
    ? Math.round(gaps.reduce((sum, g) => sum + g.opportunityScore, 0) / gaps.length)
    : 0;
  
  const criticalGaps = gaps.filter(g => g.severity === 'critical').length;
  const clustersWithGaps = clusters.filter(c => c.gapPercentage > 20).length;
  
  return {
    overallScore,
    totalTopics: topics.length,
    topicsCovered,
    topicsMissing,
    topicsUndercovered,
    competitorParity,
    depthScore,
    opportunityScore,
    wordCountGap: topicsMissing * 150,
    topicGapPercentage: topics.length > 0 
      ? Math.round((topicsMissing / topics.length) * 100) 
      : 0,
    clustersWithGaps,
    totalGaps: gaps.length,
    criticalGaps
  };
}

// =============================================================================
// RECOMMENDATIONS
// =============================================================================

/**
 * Generate recommendations
 */
export function generateTopicRecommendations(
  gaps: ContentGap[],
  topics: Topic[]
): TopicRecommendation[] {
  const recommendations: TopicRecommendation[] = [];
  
  // Prioritize critical gaps
  const criticalGaps = gaps.filter(g => g.severity === 'critical');
  for (const gap of criticalGaps.slice(0, 3)) {
    recommendations.push({
      id: generateId(),
      type: 'add_topic',
      topic: gap.topic,
      title: `Add missing critical topic: ${gap.topic}`,
      description: `This topic is essential for comprehensive coverage.`,
      impact: 'critical',
      effort: gap.effort,
      suggestedOutline: [
        `Introduction to ${gap.topic}`,
        `Key concepts`,
        `How to apply`,
        `Examples`
      ],
      questions: gap.questionsToAnswer,
      suggestedWordCount: gap.suggestedWordCount,
      priority: 1
    });
  }
  
  // Expand undercovered topics
  const undercovered = gaps.filter(g => g.status === 'undercovered');
  for (const gap of undercovered.slice(0, 3)) {
    recommendations.push({
      id: generateId(),
      type: 'expand_topic',
      topic: gap.topic,
      title: `Expand coverage of: ${gap.topic}`,
      description: gap.reason,
      impact: gap.severity,
      effort: 'low',
      suggestedWordCount: gap.suggestedWordCount,
      priority: 2
    });
  }
  
  // Add sections for high-priority gaps
  const highGaps = gaps.filter(g => g.severity === 'high' && g.status === 'missing');
  for (const gap of highGaps.slice(0, 3)) {
    recommendations.push({
      id: generateId(),
      type: 'add_section',
      topic: gap.topic,
      title: `Create new section: ${gap.topic}`,
      description: `Competitors cover this topic. Adding it will improve competitiveness.`,
      impact: 'high',
      effort: gap.effort,
      suggestedOutline: [`What is ${gap.topic}`, 'Why it matters', 'How to implement'],
      suggestedWordCount: gap.suggestedWordCount,
      priority: 3
    });
  }
  
  // Answer questions
  const questionTopics = topics.filter(t => t.type === 'question' && t.yourCoverage === 'none');
  for (const topic of questionTopics.slice(0, 2)) {
    recommendations.push({
      id: generateId(),
      type: 'answer_question',
      topic: topic.text,
      title: `Answer: ${topic.text}`,
      description: 'Adding Q&A content improves featured snippet chances.',
      impact: 'medium',
      effort: 'low',
      suggestedWordCount: 100,
      priority: 4
    });
  }
  
  return recommendations.sort((a, b) => a.priority - b.priority);
}

/**
 * Generate quick wins
 */
export function generateQuickWins(gaps: ContentGap[]): QuickWin[] {
  const quickWins: QuickWin[] = [];
  
  const easyGaps = gaps.filter(g => g.effort === 'low' && g.suggestedWordCount <= 150);
  
  for (const gap of easyGaps.slice(0, 5)) {
    quickWins.push({
      topic: gap.topic,
      action: gap.status === 'missing' ? `Add brief section on ${gap.topic}` : `Expand ${gap.topic}`,
      wordCount: gap.suggestedWordCount,
      impact: gap.severity
    });
  }
  
  return quickWins;
}

// =============================================================================
// SUMMARY GENERATION
// =============================================================================

/**
 * Generate analysis summary
 */
export function generateTopicGapSummary(
  metrics: TopicGapMetrics,
  gaps: ContentGap[],
  quickWins: QuickWin[]
): TopicGapSummary {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const topOpportunities: string[] = [];
  
  // Analyze strengths
  if (metrics.overallScore >= 80) {
    strengths.push('Excellent topic coverage');
  }
  if (metrics.depthScore >= 70) {
    strengths.push('Good content depth on covered topics');
  }
  if (metrics.competitorParity >= 80) {
    strengths.push('Competitive with top-ranking content');
  }
  if (metrics.criticalGaps === 0) {
    strengths.push('No critical topic gaps');
  }
  
  // Analyze weaknesses
  if (metrics.topicsMissing > 5) {
    weaknesses.push(`${metrics.topicsMissing} topics are completely missing`);
  }
  if (metrics.topicsUndercovered > 3) {
    weaknesses.push(`${metrics.topicsUndercovered} topics need more depth`);
  }
  if (metrics.criticalGaps > 0) {
    weaknesses.push(`${metrics.criticalGaps} critical topic gaps to address`);
  }
  if (metrics.wordCountGap > 500) {
    weaknesses.push(`Content is ~${metrics.wordCountGap} words shorter than needed`);
  }
  
  // Top opportunities
  const topGaps = gaps.slice(0, 3);
  for (const gap of topGaps) {
    topOpportunities.push(`Add ${gap.topic} (+${gap.suggestedWordCount} words)`);
  }
  
  // Determine verdict
  let verdict: TopicGapSummary['verdict'];
  if (metrics.overallScore >= 85) verdict = 'excellent';
  else if (metrics.overallScore >= 70) verdict = 'good';
  else if (metrics.overallScore >= 55) verdict = 'average';
  else if (metrics.overallScore >= 40) verdict = 'needs_work';
  else verdict = 'poor';
  
  // Main finding
  const mainFinding = metrics.overallScore >= 70
    ? `Good topic coverage with ${metrics.topicsCovered}/${metrics.totalTopics} topics covered.`
    : `Topic coverage needs improvement. ${metrics.topicsMissing} topics are missing.`;
  
  return {
    mainFinding,
    strengths,
    weaknesses,
    topOpportunities,
    verdict,
    estimatedWordsToAdd: metrics.wordCountGap
  };
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Perform full topic gap analysis
 */
export function analyzeTopicGaps(
  content: string,
  keyword: string,
  settings: TopicGapSettings = DEFAULT_TOPIC_GAP_SETTINGS
): TopicGapAnalysis {
  const yourWordCount = getWordCount(content);
  
  // Extract topics
  const topics = extractTopics(content, keyword, settings);
  
  // Create clusters
  const clusters = createTopicClusters(topics);
  
  // Identify gaps
  const gaps = identifyGaps(topics, settings);
  
  // Calculate metrics
  const metrics = calculateTopicGapMetrics(topics, gaps, clusters);
  
  // Generate gap summary
  const gapSummary: GapSummary = {
    critical: gaps.filter(g => g.severity === 'critical').length,
    high: gaps.filter(g => g.severity === 'high').length,
    medium: gaps.filter(g => g.severity === 'medium').length,
    low: gaps.filter(g => g.severity === 'low').length,
    total: gaps.length
  };
  
  // Generate recommendations
  const recommendations = generateTopicRecommendations(gaps, topics);
  
  // Generate quick wins
  const quickWins = generateQuickWins(gaps);
  
  // Generate summary
  const summary = generateTopicGapSummary(metrics, gaps, quickWins);
  
  // Competitor comparison (simulated)
  const comparison: CompetitorComparison = {
    yourContent: {
      wordCount: yourWordCount,
      topicCount: topics.filter(t => t.yourCoverage !== 'none').length,
      depth: yourWordCount > 2000 ? 'comprehensive' : yourWordCount > 1000 ? 'deep' : 'moderate',
      coverageScore: metrics.overallScore
    },
    avgCompetitor: {
      wordCount: yourWordCount + metrics.wordCountGap,
      topicCount: topics.length,
      depth: 'deep',
      coverageScore: Math.min(100, metrics.overallScore + 15)
    },
    gaps,
    uniqueToYou: topics.filter(t => t.yourCoverage !== 'none' && t.competitorsWithTopic.length === 0).map(t => t.text),
    commonToAll: topics.filter(t => t.competitorsWithTopic.length >= 2).map(t => t.text)
  };
  
  return {
    timestamp: new Date(),
    keyword,
    yourWordCount,
    metrics,
    topics,
    clusters,
    gaps,
    gapSummary,
    competitorData: [], // Would be populated with real competitor data
    comparison,
    recommendations,
    summary,
    quickWins
  };
}

// =============================================================================
// EXPORT
// =============================================================================

/**
 * Export topic gap report
 */
export function exportTopicGapReport(
  analysis: TopicGapAnalysis,
  format: TopicGapExportFormat = 'markdown'
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(analysis, null, 2);
      
    case 'csv':
      const headers = ['Topic', 'Type', 'Status', 'Severity', 'Opportunity', 'Words to Add'];
      const rows = analysis.gaps.map(g => [
        g.topic, g.type, g.status, g.severity, 
        g.opportunityScore.toString(), g.suggestedWordCount.toString()
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
    case 'markdown':
    default:
      return `# Topic Gap Analysis Report

## Summary
- **Keyword:** ${analysis.keyword}
- **Coverage Score:** ${analysis.metrics.overallScore}/100
- **Verdict:** ${analysis.summary.verdict}
- **Topics Covered:** ${analysis.metrics.topicsCovered}/${analysis.metrics.totalTopics}
- **Total Gaps:** ${analysis.metrics.totalGaps}

## Key Finding
${analysis.summary.mainFinding}

## Gap Summary
- Critical: ${analysis.gapSummary.critical}
- High: ${analysis.gapSummary.high}
- Medium: ${analysis.gapSummary.medium}
- Low: ${analysis.gapSummary.low}

## Strengths
${analysis.summary.strengths.map(s => `- ${s}`).join('\n') || '- None identified'}

## Weaknesses
${analysis.summary.weaknesses.map(w => `- ${w}`).join('\n') || '- None identified'}

## Quick Wins
${analysis.quickWins.map(q => `- ${q.action} (+${q.wordCount} words)`).join('\n') || '- None identified'}

## Top Recommendations
${analysis.recommendations.slice(0, 5).map((r, i) => 
  `### ${i + 1}. ${r.title}\n${r.description}\n*Word count:* ${r.suggestedWordCount}`
).join('\n\n')}

---
Generated: ${analysis.timestamp.toISOString()}
`;
  }
}

