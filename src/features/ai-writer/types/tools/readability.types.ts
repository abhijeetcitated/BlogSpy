// =============================================================================
// READABILITY ANALYZER TYPES - Production Level
// =============================================================================
// Comprehensive readability analysis like Hemingway, Grammarly, Yoast
// Industry-standard metrics: Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau
// =============================================================================

// =============================================================================
// READABILITY SCORE TYPES
// =============================================================================

/**
 * Flesch Reading Ease Score
 * Scale: 0-100 (higher = easier to read)
 */
export interface FleschReadingEase {
  score: number;
  grade: FleschGrade;
  description: string;
  schoolLevel: string;
}

export type FleschGrade = 
  | 'very-easy'      // 90-100: 5th grade
  | 'easy'           // 80-89: 6th grade
  | 'fairly-easy'    // 70-79: 7th grade
  | 'standard'       // 60-69: 8th-9th grade
  | 'fairly-hard'    // 50-59: 10th-12th grade
  | 'hard'           // 30-49: College level
  | 'very-hard';     // 0-29: College graduate

/**
 * Flesch-Kincaid Grade Level
 * US school grade level required to understand text
 */
export interface FleschKincaidGrade {
  score: number;
  gradeLevel: number;
  interpretation: string;
}

/**
 * Gunning Fog Index
 * Years of formal education needed
 */
export interface GunningFogIndex {
  score: number;
  yearsOfEducation: number;
  interpretation: string;
  targetAudience: string;
}

/**
 * SMOG Index (Simple Measure of Gobbledygook)
 * Years of education needed to understand text
 */
export interface SMOGIndex {
  score: number;
  gradeLevel: number;
  interpretation: string;
}

/**
 * Coleman-Liau Index
 * US grade level based on characters per word
 */
export interface ColemanLiauIndex {
  score: number;
  gradeLevel: number;
  interpretation: string;
}

/**
 * Automated Readability Index (ARI)
 * US grade level based on characters and words
 */
export interface AutomatedReadabilityIndex {
  score: number;
  gradeLevel: number;
  ageRange: string;
  interpretation: string;
}

/**
 * Dale-Chall Score
 * Based on difficult word percentage
 */
export interface DaleChallScore {
  score: number;
  gradeLevel: string;
  difficultWordPercentage: number;
  interpretation: string;
}

/**
 * Linsear Write Formula
 * US grade level for technical documents
 */
export interface LinsearWriteFormula {
  score: number;
  gradeLevel: number;
  interpretation: string;
}

// =============================================================================
// CONTENT ANALYSIS TYPES
// =============================================================================

/**
 * Sentence complexity analysis
 */
export interface SentenceAnalysis {
  total: number;
  averageLength: number;
  shortSentences: number;   // < 10 words
  mediumSentences: number;  // 10-20 words
  longSentences: number;    // 20-30 words
  veryLongSentences: number; // > 30 words
  distribution: SentenceLengthDistribution;
  issues: SentenceIssue[];
}

export interface SentenceLengthDistribution {
  '0-10': number;
  '11-15': number;
  '16-20': number;
  '21-25': number;
  '26-30': number;
  '31+': number;
}

export interface SentenceIssue {
  id: string;
  type: SentenceIssueType;
  sentence: string;
  wordCount: number;
  position: TextPosition;
  suggestion: string;
  severity: IssueSeverity;
}

export type SentenceIssueType = 
  | 'too-long'
  | 'too-short'
  | 'run-on'
  | 'fragment'
  | 'complex-structure'
  | 'passive-voice'
  | 'weak-opening';

/**
 * Word complexity analysis
 */
export interface WordAnalysis {
  total: number;
  unique: number;
  averageSyllables: number;
  averageLength: number;
  complexWords: number;       // 3+ syllables
  difficultWords: number;     // Not in common word list
  simpleWords: number;        // 1-2 syllables, common
  vocabularyDiversity: number; // Type-token ratio
  wordFrequency: WordFrequencyAnalysis;
  issues: WordIssue[];
}

export interface WordFrequencyAnalysis {
  mostCommon: Array<{ word: string; count: number }>;
  overused: Array<{ word: string; count: number; suggestion: string }>;
  filler: Array<{ word: string; count: number; position: number }>;
  jargon: Array<{ word: string; alternatives: string[] }>;
}

export interface WordIssue {
  id: string;
  type: WordIssueType;
  word: string;
  position: TextPosition;
  suggestion: string;
  alternatives?: string[];
  severity: IssueSeverity;
}

export type WordIssueType = 
  | 'complex-word'
  | 'jargon'
  | 'overused'
  | 'filler-word'
  | 'adverb-overuse'
  | 'weak-verb'
  | 'unclear-pronoun'
  | 'cliche';

/**
 * Paragraph analysis
 */
export interface ParagraphAnalysis {
  total: number;
  averageSentences: number;
  averageWords: number;
  shortParagraphs: number;   // < 50 words
  mediumParagraphs: number;  // 50-100 words
  longParagraphs: number;    // > 100 words
  issues: ParagraphIssue[];
}

export interface ParagraphIssue {
  id: string;
  type: ParagraphIssueType;
  paragraphIndex: number;
  wordCount: number;
  sentenceCount: number;
  suggestion: string;
  severity: IssueSeverity;
}

export type ParagraphIssueType = 
  | 'too-long'
  | 'too-short'
  | 'wall-of-text'
  | 'missing-transition'
  | 'weak-topic-sentence';

/**
 * Text position reference
 */
export interface TextPosition {
  start: number;
  end: number;
  line?: number;
  paragraph?: number;
  sentence?: number;
}

export type IssueSeverity = 'critical' | 'warning' | 'suggestion';

// =============================================================================
// READING LEVEL TYPES
// =============================================================================

/**
 * Target audience definitions
 */
export type TargetAudience = 
  | 'general'           // 8th grade, Flesch 60-70
  | 'professional'      // 10th-12th grade, Flesch 40-60
  | 'academic'          // College level, Flesch 30-50
  | 'technical'         // Graduate level, Flesch 20-40
  | 'simplified'        // 5th-6th grade, Flesch 80-90
  | 'child'             // 3rd-4th grade, Flesch 90+
  | 'custom';

export interface AudienceTarget {
  type: TargetAudience;
  fleschRange: [number, number];
  gradeRange: [number, number];
  description: string;
  examples: string[];
}

/**
 * Content type readability standards
 */
export type ContentTypeStandard = 
  | 'blog-post'
  | 'landing-page'
  | 'product-page'
  | 'news-article'
  | 'academic-paper'
  | 'technical-doc'
  | 'email'
  | 'social-media'
  | 'white-paper'
  | 'ebook';

export interface ContentTypeRequirements {
  type: ContentTypeStandard;
  idealFlesch: [number, number];
  idealGrade: [number, number];
  maxSentenceLength: number;
  maxParagraphLength: number;
  recommendations: string[];
}

// =============================================================================
// READABILITY RESULT TYPES
// =============================================================================

/**
 * Complete readability analysis result
 */
export interface ReadabilityAnalysis {
  // Primary scores
  overallScore: number;         // 0-100 composite score
  overallGrade: ReadabilityGrade;
  
  // Individual metrics
  fleschReadingEase: FleschReadingEase;
  fleschKincaidGrade: FleschKincaidGrade;
  gunningFog: GunningFogIndex;
  smog: SMOGIndex;
  colemanLiau: ColemanLiauIndex;
  ari: AutomatedReadabilityIndex;
  daleChall: DaleChallScore;
  linsearWrite: LinsearWriteFormula;
  
  // Consensus metrics
  averageGradeLevel: number;
  readingTime: ReadingTime;
  
  // Content analysis
  sentences: SentenceAnalysis;
  words: WordAnalysis;
  paragraphs: ParagraphAnalysis;
  
  // Comparisons
  targetComparison: TargetComparison;
  industryBenchmark: IndustryBenchmark;
  
  // Issues and recommendations
  issues: ReadabilityIssue[];
  recommendations: ReadabilityRecommendation[];
  
  // Metadata
  analyzedAt: string;
  textLength: number;
}

export type ReadabilityGrade = 
  | 'excellent'   // 90-100
  | 'good'        // 75-89
  | 'fair'        // 60-74
  | 'poor'        // 40-59
  | 'very-poor';  // 0-39

export interface ReadingTime {
  minutes: number;
  seconds: number;
  wordsPerMinute: number;
  speakingTime: number; // minutes to read aloud
}

export interface TargetComparison {
  target: TargetAudience;
  targetGrade: number;
  currentGrade: number;
  difference: number;
  isOnTarget: boolean;
  adjustment: 'simplify' | 'maintain' | 'complexify';
  specificAdvice: string;
}

export interface IndustryBenchmark {
  industry: string;
  averageScore: number;
  yourScore: number;
  percentile: number;
  topPerformerScore: number;
  comparison: 'above' | 'below' | 'average';
}

// =============================================================================
// ISSUE AND RECOMMENDATION TYPES
// =============================================================================

export interface ReadabilityIssue {
  id: string;
  type: ReadabilityIssueType;
  severity: IssueSeverity;
  title: string;
  description: string;
  impact: string;
  location?: TextPosition;
  originalText?: string;
  suggestedText?: string;
  metric: string;
  currentValue: number | string;
  targetValue: number | string;
}

export type ReadabilityIssueType = 
  | 'grade-level'
  | 'sentence-length'
  | 'word-complexity'
  | 'paragraph-length'
  | 'passive-voice'
  | 'adverb-overuse'
  | 'weak-verbs'
  | 'filler-words'
  | 'jargon'
  | 'reading-time'
  | 'vocabulary-diversity';

export interface ReadabilityRecommendation {
  id: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  title: string;
  description: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  examples?: RecommendationExample[];
  autoFix?: boolean;
}

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationCategory = 
  | 'sentence-structure'
  | 'word-choice'
  | 'paragraph-structure'
  | 'clarity'
  | 'engagement'
  | 'accessibility';

export type ImpactLevel = 'high' | 'medium' | 'low';
export type EffortLevel = 'easy' | 'moderate' | 'complex';

export interface RecommendationExample {
  before: string;
  after: string;
  improvement: string;
}

// =============================================================================
// HIGHLIGHTING TYPES
// =============================================================================

export interface ReadabilityHighlight {
  id: string;
  type: HighlightType;
  start: number;
  end: number;
  text: string;
  color: string;
  tooltip: string;
  severity: IssueSeverity;
  suggestion?: string;
}

export type HighlightType = 
  | 'long-sentence'
  | 'complex-word'
  | 'passive-voice'
  | 'adverb'
  | 'weak-verb'
  | 'filler'
  | 'jargon'
  | 'run-on'
  | 'fragment';

// =============================================================================
// UI STATE TYPES
// =============================================================================

export interface ReadabilityState {
  analysis: ReadabilityAnalysis | null;
  isAnalyzing: boolean;
  progress: number;
  error: string | null;
  lastAnalyzedContent: string;
  selectedTarget: TargetAudience;
  selectedContentType: ContentTypeStandard;
  showHighlights: boolean;
  highlightTypes: Set<HighlightType>;
  expandedSections: Set<ReadabilitySection>;
  activeTab: ReadabilityTab;
}

export type ReadabilitySection = 
  | 'scores'
  | 'sentences'
  | 'words'
  | 'paragraphs'
  | 'issues'
  | 'recommendations';

export type ReadabilityTab = 
  | 'overview'
  | 'scores'
  | 'issues'
  | 'highlights'
  | 'compare';

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export interface ReadabilityConfig {
  targetAudience: TargetAudience;
  contentType: ContentTypeStandard;
  enableHighlighting: boolean;
  highlightTypes: HighlightType[];
  strictMode: boolean;
  customTargets?: CustomReadabilityTargets;
}

export interface CustomReadabilityTargets {
  fleschReadingEase?: number;
  gradeLevel?: number;
  maxSentenceLength?: number;
  maxParagraphLength?: number;
  maxComplexWordPercentage?: number;
  minVocabularyDiversity?: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const DEFAULT_READABILITY_CONFIG: ReadabilityConfig = {
  targetAudience: 'general',
  contentType: 'blog-post',
  enableHighlighting: true,
  highlightTypes: ['long-sentence', 'complex-word', 'passive-voice', 'adverb'],
  strictMode: false
};

export const FLESCH_GRADES: Record<FleschGrade, { min: number; max: number; level: string }> = {
  'very-easy': { min: 90, max: 100, level: '5th grade' },
  'easy': { min: 80, max: 89, level: '6th grade' },
  'fairly-easy': { min: 70, max: 79, level: '7th grade' },
  'standard': { min: 60, max: 69, level: '8th-9th grade' },
  'fairly-hard': { min: 50, max: 59, level: '10th-12th grade' },
  'hard': { min: 30, max: 49, level: 'College' },
  'very-hard': { min: 0, max: 29, level: 'College graduate' }
};

export const AUDIENCE_TARGETS: Record<TargetAudience, AudienceTarget> = {
  'general': {
    type: 'general',
    fleschRange: [60, 70],
    gradeRange: [7, 9],
    description: 'General public, everyday readers',
    examples: ['News articles', 'Blog posts', 'Marketing content']
  },
  'professional': {
    type: 'professional',
    fleschRange: [40, 60],
    gradeRange: [10, 12],
    description: 'Business professionals, educated adults',
    examples: ['Business reports', 'White papers', 'Industry publications']
  },
  'academic': {
    type: 'academic',
    fleschRange: [30, 50],
    gradeRange: [13, 16],
    description: 'College students, researchers',
    examples: ['Academic papers', 'Research articles', 'Textbooks']
  },
  'technical': {
    type: 'technical',
    fleschRange: [20, 40],
    gradeRange: [15, 18],
    description: 'Technical experts, specialists',
    examples: ['Technical documentation', 'API docs', 'Scientific papers']
  },
  'simplified': {
    type: 'simplified',
    fleschRange: [80, 90],
    gradeRange: [5, 6],
    description: 'Broad accessibility, simple language',
    examples: ['Instructions', 'FAQs', 'How-to guides']
  },
  'child': {
    type: 'child',
    fleschRange: [90, 100],
    gradeRange: [3, 4],
    description: 'Young readers, non-native speakers',
    examples: ["Children's content", 'Basic instructions', 'Simple explanations']
  },
  'custom': {
    type: 'custom',
    fleschRange: [0, 100],
    gradeRange: [1, 20],
    description: 'Custom readability targets',
    examples: ['Specific audience requirements']
  }
};

export const CONTENT_TYPE_REQUIREMENTS: Record<ContentTypeStandard, ContentTypeRequirements> = {
  'blog-post': {
    type: 'blog-post',
    idealFlesch: [60, 70],
    idealGrade: [7, 9],
    maxSentenceLength: 25,
    maxParagraphLength: 100,
    recommendations: ['Use subheadings', 'Include bullet points', 'Keep paragraphs short']
  },
  'landing-page': {
    type: 'landing-page',
    idealFlesch: [65, 80],
    idealGrade: [6, 8],
    maxSentenceLength: 20,
    maxParagraphLength: 80,
    recommendations: ['Be concise', 'Use active voice', 'Focus on benefits']
  },
  'product-page': {
    type: 'product-page',
    idealFlesch: [60, 75],
    idealGrade: [6, 9],
    maxSentenceLength: 20,
    maxParagraphLength: 75,
    recommendations: ['Use bullet points', 'Highlight features', 'Be specific']
  },
  'news-article': {
    type: 'news-article',
    idealFlesch: [55, 65],
    idealGrade: [8, 10],
    maxSentenceLength: 25,
    maxParagraphLength: 100,
    recommendations: ['Lead with key info', 'Use inverted pyramid', 'Attribute sources']
  },
  'academic-paper': {
    type: 'academic-paper',
    idealFlesch: [30, 50],
    idealGrade: [13, 16],
    maxSentenceLength: 35,
    maxParagraphLength: 200,
    recommendations: ['Cite sources', 'Be precise', 'Use field terminology']
  },
  'technical-doc': {
    type: 'technical-doc',
    idealFlesch: [40, 60],
    idealGrade: [10, 14],
    maxSentenceLength: 30,
    maxParagraphLength: 150,
    recommendations: ['Use code examples', 'Define terms', 'Structure clearly']
  },
  'email': {
    type: 'email',
    idealFlesch: [65, 80],
    idealGrade: [6, 8],
    maxSentenceLength: 20,
    maxParagraphLength: 75,
    recommendations: ['Get to the point', 'Use clear subject', 'Include CTA']
  },
  'social-media': {
    type: 'social-media',
    idealFlesch: [75, 90],
    idealGrade: [5, 7],
    maxSentenceLength: 15,
    maxParagraphLength: 50,
    recommendations: ['Be concise', 'Use hashtags wisely', 'Be engaging']
  },
  'white-paper': {
    type: 'white-paper',
    idealFlesch: [45, 60],
    idealGrade: [10, 13],
    maxSentenceLength: 30,
    maxParagraphLength: 150,
    recommendations: ['Support with data', 'Use charts', 'Professional tone']
  },
  'ebook': {
    type: 'ebook',
    idealFlesch: [55, 70],
    idealGrade: [8, 11],
    maxSentenceLength: 25,
    maxParagraphLength: 120,
    recommendations: ['Use chapters', 'Include summaries', 'Vary sentence length']
  }
};

export const HIGHLIGHT_COLORS: Record<HighlightType, string> = {
  'long-sentence': 'bg-yellow-200/50',
  'complex-word': 'bg-purple-200/50',
  'passive-voice': 'bg-blue-200/50',
  'adverb': 'bg-orange-200/50',
  'weak-verb': 'bg-red-200/50',
  'filler': 'bg-gray-200/50',
  'jargon': 'bg-pink-200/50',
  'run-on': 'bg-red-300/50',
  'fragment': 'bg-amber-200/50'
};

export const HIGHLIGHT_LABELS: Record<HighlightType, string> = {
  'long-sentence': 'Long Sentence',
  'complex-word': 'Complex Word',
  'passive-voice': 'Passive Voice',
  'adverb': 'Adverb',
  'weak-verb': 'Weak Verb',
  'filler': 'Filler Word',
  'jargon': 'Jargon',
  'run-on': 'Run-on Sentence',
  'fragment': 'Sentence Fragment'
};

export const SEVERITY_COLORS: Record<IssueSeverity, string> = {
  'critical': 'text-red-600 bg-red-50 border-red-200',
  'warning': 'text-amber-600 bg-amber-50 border-amber-200',
  'suggestion': 'text-blue-600 bg-blue-50 border-blue-200'
};

export const GRADE_COLORS: Record<ReadabilityGrade, string> = {
  'excellent': 'text-green-600 bg-green-50',
  'good': 'text-emerald-600 bg-emerald-50',
  'fair': 'text-amber-600 bg-amber-50',
  'poor': 'text-orange-600 bg-orange-50',
  'very-poor': 'text-red-600 bg-red-50'
};

export const READABILITY_TABS: Array<{ id: ReadabilityTab; label: string; icon: string }> = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'scores', label: 'Scores', icon: 'Gauge' },
  { id: 'issues', label: 'Issues', icon: 'AlertTriangle' },
  { id: 'highlights', label: 'Highlights', icon: 'Highlighter' },
  { id: 'compare', label: 'Compare', icon: 'GitCompare' }
];

// Common words list for difficult word detection (truncated for brevity)
export const COMMON_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
]);

// Filler words to detect
export const FILLER_WORDS = new Set([
  'very', 'really', 'just', 'quite', 'somewhat', 'rather', 'actually',
  'basically', 'literally', 'totally', 'absolutely', 'definitely',
  'certainly', 'obviously', 'simply', 'truly', 'honestly', 'frankly',
  'perhaps', 'maybe', 'probably', 'possibly', 'seemingly', 'apparently'
]);

// Weak verbs to flag
export const WEAK_VERBS = new Set([
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'make', 'made',
  'get', 'got', 'gotten', 'seem', 'seemed', 'feel', 'felt'
]);

// Common adverbs to flag for potential removal
export const COMMON_ADVERBS = new Set([
  'very', 'really', 'extremely', 'highly', 'greatly', 'strongly',
  'quickly', 'slowly', 'carefully', 'easily', 'hardly', 'nearly',
  'almost', 'completely', 'absolutely', 'totally', 'entirely',
  'particularly', 'especially', 'specifically', 'generally', 'usually'
]);
