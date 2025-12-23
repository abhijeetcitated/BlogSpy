/**
 * Plagiarism Checker Types
 * 
 * Comprehensive type definitions for plagiarism detection
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type PlagiarismSeverity = 'critical' | 'high' | 'medium' | 'low';
export type MatchType = 'exact' | 'paraphrased' | 'similar' | 'common_phrase';
export type SourceType = 'web' | 'academic' | 'news' | 'book' | 'database' | 'social' | 'unknown';
export type ContentRisk = 'safe' | 'low_risk' | 'moderate_risk' | 'high_risk' | 'critical_risk';
export type ScanStatus = 'pending' | 'scanning' | 'completed' | 'failed';

export const SEVERITY_LABELS: Record<PlagiarismSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  exact: 'Exact Match',
  paraphrased: 'Paraphrased',
  similar: 'Similar Content',
  common_phrase: 'Common Phrase'
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  web: 'Web',
  academic: 'Academic',
  news: 'News',
  book: 'Book',
  database: 'Database',
  social: 'Social Media',
  unknown: 'Unknown'
};

export const CONTENT_RISK_LABELS: Record<ContentRisk, string> = {
  safe: 'Safe',
  low_risk: 'Low Risk',
  moderate_risk: 'Moderate Risk',
  high_risk: 'High Risk',
  critical_risk: 'Critical Risk'
};

export const SEVERITY_WEIGHTS: Record<PlagiarismSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

export const MATCH_SEVERITY_THRESHOLDS = {
  exact: { critical: 90, high: 70, medium: 50 },
  paraphrased: { critical: 85, high: 65, medium: 45 },
  similar: { critical: 80, high: 60, medium: 40 }
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
  sentenceCount: number;
}

export interface MatchedSource {
  id: string;
  url: string;
  title: string;
  domain: string;
  sourceType: SourceType;
  snippet: string;
  publishDate?: string;
  author?: string;
  credibilityScore: number;
  indexed: boolean;
}

export interface PlagiarismMatch {
  id: string;
  originalText: string;
  matchedText: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
  matchType: MatchType;
  similarity: number;
  severity: PlagiarismSeverity;
  source: MatchedSource;
  context: {
    before: string;
    after: string;
  };
  suggestions: string[];
  isQuoted: boolean;
  hasCitation: boolean;
  canExclude: boolean;
}

export interface ContentSection {
  id: string;
  title: string;
  text: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
  plagiarismScore: number;
  matches: PlagiarismMatch[];
  originalityScore: number;
}

export interface SourceStats {
  sourceId: string;
  domain: string;
  matchCount: number;
  totalWords: number;
  averageSimilarity: number;
  highestSimilarity: number;
  sourceType: SourceType;
}

// =============================================================================
// METRICS
// =============================================================================

export interface PlagiarismMetrics {
  totalWords: number;
  scannedWords: number;
  uniqueWords: number;
  plagiarizedWords: number;
  originalityScore: number;
  plagiarismScore: number;
  averageSimilarity: number;
  highestSimilarity: number;
  
  matchesBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  matchesByType: {
    exact: number;
    paraphrased: number;
    similar: number;
    common_phrase: number;
  };
  
  sourcesFound: number;
  uniqueDomains: number;
  quotedContent: number;
  citedContent: number;
  
  riskLevel: ContentRisk;
  confidence: number;
}

export interface SectionMetrics {
  sectionId: string;
  title: string;
  wordCount: number;
  originalityScore: number;
  plagiarismScore: number;
  matchCount: number;
  riskLevel: ContentRisk;
}

export interface TrendMetrics {
  previousScore: number;
  currentScore: number;
  change: number;
  trend: 'improving' | 'declining' | 'stable';
  scansCount: number;
}

// =============================================================================
// ANALYSIS RESULTS
// =============================================================================

export interface PlagiarismAnalysis {
  id: string;
  content: string;
  timestamp: Date;
  status: ScanStatus;
  duration: number;
  
  metrics: PlagiarismMetrics;
  matches: PlagiarismMatch[];
  sources: MatchedSource[];
  sections: ContentSection[];
  sourceStats: SourceStats[];
  
  summary: PlagiarismSummary;
  recommendations: PlagiarismRecommendation[];
  excludedMatches: string[];
}

export interface PlagiarismSummary {
  verdict: ContentRisk;
  mainFinding: string;
  criticalIssues: string[];
  warnings: string[];
  positives: string[];
  actionRequired: boolean;
  estimatedFixTime: number;
}

export interface PlagiarismRecommendation {
  id: string;
  type: 'rewrite' | 'cite' | 'remove' | 'quote' | 'paraphrase' | 'verify';
  priority: PlagiarismSeverity;
  title: string;
  description: string;
  affectedMatches: string[];
  suggestedAction: string;
  effort: 'minimal' | 'moderate' | 'significant';
  impact: number;
}

// =============================================================================
// SETTINGS & CONFIG
// =============================================================================

export interface PlagiarismSettings {
  minSimilarity: number;
  minWordCount: number;
  checkQuotes: boolean;
  checkCitations: boolean;
  includeSources: SourceType[];
  excludeDomains: string[];
  excludePhrases: string[];
  caseSensitive: boolean;
  checkGrammar: boolean;
  deepScan: boolean;
  maxSources: number;
  timeout: number;
}

export const DEFAULT_PLAGIARISM_SETTINGS: PlagiarismSettings = {
  minSimilarity: 40,
  minWordCount: 5,
  checkQuotes: false,
  checkCitations: false,
  includeSources: ['web', 'academic', 'news', 'book'],
  excludeDomains: [],
  excludePhrases: [],
  caseSensitive: false,
  checkGrammar: false,
  deepScan: false,
  maxSources: 100,
  timeout: 60000
};

// =============================================================================
// FILTER & SORT
// =============================================================================

export interface PlagiarismFilterState {
  search: string;
  severity: PlagiarismSeverity | 'all';
  matchType: MatchType | 'all';
  sourceType: SourceType | 'all';
  minSimilarity: number;
  showQuoted: boolean;
  showCited: boolean;
  showExcluded: boolean;
}

export type PlagiarismSortOption = 
  | 'severity'
  | 'similarity'
  | 'wordCount'
  | 'position'
  | 'source'
  | 'type';

export const DEFAULT_FILTER_STATE: PlagiarismFilterState = {
  search: '',
  severity: 'all',
  matchType: 'all',
  sourceType: 'all',
  minSimilarity: 0,
  showQuoted: true,
  showCited: true,
  showExcluded: false
};

// =============================================================================
// UI STATE
// =============================================================================

export interface PlagiarismPanelState {
  activeTab: string;
  selectedMatch: string | null;
  expandedSections: string[];
  filterState: PlagiarismFilterState;
  sortOption: PlagiarismSortOption;
  viewMode: 'list' | 'document' | 'sources';
  highlightMatches: boolean;
}

// =============================================================================
// EXPORT OPTIONS
// =============================================================================

export interface PlagiarismExportOptions {
  format: 'html' | 'markdown' | 'json' | 'txt';
  includeHighlights: boolean;
  includeSources: boolean;
  includeRecommendations: boolean;
  includeMetrics: boolean;
  includeFullText: boolean;
}

// =============================================================================
// API TYPES
// =============================================================================

export interface PlagiarismScanRequest {
  content: string;
  settings?: Partial<PlagiarismSettings>;
  compareUrls?: string[];
  excludeUrls?: string[];
}

export interface PlagiarismScanResponse {
  success: boolean;
  scanId: string;
  status: ScanStatus;
  analysis?: PlagiarismAnalysis;
  error?: string;
  quotaRemaining?: number;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

export interface HighlightRange {
  startIndex: number;
  endIndex: number;
  type: MatchType;
  severity: PlagiarismSeverity;
  matchId: string;
}

export interface DocumentHighlight {
  text: string;
  highlights: HighlightRange[];
  renderedHtml: string;
}

export interface ComparisonResult {
  text1: string;
  text2: string;
  similarity: number;
  matchType: MatchType;
  differences: Array<{
    type: 'added' | 'removed' | 'modified';
    text: string;
    position: number;
  }>;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

export interface UsePlagiarismOptions {
  settings?: Partial<PlagiarismSettings>;
  autoScan?: boolean;
  onScanComplete?: (analysis: PlagiarismAnalysis) => void;
  onError?: (error: Error) => void;
}

export interface UsePlagiarismReturn {
  analysis: PlagiarismAnalysis | null;
  isScanning: boolean;
  error: Error | null;
  metrics: PlagiarismMetrics | null;
  matches: PlagiarismMatch[];
  sources: MatchedSource[];
  recommendations: PlagiarismRecommendation[];
  summary: PlagiarismSummary | null;
  
  scan: (content: string) => Promise<void>;
  rescan: () => Promise<void>;
  excludeMatch: (matchId: string) => void;
  includeMatch: (matchId: string) => void;
  filterMatches: (filter: Partial<PlagiarismFilterState>) => PlagiarismMatch[];
  sortMatches: (matches: PlagiarismMatch[], sortBy: PlagiarismSortOption) => PlagiarismMatch[];
  exportReport: (format: PlagiarismExportOptions['format']) => string | null;
  getHighlightedContent: () => DocumentHighlight | null;
  compareTexts: (text1: string, text2: string) => ComparisonResult;
  
  settings: PlagiarismSettings;
  updateSettings: (settings: Partial<PlagiarismSettings>) => void;
}
