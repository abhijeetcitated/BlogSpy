// =============================================================================
// AUTO-OPTIMIZE UTILITIES - Production Level
// =============================================================================
// One-click optimization algorithms for content improvement
// =============================================================================

import {
  OptimizationAction,
  OptimizationActionType,
  OptimizationAnalysis,
  OptimizationCategory,
  OptimizationPriority,
  OptimizationScores,
  OptimizationSettings,
  OptimizationSummary,
  TextRange,
  DEFAULT_OPTIMIZATION_SETTINGS,
  ACTION_TYPE_INFO
} from '@/src/features/ai-writer/types/tools/auto-optimize.types';

// =============================================================================
// WORD SIMPLIFICATION DATABASE
// =============================================================================

const WORD_SIMPLIFICATIONS: Record<string, string> = {
  // Common complex words -> simple alternatives
  'utilize': 'use',
  'utilization': 'use',
  'implementation': 'setup',
  'implement': 'set up',
  'functionality': 'feature',
  'facilitate': 'help',
  'endeavor': 'try',
  'commence': 'start',
  'terminate': 'end',
  'approximately': 'about',
  'subsequently': 'later',
  'nevertheless': 'still',
  'furthermore': 'also',
  'consequently': 'so',
  'notwithstanding': 'despite',
  'aforementioned': 'previous',
  'heretofore': 'before',
  'hereinafter': 'below',
  'methodology': 'method',
  'demonstrate': 'show',
  'ascertain': 'find out',
  'elucidate': 'explain',
  'ameliorate': 'improve',
  'substantiate': 'prove',
  'disseminate': 'spread',
  'cognizant': 'aware',
  'necessitate': 'need',
  'endeavour': 'effort',
  'remuneration': 'pay',
  'commencement': 'start',
  'termination': 'end',
  'assistance': 'help',
  'concerning': 'about',
  'pertaining': 'about',
  'adjacent': 'next to',
  'numerous': 'many',
  'attempt': 'try',
  'acquire': 'get',
  'additional': 'more',
  'advantageous': 'helpful',
  'aggregate': 'total',
  'anticipate': 'expect',
  'apparent': 'clear',
  'appropriate': 'right',
  'beneficial': 'good',
  'capability': 'ability',
  'compensate': 'pay',
  'component': 'part',
  'comprise': 'include',
  'constitute': 'make up',
  'currently': 'now',
  'determine': 'find',
  'discontinue': 'stop',
  'eliminate': 'remove',
  'encounter': 'meet',
  'equivalent': 'equal',
  'establish': 'set up',
  'evaluate': 'check',
  'evident': 'clear',
  'excessive': 'too much',
  'expedite': 'speed up',
  'finalize': 'finish',
  'forthcoming': 'coming',
  'generate': 'create',
  'identical': 'same',
  'immediately': 'now',
  'indicate': 'show',
  'initiate': 'start',
  'inquire': 'ask',
  'magnitude': 'size',
  'maintain': 'keep',
  'maximum': 'most',
  'minimum': 'least',
  'modify': 'change',
  'monitor': 'watch',
  'notify': 'tell',
  'obtain': 'get',
  'operate': 'run',
  'optimum': 'best',
  'participate': 'join',
  'permit': 'let',
  'portion': 'part',
  'possess': 'have',
  'prioritize': 'rank',
  'probability': 'chance',
  'procure': 'get',
  'proficiency': 'skill',
  'prohibit': 'ban',
  'purchase': 'buy',
  'recurrence': 'return',
  'regarding': 'about',
  'remainder': 'rest',
  'remit': 'send',
  'render': 'make',
  'request': 'ask',
  'require': 'need',
  'reside': 'live',
  'retain': 'keep',
  'reveal': 'show',
  'selection': 'choice',
  'significantly': 'greatly',
  'similar': 'like',
  'solicit': 'ask for',
  'specified': 'given',
  'strategize': 'plan',
  'subsequent': 'later',
  'substantial': 'large',
  'sufficient': 'enough',
  'supplement': 'add to',
  'transform': 'change',
  'transmit': 'send',
  'transpire': 'happen',
  'ultimately': 'finally',
  'validate': 'confirm',
  'verification': 'check',
  'visualize': 'see',
  'modification': 'change',
  'prior': 'before'
};

// =============================================================================
// FILLER WORDS TO REMOVE
// =============================================================================

const FILLER_WORDS: string[] = [
  'actually',
  'basically',
  'literally',
  'honestly',
  'really',
  'very',
  'just',
  'quite',
  'rather',
  'somewhat',
  'probably',
  'perhaps',
  'maybe',
  'possibly',
  'seemingly',
  'apparently',
  'virtually',
  'practically',
  'essentially',
  'definitely',
  'certainly',
  'absolutely',
  'totally',
  'completely',
  'entirely',
  'utterly',
  'simply',
  'merely',
  'kind of',
  'sort of',
  'in order to',
  'due to the fact that',
  'in spite of the fact that',
  'at the present time',
  'at this point in time',
  'in the event that',
  'it is important to note that',
  'it should be noted that',
  'needless to say',
  'the fact that',
  'for the purpose of',
  'in terms of',
  'with regard to',
  'as a matter of fact',
  'in actual fact',
  'basically speaking',
  'in essence'
];

// =============================================================================
// PASSIVE VOICE PATTERNS
// =============================================================================

const PASSIVE_INDICATORS = [
  'was',
  'were',
  'is',
  'are',
  'been',
  'being',
  'be'
];

const PAST_PARTICIPLE_ENDINGS = ['ed', 'en', 'nt', 'wn', 'ne'];

// =============================================================================
// TEXT EXTRACTION
// =============================================================================

/**
 * Extract plain text from editor content
 */
function optExtractPlainText(content: string): string {
  // Remove HTML tags if present
  let text = content.replace(/<[^>]+>/g, ' ');
  
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Split text into sentences
 */
function optSplitIntoSentences(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Split text into words
 */
function optSplitIntoWords(text: string): string[] {
  return text.toLowerCase().match(/\b[a-z]+\b/gi) || [];
}

/**
 * Split text into paragraphs
 */
function optSplitIntoParagraphs(text: string): string[] {
  return text.split(/\n\n+/).filter(p => p.trim().length > 0);
}

// =============================================================================
// SENTENCE ANALYSIS
// =============================================================================

/**
 * Find long sentences that need shortening
 */
export function findLongSentences(
  text: string,
  maxWords: number = 25
): Array<{ sentence: string; wordCount: number; position: TextRange }> {
  const sentences = optSplitIntoSentences(text);
  const longSentences: Array<{ sentence: string; wordCount: number; position: TextRange }> = [];
  
  let currentPosition = 0;
  
  for (const sentence of sentences) {
    const words = optSplitIntoWords(sentence);
    const start = text.indexOf(sentence, currentPosition);
    const end = start + sentence.length;
    
    if (words.length > maxWords) {
      longSentences.push({
        sentence,
        wordCount: words.length,
        position: { start, end }
      });
    }
    
    currentPosition = end;
  }
  
  return longSentences;
}

/**
 * Generate shorter versions of a long sentence
 */
export function shortenSentence(sentence: string): string[] {
  // Find natural break points
  const breakPoints = [
    /, (and|but|or|so|yet|for|nor|while|although|because|since|when|if|unless|however|therefore|moreover|furthermore|meanwhile|otherwise) /gi,
    /, which /gi,
    /, who /gi,
    /; /g,
    / - /g
  ];
  
  for (const pattern of breakPoints) {
    const match = sentence.match(pattern);
    if (match) {
      const parts = sentence.split(pattern).filter(p => p.trim().length > 3);
      if (parts.length >= 2) {
        // Capitalize first letter of each part
        return parts.map(part => {
          const trimmed = part.trim();
          return trimmed.charAt(0).toUpperCase() + trimmed.slice(1) + '.';
        });
      }
    }
  }
  
  // If no natural break points, try to split at middle
  const words = sentence.split(' ');
  if (words.length > 20) {
    const midPoint = Math.floor(words.length / 2);
    const firstHalf = words.slice(0, midPoint).join(' ') + '.';
    const secondHalf = words.slice(midPoint).join(' ');
    return [
      firstHalf,
      secondHalf.charAt(0).toUpperCase() + secondHalf.slice(1)
    ];
  }
  
  return [sentence];
}

// =============================================================================
// WORD SIMPLIFICATION
// =============================================================================

/**
 * Find complex words that can be simplified
 */
export function findComplexWords(
  text: string
): Array<{ word: string; simpler: string; position: TextRange }> {
  const complexWords: Array<{ word: string; simpler: string; position: TextRange }> = [];
  const lowerText = text.toLowerCase();
  
  for (const [complex, simple] of Object.entries(WORD_SIMPLIFICATIONS)) {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    let match;
    
    while ((match = regex.exec(lowerText)) !== null) {
      complexWords.push({
        word: match[0],
        simpler: simple,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }
  }
  
  return complexWords;
}

/**
 * Count syllables in a word
 */
function optCountSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  
  if (word.length <= 2) return 1;
  
  // Count vowel groups
  const vowels = 'aeiouy';
  let count = 0;
  let prevWasVowel = false;
  
  for (const char of word) {
    const isVowel = vowels.includes(char);
    if (isVowel && !prevWasVowel) {
      count++;
    }
    prevWasVowel = isVowel;
  }
  
  // Adjust for silent e
  if (word.endsWith('e') && count > 1) {
    count--;
  }
  
  // Adjust for -le endings
  if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) {
    count++;
  }
  
  return Math.max(count, 1);
}

/**
 * Find words with many syllables (3+)
 */
export function findPolysyllabicWords(
  text: string,
  minSyllables: number = 3
): Array<{ word: string; syllables: number; position: TextRange }> {
  const words = text.match(/\b[a-zA-Z]+\b/g) || [];
  const polysyllabic: Array<{ word: string; syllables: number; position: TextRange }> = [];
  
  let currentPosition = 0;
  
  for (const word of words) {
    const syllables = optCountSyllables(word);
    const start = text.indexOf(word, currentPosition);
    const end = start + word.length;
    
    if (syllables >= minSyllables && word.length > 4) {
      // Check if there's a simpler alternative
      const lower = word.toLowerCase();
      if (WORD_SIMPLIFICATIONS[lower]) {
        polysyllabic.push({
          word,
          syllables,
          position: { start, end }
        });
      }
    }
    
    currentPosition = end;
  }
  
  return polysyllabic;
}

// =============================================================================
// FILLER WORD DETECTION
// =============================================================================

/**
 * Find filler words that can be removed
 */
export function findFillerWords(
  text: string
): Array<{ filler: string; position: TextRange; canRemove: boolean }> {
  const fillers: Array<{ filler: string; position: TextRange; canRemove: boolean }> = [];
  const lowerText = text.toLowerCase();
  
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    let match;
    
    while ((match = regex.exec(lowerText)) !== null) {
      // Check if removing would still make sense
      const before = text.substring(Math.max(0, match.index - 20), match.index);
      const after = text.substring(match.index + filler.length, match.index + filler.length + 20);
      
      // Simple heuristic: can remove if not at start of sentence
      const canRemove = before.trim().length > 0 && !before.match(/[.!?]\s*$/);
      
      fillers.push({
        filler: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        canRemove
      });
    }
  }
  
  return fillers;
}

/**
 * Remove a filler word from text
 */
export function removeFillerWord(text: string, position: TextRange): string {
  const before = text.substring(0, position.start);
  const after = text.substring(position.end);
  
  // Handle spacing
  let result = before.trimEnd() + ' ' + after.trimStart();
  
  // Clean up double spaces
  result = result.replace(/\s+/g, ' ');
  
  return result;
}

// =============================================================================
// PASSIVE VOICE DETECTION
// =============================================================================

/**
 * Detect passive voice sentences
 */
export function findPassiveVoice(
  text: string
): Array<{ sentence: string; position: TextRange; suggestion?: string }> {
  const sentences = optSplitIntoSentences(text);
  const passiveVoice: Array<{ sentence: string; position: TextRange; suggestion?: string }> = [];
  
  let currentPosition = 0;
  
  for (const sentence of sentences) {
    if (isPassiveVoice(sentence)) {
      const start = text.indexOf(sentence, currentPosition);
      const end = start + sentence.length;
      
      passiveVoice.push({
        sentence,
        position: { start, end },
        suggestion: convertToActiveVoice(sentence)
      });
    }
    
    currentPosition = text.indexOf(sentence, currentPosition) + sentence.length;
  }
  
  return passiveVoice;
}

/**
 * Check if a sentence is in passive voice
 */
function isPassiveVoice(sentence: string): boolean {
  const words = sentence.toLowerCase().split(/\s+/);
  
  for (let i = 0; i < words.length - 1; i++) {
    const currentWord = words[i].replace(/[^a-z]/g, '');
    const nextWord = words[i + 1]?.replace(/[^a-z]/g, '') || '';
    
    // Check for passive indicator followed by past participle
    if (PASSIVE_INDICATORS.includes(currentWord)) {
      // Check if next word looks like a past participle
      if (
        PAST_PARTICIPLE_ENDINGS.some(ending => nextWord.endsWith(ending)) ||
        nextWord.endsWith('ed')
      ) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Attempt to convert passive to active voice
 * This is a simplified heuristic - full conversion needs NLP
 */
function convertToActiveVoice(sentence: string): string | undefined {
  // This is a simplified version - real implementation would use NLP
  // For now, return undefined to indicate manual review needed
  return undefined;
}

// =============================================================================
// ADVERB DETECTION
// =============================================================================

const COMMON_ADVERBS = [
  'quickly', 'slowly', 'carefully', 'easily', 'hardly', 'nearly',
  'barely', 'completely', 'absolutely', 'totally', 'extremely',
  'incredibly', 'remarkably', 'significantly', 'substantially',
  'considerably', 'dramatically', 'noticeably', 'particularly',
  'especially', 'mainly', 'mostly', 'largely', 'primarily',
  'generally', 'usually', 'normally', 'typically', 'often',
  'frequently', 'occasionally', 'sometimes', 'rarely', 'seldom',
  'never', 'always', 'constantly', 'continuously', 'repeatedly',
  'suddenly', 'immediately', 'instantly', 'eventually', 'finally',
  'ultimately', 'obviously', 'clearly', 'apparently', 'evidently'
];

/**
 * Find adverbs that could be replaced with stronger verbs
 */
export function findAdverbs(
  text: string
): Array<{ adverb: string; position: TextRange }> {
  const adverbs: Array<{ adverb: string; position: TextRange }> = [];
  
  for (const adverb of COMMON_ADVERBS) {
    const regex = new RegExp(`\\b${adverb}\\b`, 'gi');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      adverbs.push({
        adverb: match[0],
        position: { start: match.index, end: match.index + match[0].length }
      });
    }
  }
  
  return adverbs;
}

// =============================================================================
// PARAGRAPH ANALYSIS
// =============================================================================

/**
 * Find paragraphs that are too long
 */
export function findLongParagraphs(
  text: string,
  maxSentences: number = 5
): Array<{ paragraph: string; sentenceCount: number; position: TextRange }> {
  const paragraphs = optSplitIntoParagraphs(text);
  const longParagraphs: Array<{ paragraph: string; sentenceCount: number; position: TextRange }> = [];
  
  let currentPosition = 0;
  
  for (const paragraph of paragraphs) {
    const sentences = optSplitIntoSentences(paragraph);
    const start = text.indexOf(paragraph, currentPosition);
    const end = start + paragraph.length;
    
    if (sentences.length > maxSentences) {
      longParagraphs.push({
        paragraph,
        sentenceCount: sentences.length,
        position: { start, end }
      });
    }
    
    currentPosition = end;
  }
  
  return longParagraphs;
}

/**
 * Suggest paragraph breaks
 */
export function suggestParagraphBreak(
  paragraph: string
): string[] {
  const sentences = optSplitIntoSentences(paragraph);
  
  if (sentences.length <= 3) {
    return [paragraph];
  }
  
  // Find best break point (topic shift, transition word)
  const transitionWords = [
    'however', 'therefore', 'furthermore', 'moreover', 'additionally',
    'on the other hand', 'in contrast', 'as a result', 'consequently',
    'in conclusion', 'to summarize', 'for example', 'for instance'
  ];
  
  let breakIndex = Math.floor(sentences.length / 2);
  
  // Look for transition word to break at
  for (let i = 2; i < sentences.length - 1; i++) {
    const lower = sentences[i].toLowerCase();
    if (transitionWords.some(tw => lower.startsWith(tw))) {
      breakIndex = i;
      break;
    }
  }
  
  const firstPart = sentences.slice(0, breakIndex).join(' ');
  const secondPart = sentences.slice(breakIndex).join(' ');
  
  return [firstPart, secondPart];
}

// =============================================================================
// SEO ANALYSIS
// =============================================================================

/**
 * Analyze keyword usage
 */
export function analyzeKeywordUsage(
  text: string,
  keyword: string,
  targetDensity: number = 1.5
): {
  count: number;
  density: number;
  isOptimal: boolean;
  needsMore: boolean;
  positions: TextRange[];
} {
  const words = optSplitIntoWords(text);
  const totalWords = words.length;
  
  const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
  const matches: TextRange[] = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    matches.push({ start: match.index, end: match.index + match[0].length });
  }
  
  const count = matches.length;
  const density = totalWords > 0 ? (count / totalWords) * 100 : 0;
  const isOptimal = density >= targetDensity * 0.8 && density <= targetDensity * 1.5;
  const needsMore = density < targetDensity * 0.8;
  
  return {
    count,
    density,
    isOptimal,
    needsMore,
    positions: matches
  };
}

/**
 * Find good positions to add keyword
 */
export function findKeywordInsertionPoints(
  text: string,
  keyword: string
): Array<{ position: number; suggestion: string }> {
  const insertionPoints: Array<{ position: number; suggestion: string }> = [];
  const sentences = optSplitIntoSentences(text);
  
  let currentPosition = 0;
  
  // Check first paragraph
  const firstParagraph = optSplitIntoParagraphs(text)[0];
  if (firstParagraph && !firstParagraph.toLowerCase().includes(keyword.toLowerCase())) {
    insertionPoints.push({
      position: 0,
      suggestion: `Consider adding "${keyword}" to the introduction`
    });
  }
  
  // Find topic sentences without keyword
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const position = text.indexOf(sentence, currentPosition);
    
    // Check if this looks like a topic sentence (first in paragraph or after blank line)
    const beforeText = text.substring(Math.max(0, position - 10), position);
    const isTopicSentence = beforeText.includes('\n\n') || position === 0;
    
    if (isTopicSentence && !sentence.toLowerCase().includes(keyword.toLowerCase())) {
      insertionPoints.push({
        position,
        suggestion: `Consider adding "${keyword}" to this topic sentence`
      });
    }
    
    currentPosition = position + sentence.length;
  }
  
  return insertionPoints.slice(0, 3); // Limit suggestions
}

// =============================================================================
// STRUCTURE ANALYSIS
// =============================================================================

/**
 * Detect content that could be converted to a list
 */
export function findListOpportunities(
  text: string
): Array<{ content: string; position: TextRange; type: 'bullet' | 'numbered' }> {
  const opportunities: Array<{ content: string; position: TextRange; type: 'bullet' | 'numbered' }> = [];
  
  // Look for patterns like "X, Y, and Z"
  const listPattern = /([A-Z][^.]+),\s*([^,]+),\s*and\s+([^.]+)\./gi;
  let match;
  
  while ((match = listPattern.exec(text)) !== null) {
    // Only suggest if there are 3+ items
    const items = match[0].split(/,\s*(?:and\s+)?/).filter(i => i.trim().length > 0);
    if (items.length >= 3) {
      opportunities.push({
        content: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        type: 'bullet'
      });
    }
  }
  
  // Look for step-by-step instructions
  const stepPatterns = [
    /first[,\s].*?second[,\s].*?third/gi,
    /step 1.*?step 2.*?step 3/gi,
    /1\).*?2\).*?3\)/gi
  ];
  
  for (const pattern of stepPatterns) {
    let stepMatch;
    while ((stepMatch = pattern.exec(text)) !== null) {
      opportunities.push({
        content: stepMatch[0],
        position: { start: stepMatch.index, end: stepMatch.index + stepMatch[0].length },
        type: 'numbered'
      });
    }
  }
  
  return opportunities;
}

/**
 * Analyze heading structure
 */
export function analyzeHeadingStructure(
  content: string
): {
  hasH1: boolean;
  headingCount: number;
  avgWordsPerSection: number;
  needsMoreHeadings: boolean;
  suggestions: string[];
} {
  // Extract headings from HTML content
  const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
  const h2Matches = content.match(/<h2[^>]*>.*?<\/h2>/gi) || [];
  const h3Matches = content.match(/<h3[^>]*>.*?<\/h3>/gi) || [];
  
  const text = optExtractPlainText(content);
  const wordCount = optSplitIntoWords(text).length;
  const headingCount = h1Matches.length + h2Matches.length + h3Matches.length;
  
  const avgWordsPerSection = headingCount > 0 ? wordCount / headingCount : wordCount;
  const idealWordsPerSection = 300;
  const needsMoreHeadings = avgWordsPerSection > idealWordsPerSection;
  
  const suggestions: string[] = [];
  
  if (h1Matches.length === 0) {
    suggestions.push('Add an H1 heading (main title)');
  } else if (h1Matches.length > 1) {
    suggestions.push('Use only one H1 heading per page');
  }
  
  if (needsMoreHeadings) {
    const suggestedHeadings = Math.ceil(wordCount / idealWordsPerSection);
    suggestions.push(`Consider adding ${suggestedHeadings - headingCount} more subheadings to break up content`);
  }
  
  if (h3Matches.length > 0 && h2Matches.length === 0) {
    suggestions.push('Add H2 headings before using H3 headings');
  }
  
  return {
    hasH1: h1Matches.length === 1,
    headingCount,
    avgWordsPerSection,
    needsMoreHeadings,
    suggestions
  };
}

// =============================================================================
// SCORE CALCULATION
// =============================================================================

/**
 * Calculate optimization scores
 */
export function calculateOptimizationScores(
  content: string,
  settings: OptimizationSettings
): OptimizationScores {
  const text = optExtractPlainText(content);
  const sentences = optSplitIntoSentences(text);
  const words = optSplitIntoWords(text);
  
  // Readability score (based on sentence/word complexity)
  const avgSentenceLength = sentences.length > 0 
    ? words.length / sentences.length 
    : 0;
  const complexWordRatio = words.filter(w => optCountSyllables(w) >= 3).length / Math.max(words.length, 1);
  
  const readabilityScore = Math.max(0, Math.min(100,
    100 - (avgSentenceLength - 15) * 2 - complexWordRatio * 100
  ));
  
  // SEO score (based on keyword usage, headings)
  const headingAnalysis = analyzeHeadingStructure(content);
  let seoScore = 50;
  
  if (settings.primaryKeyword) {
    const keywordAnalysis = analyzeKeywordUsage(text, settings.primaryKeyword, settings.targetKeywordDensity);
    if (keywordAnalysis.isOptimal) seoScore += 30;
    else if (keywordAnalysis.count > 0) seoScore += 15;
  }
  
  if (headingAnalysis.hasH1) seoScore += 10;
  if (headingAnalysis.headingCount >= 3) seoScore += 10;
  
  seoScore = Math.min(100, seoScore);
  
  // Engagement score (based on questions, variety)
  const questionCount = (text.match(/\?/g) || []).length;
  const exclamationCount = (text.match(/!/g) || []).length;
  
  let engagementScore = 50;
  if (questionCount >= 2) engagementScore += 20;
  if (exclamationCount >= 1 && exclamationCount <= 3) engagementScore += 10;
  
  engagementScore = Math.min(100, engagementScore);
  
  // Structure score
  const paragraphs = optSplitIntoParagraphs(text);
  const avgParagraphLength = paragraphs.length > 0
    ? sentences.length / paragraphs.length
    : sentences.length;
  
  let structureScore = 50;
  if (avgParagraphLength >= 2 && avgParagraphLength <= 5) structureScore += 30;
  if (headingAnalysis.headingCount >= 3) structureScore += 20;
  
  structureScore = Math.min(100, structureScore);
  
  // Grammar score (simplified - real implementation would use NLP)
  const fillerCount = findFillerWords(text).length;
  const passiveCount = findPassiveVoice(text).length;
  
  let grammarScore = 100;
  grammarScore -= fillerCount * 2;
  grammarScore -= passiveCount * 5;
  grammarScore = Math.max(0, grammarScore);
  
  // Overall score
  const overall = (
    readabilityScore * 0.25 +
    seoScore * 0.25 +
    engagementScore * 0.15 +
    structureScore * 0.2 +
    grammarScore * 0.15
  );
  
  return {
    overall,
    readability: readabilityScore,
    seo: seoScore,
    engagement: engagementScore,
    structure: structureScore,
    grammar: grammarScore
  };
}

// =============================================================================
// ACTION GENERATION
// =============================================================================

let actionIdCounter = 0;

/**
 * Generate unique action ID
 */
function generateActionId(): string {
  return `opt-action-${Date.now()}-${++actionIdCounter}`;
}

/**
 * Generate all optimization actions
 */
export function generateOptimizationActions(
  content: string,
  settings: OptimizationSettings
): OptimizationAction[] {
  const actions: OptimizationAction[] = [];
  const text = optExtractPlainText(content);
  
  // Generate readability actions
  if (settings.enableReadability) {
    actions.push(...generateReadabilityActions(text));
  }
  
  // Generate SEO actions
  if (settings.enableSeo) {
    actions.push(...generateSeoActions(text, settings));
  }
  
  // Generate structure actions
  if (settings.enableStructure) {
    actions.push(...generateStructureActions(content));
  }
  
  // Generate style actions
  if (settings.enableStyle) {
    actions.push(...generateStyleActions(text));
  }
  
  // Sort by priority
  const priorityOrder: Record<OptimizationPriority, number> = {
    'critical': 0,
    'high': 1,
    'medium': 2,
    'low': 3
  };
  
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return actions;
}

/**
 * Generate readability optimization actions
 */
function generateReadabilityActions(text: string): OptimizationAction[] {
  const actions: OptimizationAction[] = [];
  
  // Long sentences
  const longSentences = findLongSentences(text, 25);
  for (const { sentence, wordCount, position } of longSentences) {
    const shortened = shortenSentence(sentence);
    const priority: OptimizationPriority = wordCount > 40 ? 'critical' : wordCount > 30 ? 'high' : 'medium';
    
    actions.push({
      id: generateActionId(),
      type: 'shorten-sentence',
      category: 'readability',
      priority,
      status: 'pending',
      title: 'Shorten Long Sentence',
      description: `This sentence has ${wordCount} words. Consider breaking it up.`,
      impact: 'Improves readability and comprehension',
      location: position,
      originalText: sentence,
      suggestedText: shortened.join('\n\n'),
      reason: `Sentences over 25 words are harder to read. This sentence has ${wordCount} words.`,
      metrics: {
        scoreBefore: 0,
        scoreAfter: 0,
        improvement: 0,
        confidenceLevel: 0.85
      },
      canAutoApply: shortened.length > 1,
      requiresReview: true,
      aiGenerated: false,
      createdAt: new Date().toISOString()
    });
  }
  
  // Complex words
  const complexWords = findComplexWords(text);
  for (const { word, simpler, position } of complexWords.slice(0, 10)) { // Limit to top 10
    actions.push({
      id: generateActionId(),
      type: 'simplify-word',
      category: 'readability',
      priority: 'medium',
      status: 'pending',
      title: 'Simplify Word',
      description: `Replace "${word}" with "${simpler}"`,
      impact: 'Makes content easier to understand',
      location: position,
      originalText: word,
      suggestedText: simpler,
      reason: `"${simpler}" is easier to understand than "${word}"`,
      metrics: {
        scoreBefore: 0,
        scoreAfter: 0,
        improvement: 0,
        confidenceLevel: 0.9
      },
      canAutoApply: true,
      requiresReview: false,
      aiGenerated: false,
      createdAt: new Date().toISOString()
    });
  }
  
  // Filler words
  const fillers = findFillerWords(text);
  for (const { filler, position, canRemove } of fillers.filter(f => f.canRemove).slice(0, 5)) {
    actions.push({
      id: generateActionId(),
      type: 'remove-filler',
      category: 'readability',
      priority: 'low',
      status: 'pending',
      title: 'Remove Filler Word',
      description: `Remove unnecessary word "${filler}"`,
      impact: 'Makes writing more concise',
      location: position,
      originalText: filler,
      suggestedText: '',
      reason: `"${filler}" is a filler word that adds no meaning`,
      metrics: {
        scoreBefore: 0,
        scoreAfter: 0,
        improvement: 0,
        confidenceLevel: 0.8
      },
      canAutoApply: true,
      requiresReview: true,
      aiGenerated: false,
      createdAt: new Date().toISOString()
    });
  }
  
  // Passive voice
  const passiveVoice = findPassiveVoice(text);
  for (const { sentence, position } of passiveVoice.slice(0, 5)) {
    actions.push({
      id: generateActionId(),
      type: 'remove-passive',
      category: 'readability',
      priority: 'medium',
      status: 'pending',
      title: 'Convert Passive Voice',
      description: 'Convert passive voice to active voice',
      impact: 'Makes writing more direct and engaging',
      location: position,
      originalText: sentence,
      suggestedText: '', // Needs manual review
      reason: 'Active voice is more direct and easier to read',
      metrics: {
        scoreBefore: 0,
        scoreAfter: 0,
        improvement: 0,
        confidenceLevel: 0.7
      },
      canAutoApply: false,
      requiresReview: true,
      aiGenerated: false,
      createdAt: new Date().toISOString()
    });
  }
  
  // Adverbs
  const adverbs = findAdverbs(text);
  for (const { adverb, position } of adverbs.slice(0, 3)) {
    actions.push({
      id: generateActionId(),
      type: 'remove-adverb',
      category: 'readability',
      priority: 'low',
      status: 'pending',
      title: 'Consider Removing Adverb',
      description: `"${adverb}" might be replaced with a stronger verb`,
      impact: 'Makes writing more concise',
      location: position,
      originalText: adverb,
      suggestedText: '', // Needs context
      reason: 'Strong verbs are often better than verb + adverb',
      metrics: {
        scoreBefore: 0,
        scoreAfter: 0,
        improvement: 0,
        confidenceLevel: 0.6
      },
      canAutoApply: false,
      requiresReview: true,
      aiGenerated: false,
      createdAt: new Date().toISOString()
    });
  }
  
  return actions;
}

/**
 * Generate SEO optimization actions
 */
function generateSeoActions(
  text: string,
  settings: OptimizationSettings
): OptimizationAction[] {
  const actions: OptimizationAction[] = [];
  
  // Keyword optimization
  if (settings.primaryKeyword) {
    const keywordAnalysis = analyzeKeywordUsage(text, settings.primaryKeyword, settings.targetKeywordDensity);
    
    if (keywordAnalysis.needsMore) {
      const insertionPoints = findKeywordInsertionPoints(text, settings.primaryKeyword);
      
      for (const { position, suggestion } of insertionPoints) {
        actions.push({
          id: generateActionId(),
          type: 'add-keyword',
          category: 'seo',
          priority: 'high',
          status: 'pending',
          title: 'Add Target Keyword',
          description: suggestion,
          impact: 'Improves keyword optimization',
          location: { start: position, end: position },
          originalText: '',
          suggestedText: settings.primaryKeyword,
          reason: `Current keyword density is ${keywordAnalysis.density.toFixed(1)}%, target is ${settings.targetKeywordDensity}%`,
          metrics: {
            scoreBefore: keywordAnalysis.density,
            scoreAfter: settings.targetKeywordDensity,
            improvement: settings.targetKeywordDensity - keywordAnalysis.density,
            confidenceLevel: 0.75
          },
          canAutoApply: false,
          requiresReview: true,
          aiGenerated: false,
          createdAt: new Date().toISOString()
        });
      }
    }
  }
  
  return actions;
}

/**
 * Generate structure optimization actions
 */
function generateStructureActions(content: string): OptimizationAction[] {
  const actions: OptimizationAction[] = [];
  const text = optExtractPlainText(content);
  
  // Long paragraphs
  const longParagraphs = findLongParagraphs(text, 5);
  for (const { paragraph, sentenceCount, position } of longParagraphs.slice(0, 3)) {
    const split = suggestParagraphBreak(paragraph);
    
    if (split.length > 1) {
      actions.push({
        id: generateActionId(),
        type: 'break-paragraph',
        category: 'structure',
        priority: sentenceCount > 7 ? 'high' : 'medium',
        status: 'pending',
        title: 'Break Long Paragraph',
        description: `This paragraph has ${sentenceCount} sentences. Consider splitting it.`,
        impact: 'Improves readability and scannability',
        location: position,
        originalText: paragraph,
        suggestedText: split.join('\n\n'),
        reason: `Paragraphs over 5 sentences are harder to read. This has ${sentenceCount}.`,
        metrics: {
          scoreBefore: 0,
          scoreAfter: 0,
          improvement: 0,
          confidenceLevel: 0.8
        },
        canAutoApply: true,
        requiresReview: true,
        aiGenerated: false,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  // List opportunities
  const listOpportunities = findListOpportunities(text);
  for (const { content: listContent, position, type } of listOpportunities.slice(0, 2)) {
    actions.push({
      id: generateActionId(),
      type: 'add-list',
      category: 'structure',
      priority: 'medium',
      status: 'pending',
      title: 'Convert to List',
      description: `This content could be formatted as a ${type} list`,
      impact: 'Improves scannability and engagement',
      location: position,
      originalText: listContent,
      suggestedText: '', // Would need AI to format
      reason: 'Lists are easier to scan and understand',
      metrics: {
        scoreBefore: 0,
        scoreAfter: 0,
        improvement: 0,
        confidenceLevel: 0.7
      },
      canAutoApply: false,
      requiresReview: true,
      aiGenerated: false,
      createdAt: new Date().toISOString()
    });
  }
  
  // Heading suggestions
  const headingAnalysis = analyzeHeadingStructure(content);
  for (const suggestion of headingAnalysis.suggestions) {
    const priority: OptimizationPriority = suggestion.includes('H1') ? 'high' : 'medium';
    
    actions.push({
      id: generateActionId(),
      type: 'add-heading',
      category: 'structure',
      priority,
      status: 'pending',
      title: 'Heading Improvement',
      description: suggestion,
      impact: 'Improves content structure and SEO',
      location: { start: 0, end: 0 },
      originalText: '',
      suggestedText: '',
      reason: suggestion,
      metrics: {
        scoreBefore: 0,
        scoreAfter: 0,
        improvement: 0,
        confidenceLevel: 0.85
      },
      canAutoApply: false,
      requiresReview: true,
      aiGenerated: false,
      createdAt: new Date().toISOString()
    });
  }
  
  return actions;
}

/**
 * Generate style optimization actions
 */
function generateStyleActions(text: string): OptimizationAction[] {
  // Style actions would typically use AI/NLP
  // This is a placeholder for the structure
  return [];
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Run complete optimization analysis
 */
export function analyzeForOptimization(
  content: string,
  settings: OptimizationSettings = DEFAULT_OPTIMIZATION_SETTINGS
): OptimizationAnalysis {
  const scoreBefore = calculateOptimizationScores(content, settings);
  const actions = generateOptimizationActions(content, settings);
  
  // Calculate projected scores after optimization
  const scoreAfter = { ...scoreBefore };
  
  // Simple projection based on action counts
  const readabilityActions = actions.filter(a => a.category === 'readability').length;
  const seoActions = actions.filter(a => a.category === 'seo').length;
  const structureActions = actions.filter(a => a.category === 'structure').length;
  
  scoreAfter.readability = Math.min(100, scoreBefore.readability + readabilityActions * 2);
  scoreAfter.seo = Math.min(100, scoreBefore.seo + seoActions * 3);
  scoreAfter.structure = Math.min(100, scoreBefore.structure + structureActions * 3);
  scoreAfter.overall = (
    scoreAfter.readability * 0.25 +
    scoreAfter.seo * 0.25 +
    scoreAfter.engagement * 0.15 +
    scoreAfter.structure * 0.2 +
    scoreAfter.grammar * 0.15
  );
  
  // Generate summary
  const summary: OptimizationSummary = {
    totalImprovements: actions.length,
    readabilityGain: scoreAfter.readability - scoreBefore.readability,
    seoGain: scoreAfter.seo - scoreBefore.seo,
    estimatedTimeToApply: Math.ceil(actions.length * 0.5), // 30 seconds per action
    topRecommendations: actions
      .filter(a => a.priority === 'critical' || a.priority === 'high')
      .slice(0, 5)
      .map(a => a.title),
    warnings: []
  };
  
  // Add warnings
  if (scoreBefore.readability < 50) {
    summary.warnings.push('Content readability is below average');
  }
  if (scoreBefore.seo < 50) {
    summary.warnings.push('SEO optimization needs significant improvement');
  }
  
  // Count actions by category and priority
  const actionsByCategory: Record<OptimizationCategory, number> = {
    'readability': 0,
    'seo': 0,
    'engagement': 0,
    'structure': 0,
    'grammar': 0,
    'style': 0,
    'accessibility': 0
  };
  
  const actionsByPriority: Record<OptimizationPriority, number> = {
    'critical': 0,
    'high': 0,
    'medium': 0,
    'low': 0
  };
  
  for (const action of actions) {
    actionsByCategory[action.category]++;
    actionsByPriority[action.priority]++;
  }
  
  return {
    id: `opt-analysis-${Date.now()}`,
    contentId: '',
    analyzedAt: new Date().toISOString(),
    scoreBefore,
    scoreAfter,
    totalActions: actions.length,
    actionsByCategory,
    actionsByPriority,
    actions,
    summary,
    settings
  };
}

// =============================================================================
// ACTION APPLICATION
// =============================================================================

/**
 * Apply a single optimization action
 */
export function applyOptimizationAction(
  content: string,
  action: OptimizationAction
): { newContent: string; success: boolean; error?: string } {
  try {
    const { location, originalText, suggestedText } = action;
    
    // Verify the original text is still at the expected location
    const actualText = content.substring(location.start, location.end);
    
    if (actualText !== originalText && originalText.length > 0) {
      return {
        newContent: content,
        success: false,
        error: 'Content has changed since analysis. Please re-analyze.'
      };
    }
    
    // Apply the change
    const before = content.substring(0, location.start);
    const after = content.substring(location.end);
    const newContent = before + suggestedText + after;
    
    return {
      newContent,
      success: true
    };
  } catch (error) {
    return {
      newContent: content,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply optimization'
    };
  }
}

/**
 * Apply multiple optimization actions in batch
 */
export function applyBatchOptimizations(
  content: string,
  actions: OptimizationAction[]
): {
  newContent: string;
  applied: string[];
  failed: Array<{ id: string; error: string }>;
} {
  // Sort actions by position (reverse order to avoid offset issues)
  const sortedActions = [...actions].sort((a, b) => b.location.start - a.location.start);
  
  let currentContent = content;
  const applied: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];
  
  for (const action of sortedActions) {
    const result = applyOptimizationAction(currentContent, action);
    
    if (result.success) {
      currentContent = result.newContent;
      applied.push(action.id);
    } else {
      failed.push({ id: action.id, error: result.error || 'Unknown error' });
    }
  }
  
  return {
    newContent: currentContent,
    applied,
    failed
  };
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

/**
 * Export optimization report
 */
export function exportOptimizationReport(
  analysis: OptimizationAnalysis
): string {
  const lines: string[] = [
    '# Content Optimization Report',
    '',
    `Generated: ${new Date(analysis.analyzedAt).toLocaleString()}`,
    '',
    '## Overall Scores',
    '',
    `| Metric | Before | After | Change |`,
    `|--------|--------|-------|--------|`,
    `| Overall | ${analysis.scoreBefore.overall.toFixed(0)} | ${analysis.scoreAfter.overall.toFixed(0)} | +${(analysis.scoreAfter.overall - analysis.scoreBefore.overall).toFixed(0)} |`,
    `| Readability | ${analysis.scoreBefore.readability.toFixed(0)} | ${analysis.scoreAfter.readability.toFixed(0)} | +${(analysis.scoreAfter.readability - analysis.scoreBefore.readability).toFixed(0)} |`,
    `| SEO | ${analysis.scoreBefore.seo.toFixed(0)} | ${analysis.scoreAfter.seo.toFixed(0)} | +${(analysis.scoreAfter.seo - analysis.scoreBefore.seo).toFixed(0)} |`,
    `| Structure | ${analysis.scoreBefore.structure.toFixed(0)} | ${analysis.scoreAfter.structure.toFixed(0)} | +${(analysis.scoreAfter.structure - analysis.scoreBefore.structure).toFixed(0)} |`,
    '',
    '## Summary',
    '',
    `- **Total Improvements Found:** ${analysis.totalActions}`,
    `- **Estimated Time to Apply:** ${analysis.summary.estimatedTimeToApply} minutes`,
    '',
    '## Actions by Priority',
    ''
  ];
  
  if (analysis.actionsByPriority.critical > 0) {
    lines.push(`- 🔴 Critical: ${analysis.actionsByPriority.critical}`);
  }
  if (analysis.actionsByPriority.high > 0) {
    lines.push(`- 🟠 High: ${analysis.actionsByPriority.high}`);
  }
  if (analysis.actionsByPriority.medium > 0) {
    lines.push(`- 🟡 Medium: ${analysis.actionsByPriority.medium}`);
  }
  if (analysis.actionsByPriority.low > 0) {
    lines.push(`- 🔵 Low: ${analysis.actionsByPriority.low}`);
  }
  
  lines.push('', '## Recommended Actions', '');
  
  for (const rec of analysis.summary.topRecommendations) {
    lines.push(`- ${rec}`);
  }
  
  if (analysis.summary.warnings.length > 0) {
    lines.push('', '## Warnings', '');
    for (const warning of analysis.summary.warnings) {
      lines.push(`⚠️ ${warning}`);
    }
  }
  
  lines.push('', '## Detailed Actions', '');
  
  for (const action of analysis.actions) {
    const info = ACTION_TYPE_INFO[action.type];
    lines.push(`### ${action.title}`);
    lines.push('');
    lines.push(`- **Category:** ${info?.category || action.category}`);
    lines.push(`- **Priority:** ${action.priority}`);
    lines.push(`- **Description:** ${action.description}`);
    lines.push(`- **Reason:** ${action.reason}`);
    if (action.originalText) {
      lines.push(`- **Original:** "${action.originalText.substring(0, 100)}${action.originalText.length > 100 ? '...' : ''}"`);
    }
    if (action.suggestedText) {
      lines.push(`- **Suggested:** "${action.suggestedText.substring(0, 100)}${action.suggestedText.length > 100 ? '...' : ''}"`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

