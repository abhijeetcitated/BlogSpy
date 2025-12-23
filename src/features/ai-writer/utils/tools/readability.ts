// =============================================================================
// READABILITY ANALYZER UTILITIES - Production Level
// =============================================================================
// Industry-standard readability formulas like Hemingway, Grammarly, Yoast
// Complete implementation of all major readability metrics
// =============================================================================

import {
  ReadabilityAnalysis,
  ReadabilityGrade,
  FleschReadingEase,
  FleschGrade,
  FleschKincaidGrade,
  GunningFogIndex,
  SMOGIndex,
  ColemanLiauIndex,
  AutomatedReadabilityIndex,
  DaleChallScore,
  LinsearWriteFormula,
  SentenceAnalysis,
  SentenceIssue,
  SentenceIssueType,
  SentenceLengthDistribution,
  WordAnalysis,
  WordIssue,
  WordIssueType,
  WordFrequencyAnalysis,
  ParagraphAnalysis,
  ParagraphIssue,
  ParagraphIssueType,
  ReadingTime,
  TargetComparison,
  TargetAudience,
  IndustryBenchmark,
  ReadabilityIssue,
  ReadabilityIssueType,
  ReadabilityRecommendation,
  RecommendationPriority,
  RecommendationCategory,
  ReadabilityHighlight,
  HighlightType,
  TextPosition,
  IssueSeverity,
  ReadabilityConfig,
  ContentTypeStandard,
  FLESCH_GRADES,
  AUDIENCE_TARGETS,
  CONTENT_TYPE_REQUIREMENTS,
  COMMON_WORDS,
  FILLER_WORDS,
  WEAK_VERBS,
  COMMON_ADVERBS,
  DEFAULT_READABILITY_CONFIG
} from '@/src/features/ai-writer/types/tools/readability.types';

// =============================================================================
// TEXT EXTRACTION UTILITIES
// =============================================================================

/**
 * Extract plain text from HTML content
 */
export function extractPlainText(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Split text into sentences
 */
export function splitIntoSentences(text: string): string[] {
  // Handle common abbreviations
  const abbreviations = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Sr.', 'Jr.', 
    'vs.', 'etc.', 'e.g.', 'i.e.', 'Inc.', 'Ltd.', 'Corp.', 'St.', 'Ave.'];
  
  let processedText = text;
  const placeholders: string[] = [];
  
  abbreviations.forEach((abbr, idx) => {
    const placeholder = `__ABBR${idx}__`;
    placeholders.push(placeholder);
    processedText = processedText.split(abbr).join(placeholder);
  });
  
  // Split on sentence-ending punctuation
  const rawSentences = processedText.split(/(?<=[.!?])\s+/);
  
  // Restore abbreviations
  const sentences = rawSentences.map(sentence => {
    let restored = sentence;
    abbreviations.forEach((abbr, idx) => {
      restored = restored.split(placeholders[idx]).join(abbr);
    });
    return restored.trim();
  }).filter(s => s.length > 0);
  
  return sentences;
}

/**
 * Split text into words
 */
export function splitIntoWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z'\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0 && !/^[-']+$/.test(word));
}

/**
 * Split text into paragraphs
 */
export function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

// =============================================================================
// SYLLABLE COUNTING
// =============================================================================

/**
 * Count syllables in a word using a rule-based approach
 */
export function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  
  if (word.length <= 3) return 1;
  
  // Remove common silent endings
  word = word.replace(/(?:[^leas]es|ed|[^aeiou]e)$/, '');
  word = word.replace(/^y/, '');
  
  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  const count = vowelGroups ? vowelGroups.length : 1;
  
  return Math.max(1, count);
}

/**
 * Check if a word is complex (3+ syllables)
 */
export function isComplexWord(word: string): boolean {
  return countSyllables(word) >= 3;
}

/**
 * Check if a word is a difficult word (not in common word list)
 */
export function isDifficultWord(word: string): boolean {
  const normalized = word.toLowerCase();
  return normalized.length > 4 && !COMMON_WORDS.has(normalized) && countSyllables(normalized) >= 3;
}

// =============================================================================
// READABILITY FORMULAS
// =============================================================================

/**
 * Calculate Flesch Reading Ease Score
 * Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
 */
export function calculateFleschReadingEase(
  totalWords: number,
  totalSentences: number,
  totalSyllables: number
): FleschReadingEase {
  if (totalWords === 0 || totalSentences === 0) {
    return {
      score: 0,
      grade: 'very-hard',
      description: 'Insufficient text for analysis',
      schoolLevel: 'N/A'
    };
  }
  
  const avgSentenceLength = totalWords / totalSentences;
  const avgSyllablesPerWord = totalSyllables / totalWords;
  
  let score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  score = Math.max(0, Math.min(100, score));
  
  const grade = getFleschGrade(score);
  
  return {
    score: Math.round(score * 10) / 10,
    grade,
    description: getFleschDescription(grade),
    schoolLevel: FLESCH_GRADES[grade].level
  };
}

function getFleschGrade(score: number): FleschGrade {
  if (score >= 90) return 'very-easy';
  if (score >= 80) return 'easy';
  if (score >= 70) return 'fairly-easy';
  if (score >= 60) return 'standard';
  if (score >= 50) return 'fairly-hard';
  if (score >= 30) return 'hard';
  return 'very-hard';
}

function getFleschDescription(grade: FleschGrade): string {
  const descriptions: Record<FleschGrade, string> = {
    'very-easy': 'Very easy to read. Easily understood by an average 11-year-old student.',
    'easy': 'Easy to read. Conversational English for consumers.',
    'fairly-easy': 'Fairly easy to read.',
    'standard': 'Plain English. Easily understood by 13- to 15-year-old students.',
    'fairly-hard': 'Fairly difficult to read.',
    'hard': 'Difficult to read.',
    'very-hard': 'Very difficult to read. Best understood by university graduates.'
  };
  return descriptions[grade];
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * Formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
 */
export function calculateFleschKincaidGrade(
  totalWords: number,
  totalSentences: number,
  totalSyllables: number
): FleschKincaidGrade {
  if (totalWords === 0 || totalSentences === 0) {
    return {
      score: 0,
      gradeLevel: 0,
      interpretation: 'Insufficient text for analysis'
    };
  }
  
  const avgSentenceLength = totalWords / totalSentences;
  const avgSyllablesPerWord = totalSyllables / totalWords;
  
  let score = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
  score = Math.max(0, Math.min(18, score));
  
  const gradeLevel = Math.round(score);
  
  return {
    score: Math.round(score * 10) / 10,
    gradeLevel,
    interpretation: getGradeLevelInterpretation(gradeLevel)
  };
}

function getGradeLevelInterpretation(grade: number): string {
  if (grade <= 5) return 'Elementary school level';
  if (grade <= 8) return 'Middle school level';
  if (grade <= 12) return 'High school level';
  if (grade <= 16) return 'College level';
  return 'Graduate level';
}

/**
 * Calculate Gunning Fog Index
 * Formula: 0.4 * ((words/sentences) + 100 * (complexWords/words))
 */
export function calculateGunningFog(
  totalWords: number,
  totalSentences: number,
  complexWords: number
): GunningFogIndex {
  if (totalWords === 0 || totalSentences === 0) {
    return {
      score: 0,
      yearsOfEducation: 0,
      interpretation: 'Insufficient text for analysis',
      targetAudience: 'N/A'
    };
  }
  
  const avgSentenceLength = totalWords / totalSentences;
  const percentComplexWords = (complexWords / totalWords) * 100;
  
  const score = 0.4 * (avgSentenceLength + percentComplexWords);
  const roundedScore = Math.round(score * 10) / 10;
  
  return {
    score: roundedScore,
    yearsOfEducation: Math.round(score),
    interpretation: getGunningFogInterpretation(roundedScore),
    targetAudience: getGunningFogAudience(roundedScore)
  };
}

function getGunningFogInterpretation(score: number): string {
  if (score <= 6) return 'Very easy to understand';
  if (score <= 8) return 'Easy to understand';
  if (score <= 10) return 'Acceptable difficulty';
  if (score <= 12) return 'Hard to read';
  if (score <= 14) return 'Very hard to read';
  return 'Extremely difficult';
}

function getGunningFogAudience(score: number): string {
  if (score <= 8) return 'General public';
  if (score <= 12) return 'High school graduates';
  if (score <= 16) return 'College graduates';
  return 'Advanced degree holders';
}

/**
 * Calculate SMOG Index
 * Formula: 1.0430 * sqrt(polysyllables * (30/sentences)) + 3.1291
 */
export function calculateSMOG(
  totalSentences: number,
  polysyllabicWords: number
): SMOGIndex {
  if (totalSentences === 0) {
    return {
      score: 0,
      gradeLevel: 0,
      interpretation: 'Insufficient text for analysis'
    };
  }
  
  // SMOG requires at least 30 sentences for accuracy
  const adjustedPolysyllables = polysyllabicWords * (30 / totalSentences);
  const score = 1.0430 * Math.sqrt(adjustedPolysyllables) + 3.1291;
  const roundedScore = Math.round(score * 10) / 10;
  
  return {
    score: roundedScore,
    gradeLevel: Math.round(score),
    interpretation: getGradeLevelInterpretation(Math.round(score))
  };
}

/**
 * Calculate Coleman-Liau Index
 * Formula: 0.0588 * L - 0.296 * S - 15.8
 * L = average letters per 100 words
 * S = average sentences per 100 words
 */
export function calculateColemanLiau(
  totalWords: number,
  totalSentences: number,
  totalLetters: number
): ColemanLiauIndex {
  if (totalWords === 0) {
    return {
      score: 0,
      gradeLevel: 0,
      interpretation: 'Insufficient text for analysis'
    };
  }
  
  const L = (totalLetters / totalWords) * 100;
  const S = (totalSentences / totalWords) * 100;
  
  const score = (0.0588 * L) - (0.296 * S) - 15.8;
  const roundedScore = Math.round(score * 10) / 10;
  
  return {
    score: roundedScore,
    gradeLevel: Math.max(1, Math.round(score)),
    interpretation: getGradeLevelInterpretation(Math.round(score))
  };
}

/**
 * Calculate Automated Readability Index
 * Formula: 4.71 * (characters/words) + 0.5 * (words/sentences) - 21.43
 */
export function calculateARI(
  totalWords: number,
  totalSentences: number,
  totalCharacters: number
): AutomatedReadabilityIndex {
  if (totalWords === 0 || totalSentences === 0) {
    return {
      score: 0,
      gradeLevel: 0,
      ageRange: 'N/A',
      interpretation: 'Insufficient text for analysis'
    };
  }
  
  const charsPerWord = totalCharacters / totalWords;
  const wordsPerSentence = totalWords / totalSentences;
  
  const score = (4.71 * charsPerWord) + (0.5 * wordsPerSentence) - 21.43;
  const roundedScore = Math.round(score * 10) / 10;
  const gradeLevel = Math.max(1, Math.ceil(score));
  
  return {
    score: roundedScore,
    gradeLevel,
    ageRange: getAgeRange(gradeLevel),
    interpretation: getGradeLevelInterpretation(gradeLevel)
  };
}

function getAgeRange(grade: number): string {
  const baseAge = 5;
  const minAge = baseAge + grade;
  const maxAge = minAge + 1;
  return `${minAge}-${maxAge} years`;
}

/**
 * Calculate Dale-Chall Readability Score
 * Formula: 0.1579 * (difficultWords/words * 100) + 0.0496 * (words/sentences)
 * If difficult words > 5%, add 3.6365
 */
export function calculateDaleChall(
  totalWords: number,
  totalSentences: number,
  difficultWords: number
): DaleChallScore {
  if (totalWords === 0 || totalSentences === 0) {
    return {
      score: 0,
      gradeLevel: 'N/A',
      difficultWordPercentage: 0,
      interpretation: 'Insufficient text for analysis'
    };
  }
  
  const percentDifficult = (difficultWords / totalWords) * 100;
  const avgSentenceLength = totalWords / totalSentences;
  
  let score = (0.1579 * percentDifficult) + (0.0496 * avgSentenceLength);
  
  if (percentDifficult > 5) {
    score += 3.6365;
  }
  
  const roundedScore = Math.round(score * 10) / 10;
  
  return {
    score: roundedScore,
    gradeLevel: getDaleChallGradeLevel(roundedScore),
    difficultWordPercentage: Math.round(percentDifficult * 10) / 10,
    interpretation: getDaleChallInterpretation(roundedScore)
  };
}

function getDaleChallGradeLevel(score: number): string {
  if (score <= 4.9) return '4th grade or below';
  if (score <= 5.9) return '5th-6th grade';
  if (score <= 6.9) return '7th-8th grade';
  if (score <= 7.9) return '9th-10th grade';
  if (score <= 8.9) return '11th-12th grade';
  if (score <= 9.9) return 'College';
  return 'College graduate';
}

function getDaleChallInterpretation(score: number): string {
  if (score <= 5) return 'Easily understood by average 4th-grade student';
  if (score <= 6) return 'Easily understood by 5th-6th grade students';
  if (score <= 7) return 'Easily understood by 7th-8th grade students';
  if (score <= 8) return 'Easily understood by 9th-10th grade students';
  if (score <= 9) return 'Easily understood by 11th-12th grade students';
  return 'Easily understood by college graduates';
}

/**
 * Calculate Linsear Write Formula
 * For technical documents
 */
export function calculateLinsearWrite(
  sentences: string[],
  words: string[]
): LinsearWriteFormula {
  if (sentences.length === 0 || words.length === 0) {
    return {
      score: 0,
      gradeLevel: 0,
      interpretation: 'Insufficient text for analysis'
    };
  }
  
  // Take sample of first 100 words
  const sampleWords = words.slice(0, 100);
  
  let easyWordCount = 0;
  let hardWordCount = 0;
  
  sampleWords.forEach(word => {
    const syllables = countSyllables(word);
    if (syllables <= 2) {
      easyWordCount++;
    } else {
      hardWordCount++;
    }
  });
  
  // Count sentences in sample
  const sampleText = sampleWords.join(' ');
  const sampleSentences = splitIntoSentences(sampleText);
  const sentenceCount = Math.max(1, sampleSentences.length);
  
  const rawScore = ((easyWordCount * 1) + (hardWordCount * 3)) / sentenceCount;
  
  let score: number;
  if (rawScore > 20) {
    score = rawScore / 2;
  } else {
    score = (rawScore - 2) / 2;
  }
  
  const roundedScore = Math.round(score * 10) / 10;
  
  return {
    score: roundedScore,
    gradeLevel: Math.max(1, Math.round(score)),
    interpretation: getGradeLevelInterpretation(Math.round(score))
  };
}

// =============================================================================
// CONTENT ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Analyze sentence structure
 */
export function analyzeSentences(text: string): SentenceAnalysis {
  const sentences = splitIntoSentences(text);
  
  if (sentences.length === 0) {
    return {
      total: 0,
      averageLength: 0,
      shortSentences: 0,
      mediumSentences: 0,
      longSentences: 0,
      veryLongSentences: 0,
      distribution: {
        '0-10': 0, '11-15': 0, '16-20': 0,
        '21-25': 0, '26-30': 0, '31+': 0
      },
      issues: []
    };
  }
  
  const wordCounts = sentences.map(s => splitIntoWords(s).length);
  const totalWords = wordCounts.reduce((a, b) => a + b, 0);
  
  const distribution: SentenceLengthDistribution = {
    '0-10': 0, '11-15': 0, '16-20': 0,
    '21-25': 0, '26-30': 0, '31+': 0
  };
  
  let shortCount = 0;
  let mediumCount = 0;
  let longCount = 0;
  let veryLongCount = 0;
  
  const issues: SentenceIssue[] = [];
  
  sentences.forEach((sentence, idx) => {
    const wordCount = wordCounts[idx];
    
    // Distribution
    if (wordCount <= 10) distribution['0-10']++;
    else if (wordCount <= 15) distribution['11-15']++;
    else if (wordCount <= 20) distribution['16-20']++;
    else if (wordCount <= 25) distribution['21-25']++;
    else if (wordCount <= 30) distribution['26-30']++;
    else distribution['31+']++;
    
    // Categories
    if (wordCount < 10) shortCount++;
    else if (wordCount <= 20) mediumCount++;
    else if (wordCount <= 30) longCount++;
    else veryLongCount++;
    
    // Detect issues
    if (wordCount > 30) {
      issues.push({
        id: `sentence-${idx}`,
        type: 'too-long',
        sentence,
        wordCount,
        position: { start: 0, end: sentence.length, sentence: idx },
        suggestion: 'Consider breaking this sentence into two shorter sentences for better readability.',
        severity: wordCount > 40 ? 'critical' : 'warning'
      });
    }
    
    if (wordCount < 5 && !sentence.match(/^[A-Z][a-z]*[.!?]$/)) {
      issues.push({
        id: `sentence-${idx}-short`,
        type: 'too-short',
        sentence,
        wordCount,
        position: { start: 0, end: sentence.length, sentence: idx },
        suggestion: 'This sentence may be too brief. Consider expanding or combining with another sentence.',
        severity: 'suggestion'
      });
    }
    
    // Detect passive voice
    if (detectPassiveVoice(sentence)) {
      issues.push({
        id: `sentence-${idx}-passive`,
        type: 'passive-voice',
        sentence,
        wordCount,
        position: { start: 0, end: sentence.length, sentence: idx },
        suggestion: 'Consider rewriting in active voice for more direct, engaging content.',
        severity: 'suggestion'
      });
    }
  });
  
  return {
    total: sentences.length,
    averageLength: Math.round((totalWords / sentences.length) * 10) / 10,
    shortSentences: shortCount,
    mediumSentences: mediumCount,
    longSentences: longCount,
    veryLongSentences: veryLongCount,
    distribution,
    issues
  };
}

/**
 * Detect passive voice in a sentence
 */
function detectPassiveVoice(sentence: string): boolean {
  const passivePatterns = [
    /\b(?:is|are|was|were|been|being)\s+\w+ed\b/i,
    /\b(?:is|are|was|were|been|being)\s+\w+en\b/i,
    /\bwill\s+be\s+\w+ed\b/i,
    /\bhas\s+been\s+\w+ed\b/i,
    /\bhave\s+been\s+\w+ed\b/i,
    /\bhad\s+been\s+\w+ed\b/i
  ];
  
  return passivePatterns.some(pattern => pattern.test(sentence));
}

/**
 * Analyze word usage
 */
export function analyzeWords(text: string): WordAnalysis {
  const words = splitIntoWords(text);
  
  if (words.length === 0) {
    return {
      total: 0,
      unique: 0,
      averageSyllables: 0,
      averageLength: 0,
      complexWords: 0,
      difficultWords: 0,
      simpleWords: 0,
      vocabularyDiversity: 0,
      wordFrequency: {
        mostCommon: [],
        overused: [],
        filler: [],
        jargon: []
      },
      issues: []
    };
  }
  
  const uniqueWords = new Set(words);
  const wordCounts = new Map<string, number>();
  
  let totalSyllables = 0;
  let totalLength = 0;
  let complexCount = 0;
  let difficultCount = 0;
  let simpleCount = 0;
  
  const issues: WordIssue[] = [];
  const fillerFound: Array<{ word: string; count: number; position: number }> = [];
  const adverbsFound: string[] = [];
  
  words.forEach((word, idx) => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    
    const syllables = countSyllables(word);
    totalSyllables += syllables;
    totalLength += word.length;
    
    if (syllables >= 3) {
      complexCount++;
      if (!COMMON_WORDS.has(word)) {
        difficultCount++;
      }
    } else {
      simpleCount++;
    }
    
    // Track filler words
    if (FILLER_WORDS.has(word)) {
      const existing = fillerFound.find(f => f.word === word);
      if (existing) {
        existing.count++;
      } else {
        fillerFound.push({ word, count: 1, position: idx });
      }
    }
    
    // Track adverbs
    if (COMMON_ADVERBS.has(word)) {
      adverbsFound.push(word);
    }
  });
  
  // Find most common words
  const sortedWords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1]);
  
  const mostCommon = sortedWords
    .filter(([word]) => word.length > 3)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
  
  // Find overused words
  const averageFrequency = words.length / uniqueWords.size;
  const overused = sortedWords
    .filter(([word, count]) => count > averageFrequency * 3 && word.length > 4)
    .slice(0, 5)
    .map(([word, count]) => ({ 
      word, 
      count,
      suggestion: `Consider using synonyms for "${word}" to improve variety`
    }));
  
  // Generate word issues
  if (fillerFound.length > 3) {
    fillerFound.slice(0, 5).forEach(({ word, count }) => {
      issues.push({
        id: `filler-${word}`,
        type: 'filler-word',
        word,
        position: { start: 0, end: 0 },
        suggestion: `The word "${word}" appears ${count} times. Consider removing or replacing.`,
        severity: count > 5 ? 'warning' : 'suggestion'
      });
    });
  }
  
  if (adverbsFound.length > words.length * 0.05) {
    issues.push({
      id: 'adverb-overuse',
      type: 'adverb-overuse',
      word: adverbsFound.slice(0, 3).join(', '),
      position: { start: 0, end: 0 },
      suggestion: 'Your content has many adverbs. Consider using stronger verbs instead.',
      severity: 'suggestion'
    });
  }
  
  return {
    total: words.length,
    unique: uniqueWords.size,
    averageSyllables: Math.round((totalSyllables / words.length) * 100) / 100,
    averageLength: Math.round((totalLength / words.length) * 10) / 10,
    complexWords: complexCount,
    difficultWords: difficultCount,
    simpleWords: simpleCount,
    vocabularyDiversity: Math.round((uniqueWords.size / words.length) * 100) / 100,
    wordFrequency: {
      mostCommon,
      overused,
      filler: fillerFound,
      jargon: []
    },
    issues
  };
}

/**
 * Analyze paragraph structure
 */
export function analyzeParagraphs(text: string): ParagraphAnalysis {
  const paragraphs = splitIntoParagraphs(text);
  
  if (paragraphs.length === 0) {
    return {
      total: 0,
      averageSentences: 0,
      averageWords: 0,
      shortParagraphs: 0,
      mediumParagraphs: 0,
      longParagraphs: 0,
      issues: []
    };
  }
  
  let totalSentences = 0;
  let totalWords = 0;
  let shortCount = 0;
  let mediumCount = 0;
  let longCount = 0;
  const issues: ParagraphIssue[] = [];
  
  paragraphs.forEach((para, idx) => {
    const sentences = splitIntoSentences(para);
    const words = splitIntoWords(para);
    
    totalSentences += sentences.length;
    totalWords += words.length;
    
    if (words.length < 50) shortCount++;
    else if (words.length <= 100) mediumCount++;
    else longCount++;
    
    if (words.length > 150) {
      issues.push({
        id: `para-${idx}`,
        type: 'too-long',
        paragraphIndex: idx,
        wordCount: words.length,
        sentenceCount: sentences.length,
        suggestion: 'This paragraph is very long. Consider breaking it into smaller paragraphs for better readability.',
        severity: words.length > 200 ? 'critical' : 'warning'
      });
    }
    
    if (words.length > 100 && sentences.length > 6) {
      issues.push({
        id: `para-${idx}-wall`,
        type: 'wall-of-text',
        paragraphIndex: idx,
        wordCount: words.length,
        sentenceCount: sentences.length,
        suggestion: 'This paragraph appears dense. Consider using subheadings or bullet points.',
        severity: 'warning'
      });
    }
  });
  
  return {
    total: paragraphs.length,
    averageSentences: Math.round((totalSentences / paragraphs.length) * 10) / 10,
    averageWords: Math.round((totalWords / paragraphs.length) * 10) / 10,
    shortParagraphs: shortCount,
    mediumParagraphs: mediumCount,
    longParagraphs: longCount,
    issues
  };
}

// =============================================================================
// READING TIME CALCULATION
// =============================================================================

/**
 * Calculate estimated reading time
 */
export function calculateReadingTime(totalWords: number): ReadingTime {
  const wordsPerMinute = 238; // Average adult reading speed
  const speakingWPM = 150; // Average speaking speed
  
  const minutes = totalWords / wordsPerMinute;
  const speakingMinutes = totalWords / speakingWPM;
  
  return {
    minutes: Math.floor(minutes),
    seconds: Math.round((minutes % 1) * 60),
    wordsPerMinute,
    speakingTime: Math.round(speakingMinutes * 10) / 10
  };
}

// =============================================================================
// TARGET COMPARISON
// =============================================================================

/**
 * Compare against target audience
 */
export function compareToTarget(
  currentGrade: number,
  targetAudience: TargetAudience
): TargetComparison {
  const target = AUDIENCE_TARGETS[targetAudience];
  const [minGrade, maxGrade] = target.gradeRange;
  const idealGrade = (minGrade + maxGrade) / 2;
  
  const difference = currentGrade - idealGrade;
  const isOnTarget = currentGrade >= minGrade && currentGrade <= maxGrade;
  
  let adjustment: 'simplify' | 'maintain' | 'complexify';
  let specificAdvice: string;
  
  if (difference > 2) {
    adjustment = 'simplify';
    specificAdvice = `Your content is about ${Math.round(difference)} grade levels above the target. Use shorter sentences and simpler words.`;
  } else if (difference < -2) {
    adjustment = 'complexify';
    specificAdvice = `Your content is about ${Math.round(Math.abs(difference))} grade levels below the target. You can use more sophisticated vocabulary.`;
  } else {
    adjustment = 'maintain';
    specificAdvice = 'Your content matches the target audience reading level well.';
  }
  
  return {
    target: targetAudience,
    targetGrade: idealGrade,
    currentGrade,
    difference: Math.round(difference * 10) / 10,
    isOnTarget,
    adjustment,
    specificAdvice
  };
}

// =============================================================================
// INDUSTRY BENCHMARK
// =============================================================================

/**
 * Compare against industry benchmarks
 */
export function getIndustryBenchmark(
  fleschScore: number,
  contentType: ContentTypeStandard
): IndustryBenchmark {
  const requirements = CONTENT_TYPE_REQUIREMENTS[contentType];
  const [minFlesch, maxFlesch] = requirements.idealFlesch;
  const benchmarkScore = (minFlesch + maxFlesch) / 2;
  const topPerformerScore = maxFlesch;
  
  // Calculate percentile (simplified)
  const range = maxFlesch - minFlesch;
  const percentile = Math.min(100, Math.max(0, 
    ((fleschScore - minFlesch) / range) * 100
  ));
  
  let comparison: 'above' | 'below' | 'average';
  if (fleschScore > benchmarkScore + 5) comparison = 'above';
  else if (fleschScore < benchmarkScore - 5) comparison = 'below';
  else comparison = 'average';
  
  return {
    industry: contentType,
    averageScore: benchmarkScore,
    yourScore: fleschScore,
    percentile: Math.round(percentile),
    topPerformerScore,
    comparison
  };
}

// =============================================================================
// ISSUE DETECTION
// =============================================================================

/**
 * Generate readability issues
 */
export function generateReadabilityIssues(
  analysis: {
    fleschReadingEase: FleschReadingEase;
    sentences: SentenceAnalysis;
    words: WordAnalysis;
    paragraphs: ParagraphAnalysis;
    targetComparison: TargetComparison;
  }
): ReadabilityIssue[] {
  const issues: ReadabilityIssue[] = [];
  
  // Grade level issues
  if (!analysis.targetComparison.isOnTarget) {
    issues.push({
      id: 'grade-level',
      type: 'grade-level',
      severity: Math.abs(analysis.targetComparison.difference) > 3 ? 'critical' : 'warning',
      title: 'Reading Level Mismatch',
      description: analysis.targetComparison.specificAdvice,
      impact: 'May reduce reader engagement and comprehension',
      metric: 'Grade Level',
      currentValue: analysis.targetComparison.currentGrade,
      targetValue: analysis.targetComparison.targetGrade
    });
  }
  
  // Sentence length issues
  if (analysis.sentences.veryLongSentences > 0) {
    issues.push({
      id: 'long-sentences',
      type: 'sentence-length',
      severity: analysis.sentences.veryLongSentences > 3 ? 'critical' : 'warning',
      title: 'Long Sentences Detected',
      description: `Found ${analysis.sentences.veryLongSentences} sentences with more than 30 words.`,
      impact: 'Long sentences can confuse readers and reduce comprehension',
      metric: 'Long Sentences',
      currentValue: analysis.sentences.veryLongSentences,
      targetValue: 0
    });
  }
  
  // Complex words issues
  const complexPercentage = (analysis.words.complexWords / analysis.words.total) * 100;
  if (complexPercentage > 20) {
    issues.push({
      id: 'complex-words',
      type: 'word-complexity',
      severity: complexPercentage > 30 ? 'critical' : 'warning',
      title: 'High Word Complexity',
      description: `${Math.round(complexPercentage)}% of words are complex (3+ syllables).`,
      impact: 'Complex vocabulary can make content harder to understand',
      metric: 'Complex Words',
      currentValue: `${Math.round(complexPercentage)}%`,
      targetValue: '<20%'
    });
  }
  
  // Paragraph issues
  if (analysis.paragraphs.issues.length > 0) {
    issues.push({
      id: 'paragraph-structure',
      type: 'paragraph-length',
      severity: 'warning',
      title: 'Paragraph Structure Issues',
      description: `Found ${analysis.paragraphs.issues.length} paragraphs that need attention.`,
      impact: 'Dense paragraphs can discourage readers',
      metric: 'Problem Paragraphs',
      currentValue: analysis.paragraphs.issues.length,
      targetValue: 0
    });
  }
  
  // Add sentence-level and word-level issues
  analysis.sentences.issues.forEach(issue => {
    if (issue.severity === 'critical') {
      issues.push({
        id: issue.id,
        type: issue.type === 'passive-voice' ? 'passive-voice' : 'sentence-length',
        severity: issue.severity,
        title: issue.type === 'passive-voice' ? 'Passive Voice' : 'Very Long Sentence',
        description: issue.suggestion,
        impact: 'Affects readability',
        originalText: issue.sentence,
        metric: 'Words',
        currentValue: issue.wordCount,
        targetValue: 25
      });
    }
  });
  
  analysis.words.issues.forEach(issue => {
    if (issue.type === 'filler-word' && issue.severity === 'warning') {
      issues.push({
        id: issue.id,
        type: 'filler-words',
        severity: issue.severity,
        title: 'Filler Words Detected',
        description: issue.suggestion,
        impact: 'Weakens writing',
        metric: 'Filler Words',
        currentValue: issue.word,
        targetValue: 'Remove or reduce'
      });
    }
  });
  
  return issues;
}

// =============================================================================
// RECOMMENDATIONS GENERATOR
// =============================================================================

/**
 * Generate recommendations based on analysis
 */
export function generateRecommendations(
  analysis: {
    fleschReadingEase: FleschReadingEase;
    sentences: SentenceAnalysis;
    words: WordAnalysis;
    paragraphs: ParagraphAnalysis;
    targetComparison: TargetComparison;
  }
): ReadabilityRecommendation[] {
  const recommendations: ReadabilityRecommendation[] = [];
  
  // Based on grade level
  if (analysis.targetComparison.adjustment === 'simplify') {
    recommendations.push({
      id: 'simplify-content',
      priority: 'high',
      category: 'clarity',
      title: 'Simplify Your Content',
      description: 'Your content is more complex than your target audience expects.',
      impact: 'high',
      effort: 'moderate',
      examples: [
        {
          before: 'The implementation of the new methodology resulted in significant improvements.',
          after: 'The new method led to big improvements.',
          improvement: 'Simpler words, shorter sentence'
        }
      ],
      autoFix: false
    });
  }
  
  // Sentence recommendations
  if (analysis.sentences.averageLength > 20) {
    recommendations.push({
      id: 'shorter-sentences',
      priority: 'high',
      category: 'sentence-structure',
      title: 'Use Shorter Sentences',
      description: `Average sentence length is ${analysis.sentences.averageLength} words. Aim for 15-20 words.`,
      impact: 'high',
      effort: 'easy',
      examples: [
        {
          before: 'When you write sentences that are too long, readers can lose track of the main point you are trying to make.',
          after: 'Long sentences can confuse readers. They lose track of your main point.',
          improvement: 'Split into two clear sentences'
        }
      ],
      autoFix: true
    });
  }
  
  // Word recommendations
  const fillerCount = analysis.words.wordFrequency.filler.reduce((acc, f) => acc + f.count, 0);
  if (fillerCount > 5) {
    recommendations.push({
      id: 'remove-filler',
      priority: 'medium',
      category: 'word-choice',
      title: 'Remove Filler Words',
      description: `Found ${fillerCount} filler words like "very", "really", "just".`,
      impact: 'medium',
      effort: 'easy',
      examples: [
        {
          before: 'This is a very important and really significant update.',
          after: 'This is an important, significant update.',
          improvement: 'Removed "very" and "really"'
        }
      ],
      autoFix: true
    });
  }
  
  // Paragraph recommendations
  if (analysis.paragraphs.longParagraphs > 0) {
    recommendations.push({
      id: 'break-paragraphs',
      priority: 'medium',
      category: 'paragraph-structure',
      title: 'Break Up Long Paragraphs',
      description: `${analysis.paragraphs.longParagraphs} paragraphs are over 100 words.`,
      impact: 'medium',
      effort: 'easy',
      autoFix: false
    });
  }
  
  // Vocabulary diversity
  if (analysis.words.vocabularyDiversity < 0.4) {
    recommendations.push({
      id: 'vary-vocabulary',
      priority: 'low',
      category: 'word-choice',
      title: 'Vary Your Vocabulary',
      description: 'Your content reuses many words. Consider using synonyms.',
      impact: 'low',
      effort: 'moderate',
      autoFix: false
    });
  }
  
  // Passive voice recommendation
  const passiveCount = analysis.sentences.issues.filter(i => i.type === 'passive-voice').length;
  if (passiveCount > 2) {
    recommendations.push({
      id: 'active-voice',
      priority: 'medium',
      category: 'clarity',
      title: 'Use Active Voice',
      description: `Found ${passiveCount} sentences with passive voice.`,
      impact: 'medium',
      effort: 'moderate',
      examples: [
        {
          before: 'The report was written by the team.',
          after: 'The team wrote the report.',
          improvement: 'Active voice is more direct'
        }
      ],
      autoFix: false
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder: Record<RecommendationPriority, number> = {
      'critical': 0, 'high': 1, 'medium': 2, 'low': 3
    };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// =============================================================================
// HIGHLIGHTING FUNCTIONS
// =============================================================================

/**
 * Generate highlights for text
 */
export function generateHighlights(
  text: string,
  enabledTypes: HighlightType[]
): ReadabilityHighlight[] {
  const highlights: ReadabilityHighlight[] = [];
  const sentences = splitIntoSentences(text);
  
  let currentPosition = 0;
  
  sentences.forEach((sentence, idx) => {
    const sentenceStart = text.indexOf(sentence, currentPosition);
    const words = splitIntoWords(sentence);
    const wordCount = words.length;
    
    // Long sentence highlighting
    if (enabledTypes.includes('long-sentence') && wordCount > 25) {
      highlights.push({
        id: `hl-long-${idx}`,
        type: 'long-sentence',
        start: sentenceStart,
        end: sentenceStart + sentence.length,
        text: sentence,
        color: 'bg-yellow-200/50',
        tooltip: `Long sentence (${wordCount} words)`,
        severity: wordCount > 35 ? 'critical' : 'warning',
        suggestion: 'Consider breaking into shorter sentences'
      });
    }
    
    // Passive voice highlighting
    if (enabledTypes.includes('passive-voice') && detectPassiveVoice(sentence)) {
      highlights.push({
        id: `hl-passive-${idx}`,
        type: 'passive-voice',
        start: sentenceStart,
        end: sentenceStart + sentence.length,
        text: sentence,
        color: 'bg-blue-200/50',
        tooltip: 'Passive voice detected',
        severity: 'suggestion',
        suggestion: 'Consider using active voice'
      });
    }
    
    // Word-level highlights
    let wordPosition = sentenceStart;
    words.forEach((word, wordIdx) => {
      const wordStart = text.indexOf(word, wordPosition);
      const wordEnd = wordStart + word.length;
      
      // Complex word
      if (enabledTypes.includes('complex-word') && isComplexWord(word) && !COMMON_WORDS.has(word.toLowerCase())) {
        highlights.push({
          id: `hl-complex-${idx}-${wordIdx}`,
          type: 'complex-word',
          start: wordStart,
          end: wordEnd,
          text: word,
          color: 'bg-purple-200/50',
          tooltip: `Complex word (${countSyllables(word)} syllables)`,
          severity: 'suggestion',
          suggestion: 'Consider using a simpler alternative'
        });
      }
      
      // Adverb
      if (enabledTypes.includes('adverb') && COMMON_ADVERBS.has(word.toLowerCase())) {
        highlights.push({
          id: `hl-adverb-${idx}-${wordIdx}`,
          type: 'adverb',
          start: wordStart,
          end: wordEnd,
          text: word,
          color: 'bg-orange-200/50',
          tooltip: 'Adverb - consider removing',
          severity: 'suggestion',
          suggestion: 'Consider using a stronger verb instead'
        });
      }
      
      // Filler word
      if (enabledTypes.includes('filler') && FILLER_WORDS.has(word.toLowerCase())) {
        highlights.push({
          id: `hl-filler-${idx}-${wordIdx}`,
          type: 'filler',
          start: wordStart,
          end: wordEnd,
          text: word,
          color: 'bg-gray-200/50',
          tooltip: 'Filler word - consider removing',
          severity: 'suggestion',
          suggestion: 'This word can usually be removed'
        });
      }
      
      // Weak verb
      if (enabledTypes.includes('weak-verb') && WEAK_VERBS.has(word.toLowerCase())) {
        highlights.push({
          id: `hl-weakverb-${idx}-${wordIdx}`,
          type: 'weak-verb',
          start: wordStart,
          end: wordEnd,
          text: word,
          color: 'bg-red-200/50',
          tooltip: 'Weak verb',
          severity: 'suggestion',
          suggestion: 'Consider using a stronger, more specific verb'
        });
      }
      
      wordPosition = wordEnd;
    });
    
    currentPosition = sentenceStart + sentence.length;
  });
  
  return highlights;
}

// =============================================================================
// OVERALL SCORE CALCULATION
// =============================================================================

/**
 * Calculate composite overall readability score
 */
export function calculateOverallScore(
  fleschReadingEase: FleschReadingEase,
  sentences: SentenceAnalysis,
  words: WordAnalysis,
  targetComparison: TargetComparison
): { score: number; grade: ReadabilityGrade } {
  // Weight factors
  const weights = {
    flesch: 0.35,
    sentenceLength: 0.20,
    wordComplexity: 0.20,
    targetMatch: 0.25
  };
  
  // Flesch score (already 0-100)
  const fleschComponent = fleschReadingEase.score * weights.flesch;
  
  // Sentence length score (ideal average is 15-20)
  const avgSentence = sentences.averageLength;
  let sentenceScore = 100;
  if (avgSentence < 10) sentenceScore = 70;
  else if (avgSentence > 25) sentenceScore = 100 - (avgSentence - 25) * 3;
  sentenceScore = Math.max(0, Math.min(100, sentenceScore));
  const sentenceComponent = sentenceScore * weights.sentenceLength;
  
  // Word complexity score
  const complexPercentage = (words.complexWords / words.total) * 100;
  const wordScore = Math.max(0, 100 - complexPercentage * 3);
  const wordComponent = wordScore * weights.wordComplexity;
  
  // Target match score
  const diffFromTarget = Math.abs(targetComparison.difference);
  const targetScore = Math.max(0, 100 - diffFromTarget * 15);
  const targetComponent = targetScore * weights.targetMatch;
  
  const totalScore = fleschComponent + sentenceComponent + wordComponent + targetComponent;
  const roundedScore = Math.round(totalScore);
  
  let grade: ReadabilityGrade;
  if (roundedScore >= 90) grade = 'excellent';
  else if (roundedScore >= 75) grade = 'good';
  else if (roundedScore >= 60) grade = 'fair';
  else if (roundedScore >= 40) grade = 'poor';
  else grade = 'very-poor';
  
  return { score: roundedScore, grade };
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Perform complete readability analysis
 */
export function analyzeReadability(
  content: string,
  config: ReadabilityConfig = DEFAULT_READABILITY_CONFIG
): ReadabilityAnalysis {
  const plainText = extractPlainText(content);
  const sentences = splitIntoSentences(plainText);
  const words = splitIntoWords(plainText);
  const paragraphs = splitIntoParagraphs(plainText);
  
  // Basic counts
  const totalWords = words.length;
  const totalSentences = sentences.length;
  const totalSyllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
  const totalLetters = words.join('').length;
  const totalCharacters = plainText.replace(/\s/g, '').length;
  const complexWords = words.filter(isComplexWord).length;
  const difficultWords = words.filter(isDifficultWord).length;
  const polysyllabicWords = words.filter(w => countSyllables(w) >= 3).length;
  
  // Calculate all metrics
  const fleschReadingEase = calculateFleschReadingEase(totalWords, totalSentences, totalSyllables);
  const fleschKincaidGrade = calculateFleschKincaidGrade(totalWords, totalSentences, totalSyllables);
  const gunningFog = calculateGunningFog(totalWords, totalSentences, complexWords);
  const smog = calculateSMOG(totalSentences, polysyllabicWords);
  const colemanLiau = calculateColemanLiau(totalWords, totalSentences, totalLetters);
  const ari = calculateARI(totalWords, totalSentences, totalCharacters);
  const daleChall = calculateDaleChall(totalWords, totalSentences, difficultWords);
  const linsearWrite = calculateLinsearWrite(sentences, words);
  
  // Average grade level
  const gradeLevels = [
    fleschKincaidGrade.gradeLevel,
    gunningFog.yearsOfEducation,
    smog.gradeLevel,
    colemanLiau.gradeLevel,
    ari.gradeLevel
  ].filter(g => g > 0);
  const averageGradeLevel = gradeLevels.length > 0
    ? Math.round((gradeLevels.reduce((a, b) => a + b, 0) / gradeLevels.length) * 10) / 10
    : 0;
  
  // Content analysis
  const sentenceAnalysis = analyzeSentences(plainText);
  const wordAnalysis = analyzeWords(plainText);
  const paragraphAnalysis = analyzeParagraphs(plainText);
  
  // Reading time
  const readingTime = calculateReadingTime(totalWords);
  
  // Comparisons
  const targetComparison = compareToTarget(averageGradeLevel, config.targetAudience);
  const industryBenchmark = getIndustryBenchmark(fleschReadingEase.score, config.contentType);
  
  // Overall score
  const { score: overallScore, grade: overallGrade } = calculateOverallScore(
    fleschReadingEase,
    sentenceAnalysis,
    wordAnalysis,
    targetComparison
  );
  
  // Issues and recommendations
  const issues = generateReadabilityIssues({
    fleschReadingEase,
    sentences: sentenceAnalysis,
    words: wordAnalysis,
    paragraphs: paragraphAnalysis,
    targetComparison
  });
  
  const recommendations = generateRecommendations({
    fleschReadingEase,
    sentences: sentenceAnalysis,
    words: wordAnalysis,
    paragraphs: paragraphAnalysis,
    targetComparison
  });
  
  return {
    overallScore,
    overallGrade,
    fleschReadingEase,
    fleschKincaidGrade,
    gunningFog,
    smog,
    colemanLiau,
    ari,
    daleChall,
    linsearWrite,
    averageGradeLevel,
    readingTime,
    sentences: sentenceAnalysis,
    words: wordAnalysis,
    paragraphs: paragraphAnalysis,
    targetComparison,
    industryBenchmark,
    issues,
    recommendations,
    analyzedAt: new Date().toISOString(),
    textLength: plainText.length
  };
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

/**
 * Export readability report as markdown
 */
export function exportReadabilityReport(analysis: ReadabilityAnalysis): string {
  const lines: string[] = [
    '# Readability Analysis Report',
    '',
    `**Generated:** ${new Date(analysis.analyzedAt).toLocaleString()}`,
    `**Word Count:** ${analysis.words.total}`,
    `**Reading Time:** ${analysis.readingTime.minutes} min ${analysis.readingTime.seconds} sec`,
    '',
    '## Overall Score',
    '',
    `**Score:** ${analysis.overallScore}/100 (${analysis.overallGrade.toUpperCase()})`,
    `**Average Grade Level:** ${analysis.averageGradeLevel}`,
    '',
    '## Readability Metrics',
    '',
    '| Metric | Score | Interpretation |',
    '|--------|-------|----------------|',
    `| Flesch Reading Ease | ${analysis.fleschReadingEase.score} | ${analysis.fleschReadingEase.schoolLevel} |`,
    `| Flesch-Kincaid Grade | ${analysis.fleschKincaidGrade.score} | Grade ${analysis.fleschKincaidGrade.gradeLevel} |`,
    `| Gunning Fog Index | ${analysis.gunningFog.score} | ${analysis.gunningFog.targetAudience} |`,
    `| SMOG Index | ${analysis.smog.score} | Grade ${analysis.smog.gradeLevel} |`,
    `| Coleman-Liau Index | ${analysis.colemanLiau.score} | Grade ${analysis.colemanLiau.gradeLevel} |`,
    `| Automated Readability | ${analysis.ari.score} | ${analysis.ari.ageRange} |`,
    `| Dale-Chall | ${analysis.daleChall.score} | ${analysis.daleChall.gradeLevel} |`,
    '',
    '## Content Analysis',
    '',
    '### Sentences',
    `- Total: ${analysis.sentences.total}`,
    `- Average Length: ${analysis.sentences.averageLength} words`,
    `- Long Sentences (>30 words): ${analysis.sentences.veryLongSentences}`,
    '',
    '### Words',
    `- Total: ${analysis.words.total}`,
    `- Unique: ${analysis.words.unique}`,
    `- Complex Words: ${analysis.words.complexWords}`,
    `- Vocabulary Diversity: ${(analysis.words.vocabularyDiversity * 100).toFixed(1)}%`,
    '',
    '### Paragraphs',
    `- Total: ${analysis.paragraphs.total}`,
    `- Average Words: ${analysis.paragraphs.averageWords}`,
    ''
  ];
  
  if (analysis.issues.length > 0) {
    lines.push('## Issues');
    lines.push('');
    analysis.issues.forEach(issue => {
      lines.push(`### ${issue.title}`);
      lines.push(`**Severity:** ${issue.severity}`);
      lines.push(`**Description:** ${issue.description}`);
      lines.push('');
    });
  }
  
  if (analysis.recommendations.length > 0) {
    lines.push('## Recommendations');
    lines.push('');
    analysis.recommendations.forEach((rec, idx) => {
      lines.push(`${idx + 1}. **${rec.title}** (${rec.priority})`);
      lines.push(`   ${rec.description}`);
      lines.push('');
    });
  }
  
  return lines.join('\n');
}

