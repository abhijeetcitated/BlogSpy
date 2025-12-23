/**
 * AI Content Detector Utilities
 * 
 * Comprehensive AI-generated content detection functions
 */

import {
  AIDetectionAnalysis,
  AIDetectionMetrics,
  AIDetectionSummary,
  AIDetectionRecommendation,
  AIDetectionSettings,
  SectionAnalysis,
  AIIndicator,
  PatternAnalysis,
  VocabularyAnalysis,
  SentenceAnalysis,
  ProbableAIModel,
  TextSegment,
  HighlightedSection,
  AIDetectionResult,
  ConfidenceLevel,
  TextPattern,
  RiskLevel,
  AIModel,
  SectionType,
  DEFAULT_AI_DETECTION_SETTINGS,
  AI_DETECTION_THRESHOLDS,
  CONFIDENCE_THRESHOLDS,
  COMMON_AI_PHRASES,
  COMMON_AI_TRANSITIONS,
  AI_SENTENCE_STARTERS
} from '@/src/features/ai-writer/types/tools/ai-detector.types';

// =============================================================================
// TEXT PROCESSING
// =============================================================================

/**
 * Split text into analyzable sections
 */
export function splitIntoSections(text: string): TextSegment[] {
  const paragraphs = text.split(/\n\n+/);
  const sections: TextSegment[] = [];
  let currentIndex = 0;
  
  paragraphs.forEach((para, index) => {
    const trimmed = para.trim();
    if (trimmed.length === 0) {
      currentIndex += para.length + 2;
      return;
    }
    
    // Determine section type
    let sectionType: SectionType = 'paragraph';
    if (/^#{1,6}\s/.test(trimmed)) {
      sectionType = 'heading';
    } else if (/^[-*]\s|^\d+\.\s/.test(trimmed)) {
      sectionType = 'list';
    } else if (/^["'>]/.test(trimmed) || /^>\s/.test(trimmed)) {
      sectionType = 'quote';
    } else if (/^```|^`/.test(trimmed)) {
      sectionType = 'code';
    }
    
    sections.push({
      id: `section-${index}`,
      text: trimmed,
      startIndex: currentIndex,
      endIndex: currentIndex + trimmed.length,
      wordCount: trimmed.split(/\s+/).filter(w => w.length > 0).length,
      sectionType
    });
    
    currentIndex += para.length + 2;
  });
  
  return sections;
}

/**
 * Extract sentences from text
 */
export function extractSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
}

/**
 * Calculate word statistics
 */
export function calculateWordStats(text: string): {
  totalWords: number;
  uniqueWords: number;
  averageLength: number;
  complexWords: number;
} {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const uniqueWords = new Set(words);
  const totalLength = words.reduce((sum, w) => sum + w.length, 0);
  const complexWords = words.filter(w => w.length > 8).length;
  
  return {
    totalWords: words.length,
    uniqueWords: uniqueWords.size,
    averageLength: words.length > 0 ? totalLength / words.length : 0,
    complexWords
  };
}

// =============================================================================
// DETECTION ALGORITHMS
// =============================================================================

/**
 * Calculate burstiness score (variance in sentence lengths)
 * AI text tends to have uniform sentence lengths (low burstiness)
 * Human text has more varied sentence lengths (high burstiness)
 */
export function calculateBurstiness(text: string): number {
  const sentences = extractSentences(text);
  if (sentences.length < 2) return 50;
  
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
  
  // Normalize: higher CV = more human-like (higher burstiness)
  return Math.min(100, Math.max(0, cv * 2));
}

/**
 * Calculate perplexity score (how predictable the text is)
 * AI text tends to be more predictable (lower perplexity)
 */
export function calculatePerplexity(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length < 3) return 50;
  
  // Simple bigram-based perplexity approximation
  const bigrams = new Map<string, number>();
  const unigramCounts = new Map<string, number>();
  
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    unigramCounts.set(words[i], (unigramCounts.get(words[i]) || 0) + 1);
  }
  
  // Calculate transition probabilities
  let logProb = 0;
  let count = 0;
  
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    const bigramCount = bigrams.get(bigram) || 0;
    const unigramCount = unigramCounts.get(words[i]) || 0;
    
    if (unigramCount > 0 && bigramCount > 0) {
      logProb += Math.log(bigramCount / unigramCount);
      count++;
    }
  }
  
  // Normalize perplexity score (inverted - lower is more AI-like)
  const avgLogProb = count > 0 ? logProb / count : 0;
  const normalizedPerplexity = Math.max(0, Math.min(100, 50 + avgLogProb * 20));
  
  return normalizedPerplexity;
}

/**
 * Calculate repetition index
 * AI text often has more repetitive patterns
 */
export function calculateRepetitionIndex(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length < 10) return 0;
  
  // Check for repeated phrases (3-grams)
  const trigrams = new Map<string, number>();
  for (let i = 0; i < words.length - 2; i++) {
    const trigram = words.slice(i, i + 3).join(' ');
    trigrams.set(trigram, (trigrams.get(trigram) || 0) + 1);
  }
  
  // Count repeated trigrams
  const repeatedCount = Array.from(trigrams.values()).filter(c => c > 1).length;
  const repetitionRatio = trigrams.size > 0 ? repeatedCount / trigrams.size : 0;
  
  return Math.min(100, repetitionRatio * 200);
}

/**
 * Check for common AI phrases
 */
export function detectAIPhrases(text: string): { phrase: string; count: number }[] {
  const lowerText = text.toLowerCase();
  const found: { phrase: string; count: number }[] = [];
  
  COMMON_AI_PHRASES.forEach(phrase => {
    const regex = new RegExp(phrase.toLowerCase(), 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      found.push({ phrase, count: matches.length });
    }
  });
  
  return found;
}

/**
 * Check for AI transitions
 */
export function detectAITransitions(text: string): number {
  const sentences = extractSentences(text);
  let transitionCount = 0;
  
  sentences.forEach(sentence => {
    const firstWord = sentence.trim().split(/\s+/)[0]?.toLowerCase();
    if (COMMON_AI_TRANSITIONS.includes(firstWord)) {
      transitionCount++;
    }
  });
  
  return sentences.length > 0 ? (transitionCount / sentences.length) * 100 : 0;
}

/**
 * Detect AI sentence starters
 */
export function detectAISentenceStarters(text: string): number {
  const sentences = extractSentences(text);
  let aiStarterCount = 0;
  
  sentences.forEach(sentence => {
    const start = sentence.trim().substring(0, 15);
    if (AI_SENTENCE_STARTERS.some(starter => start.startsWith(starter))) {
      aiStarterCount++;
    }
  });
  
  return sentences.length > 0 ? (aiStarterCount / sentences.length) * 100 : 0;
}

/**
 * Analyze vocabulary diversity
 */
export function analyzeVocabulary(text: string): VocabularyAnalysis {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const uniqueWords = new Set(words);
  const totalLength = words.reduce((sum, w) => sum + w.length, 0);
  
  // Find common AI words
  const commonAIWordsList = [
    'furthermore', 'moreover', 'however', 'therefore', 'consequently',
    'subsequently', 'additionally', 'nevertheless', 'accordingly', 'hence',
    'crucial', 'essential', 'significant', 'paramount', 'pivotal',
    'comprehensive', 'robust', 'seamless', 'optimal', 'cutting-edge'
  ];
  
  const commonAIWords = words.filter(w => commonAIWordsList.includes(w));
  const uncommonWords = words.filter(w => 
    w.length > 10 && !commonAIWordsList.includes(w)
  );
  
  return {
    uniqueWords: uniqueWords.size,
    totalWords: words.length,
    richness: words.length > 0 ? (uniqueWords.size / words.length) * 100 : 0,
    commonAIWords: [...new Set(commonAIWords)],
    uncommonWords: [...new Set(uncommonWords)].slice(0, 10),
    averageWordLength: words.length > 0 ? totalLength / words.length : 0,
    complexWordRatio: words.length > 0 
      ? (words.filter(w => w.length > 8).length / words.length) * 100 
      : 0
  };
}

/**
 * Analyze sentence structure
 */
export function analyzeSentences(text: string): SentenceAnalysis {
  const sentences = extractSentences(text);
  const lengths = sentences.map(s => s.split(/\s+/).length);
  
  const mean = lengths.length > 0 
    ? lengths.reduce((a, b) => a + b, 0) / lengths.length 
    : 0;
  
  const variance = lengths.length > 0
    ? lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length
    : 0;
  
  const questions = sentences.filter(s => s.trim().endsWith('?')).length;
  const exclamations = sentences.filter(s => s.trim().endsWith('!')).length;
  
  return {
    totalSentences: sentences.length,
    averageLength: mean,
    lengthVariance: variance,
    shortSentences: lengths.filter(l => l < 8).length,
    longSentences: lengths.filter(l => l > 25).length,
    questionRatio: sentences.length > 0 ? (questions / sentences.length) * 100 : 0,
    exclamationRatio: sentences.length > 0 ? (exclamations / sentences.length) * 100 : 0
  };
}

/**
 * Determine text pattern
 */
export function determinePattern(section: TextSegment): TextPattern[] {
  const patterns: TextPattern[] = [];
  const text = section.text;
  
  // Check for formulaic patterns
  const aiPhrases = detectAIPhrases(text);
  if (aiPhrases.length > 2) {
    patterns.push('formulaic');
  }
  
  // Check for repetitive patterns
  const repetition = calculateRepetitionIndex(text);
  if (repetition > 30) {
    patterns.push('repetitive');
  }
  
  // Check for mechanical structure
  const sentences = extractSentences(text);
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const variance = lengths.reduce((sum, l, _, arr) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return sum + Math.pow(l - mean, 2);
  }, 0) / lengths.length;
  
  if (variance < 15) {
    patterns.push('mechanical');
  }
  
  // Check for creative elements
  const hasQuestions = sentences.some(s => s.endsWith('?'));
  const hasExclamations = sentences.some(s => s.endsWith('!'));
  const hasPersonalPronouns = /\b(I|we|my|our|me|us)\b/i.test(text);
  
  if ((hasQuestions && hasExclamations) || hasPersonalPronouns) {
    patterns.push('creative');
  }
  
  // Default to natural if no specific patterns
  if (patterns.length === 0) {
    patterns.push('natural');
  }
  
  return patterns;
}

// =============================================================================
// SECTION ANALYSIS
// =============================================================================

/**
 * Analyze a single section
 */
export function analyzeSection(section: TextSegment): SectionAnalysis {
  const text = section.text;
  
  // Calculate base metrics
  const burstiness = calculateBurstiness(text);
  const perplexity = calculatePerplexity(text);
  const repetition = calculateRepetitionIndex(text);
  const aiPhrases = detectAIPhrases(text);
  const aiTransitions = detectAITransitions(text);
  const aiStarters = detectAISentenceStarters(text);
  const vocab = analyzeVocabulary(text);
  
  // Build indicators
  const indicators: AIIndicator[] = [];
  
  // AI phrase indicator
  if (aiPhrases.length > 0) {
    indicators.push({
      id: 'ai-phrases',
      type: 'vocabulary',
      name: 'Common AI Phrases',
      description: `Found ${aiPhrases.length} common AI phrases`,
      weight: 25,
      detected: true,
      confidence: Math.min(95, 50 + aiPhrases.length * 15),
      examples: aiPhrases.slice(0, 3).map(p => p.phrase)
    });
  }
  
  // Low burstiness indicator
  if (burstiness < 30) {
    indicators.push({
      id: 'low-burstiness',
      type: 'structure',
      name: 'Uniform Sentence Length',
      description: 'Sentence lengths are very uniform (typical of AI)',
      weight: 20,
      detected: true,
      confidence: 70,
      examples: []
    });
  }
  
  // High transition usage
  if (aiTransitions > 20) {
    indicators.push({
      id: 'transitions',
      type: 'style',
      name: 'Frequent Transitions',
      description: 'High use of transitional phrases',
      weight: 15,
      detected: true,
      confidence: 60,
      examples: []
    });
  }
  
  // Repetition indicator
  if (repetition > 25) {
    indicators.push({
      id: 'repetition',
      type: 'pattern',
      name: 'Repetitive Patterns',
      description: 'Detected repetitive phrase patterns',
      weight: 20,
      detected: true,
      confidence: 65,
      examples: []
    });
  }
  
  // Low vocabulary richness
  if (vocab.richness < 50) {
    indicators.push({
      id: 'vocab-richness',
      type: 'vocabulary',
      name: 'Limited Vocabulary',
      description: 'Lower vocabulary diversity than typical human writing',
      weight: 15,
      detected: true,
      confidence: 55,
      examples: []
    });
  }
  
  // Calculate AI score
  let aiScore = 0;
  aiScore += Math.max(0, 100 - burstiness) * 0.2; // Low burstiness = more AI
  aiScore += Math.max(0, 100 - perplexity) * 0.15; // Low perplexity = more AI
  aiScore += repetition * 0.15;
  aiScore += aiPhrases.length * 5;
  aiScore += aiTransitions * 0.3;
  aiScore += aiStarters * 0.2;
  aiScore += (100 - vocab.richness) * 0.1;
  
  aiScore = Math.min(100, Math.max(0, aiScore));
  const humanScore = 100 - aiScore;
  
  // Determine result
  let result: AIDetectionResult = 'uncertain';
  if (aiScore < AI_DETECTION_THRESHOLDS.human.max) {
    result = 'human';
  } else if (aiScore < AI_DETECTION_THRESHOLDS.mixed.max) {
    result = 'mixed';
  } else {
    result = 'ai_generated';
  }
  
  // Determine confidence
  const confidenceScore = Math.abs(50 - aiScore) * 2;
  let confidence: ConfidenceLevel = 'very_low';
  if (confidenceScore >= CONFIDENCE_THRESHOLDS.high) {
    confidence = 'high';
  } else if (confidenceScore >= CONFIDENCE_THRESHOLDS.medium) {
    confidence = 'medium';
  } else if (confidenceScore >= CONFIDENCE_THRESHOLDS.low) {
    confidence = 'low';
  }
  
  const patterns = determinePattern(section);
  
  return {
    id: section.id,
    text: section.text,
    startIndex: section.startIndex,
    endIndex: section.endIndex,
    wordCount: section.wordCount,
    sectionType: section.sectionType,
    aiScore: Math.round(aiScore),
    humanScore: Math.round(humanScore),
    result,
    confidence,
    patterns,
    indicators,
    burstiness: Math.round(burstiness),
    perplexity: Math.round(perplexity),
    repetitionScore: Math.round(repetition),
    vocabularyRichness: Math.round(vocab.richness)
  };
}

// =============================================================================
// MAIN ANALYSIS
// =============================================================================

/**
 * Perform complete AI detection analysis
 */
export function analyzeAIContent(
  content: string,
  settings: AIDetectionSettings = DEFAULT_AI_DETECTION_SETTINGS
): AIDetectionAnalysis {
  const startTime = Date.now();
  
  // Split into sections
  const segments = splitIntoSections(content);
  
  // Analyze each section
  const sections = segments.map(seg => analyzeSection(seg));
  
  // Calculate overall metrics
  const metrics = calculateOverallMetrics(content, sections);
  
  // Collect all indicators
  const allIndicators = sections.flatMap(s => s.indicators);
  const uniqueIndicators = Array.from(
    new Map(allIndicators.map(i => [i.id, i])).values()
  );
  
  // Analyze patterns
  const patterns = analyzePatterns(sections);
  
  // Vocabulary and sentence analysis
  const vocabulary = analyzeVocabulary(content);
  const sentences = analyzeSentences(content);
  
  // Generate summary and recommendations
  const summary = generateSummary(metrics, sections);
  const recommendations = generateRecommendations(metrics, sections);
  
  // Create highlighted content
  const highlightedContent = createHighlightedContent(content, sections);
  
  const duration = Date.now() - startTime;
  
  return {
    id: `ai-detection-${Date.now()}`,
    content,
    timestamp: new Date(),
    duration,
    metrics,
    sections,
    indicators: uniqueIndicators,
    patterns,
    vocabulary,
    sentences,
    summary,
    recommendations,
    highlightedContent
  };
}

/**
 * Calculate overall metrics from sections
 */
function calculateOverallMetrics(
  content: string,
  sections: SectionAnalysis[]
): AIDetectionMetrics {
  const totalWords = content.split(/\s+/).filter(w => w.length > 0).length;
  
  // Weighted average of AI scores
  const weightedSum = sections.reduce((sum, s) => sum + s.aiScore * s.wordCount, 0);
  const totalSectionWords = sections.reduce((sum, s) => sum + s.wordCount, 0);
  const overallAIScore = totalSectionWords > 0 
    ? Math.round(weightedSum / totalSectionWords) 
    : 0;
  const overallHumanScore = 100 - overallAIScore;
  
  // Overall confidence
  const avgConfidence = sections.reduce((sum, s) => {
    const confValue = s.confidence === 'high' ? 90 : 
                      s.confidence === 'medium' ? 70 :
                      s.confidence === 'low' ? 50 : 30;
    return sum + confValue;
  }, 0) / (sections.length || 1);
  
  let confidenceLevel: ConfidenceLevel = 'very_low';
  if (avgConfidence >= CONFIDENCE_THRESHOLDS.high) {
    confidenceLevel = 'high';
  } else if (avgConfidence >= CONFIDENCE_THRESHOLDS.medium) {
    confidenceLevel = 'medium';
  } else if (avgConfidence >= CONFIDENCE_THRESHOLDS.low) {
    confidenceLevel = 'low';
  }
  
  // Overall result
  let result: AIDetectionResult = 'uncertain';
  if (overallAIScore < AI_DETECTION_THRESHOLDS.human.max) {
    result = 'human';
  } else if (overallAIScore < AI_DETECTION_THRESHOLDS.mixed.max) {
    result = 'mixed';
  } else {
    result = 'ai_generated';
  }
  
  // Risk level
  let riskLevel: RiskLevel = 'safe';
  if (overallAIScore >= 80) {
    riskLevel = 'critical';
  } else if (overallAIScore >= 60) {
    riskLevel = 'high';
  } else if (overallAIScore >= 40) {
    riskLevel = 'moderate';
  } else if (overallAIScore >= 20) {
    riskLevel = 'low';
  }
  
  // Sections by result
  const sectionsByResult = {
    human: sections.filter(s => s.result === 'human').length,
    ai_generated: sections.filter(s => s.result === 'ai_generated').length,
    mixed: sections.filter(s => s.result === 'mixed').length,
    uncertain: sections.filter(s => s.result === 'uncertain').length
  };
  
  // Pattern distribution
  const patternDistribution: Record<TextPattern, number> = {
    natural: 0,
    formulaic: 0,
    repetitive: 0,
    mechanical: 0,
    creative: 0
  };
  
  sections.forEach(s => {
    s.patterns.forEach(p => {
      patternDistribution[p]++;
    });
  });
  
  // Aggregate metrics
  const avgBurstiness = sections.reduce((s, sec) => s + sec.burstiness, 0) / (sections.length || 1);
  const avgPerplexity = sections.reduce((s, sec) => s + sec.perplexity, 0) / (sections.length || 1);
  const avgRepetition = sections.reduce((s, sec) => s + sec.repetitionScore, 0) / (sections.length || 1);
  const avgVocab = sections.reduce((s, sec) => s + sec.vocabularyRichness, 0) / (sections.length || 1);
  
  // Probable AI models (simulated)
  const probableModels: ProbableAIModel[] = [];
  if (overallAIScore > 50) {
    probableModels.push({
      model: 'gpt4',
      probability: Math.min(95, overallAIScore + 10),
      characteristics: ['Structured paragraphs', 'Balanced transitions']
    });
    probableModels.push({
      model: 'claude',
      probability: Math.min(85, overallAIScore),
      characteristics: ['Detailed explanations', 'Formal tone']
    });
  }
  
  return {
    overallAIScore,
    overallHumanScore,
    confidence: Math.round(avgConfidence),
    confidenceLevel,
    result,
    riskLevel,
    totalWords,
    analyzedWords: totalSectionWords,
    totalSections: sections.length,
    sectionsByResult,
    patternDistribution,
    burstiness: Math.round(avgBurstiness),
    perplexity: Math.round(avgPerplexity),
    repetitionIndex: Math.round(avgRepetition),
    vocabularyDiversity: Math.round(avgVocab),
    probableModels
  };
}

/**
 * Analyze patterns across sections
 */
function analyzePatterns(sections: SectionAnalysis[]): PatternAnalysis[] {
  const patternMap = new Map<TextPattern, PatternAnalysis>();
  
  sections.forEach(section => {
    section.patterns.forEach(pattern => {
      const existing = patternMap.get(pattern);
      if (existing) {
        existing.frequency++;
        if (existing.examples.length < 3) {
          existing.examples.push(section.text.substring(0, 50) + '...');
        }
      } else {
        patternMap.set(pattern, {
          pattern,
          frequency: 1,
          examples: [section.text.substring(0, 50) + '...'],
          contribution: 0
        });
      }
    });
  });
  
  // Calculate contribution
  const total = sections.length || 1;
  patternMap.forEach(p => {
    p.contribution = Math.round((p.frequency / total) * 100);
  });
  
  return Array.from(patternMap.values())
    .sort((a, b) => b.frequency - a.frequency);
}

/**
 * Generate analysis summary
 */
function generateSummary(
  metrics: AIDetectionMetrics,
  sections: SectionAnalysis[]
): AIDetectionSummary {
  const keyIndicators: string[] = [];
  const concerns: string[] = [];
  const positives: string[] = [];
  
  // Key indicators
  if (metrics.burstiness < 30) {
    keyIndicators.push('Uniform sentence structure');
  }
  if (metrics.repetitionIndex > 25) {
    keyIndicators.push('Repetitive patterns detected');
  }
  if (metrics.vocabularyDiversity < 50) {
    keyIndicators.push('Limited vocabulary range');
  }
  
  // Concerns
  if (metrics.sectionsByResult.ai_generated > metrics.totalSections / 2) {
    concerns.push(`${metrics.sectionsByResult.ai_generated} sections appear AI-generated`);
  }
  if (metrics.overallAIScore > 70) {
    concerns.push('High probability of AI-generated content');
  }
  
  // Positives
  if (metrics.burstiness > 60) {
    positives.push('Natural sentence variation');
  }
  if (metrics.vocabularyDiversity > 70) {
    positives.push('Rich vocabulary usage');
  }
  if (metrics.sectionsByResult.human > metrics.totalSections / 2) {
    positives.push('Majority of content appears human-written');
  }
  
  // Main finding
  let mainFinding = '';
  if (metrics.result === 'human') {
    mainFinding = 'This content appears to be predominantly human-written with natural patterns.';
  } else if (metrics.result === 'ai_generated') {
    mainFinding = 'This content shows strong indicators of AI generation.';
  } else if (metrics.result === 'mixed') {
    mainFinding = 'This content appears to be a mix of human and AI-generated text.';
  } else {
    mainFinding = 'Analysis results are uncertain. Consider reviewing manually.';
  }
  
  return {
    verdict: metrics.result,
    confidence: metrics.confidenceLevel,
    mainFinding,
    keyIndicators,
    concerns,
    positives,
    estimatedAIPercentage: metrics.overallAIScore,
    estimatedHumanPercentage: metrics.overallHumanScore
  };
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  metrics: AIDetectionMetrics,
  sections: SectionAnalysis[]
): AIDetectionRecommendation[] {
  const recommendations: AIDetectionRecommendation[] = [];
  
  const aiSections = sections.filter(s => s.result === 'ai_generated');
  
  // Humanize AI sections
  if (aiSections.length > 0) {
    recommendations.push({
      id: 'humanize',
      type: 'humanize',
      priority: 'high',
      title: 'Humanize AI-Generated Sections',
      description: `${aiSections.length} sections show strong AI characteristics.`,
      affectedSections: aiSections.map(s => s.id),
      impact: 40,
      effort: 'significant',
      tips: [
        'Add personal anecdotes or experiences',
        'Include rhetorical questions',
        'Vary sentence lengths intentionally',
        'Add colloquial expressions'
      ]
    });
  }
  
  // Vary structure
  if (metrics.burstiness < 30) {
    recommendations.push({
      id: 'vary-structure',
      type: 'vary_structure',
      priority: 'medium',
      title: 'Vary Sentence Structure',
      description: 'Sentence lengths are too uniform.',
      affectedSections: sections.filter(s => s.burstiness < 30).map(s => s.id),
      impact: 25,
      effort: 'moderate',
      tips: [
        'Mix short punchy sentences with longer ones',
        'Use sentence fragments for emphasis',
        'Break up long sentences',
        'Start sentences differently'
      ]
    });
  }
  
  // Add personality
  if (metrics.patternDistribution.formulaic > metrics.totalSections / 3) {
    recommendations.push({
      id: 'add-personality',
      type: 'add_personality',
      priority: 'medium',
      title: 'Add Personal Voice',
      description: 'Content feels formulaic and impersonal.',
      affectedSections: sections.filter(s => s.patterns.includes('formulaic')).map(s => s.id),
      impact: 30,
      effort: 'moderate',
      tips: [
        'Share your unique perspective',
        'Include personal opinions',
        'Use humor where appropriate',
        'Add emotional language'
      ]
    });
  }
  
  // Add examples
  if (metrics.overallAIScore > 50) {
    recommendations.push({
      id: 'add-examples',
      type: 'add_examples',
      priority: 'low',
      title: 'Include Real Examples',
      description: 'Add specific examples to make content more authentic.',
      affectedSections: [],
      impact: 20,
      effort: 'minimal',
      tips: [
        'Include case studies',
        'Share real-world scenarios',
        'Reference specific data',
        'Tell stories'
      ]
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Create highlighted content HTML
 */
function createHighlightedContent(
  content: string,
  sections: SectionAnalysis[]
): string {
  let html = content;
  
  // Sort sections by position (reverse to maintain indices)
  const sortedSections = [...sections].sort((a, b) => b.startIndex - a.startIndex);
  
  sortedSections.forEach(section => {
    const colorClass = section.result === 'ai_generated' ? 'ai-generated' :
                       section.result === 'human' ? 'human-written' :
                       section.result === 'mixed' ? 'mixed-content' : 'uncertain';
    
    const before = html.substring(0, section.startIndex);
    const text = html.substring(section.startIndex, section.endIndex);
    const after = html.substring(section.endIndex);
    
    html = `${before}<span class="${colorClass}" data-ai-score="${section.aiScore}">${text}</span>${after}`;
  });
  
  return html;
}

/**
 * Get highlighted sections
 */
export function getHighlightedSections(
  content: string,
  sections: SectionAnalysis[]
): HighlightedSection[] {
  return sections.map(section => ({
    text: section.text,
    result: section.result,
    aiScore: section.aiScore,
    startIndex: section.startIndex,
    endIndex: section.endIndex
  }));
}

// =============================================================================
// EXPORT
// =============================================================================

/**
 * Export AI detection report
 */
export function exportAIDetectionReport(
  analysis: AIDetectionAnalysis,
  format: 'markdown' | 'html' | 'json'
): string {
  if (format === 'json') {
    return JSON.stringify(analysis, null, 2);
  }
  
  if (format === 'markdown') {
    let report = `# AI Content Detection Report\n\n`;
    report += `Generated: ${analysis.timestamp.toISOString()}\n\n`;
    
    report += `## Summary\n\n`;
    report += `- **Verdict**: ${analysis.summary.verdict}\n`;
    report += `- **Confidence**: ${analysis.summary.confidence}\n`;
    report += `- **AI Score**: ${analysis.metrics.overallAIScore}%\n`;
    report += `- **Human Score**: ${analysis.metrics.overallHumanScore}%\n\n`;
    
    report += `${analysis.summary.mainFinding}\n\n`;
    
    if (analysis.summary.keyIndicators.length > 0) {
      report += `### Key Indicators\n`;
      analysis.summary.keyIndicators.forEach(i => {
        report += `- ${i}\n`;
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
    
    return report;
  }
  
  // HTML format
  return `<!DOCTYPE html>
<html>
<head>
  <title>AI Detection Report</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 20px; }
    .score { font-size: 48px; font-weight: bold; }
    .human { color: green; }
    .ai { color: red; }
    .mixed { color: orange; }
  </style>
</head>
<body>
  <h1>AI Content Detection Report</h1>
  <div class="score ${analysis.metrics.result === 'human' ? 'human' : analysis.metrics.result === 'ai_generated' ? 'ai' : 'mixed'}">
    ${analysis.metrics.overallHumanScore}% Human
  </div>
  <p>${analysis.summary.mainFinding}</p>
</body>
</html>`;
}

