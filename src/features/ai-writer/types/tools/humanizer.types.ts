/**
 * Content Humanizer Types
 * 
 * Comprehensive type definitions for AI content humanization
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type HumanizationLevel = 'light' | 'moderate' | 'heavy' | 'complete';
export type WritingStyle = 'casual' | 'professional' | 'academic' | 'conversational' | 'storytelling';
export type ToneType = 'friendly' | 'authoritative' | 'empathetic' | 'humorous' | 'neutral';
export type PersonalizationType = 'first_person' | 'second_person' | 'third_person' | 'mixed';
export type ChangeType = 'vocabulary' | 'structure' | 'tone' | 'flow' | 'personality' | 'formatting';
export type ChangeImpact = 'high' | 'medium' | 'low';

export const HUMANIZATION_LEVEL_LABELS: Record<HumanizationLevel, string> = {
  light: 'Light Touch',
  moderate: 'Moderate',
  heavy: 'Heavy',
  complete: 'Complete Rewrite'
};

export const WRITING_STYLE_LABELS: Record<WritingStyle, string> = {
  casual: 'Casual',
  professional: 'Professional',
  academic: 'Academic',
  conversational: 'Conversational',
  storytelling: 'Storytelling'
};

export const TONE_LABELS: Record<ToneType, string> = {
  friendly: 'Friendly',
  authoritative: 'Authoritative',
  empathetic: 'Empathetic',
  humorous: 'Humorous',
  neutral: 'Neutral'
};

export const PERSONALIZATION_LABELS: Record<PersonalizationType, string> = {
  first_person: 'First Person (I/We)',
  second_person: 'Second Person (You)',
  third_person: 'Third Person',
  mixed: 'Mixed'
};

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  vocabulary: 'Vocabulary',
  structure: 'Structure',
  tone: 'Tone',
  flow: 'Flow',
  personality: 'Personality',
  formatting: 'Formatting'
};

// =============================================================================
// CORE TYPES
// =============================================================================

export interface HumanizationChange {
  id: string;
  type: ChangeType;
  original: string;
  humanized: string;
  startIndex: number;
  endIndex: number;
  reason: string;
  impact: ChangeImpact;
  accepted: boolean;
  suggestions: string[];
}

export interface SectionHumanization {
  id: string;
  originalText: string;
  humanizedText: string;
  startIndex: number;
  endIndex: number;
  changes: HumanizationChange[];
  aiScoreBefore: number;
  aiScoreAfter: number;
  improvementPercent: number;
}

export interface VocabularyReplacement {
  original: string;
  replacement: string;
  reason: string;
  frequency: number;
  type: 'formal_to_casual' | 'generic_to_specific' | 'ai_phrase' | 'repetitive';
}

export interface StructureChange {
  type: 'split_sentence' | 'merge_sentences' | 'reorder' | 'add_fragment' | 'vary_length';
  description: string;
  before: string;
  after: string;
}

export interface ToneAdjustment {
  aspect: 'formality' | 'warmth' | 'enthusiasm' | 'directness';
  before: number;
  after: number;
  changes: string[];
}

export interface PersonalityElement {
  type: 'anecdote' | 'opinion' | 'question' | 'exclamation' | 'humor' | 'metaphor';
  text: string;
  insertPosition: number;
  context: string;
}

// =============================================================================
// METRICS
// =============================================================================

export interface HumanizationMetrics {
  originalWordCount: number;
  humanizedWordCount: number;
  wordCountChange: number;
  
  originalAIScore: number;
  humanizedAIScore: number;
  aiScoreImprovement: number;
  
  totalChanges: number;
  changesByType: Record<ChangeType, number>;
  changesByImpact: Record<ChangeImpact, number>;
  
  acceptedChanges: number;
  rejectedChanges: number;
  
  readabilityBefore: number;
  readabilityAfter: number;
  
  sentenceVarianceBefore: number;
  sentenceVarianceAfter: number;
  
  vocabularyDiversityBefore: number;
  vocabularyDiversityAfter: number;
}

export interface QualityScore {
  naturalness: number;
  coherence: number;
  engagement: number;
  authenticity: number;
  overall: number;
}

// =============================================================================
// ANALYSIS RESULTS
// =============================================================================

export interface HumanizationAnalysis {
  id: string;
  timestamp: Date;
  duration: number;
  
  originalContent: string;
  humanizedContent: string;
  
  settings: HumanizationSettings;
  metrics: HumanizationMetrics;
  quality: QualityScore;
  
  sections: SectionHumanization[];
  changes: HumanizationChange[];
  
  vocabularyReplacements: VocabularyReplacement[];
  structureChanges: StructureChange[];
  toneAdjustments: ToneAdjustment[];
  personalityElements: PersonalityElement[];
  
  summary: HumanizationSummary;
  recommendations: HumanizationRecommendation[];
}

export interface HumanizationSummary {
  verdict: 'excellent' | 'good' | 'moderate' | 'needs_work';
  mainChanges: string[];
  improvements: string[];
  warnings: string[];
  estimatedDetectability: 'very_low' | 'low' | 'moderate' | 'high';
}

export interface HumanizationRecommendation {
  id: string;
  type: 'manual_edit' | 'add_personal' | 'restructure' | 'tone_shift' | 'verify';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
}

// =============================================================================
// SETTINGS & CONFIG
// =============================================================================

export interface HumanizationSettings {
  level: HumanizationLevel;
  style: WritingStyle;
  tone: ToneType;
  personalization: PersonalizationType;
  
  preserveKeywords: string[];
  preserveQuotes: boolean;
  preserveData: boolean;
  preserveTechnicalTerms: boolean;
  
  addPersonalElements: boolean;
  addRhetoricalQuestions: boolean;
  addTransitions: boolean;
  varySentenceLength: boolean;
  
  targetReadingLevel: number;
  maxWordCountChange: number;
}

export const DEFAULT_HUMANIZATION_SETTINGS: HumanizationSettings = {
  level: 'moderate',
  style: 'conversational',
  tone: 'friendly',
  personalization: 'mixed',
  
  preserveKeywords: [],
  preserveQuotes: true,
  preserveData: true,
  preserveTechnicalTerms: true,
  
  addPersonalElements: true,
  addRhetoricalQuestions: true,
  addTransitions: true,
  varySentenceLength: true,
  
  targetReadingLevel: 8,
  maxWordCountChange: 20
};

// =============================================================================
// UI STATE
// =============================================================================

export interface HumanizationFilterState {
  changeType: ChangeType | 'all';
  impact: ChangeImpact | 'all';
  showAccepted: boolean;
  showRejected: boolean;
  showPending: boolean;
}

export type HumanizationSortOption = 
  | 'position'
  | 'impact'
  | 'type'
  | 'status';

export const DEFAULT_FILTER_STATE: HumanizationFilterState = {
  changeType: 'all',
  impact: 'all',
  showAccepted: true,
  showRejected: true,
  showPending: true
};

export interface HumanizationPanelState {
  activeTab: string;
  viewMode: 'diff' | 'side_by_side' | 'unified';
  selectedChange: string | null;
  filterState: HumanizationFilterState;
  sortOption: HumanizationSortOption;
  previewEnabled: boolean;
}

// =============================================================================
// DIFF VIEW
// =============================================================================

export interface DiffSegment {
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  text: string;
  originalText?: string;
  changeId?: string;
}

export interface DiffView {
  segments: DiffSegment[];
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
}

// =============================================================================
// EXPORT OPTIONS
// =============================================================================

export interface HumanizationExportOptions {
  format: 'text' | 'markdown' | 'html' | 'json';
  includeOriginal: boolean;
  includeChanges: boolean;
  includeMetrics: boolean;
  includeDiff: boolean;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

export interface UseHumanizerOptions {
  settings?: Partial<HumanizationSettings>;
  autoHumanize?: boolean;
  onComplete?: (analysis: HumanizationAnalysis) => void;
  onError?: (error: Error) => void;
}

export interface UseHumanizerReturn {
  analysis: HumanizationAnalysis | null;
  isHumanizing: boolean;
  error: Error | null;
  
  originalContent: string;
  humanizedContent: string;
  
  metrics: HumanizationMetrics | null;
  quality: QualityScore | null;
  changes: HumanizationChange[];
  summary: HumanizationSummary | null;
  recommendations: HumanizationRecommendation[];
  
  humanize: (content: string) => Promise<void>;
  rehumanize: () => Promise<void>;
  
  acceptChange: (changeId: string) => void;
  rejectChange: (changeId: string) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  
  filterChanges: (filter: Partial<HumanizationFilterState>) => HumanizationChange[];
  sortChanges: (changes: HumanizationChange[], sortBy: HumanizationSortOption) => HumanizationChange[];
  
  getDiff: () => DiffView;
  getHumanizedContent: (includeRejected?: boolean) => string;
  exportResult: (format: HumanizationExportOptions['format']) => string | null;
  
  settings: HumanizationSettings;
  updateSettings: (settings: Partial<HumanizationSettings>) => void;
}

// =============================================================================
// HUMANIZATION PATTERNS
// =============================================================================

export const AI_TO_HUMAN_VOCABULARY: Record<string, string[]> = {
  'furthermore': ['also', 'plus', 'on top of that', 'what\'s more'],
  'moreover': ['besides', 'and', 'plus'],
  'however': ['but', 'though', 'still', 'that said'],
  'therefore': ['so', 'that\'s why', 'because of this'],
  'consequently': ['as a result', 'so', 'that\'s why'],
  'subsequently': ['then', 'after that', 'next'],
  'additionally': ['also', 'plus', 'and'],
  'nevertheless': ['still', 'even so', 'but'],
  'utilize': ['use'],
  'implement': ['use', 'put in place', 'start'],
  'facilitate': ['help', 'make easier', 'enable'],
  'leverage': ['use', 'take advantage of'],
  'optimize': ['improve', 'make better'],
  'comprehensive': ['complete', 'full', 'thorough'],
  'robust': ['strong', 'solid', 'reliable'],
  'pivotal': ['key', 'important', 'crucial'],
  'paramount': ['most important', 'key', 'crucial'],
  'seamless': ['smooth', 'easy'],
  'cutting-edge': ['latest', 'modern', 'new']
};

export const PERSONAL_ELEMENTS: Record<string, string[]> = {
  anecdotes: [
    'I remember when...',
    'In my experience...',
    'I\'ve found that...',
    'Speaking from personal experience...'
  ],
  opinions: [
    'I think...',
    'In my view...',
    'Honestly...',
    'If you ask me...'
  ],
  questions: [
    'Have you ever wondered...?',
    'What if...?',
    'Isn\'t it interesting that...?',
    'Ever noticed how...?'
  ],
  exclamations: [
    'Here\'s the thing:',
    'And get this:',
    'The best part?',
    'Here\'s what surprised me:'
  ]
};

export const SENTENCE_STARTERS_HUMAN: string[] = [
  'Look,',
  'Here\'s the thing:',
  'Honestly,',
  'Truth is,',
  'I\'ll be honest,',
  'Let me tell you,',
  'You know what?',
  'Picture this:',
  'Think about it.',
  'Now,'
];
