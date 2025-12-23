/**
 * AI Overview Visibility Types
 * 
 * Types for analyzing and optimizing content for AI search overviews
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type VisibilityScore = 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
export type ContentFormat = 'definition' | 'list' | 'comparison' | 'how_to' | 'table' | 'faq' | 'general';
export type OptimizationPriority = 'critical' | 'high' | 'medium' | 'low';
export type FactorCategory = 'structure' | 'authority' | 'relevance' | 'freshness' | 'engagement';

export const VISIBILITY_SCORE_LABELS: Record<VisibilityScore, string> = {
  excellent: 'Excellent Visibility',
  good: 'Good Visibility',
  moderate: 'Moderate Visibility',
  poor: 'Poor Visibility',
  critical: 'Critical Issues'
};

export const CONTENT_FORMAT_LABELS: Record<ContentFormat, string> = {
  definition: 'Definition/Explanation',
  list: 'List Format',
  comparison: 'Comparison',
  how_to: 'How-To Guide',
  table: 'Table/Data',
  faq: 'FAQ Format',
  general: 'General Content'
};

export const FACTOR_CATEGORY_LABELS: Record<FactorCategory, string> = {
  structure: 'Content Structure',
  authority: 'Authority & Trust',
  relevance: 'Topic Relevance',
  freshness: 'Content Freshness',
  engagement: 'User Engagement'
};

// =============================================================================
// CORE TYPES
// =============================================================================

export interface AIOverviewFactor {
  id: string;
  name: string;
  category: FactorCategory;
  score: number;
  maxScore: number;
  weight: number;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  details: string[];
  recommendations: string[];
}

export interface ContentStructureAnalysis {
  hasDefinition: boolean;
  definitionPosition: number | null;
  hasLists: boolean;
  listCount: number;
  hasHeadings: boolean;
  headingCount: number;
  headingHierarchy: boolean;
  hasTables: boolean;
  tableCount: number;
  hasFAQ: boolean;
  faqCount: number;
  hasHowTo: boolean;
  stepsCount: number;
  paragraphCount: number;
  averageParagraphLength: number;
}

export interface AuthoritySignals {
  hasAuthor: boolean;
  authorCredentials: string | null;
  hasCitations: boolean;
  citationCount: number;
  hasExternalLinks: boolean;
  externalLinkCount: number;
  hasInternalLinks: boolean;
  internalLinkCount: number;
  hasStatistics: boolean;
  statisticsCount: number;
  hasExpertQuotes: boolean;
  quoteCount: number;
}

export interface RelevanceSignals {
  primaryKeywordDensity: number;
  semanticKeywords: string[];
  semanticCoverage: number;
  topicDepth: number;
  queryMatch: number;
  intentAlignment: number;
  entityMentions: string[];
  entityCoverage: number;
}

export interface FreshnessSignals {
  hasDate: boolean;
  dateFound: string | null;
  hasUpdatedDate: boolean;
  updatedDateFound: string | null;
  temporalTerms: string[];
  isEvergreen: boolean;
  freshnessScore: number;
}

export interface EngagementSignals {
  readabilityScore: number;
  sentenceVariety: number;
  questionCount: number;
  callToActionCount: number;
  visualElementCount: number;
  interactiveElements: string[];
}

export interface SnippetCandidate {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  format: ContentFormat;
  confidence: number;
  reasons: string[];
  improvements: string[];
  optimizedVersion?: string;
}

export interface CompetitorOverview {
  url: string;
  title: string;
  snippetText: string;
  format: ContentFormat;
  position: number;
  strengths: string[];
  weaknesses: string[];
}

// =============================================================================
// ANALYSIS RESULTS
// =============================================================================

export interface AIOverviewAnalysis {
  id: string;
  timestamp: Date;
  duration: number;
  
  content: string;
  targetQuery: string;
  
  overallScore: number;
  visibilityLevel: VisibilityScore;
  
  factors: AIOverviewFactor[];
  factorsByCategory: Record<FactorCategory, AIOverviewFactor[]>;
  
  structure: ContentStructureAnalysis;
  authority: AuthoritySignals;
  relevance: RelevanceSignals;
  freshness: FreshnessSignals;
  engagement: EngagementSignals;
  
  snippetCandidates: SnippetCandidate[];
  bestCandidate: SnippetCandidate | null;
  
  detectedFormat: ContentFormat;
  recommendedFormat: ContentFormat;
  
  summary: AIOverviewSummary;
  optimizations: AIOverviewOptimization[];
  
  competitorAnalysis?: CompetitorOverview[];
}

export interface AIOverviewSummary {
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  quickWins: string[];
  estimatedVisibility: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low';
  priorityActions: string[];
}

export interface AIOverviewOptimization {
  id: string;
  priority: OptimizationPriority;
  category: FactorCategory;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  example?: string;
  beforeAfter?: {
    before: string;
    after: string;
  };
}

// =============================================================================
// METRICS
// =============================================================================

export interface AIOverviewMetrics {
  overallScore: number;
  categoryScores: Record<FactorCategory, number>;
  
  passedFactors: number;
  warningFactors: number;
  failedFactors: number;
  
  snippetCandidateCount: number;
  bestCandidateConfidence: number;
  
  structureScore: number;
  authorityScore: number;
  relevanceScore: number;
  freshnessScore: number;
  engagementScore: number;
  
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
}

// =============================================================================
// SETTINGS & CONFIG
// =============================================================================

export interface AIOverviewSettings {
  targetQuery: string;
  targetFormat: ContentFormat | 'auto';
  includeCompetitorAnalysis: boolean;
  generateOptimizations: boolean;
  strictMode: boolean;
  weightOverrides?: Partial<Record<FactorCategory, number>>;
}

export const DEFAULT_AI_OVERVIEW_SETTINGS: AIOverviewSettings = {
  targetQuery: '',
  targetFormat: 'auto',
  includeCompetitorAnalysis: false,
  generateOptimizations: true,
  strictMode: false
};

// =============================================================================
// UI STATE
// =============================================================================

export interface AIOverviewFilterState {
  category: FactorCategory | 'all';
  status: 'all' | 'pass' | 'warning' | 'fail';
  priority: OptimizationPriority | 'all';
}

export type AIOverviewSortOption = 
  | 'score'
  | 'category'
  | 'status'
  | 'impact'
  | 'effort';

export const DEFAULT_FILTER_STATE: AIOverviewFilterState = {
  category: 'all',
  status: 'all',
  priority: 'all'
};

export interface AIOverviewPanelState {
  activeTab: string;
  selectedFactor: string | null;
  selectedCandidate: string | null;
  filterState: AIOverviewFilterState;
  sortOption: AIOverviewSortOption;
  showOptimized: boolean;
}

// =============================================================================
// EXPORT OPTIONS
// =============================================================================

export interface AIOverviewExportOptions {
  format: 'markdown' | 'html' | 'json' | 'pdf';
  includeAnalysis: boolean;
  includeOptimizations: boolean;
  includeSnippets: boolean;
  includeCompetitors: boolean;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

export interface UseAIOverviewOptions {
  settings?: Partial<AIOverviewSettings>;
  autoAnalyze?: boolean;
  onComplete?: (analysis: AIOverviewAnalysis) => void;
  onError?: (error: Error) => void;
}

export interface UseAIOverviewReturn {
  analysis: AIOverviewAnalysis | null;
  isAnalyzing: boolean;
  error: Error | null;
  
  metrics: AIOverviewMetrics | null;
  factors: AIOverviewFactor[];
  snippetCandidates: SnippetCandidate[];
  optimizations: AIOverviewOptimization[];
  summary: AIOverviewSummary | null;
  
  analyze: (content: string, query: string) => Promise<void>;
  reanalyze: () => Promise<void>;
  
  filterFactors: (filter: Partial<AIOverviewFilterState>) => AIOverviewFactor[];
  sortFactors: (factors: AIOverviewFactor[], sortBy: AIOverviewSortOption) => AIOverviewFactor[];
  
  filterOptimizations: (filter: Partial<AIOverviewFilterState>) => AIOverviewOptimization[];
  sortOptimizations: (optimizations: AIOverviewOptimization[], sortBy: AIOverviewSortOption) => AIOverviewOptimization[];
  
  getOptimizedSnippet: (candidateId: string) => string | null;
  exportReport: (format: AIOverviewExportOptions['format']) => string | null;
  
  settings: AIOverviewSettings;
  updateSettings: (settings: Partial<AIOverviewSettings>) => void;
}

// =============================================================================
// AI OVERVIEW PATTERNS & CONSTANTS
// =============================================================================

export const DEFINITION_PATTERNS = [
  /^[A-Z][^.!?]*\s+is\s+(?:a|an|the)\s+[^.!?]+[.!?]/,
  /^[A-Z][^.!?]*\s+refers\s+to\s+[^.!?]+[.!?]/,
  /^[A-Z][^.!?]*\s+means\s+[^.!?]+[.!?]/,
  /^[A-Z][^.!?]*\s+can\s+be\s+defined\s+as\s+[^.!?]+[.!?]/
];

export const LIST_PATTERNS = [
  /^\s*[-•*]\s+/m,
  /^\s*\d+[.)]\s+/m,
  /^\s*[a-z][.)]\s+/im
];

export const HOW_TO_PATTERNS = [
  /^step\s+\d+/im,
  /^how\s+to\s+/i,
  /^first[,:]?\s+/i,
  /^next[,:]?\s+/i,
  /^finally[,:]?\s+/i
];

export const FAQ_PATTERNS = [
  /\?$/m,
  /^what\s+is\s+/im,
  /^how\s+(?:do|does|can)\s+/im,
  /^why\s+(?:do|does|is|are)\s+/im,
  /^when\s+(?:do|does|should)\s+/im
];

export const AUTHORITY_KEYWORDS = [
  'according to',
  'research shows',
  'studies indicate',
  'experts say',
  'data suggests',
  'statistics show',
  'evidence indicates'
];

export const FRESHNESS_KEYWORDS = [
  'latest',
  'recent',
  'updated',
  'new',
  'current',
  '2024',
  '2025',
  'this year',
  'today'
];

export const OPTIMAL_SNIPPET_LENGTH = {
  min: 40,
  optimal: 50,
  max: 60
};

export const CATEGORY_WEIGHTS: Record<FactorCategory, number> = {
  structure: 0.25,
  authority: 0.25,
  relevance: 0.30,
  freshness: 0.10,
  engagement: 0.10
};
