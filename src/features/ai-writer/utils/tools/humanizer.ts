/**
 * Content Humanizer Utilities
 * 
 * Algorithms and functions for humanizing AI-generated content
 */

import {
  HumanizationAnalysis,
  HumanizationChange,
  HumanizationMetrics,
  HumanizationRecommendation,
  HumanizationSettings,
  HumanizationSummary,
  QualityScore,
  SectionHumanization,
  VocabularyReplacement,
  StructureChange,
  ToneAdjustment,
  PersonalityElement,
  DiffView,
  DiffSegment,
  ChangeType,
  ChangeImpact,
  DEFAULT_HUMANIZATION_SETTINGS,
  AI_TO_HUMAN_VOCABULARY,
  PERSONAL_ELEMENTS,
  SENTENCE_STARTERS_HUMAN,
  HumanizationExportOptions
} from '@/src/features/ai-writer/types/tools/humanizer.types';

// =============================================================================
// TEXT ANALYSIS
// =============================================================================

function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

function getSentences(text: string): string[] {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
}

function calculateReadability(text: string): number {
  const words = countWords(text);
  const sentences = getSentences(text).length;
  const syllables = countSyllables(text);
  
  if (sentences === 0 || words === 0) return 0;
  
  // Flesch Reading Ease
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, score));
}

function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  return words.reduce((total, word) => {
    return total + countWordSyllables(word);
  }, 0);
}

function countWordSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function calculateSentenceVariance(text: string): number {
  const sentences = getSentences(text);
  if (sentences.length < 2) return 0;
  
  const lengths = sentences.map(s => countWords(s));
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
  
  return Math.sqrt(variance);
}

function calculateVocabularyDiversity(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const uniqueWords = new Set(words);
  
  if (words.length === 0) return 0;
  return uniqueWords.size / words.length;
}

function estimateAIScore(text: string): number {
  let score = 50; // Base score
  
  // Check for AI patterns
  const sentences = getSentences(text);
  const words = text.toLowerCase();
  
  // Uniform sentence lengths (AI pattern)
  const variance = calculateSentenceVariance(text);
  if (variance < 3) score += 15;
  else if (variance < 5) score += 10;
  else if (variance > 10) score -= 10;
  
  // Formal vocabulary
  const formalWords = Object.keys(AI_TO_HUMAN_VOCABULARY);
  const formalCount = formalWords.filter(word => words.includes(word)).length;
  score += formalCount * 3;
  
  // Lack of personal pronouns
  const personalPronouns = (text.match(/\b(I|me|my|we|our|you|your)\b/gi) || []).length;
  if (personalPronouns < sentences.length * 0.1) score += 10;
  
  // Perfect grammar patterns
  const perfectPatterns = [
    /\bIn conclusion\b/gi,
    /\bFirst(?:ly)?,?\s+(?:Second(?:ly)?,?\s+)?(?:Third(?:ly)?)?\b/gi,
    /\bIt is important to note\b/gi,
    /\bThis article will explore\b/gi
  ];
  perfectPatterns.forEach(pattern => {
    if (pattern.test(text)) score += 5;
  });
  
  // Questions and exclamations (human patterns)
  const questions = (text.match(/\?/g) || []).length;
  const exclamations = (text.match(/!/g) || []).length;
  score -= questions * 2;
  score -= exclamations * 2;
  
  // Contractions (human pattern)
  const contractions = (text.match(/\b\w+'\w+\b/g) || []).length;
  score -= contractions * 2;
  
  return Math.max(0, Math.min(100, score));
}

// =============================================================================
// VOCABULARY HUMANIZATION
// =============================================================================

function findVocabularyReplacements(
  text: string,
  settings: HumanizationSettings
): VocabularyReplacement[] {
  const replacements: VocabularyReplacement[] = [];
  const lowerText = text.toLowerCase();
  
  // AI vocabulary replacements
  for (const [formal, alternatives] of Object.entries(AI_TO_HUMAN_VOCABULARY)) {
    const regex = new RegExp(`\\b${formal}\\b`, 'gi');
    const matches = lowerText.match(regex);
    
    if (matches) {
      const replacement = selectReplacement(alternatives, settings.style);
      replacements.push({
        original: formal,
        replacement,
        reason: `"${formal}" sounds formal/AI-like. "${replacement}" is more natural.`,
        frequency: matches.length,
        type: 'formal_to_casual'
      });
    }
  }
  
  // Find repetitive words
  const words = text.split(/\s+/);
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.length > 4) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  });
  
  Object.entries(wordFreq).forEach(([word, count]) => {
    if (count > 3 && !settings.preserveKeywords.includes(word)) {
      replacements.push({
        original: word,
        replacement: `[vary: ${word}]`,
        reason: `"${word}" appears ${count} times. Vary for more natural feel.`,
        frequency: count,
        type: 'repetitive'
      });
    }
  });
  
  return replacements;
}

function selectReplacement(alternatives: string[], style: string): string {
  // Select based on style
  if (style === 'casual' || style === 'conversational') {
    return alternatives[0]; // Usually most casual
  } else if (style === 'professional') {
    return alternatives[alternatives.length - 1]; // Usually most formal
  }
  return alternatives[Math.floor(Math.random() * alternatives.length)];
}

// =============================================================================
// STRUCTURE HUMANIZATION
// =============================================================================

function analyzeStructure(text: string, settings: HumanizationSettings): StructureChange[] {
  const changes: StructureChange[] = [];
  const sentences = getSentences(text);
  
  // Find long sentences to split
  sentences.forEach((sentence, index) => {
    const wordCount = countWords(sentence);
    
    if (wordCount > 30 && settings.varySentenceLength) {
      const splitPoint = findSplitPoint(sentence);
      if (splitPoint > -1) {
        const part1 = sentence.substring(0, splitPoint).trim();
        const part2 = sentence.substring(splitPoint).trim();
        changes.push({
          type: 'split_sentence',
          description: `Split long sentence (${wordCount} words) for better readability`,
          before: sentence,
          after: `${part1}. ${capitalizeFirst(part2)}`
        });
      }
    }
    
    // Find consecutive short sentences to potentially merge
    if (index < sentences.length - 1) {
      const nextSentence = sentences[index + 1];
      if (countWords(sentence) < 8 && countWords(nextSentence) < 8) {
        changes.push({
          type: 'merge_sentences',
          description: 'Merge short consecutive sentences for better flow',
          before: `${sentence}. ${nextSentence}`,
          after: `${sentence}, and ${nextSentence.charAt(0).toLowerCase()}${nextSentence.slice(1)}`
        });
      }
    }
  });
  
  // Check sentence length variance
  if (settings.varySentenceLength) {
    const lengths = sentences.map(s => countWords(s));
    const allSimilar = lengths.every(len => Math.abs(len - lengths[0]) < 3);
    
    if (allSimilar && sentences.length > 2) {
      changes.push({
        type: 'vary_length',
        description: 'Sentences are too uniform in length. Vary for natural feel.',
        before: '[uniform sentence lengths detected]',
        after: '[mix short, medium, and longer sentences]'
      });
    }
  }
  
  return changes;
}

function findSplitPoint(sentence: string): number {
  const conjunctions = [', and ', ', but ', ', so ', ', which ', ', because ', ' - '];
  
  for (const conj of conjunctions) {
    const index = sentence.indexOf(conj);
    if (index > sentence.length * 0.3 && index < sentence.length * 0.7) {
      return index + conj.length - (conj.endsWith(' ') ? 1 : 0);
    }
  }
  
  return -1;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// =============================================================================
// TONE HUMANIZATION
// =============================================================================

function analyzeTone(text: string, settings: HumanizationSettings): ToneAdjustment[] {
  const adjustments: ToneAdjustment[] = [];
  
  // Analyze formality
  const formalityBefore = calculateFormality(text);
  const targetFormality = getTargetFormality(settings.tone, settings.style);
  
  if (Math.abs(formalityBefore - targetFormality) > 20) {
    adjustments.push({
      aspect: 'formality',
      before: formalityBefore,
      after: targetFormality,
      changes: formalityBefore > targetFormality
        ? ['Use contractions', 'Simplify vocabulary', 'Add casual phrases']
        : ['Use complete forms', 'Professional vocabulary', 'Formal transitions']
    });
  }
  
  // Analyze warmth
  const warmthBefore = calculateWarmth(text);
  const targetWarmth = settings.tone === 'friendly' || settings.tone === 'empathetic' ? 70 : 40;
  
  if (warmthBefore < targetWarmth - 20) {
    adjustments.push({
      aspect: 'warmth',
      before: warmthBefore,
      after: targetWarmth,
      changes: ['Add personal pronouns', 'Use warmer language', 'Include empathetic phrases']
    });
  }
  
  // Analyze enthusiasm
  const enthusiasmBefore = calculateEnthusiasm(text);
  const targetEnthusiasm = settings.tone === 'humorous' ? 70 : settings.tone === 'neutral' ? 30 : 50;
  
  if (Math.abs(enthusiasmBefore - targetEnthusiasm) > 25) {
    adjustments.push({
      aspect: 'enthusiasm',
      before: enthusiasmBefore,
      after: targetEnthusiasm,
      changes: enthusiasmBefore < targetEnthusiasm
        ? ['Add exclamation points sparingly', 'Use energetic words', 'Show excitement']
        : ['Tone down superlatives', 'Use measured language', 'Be more factual']
    });
  }
  
  return adjustments;
}

function calculateFormality(text: string): number {
  let score = 50;
  
  // Contractions decrease formality
  const contractions = (text.match(/\b\w+'\w+\b/g) || []).length;
  score -= contractions * 5;
  
  // Formal words increase formality
  const formalWords = Object.keys(AI_TO_HUMAN_VOCABULARY);
  formalWords.forEach(word => {
    if (text.toLowerCase().includes(word)) score += 5;
  });
  
  // Personal pronouns decrease formality
  const personal = (text.match(/\b(I|me|my|we|you)\b/gi) || []).length;
  score -= personal * 2;
  
  return Math.max(0, Math.min(100, score));
}

function calculateWarmth(text: string): number {
  let score = 30;
  
  // Personal pronouns
  const personal = (text.match(/\b(I|me|my|we|you|your)\b/gi) || []).length;
  score += personal * 3;
  
  // Warm words
  const warmWords = ['love', 'great', 'wonderful', 'amazing', 'thank', 'appreciate', 'happy', 'glad'];
  warmWords.forEach(word => {
    if (text.toLowerCase().includes(word)) score += 5;
  });
  
  // Questions show engagement
  const questions = (text.match(/\?/g) || []).length;
  score += questions * 3;
  
  return Math.max(0, Math.min(100, score));
}

function calculateEnthusiasm(text: string): number {
  let score = 30;
  
  // Exclamation points
  const exclamations = (text.match(/!/g) || []).length;
  score += exclamations * 10;
  
  // Superlatives
  const superlatives = (text.match(/\b(best|worst|most|least|amazing|incredible|fantastic)\b/gi) || []).length;
  score += superlatives * 5;
  
  // All caps (sparingly)
  const caps = (text.match(/\b[A-Z]{2,}\b/g) || []).length;
  score += caps * 3;
  
  return Math.max(0, Math.min(100, score));
}

function getTargetFormality(tone: string, style: string): number {
  const toneFormality: Record<string, number> = {
    friendly: 30,
    authoritative: 70,
    empathetic: 40,
    humorous: 25,
    neutral: 50
  };
  
  const styleFormality: Record<string, number> = {
    casual: 20,
    professional: 70,
    academic: 80,
    conversational: 30,
    storytelling: 35
  };
  
  return (toneFormality[tone] + styleFormality[style]) / 2;
}

// =============================================================================
// PERSONALITY ELEMENTS
// =============================================================================

function generatePersonalityElements(
  text: string,
  settings: HumanizationSettings
): PersonalityElement[] {
  const elements: PersonalityElement[] = [];
  
  if (!settings.addPersonalElements) return elements;
  
  const sentences = getSentences(text);
  const paragraphs = text.split(/\n\n+/);
  
  // Add questions
  if (settings.addRhetoricalQuestions && paragraphs.length > 2) {
    const questionPosition = Math.floor(paragraphs.length * 0.3);
    elements.push({
      type: 'question',
      text: selectPersonalElement('questions'),
      insertPosition: findParagraphStart(text, questionPosition),
      context: 'Add engagement question'
    });
  }
  
  // Add opinion/anecdote at natural points
  if (settings.addPersonalElements && sentences.length > 5) {
    const opinionPosition = Math.floor(sentences.length * 0.4);
    elements.push({
      type: 'opinion',
      text: selectPersonalElement('opinions'),
      insertPosition: findSentenceEnd(text, opinionPosition),
      context: 'Add personal perspective'
    });
  }
  
  // Add exclamation/emphasis
  if (settings.addPersonalElements && paragraphs.length > 1) {
    elements.push({
      type: 'exclamation',
      text: selectPersonalElement('exclamations'),
      insertPosition: findParagraphStart(text, 1),
      context: 'Add emphasis'
    });
  }
  
  return elements;
}

function selectPersonalElement(type: keyof typeof PERSONAL_ELEMENTS): string {
  const options = PERSONAL_ELEMENTS[type];
  return options[Math.floor(Math.random() * options.length)];
}

function findParagraphStart(text: string, paragraphIndex: number): number {
  const paragraphs = text.split(/\n\n+/);
  let position = 0;
  
  for (let i = 0; i < paragraphIndex && i < paragraphs.length; i++) {
    position += paragraphs[i].length + 2; // +2 for \n\n
  }
  
  return position;
}

function findSentenceEnd(text: string, sentenceIndex: number): number {
  const sentences = getSentences(text);
  let position = 0;
  
  for (let i = 0; i <= sentenceIndex && i < sentences.length; i++) {
    position = text.indexOf(sentences[i], position) + sentences[i].length + 1;
  }
  
  return position;
}

// =============================================================================
// HUMANIZATION ENGINE
// =============================================================================

function humanizeText(
  text: string,
  settings: HumanizationSettings
): string {
  let humanized = text;
  
  // Apply vocabulary replacements
  for (const [formal, alternatives] of Object.entries(AI_TO_HUMAN_VOCABULARY)) {
    const replacement = selectReplacement(alternatives, settings.style);
    const regex = new RegExp(`\\b${formal}\\b`, 'gi');
    humanized = humanized.replace(regex, replacement);
  }
  
  // Add contractions if casual/conversational
  if (settings.style === 'casual' || settings.style === 'conversational') {
    humanized = addContractions(humanized);
  }
  
  // Vary sentence starters
  humanized = varySentenceStarters(humanized, settings);
  
  // Add transition variety
  if (settings.addTransitions) {
    humanized = varyTransitions(humanized);
  }
  
  return humanized;
}

function addContractions(text: string): string {
  const contractionMap: Record<string, string> = {
    'do not': "don't",
    'does not': "doesn't",
    'did not': "didn't",
    'is not': "isn't",
    'are not': "aren't",
    'was not': "wasn't",
    'were not': "weren't",
    'will not': "won't",
    'would not': "wouldn't",
    'could not': "couldn't",
    'should not': "shouldn't",
    'cannot': "can't",
    'I am': "I'm",
    'you are': "you're",
    'they are': "they're",
    'we are': "we're",
    'it is': "it's",
    'that is': "that's",
    'there is': "there's",
    'I have': "I've",
    'you have': "you've",
    'we have': "we've",
    'they have': "they've",
    'I will': "I'll",
    'you will': "you'll",
    'we will': "we'll",
    'it will': "it'll"
  };
  
  let result = text;
  for (const [full, contracted] of Object.entries(contractionMap)) {
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    result = result.replace(regex, contracted);
  }
  
  return result;
}

function varySentenceStarters(text: string, settings: HumanizationSettings): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  // Don't modify too many sentences
  const modifyIndices = new Set<number>();
  const numToModify = Math.min(3, Math.floor(sentences.length * 0.15));
  
  while (modifyIndices.size < numToModify) {
    modifyIndices.add(Math.floor(Math.random() * sentences.length));
  }
  
  const modified = sentences.map((sentence, index) => {
    if (modifyIndices.has(index) && !sentence.match(/^["']/)) {
      const starter = SENTENCE_STARTERS_HUMAN[Math.floor(Math.random() * SENTENCE_STARTERS_HUMAN.length)];
      // Only add if sentence doesn't already start casually
      if (!sentence.match(/^(Look|Here's|Honestly|Truth|I'll|Let me|You know|Picture|Think|Now)/)) {
        return `${starter} ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
      }
    }
    return sentence;
  });
  
  return modified.join(' ');
}

function varyTransitions(text: string): string {
  const transitionVariations: Record<string, string[]> = {
    'In addition': ['Also', 'Plus', 'And'],
    'On the other hand': ['But', 'Then again', 'That said'],
    'As a result': ['So', 'Because of this', 'That\'s why'],
    'In order to': ['To'],
    'Due to the fact that': ['Because', 'Since'],
    'At this point in time': ['Now', 'Currently'],
    'In the event that': ['If'],
    'For the purpose of': ['To', 'For']
  };
  
  let result = text;
  for (const [formal, alternatives] of Object.entries(transitionVariations)) {
    const regex = new RegExp(`\\b${formal}\\b`, 'gi');
    const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
    result = result.replace(regex, replacement);
  }
  
  return result;
}

// =============================================================================
// CHANGE DETECTION
// =============================================================================

function detectChanges(
  original: string,
  humanized: string,
  settings: HumanizationSettings
): HumanizationChange[] {
  const changes: HumanizationChange[] = [];
  
  // Find vocabulary changes
  for (const [formal, alternatives] of Object.entries(AI_TO_HUMAN_VOCABULARY)) {
    const regex = new RegExp(`\\b${formal}\\b`, 'gi');
    let match;
    
    while ((match = regex.exec(original)) !== null) {
      const replacement = selectReplacement(alternatives, settings.style);
      changes.push({
        id: `vocab-${changes.length}`,
        type: 'vocabulary',
        original: match[0],
        humanized: replacement,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        reason: `Replaced formal "${match[0]}" with natural "${replacement}"`,
        impact: 'medium',
        accepted: true,
        suggestions: alternatives
      });
    }
  }
  
  // Detect contraction changes
  const contractionPairs = [
    { full: 'do not', contracted: "don't" },
    { full: 'does not', contracted: "doesn't" },
    { full: 'is not', contracted: "isn't" },
    { full: 'I am', contracted: "I'm" },
    { full: 'you are', contracted: "you're" }
  ];
  
  contractionPairs.forEach(({ full, contracted }) => {
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    let match;
    
    while ((match = regex.exec(original)) !== null) {
      if (humanized.includes(contracted)) {
        changes.push({
          id: `contract-${changes.length}`,
          type: 'tone',
          original: match[0],
          humanized: contracted,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          reason: `Added contraction for casual tone`,
          impact: 'low',
          accepted: true,
          suggestions: [contracted, match[0]]
        });
      }
    }
  });
  
  return changes;
}

// =============================================================================
// SECTION ANALYSIS
// =============================================================================

function analyzeSections(
  original: string,
  humanized: string,
  changes: HumanizationChange[]
): SectionHumanization[] {
  const paragraphs = original.split(/\n\n+/);
  const humanizedParagraphs = humanized.split(/\n\n+/);
  const sections: SectionHumanization[] = [];
  
  let currentIndex = 0;
  
  paragraphs.forEach((para, index) => {
    const humanizedPara = humanizedParagraphs[index] || para;
    const sectionChanges = changes.filter(
      c => c.startIndex >= currentIndex && c.startIndex < currentIndex + para.length
    );
    
    const aiScoreBefore = estimateAIScore(para);
    const aiScoreAfter = estimateAIScore(humanizedPara);
    
    sections.push({
      id: `section-${index}`,
      originalText: para,
      humanizedText: humanizedPara,
      startIndex: currentIndex,
      endIndex: currentIndex + para.length,
      changes: sectionChanges,
      aiScoreBefore,
      aiScoreAfter,
      improvementPercent: aiScoreBefore > 0 
        ? Math.round(((aiScoreBefore - aiScoreAfter) / aiScoreBefore) * 100)
        : 0
    });
    
    currentIndex += para.length + 2; // +2 for \n\n
  });
  
  return sections;
}

// =============================================================================
// QUALITY SCORING
// =============================================================================

function calculateQuality(
  original: string,
  humanized: string,
  changes: HumanizationChange[]
): QualityScore {
  // Naturalness: How human-like does it sound?
  const aiScoreOriginal = estimateAIScore(original);
  const aiScoreHumanized = estimateAIScore(humanized);
  const naturalness = Math.max(0, 100 - aiScoreHumanized);
  
  // Coherence: Does it still make sense?
  const coherence = calculateCoherence(original, humanized);
  
  // Engagement: Is it more engaging?
  const engagement = calculateEngagement(humanized);
  
  // Authenticity: Does it feel genuine?
  const authenticity = calculateAuthenticity(humanized, changes);
  
  const overall = Math.round((naturalness + coherence + engagement + authenticity) / 4);
  
  return {
    naturalness: Math.round(naturalness),
    coherence: Math.round(coherence),
    engagement: Math.round(engagement),
    authenticity: Math.round(authenticity),
    overall
  };
}

function calculateCoherence(original: string, humanized: string): number {
  // Simple coherence check based on structure preservation
  const originalSentences = getSentences(original).length;
  const humanizedSentences = getSentences(humanized).length;
  
  // Significant sentence count change might indicate coherence issues
  const sentenceRatio = Math.min(originalSentences, humanizedSentences) / 
                        Math.max(originalSentences, humanizedSentences);
  
  // Word count preservation
  const originalWords = countWords(original);
  const humanizedWords = countWords(humanized);
  const wordRatio = Math.min(originalWords, humanizedWords) / 
                    Math.max(originalWords, humanizedWords);
  
  return (sentenceRatio * 50 + wordRatio * 50);
}

function calculateEngagement(text: string): number {
  let score = 40;
  
  // Questions engage readers
  const questions = (text.match(/\?/g) || []).length;
  score += questions * 5;
  
  // Variety in sentence length
  const variance = calculateSentenceVariance(text);
  if (variance > 5) score += 15;
  
  // Personal elements
  const personal = (text.match(/\b(you|your|I|we|our)\b/gi) || []).length;
  score += Math.min(20, personal * 2);
  
  // Active voice indicators
  const activePatterns = ['we found', 'I noticed', 'you\'ll see', 'let\'s'];
  activePatterns.forEach(pattern => {
    if (text.toLowerCase().includes(pattern)) score += 5;
  });
  
  return Math.min(100, score);
}

function calculateAuthenticity(text: string, changes: HumanizationChange[]): number {
  let score = 60;
  
  // Not too many changes (over-humanization feels fake)
  const changeRatio = changes.length / Math.max(1, countWords(text) / 50);
  if (changeRatio < 0.5) score += 20;
  else if (changeRatio > 2) score -= 20;
  
  // Natural contractions
  const contractions = (text.match(/\b\w+'\w+\b/g) || []).length;
  if (contractions > 0 && contractions < 10) score += 10;
  
  // Varied vocabulary
  const diversity = calculateVocabularyDiversity(text);
  if (diversity > 0.5) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

// =============================================================================
// METRICS CALCULATION
// =============================================================================

function calculateMetrics(
  original: string,
  humanized: string,
  changes: HumanizationChange[]
): HumanizationMetrics {
  const changesByType: Record<ChangeType, number> = {
    vocabulary: 0,
    structure: 0,
    tone: 0,
    flow: 0,
    personality: 0,
    formatting: 0
  };
  
  const changesByImpact: Record<ChangeImpact, number> = {
    high: 0,
    medium: 0,
    low: 0
  };
  
  changes.forEach(change => {
    changesByType[change.type]++;
    changesByImpact[change.impact]++;
  });
  
  const originalAIScore = estimateAIScore(original);
  const humanizedAIScore = estimateAIScore(humanized);
  
  return {
    originalWordCount: countWords(original),
    humanizedWordCount: countWords(humanized),
    wordCountChange: countWords(humanized) - countWords(original),
    
    originalAIScore,
    humanizedAIScore,
    aiScoreImprovement: originalAIScore - humanizedAIScore,
    
    totalChanges: changes.length,
    changesByType,
    changesByImpact,
    
    acceptedChanges: changes.filter(c => c.accepted).length,
    rejectedChanges: changes.filter(c => !c.accepted).length,
    
    readabilityBefore: calculateReadability(original),
    readabilityAfter: calculateReadability(humanized),
    
    sentenceVarianceBefore: calculateSentenceVariance(original),
    sentenceVarianceAfter: calculateSentenceVariance(humanized),
    
    vocabularyDiversityBefore: calculateVocabularyDiversity(original),
    vocabularyDiversityAfter: calculateVocabularyDiversity(humanized)
  };
}

// =============================================================================
// SUMMARY & RECOMMENDATIONS
// =============================================================================

function generateSummary(
  metrics: HumanizationMetrics,
  quality: QualityScore
): HumanizationSummary {
  let verdict: HumanizationSummary['verdict'];
  
  if (quality.overall >= 80) verdict = 'excellent';
  else if (quality.overall >= 60) verdict = 'good';
  else if (quality.overall >= 40) verdict = 'moderate';
  else verdict = 'needs_work';
  
  const mainChanges: string[] = [];
  if (metrics.changesByType.vocabulary > 0) {
    mainChanges.push(`${metrics.changesByType.vocabulary} vocabulary replacements`);
  }
  if (metrics.changesByType.tone > 0) {
    mainChanges.push(`${metrics.changesByType.tone} tone adjustments`);
  }
  if (metrics.changesByType.structure > 0) {
    mainChanges.push(`${metrics.changesByType.structure} structure changes`);
  }
  
  const improvements: string[] = [];
  if (metrics.aiScoreImprovement > 10) {
    improvements.push(`AI detectability reduced by ${metrics.aiScoreImprovement}%`);
  }
  if (metrics.readabilityAfter > metrics.readabilityBefore) {
    improvements.push('Improved readability');
  }
  if (metrics.sentenceVarianceAfter > metrics.sentenceVarianceBefore) {
    improvements.push('Better sentence variety');
  }
  
  const warnings: string[] = [];
  if (metrics.humanizedAIScore > 60) {
    warnings.push('Content may still be detected as AI-generated');
  }
  if (Math.abs(metrics.wordCountChange) > metrics.originalWordCount * 0.2) {
    warnings.push('Significant change in content length');
  }
  
  let estimatedDetectability: HumanizationSummary['estimatedDetectability'];
  if (metrics.humanizedAIScore < 30) estimatedDetectability = 'very_low';
  else if (metrics.humanizedAIScore < 50) estimatedDetectability = 'low';
  else if (metrics.humanizedAIScore < 70) estimatedDetectability = 'moderate';
  else estimatedDetectability = 'high';
  
  return {
    verdict,
    mainChanges,
    improvements,
    warnings,
    estimatedDetectability
  };
}

function generateRecommendations(
  metrics: HumanizationMetrics,
  quality: QualityScore,
  settings: HumanizationSettings
): HumanizationRecommendation[] {
  const recommendations: HumanizationRecommendation[] = [];
  
  if (metrics.humanizedAIScore > 50) {
    recommendations.push({
      id: 'rec-1',
      type: 'manual_edit',
      priority: 'high',
      title: 'Add Personal Experiences',
      description: 'Include personal anecdotes or real examples to make content more authentic.',
      action: 'Add 2-3 personal stories or experiences related to your topic.'
    });
  }
  
  if (quality.engagement < 60) {
    recommendations.push({
      id: 'rec-2',
      type: 'restructure',
      priority: 'medium',
      title: 'Increase Engagement',
      description: 'Add questions and interactive elements to engage readers.',
      action: 'Include rhetorical questions and direct reader engagement.'
    });
  }
  
  if (metrics.sentenceVarianceAfter < 5) {
    recommendations.push({
      id: 'rec-3',
      type: 'restructure',
      priority: 'medium',
      title: 'Vary Sentence Structure',
      description: 'Your sentences are still quite uniform in length.',
      action: 'Mix short punchy sentences with longer, flowing ones.'
    });
  }
  
  if (quality.authenticity < 70) {
    recommendations.push({
      id: 'rec-4',
      type: 'add_personal',
      priority: 'high',
      title: 'Add Your Voice',
      description: 'The content lacks a distinctive voice.',
      action: 'Include opinions, humor, or unique perspectives.'
    });
  }
  
  if (settings.level === 'light' && metrics.aiScoreImprovement < 15) {
    recommendations.push({
      id: 'rec-5',
      type: 'tone_shift',
      priority: 'low',
      title: 'Consider Stronger Humanization',
      description: 'Light humanization had minimal impact.',
      action: 'Try moderate or heavy humanization for better results.'
    });
  }
  
  recommendations.push({
    id: 'rec-verify',
    type: 'verify',
    priority: 'low',
    title: 'Verify Changes',
    description: 'Review humanized content for accuracy.',
    action: 'Ensure meaning is preserved and facts are accurate.'
  });
  
  return recommendations;
}

// =============================================================================
// DIFF GENERATION
// =============================================================================

export function generateDiff(original: string, humanized: string): DiffView {
  const segments: DiffSegment[] = [];
  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  
  // Simple word-by-word diff
  const originalWords = original.split(/\s+/);
  const humanizedWords = humanized.split(/\s+/);
  
  let i = 0;
  let j = 0;
  
  while (i < originalWords.length || j < humanizedWords.length) {
    if (i >= originalWords.length) {
      segments.push({ type: 'added', text: humanizedWords[j] });
      addedCount++;
      j++;
    } else if (j >= humanizedWords.length) {
      segments.push({ type: 'removed', text: originalWords[i] });
      removedCount++;
      i++;
    } else if (originalWords[i] === humanizedWords[j]) {
      segments.push({ type: 'unchanged', text: originalWords[i] });
      i++;
      j++;
    } else {
      // Check if it's a modification or insertion/deletion
      const lookAheadOriginal = originalWords.slice(i, i + 3).indexOf(humanizedWords[j]);
      const lookAheadHumanized = humanizedWords.slice(j, j + 3).indexOf(originalWords[i]);
      
      if (lookAheadOriginal > -1) {
        // Original word removed
        segments.push({ type: 'removed', text: originalWords[i] });
        removedCount++;
        i++;
      } else if (lookAheadHumanized > -1) {
        // New word added
        segments.push({ type: 'added', text: humanizedWords[j] });
        addedCount++;
        j++;
      } else {
        // Word modified
        segments.push({
          type: 'modified',
          text: humanizedWords[j],
          originalText: originalWords[i]
        });
        modifiedCount++;
        i++;
        j++;
      }
    }
  }
  
  return { segments, addedCount, removedCount, modifiedCount };
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

export function humanizeContent(
  content: string,
  settings: Partial<HumanizationSettings> = {}
): HumanizationAnalysis {
  const startTime = Date.now();
  
  const fullSettings: HumanizationSettings = {
    ...DEFAULT_HUMANIZATION_SETTINGS,
    ...settings
  };
  
  // Perform humanization
  const humanizedContent = humanizeText(content, fullSettings);
  
  // Detect all changes
  const changes = detectChanges(content, humanizedContent, fullSettings);
  
  // Analyze sections
  const sections = analyzeSections(content, humanizedContent, changes);
  
  // Analyze structure, tone, personality
  const vocabularyReplacements = findVocabularyReplacements(content, fullSettings);
  const structureChanges = analyzeStructure(content, fullSettings);
  const toneAdjustments = analyzeTone(content, fullSettings);
  const personalityElements = generatePersonalityElements(content, fullSettings);
  
  // Calculate metrics and quality
  const metrics = calculateMetrics(content, humanizedContent, changes);
  const quality = calculateQuality(content, humanizedContent, changes);
  
  // Generate summary and recommendations
  const summary = generateSummary(metrics, quality);
  const recommendations = generateRecommendations(metrics, quality, fullSettings);
  
  return {
    id: `humanize-${Date.now()}`,
    timestamp: new Date(),
    duration: Date.now() - startTime,
    
    originalContent: content,
    humanizedContent,
    
    settings: fullSettings,
    metrics,
    quality,
    
    sections,
    changes,
    
    vocabularyReplacements,
    structureChanges,
    toneAdjustments,
    personalityElements,
    
    summary,
    recommendations
  };
}

// =============================================================================
// EXPORT FUNCTION
// =============================================================================

export function exportHumanizationReport(
  analysis: HumanizationAnalysis,
  options: HumanizationExportOptions
): string {
  const { format, includeOriginal, includeChanges, includeMetrics, includeDiff } = options;
  
  if (format === 'json') {
    return JSON.stringify({
      humanizedContent: analysis.humanizedContent,
      ...(includeOriginal && { originalContent: analysis.originalContent }),
      ...(includeMetrics && { metrics: analysis.metrics, quality: analysis.quality }),
      ...(includeChanges && { changes: analysis.changes }),
      summary: analysis.summary,
      recommendations: analysis.recommendations
    }, null, 2);
  }
  
  if (format === 'text') {
    let output = 'CONTENT HUMANIZATION REPORT\n';
    output += '='.repeat(50) + '\n\n';
    
    output += 'HUMANIZED CONTENT:\n';
    output += '-'.repeat(30) + '\n';
    output += analysis.humanizedContent + '\n\n';
    
    if (includeOriginal) {
      output += 'ORIGINAL CONTENT:\n';
      output += '-'.repeat(30) + '\n';
      output += analysis.originalContent + '\n\n';
    }
    
    if (includeMetrics) {
      output += 'METRICS:\n';
      output += '-'.repeat(30) + '\n';
      output += `AI Score: ${analysis.metrics.originalAIScore}% â†’ ${analysis.metrics.humanizedAIScore}%\n`;
      output += `Quality: ${analysis.quality.overall}/100\n`;
      output += `Total Changes: ${analysis.metrics.totalChanges}\n\n`;
    }
    
    output += 'SUMMARY:\n';
    output += '-'.repeat(30) + '\n';
    output += `Verdict: ${analysis.summary.verdict}\n`;
    output += `Detectability: ${analysis.summary.estimatedDetectability}\n`;
    
    return output;
  }
  
  // Markdown format
  let output = '# Content Humanization Report\n\n';
  
  output += '## Humanized Content\n\n';
  output += analysis.humanizedContent + '\n\n';
  
  if (includeOriginal) {
    output += '## Original Content\n\n';
    output += analysis.originalContent + '\n\n';
  }
  
  if (includeMetrics) {
    output += '## Metrics\n\n';
    output += `| Metric | Before | After |\n`;
    output += `|--------|--------|-------|\n`;
    output += `| AI Score | ${analysis.metrics.originalAIScore}% | ${analysis.metrics.humanizedAIScore}% |\n`;
    output += `| Readability | ${analysis.metrics.readabilityBefore.toFixed(1)} | ${analysis.metrics.readabilityAfter.toFixed(1)} |\n`;
    output += `| Sentence Variance | ${analysis.metrics.sentenceVarianceBefore.toFixed(1)} | ${analysis.metrics.sentenceVarianceAfter.toFixed(1)} |\n\n`;
    
    output += '## Quality Scores\n\n';
    output += `- Naturalness: ${analysis.quality.naturalness}/100\n`;
    output += `- Coherence: ${analysis.quality.coherence}/100\n`;
    output += `- Engagement: ${analysis.quality.engagement}/100\n`;
    output += `- Authenticity: ${analysis.quality.authenticity}/100\n`;
    output += `- **Overall: ${analysis.quality.overall}/100**\n\n`;
  }
  
  if (includeChanges && analysis.changes.length > 0) {
    output += '## Changes Made\n\n';
    analysis.changes.forEach(change => {
      output += `- **${change.type}**: "${change.original}" â†’ "${change.humanized}"\n`;
    });
    output += '\n';
  }
  
  output += '## Summary\n\n';
  output += `**Verdict:** ${analysis.summary.verdict}\n`;
  output += `**Estimated Detectability:** ${analysis.summary.estimatedDetectability}\n\n`;
  
  if (analysis.summary.improvements.length > 0) {
    output += '### Improvements\n\n';
    analysis.summary.improvements.forEach(imp => {
      output += `- ${imp}\n`;
    });
    output += '\n';
  }
  
  if (analysis.summary.warnings.length > 0) {
    output += '### Warnings\n\n';
    analysis.summary.warnings.forEach(warning => {
      output += `- âš ï¸ ${warning}\n`;
    });
    output += '\n';
  }
  
  output += '## Recommendations\n\n';
  analysis.recommendations.forEach(rec => {
    output += `### ${rec.title}\n`;
    output += `${rec.description}\n`;
    output += `**Action:** ${rec.action}\n\n`;
  });
  
  return output;
}

