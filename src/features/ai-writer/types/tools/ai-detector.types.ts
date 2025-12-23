/**
 * AI Content Detector Types
 * 
 * Comprehensive type definitions for AI-generated content detection
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type AIDetectionResult = 'human' | 'ai_generated' | 'mixed' | 'uncertain';
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'very_low';
export type AIModel = 'gpt4' | 'gpt3' | 'claude' | 'gemini' | 'llama' | 'other' | 'unknown';
export type TextPattern = 'natural' | 'formulaic' | 'repetitive' | 'mechanical' | 'creative';
export type RiskLevel = 'safe' | 'low' | 'moderate' | 'high' | 'critical';
export type SectionType = 'paragraph' | 'heading' | 'list' | 'quote' | 'code';

export const DETECTION_RESULT_LABELS: Record<AIDetectionResult, string> = {
  human: 'Human Written',
  ai_generated: 'AI Generated',
  mixed: 'Mixed Content',
  uncertain: 'Uncertain'
};

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  high: 'High Confidence',
  medium: 'Medium Confidence',
  low: 'Low Confidence',
  very_low: 'Very Low Confidence'
};

export const AI_MODEL_LABELS: Record<AIModel, string> = {
  gpt4: 'GPT-4',
  gpt3: 'GPT-3.5',
  claude: 'Claude',
  gemini: 'Gemini',
  llama: 'LLaMA',
  other: 'Other AI',
  unknown: 'Unknown'
};

export const TEXT_PATTERN_LABELS: Record<TextPattern, string> = {
  natural: 'Natural',
  formulaic: 'Formulaic',
  repetitive: 'Repetitive',
  mechanical: 'Mechanical',
  creative: 'Creative'
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  safe: 'Safe',
  low: 'Low Risk',
  moderate: 'Moderate Risk',
  high: 'High Risk',
  critical: 'Critical Risk'
};

// Detection thresholds
export const AI_DETECTION_THRESHOLDS = {
  human: { min: 0, max: 25 },
  mixed: { min: 25, max: 60 },
  ai_generated: { min: 60, max: 100 }
};

// Confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  high: 85,
  medium: 65,
  low: 45,
  very_low: 0
};

// =============================================================================
// CORE TYPES
// =============================================================================

export interface TextSegment {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
  sectionType: SectionType;
}

export interface AIIndicator {
  id: string;
  type: 'pattern' | 'vocabulary' | 'structure' | 'style' | 'semantic';
  name: string;
  description: string;
  weight: number;
  detected: boolean;
  confidence: number;
  examples: string[];
}

export interface SectionAnalysis {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
  sectionType: SectionType;
  
  aiScore: number;
  humanScore: number;
  result: AIDetectionResult;
  confidence: ConfidenceLevel;
  
  patterns: TextPattern[];
  indicators: AIIndicator[];
  
  burstiness: number;
  perplexity: number;
  repetitionScore: number;
  vocabularyRichness: number;
}

export interface PatternAnalysis {
  pattern: TextPattern;
  frequency: number;
  examples: string[];
  contribution: number;
}

export interface VocabularyAnalysis {
  uniqueWords: number;
  totalWords: number;
  richness: number;
  commonAIWords: string[];
  uncommonWords: string[];
  averageWordLength: number;
  complexWordRatio: number;
}

export interface SentenceAnalysis {
  totalSentences: number;
  averageLength: number;
  lengthVariance: number;
  shortSentences: number;
  longSentences: number;
  questionRatio: number;
  exclamationRatio: number;
}

export interface ProbableAIModel {
  model: AIModel;
  probability: number;
  characteristics: string[];
}

// =============================================================================
// METRICS
// =============================================================================

export interface AIDetectionMetrics {
  overallAIScore: number;
  overallHumanScore: number;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  
  result: AIDetectionResult;
  riskLevel: RiskLevel;
  
  totalWords: number;
  analyzedWords: number;
  totalSections: number;
  
  sectionsByResult: {
    human: number;
    ai_generated: number;
    mixed: number;
    uncertain: number;
  };
  
  patternDistribution: Record<TextPattern, number>;
  
  burstiness: number;
  perplexity: number;
  repetitionIndex: number;
  vocabularyDiversity: number;
  
  probableModels: ProbableAIModel[];
}

export interface TrendData {
  date: Date;
  aiScore: number;
  humanScore: number;
  wordCount: number;
}

// =============================================================================
// ANALYSIS RESULTS
// =============================================================================

export interface AIDetectionAnalysis {
  id: string;
  content: string;
  timestamp: Date;
  duration: number;
  
  metrics: AIDetectionMetrics;
  sections: SectionAnalysis[];
  indicators: AIIndicator[];
  patterns: PatternAnalysis[];
  
  vocabulary: VocabularyAnalysis;
  sentences: SentenceAnalysis;
  
  summary: AIDetectionSummary;
  recommendations: AIDetectionRecommendation[];
  
  highlightedContent: string;
}

export interface AIDetectionSummary {
  verdict: AIDetectionResult;
  confidence: ConfidenceLevel;
  mainFinding: string;
  keyIndicators: string[];
  concerns: string[];
  positives: string[];
  estimatedAIPercentage: number;
  estimatedHumanPercentage: number;
}

export interface AIDetectionRecommendation {
  id: string;
  type: 'rewrite' | 'humanize' | 'add_personality' | 'vary_structure' | 'add_examples' | 'review';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedSections: string[];
  impact: number;
  effort: 'minimal' | 'moderate' | 'significant';
  tips: string[];
}

// =============================================================================
// SETTINGS & CONFIG
// =============================================================================

export interface AIDetectionSettings {
  sensitivity: 'low' | 'medium' | 'high';
  minConfidence: number;
  checkVocabulary: boolean;
  checkPatterns: boolean;
  checkStructure: boolean;
  checkStyle: boolean;
  detectModel: boolean;
  highlightResults: boolean;
  sectionLevel: boolean;
}

export const DEFAULT_AI_DETECTION_SETTINGS: AIDetectionSettings = {
  sensitivity: 'medium',
  minConfidence: 50,
  checkVocabulary: true,
  checkPatterns: true,
  checkStructure: true,
  checkStyle: true,
  detectModel: true,
  highlightResults: true,
  sectionLevel: true
};

// =============================================================================
// FILTER & SORT
// =============================================================================

export interface AIDetectionFilterState {
  search: string;
  result: AIDetectionResult | 'all';
  confidence: ConfidenceLevel | 'all';
  pattern: TextPattern | 'all';
  minAIScore: number;
  maxAIScore: number;
}

export type AIDetectionSortOption = 
  | 'aiScore'
  | 'humanScore'
  | 'confidence'
  | 'position'
  | 'wordCount';

export const DEFAULT_FILTER_STATE: AIDetectionFilterState = {
  search: '',
  result: 'all',
  confidence: 'all',
  pattern: 'all',
  minAIScore: 0,
  maxAIScore: 100
};

// =============================================================================
// UI STATE
// =============================================================================

export interface AIDetectionPanelState {
  activeTab: string;
  selectedSection: string | null;
  expandedIndicators: string[];
  filterState: AIDetectionFilterState;
  sortOption: AIDetectionSortOption;
  viewMode: 'overview' | 'sections' | 'document';
  showHighlights: boolean;
}

// =============================================================================
// EXPORT OPTIONS
// =============================================================================

export interface AIDetectionExportOptions {
  format: 'html' | 'markdown' | 'json';
  includeHighlights: boolean;
  includeSections: boolean;
  includeIndicators: boolean;
  includeRecommendations: boolean;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

export interface HighlightedSection {
  text: string;
  result: AIDetectionResult;
  aiScore: number;
  startIndex: number;
  endIndex: number;
}

export interface ComparisonData {
  content1: {
    text: string;
    aiScore: number;
    result: AIDetectionResult;
  };
  content2: {
    text: string;
    aiScore: number;
    result: AIDetectionResult;
  };
  difference: number;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

export interface UseAIDetectorOptions {
  settings?: Partial<AIDetectionSettings>;
  autoAnalyze?: boolean;
  onAnalysisComplete?: (analysis: AIDetectionAnalysis) => void;
  onError?: (error: Error) => void;
}

export interface UseAIDetectorReturn {
  analysis: AIDetectionAnalysis | null;
  isAnalyzing: boolean;
  error: Error | null;
  
  metrics: AIDetectionMetrics | null;
  sections: SectionAnalysis[];
  indicators: AIIndicator[];
  recommendations: AIDetectionRecommendation[];
  summary: AIDetectionSummary | null;
  
  analyze: (content: string) => Promise<void>;
  reanalyze: () => Promise<void>;
  
  filterSections: (filter: Partial<AIDetectionFilterState>) => SectionAnalysis[];
  sortSections: (sections: SectionAnalysis[], sortBy: AIDetectionSortOption) => SectionAnalysis[];
  
  getHighlightedContent: () => HighlightedSection[];
  exportReport: (format: AIDetectionExportOptions['format']) => string | null;
  
  settings: AIDetectionSettings;
  updateSettings: (settings: Partial<AIDetectionSettings>) => void;
}

// =============================================================================
// COMMON AI PATTERNS
// =============================================================================

export const COMMON_AI_PHRASES = [
  'it is important to note',
  'in conclusion',
  'as mentioned above',
  'in the realm of',
  'delve into',
  'it is worth noting',
  'plays a crucial role',
  'in today\'s world',
  'furthermore',
  'moreover',
  'in essence',
  'at the end of the day',
  'when it comes to',
  'in light of',
  'in this context',
  'it goes without saying',
  'by and large',
  'in the grand scheme',
  'navigate the complexities',
  'leverage the power'
];

export const COMMON_AI_TRANSITIONS = [
  'additionally',
  'subsequently',
  'consequently',
  'nevertheless',
  'furthermore',
  'moreover',
  'hence',
  'thus',
  'therefore',
  'accordingly',
  'likewise',
  'similarly',
  'conversely',
  'alternatively'
];

export const AI_SENTENCE_STARTERS = [
  'It is',
  'There are',
  'This is',
  'These are',
  'In the',
  'As we',
  'One of the',
  'The key',
  'A key',
  'An important'
];
