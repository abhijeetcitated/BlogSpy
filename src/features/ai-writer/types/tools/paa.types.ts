// =============================================================================
// PAA (PEOPLE ALSO ASK) TYPES - Production Level
// Google PAA Questions Integration like Surfer SEO, AlsoAsked, AnswerThePublic
// =============================================================================

/**
 * Main PAA data structure containing all questions and metadata
 */
export interface PAAData {
  /** Target keyword for PAA lookup */
  keyword: string;
  /** Search location/country */
  location: PAALocation;
  /** Language code */
  language: string;
  /** Total questions count */
  totalQuestions: number;
  /** PAA questions grouped by type */
  questions: PAAQuestionGroup[];
  /** Question clusters by topic */
  clusters: PAACluster[];
  /** Related searches from SERP */
  relatedSearches: PAARelatedSearch[];
  /** Question tree structure */
  questionTree: PAATreeNode[];
  /** Timestamp when data was fetched */
  fetchedAt: string;
  /** Data freshness status */
  freshness: DataFreshness;
}

/**
 * Individual PAA question with all metadata
 */
export interface PAAQuestion {
  /** Unique identifier */
  id: string;
  /** The question text */
  question: string;
  /** Answer snippet from Google */
  answerSnippet: string;
  /** Full answer text if available */
  fullAnswer?: string;
  /** Source URL of the answer */
  sourceUrl: string;
  /** Source domain */
  sourceDomain: string;
  /** Position in PAA box (1-4 typically) */
  position: number;
  /** Question type classification */
  type: QuestionType;
  /** Question intent */
  intent: QuestionIntent;
  /** Search volume estimate */
  searchVolume?: number;
  /** Difficulty to rank for this question */
  difficulty: PAADifficultyLevel;
  /** Is this a featured question (first in PAA) */
  isFeatured: boolean;
  /** Nested/child questions discovered by expanding */
  childQuestions?: PAAQuestion[];
  /** Parent question ID if this is a child */
  parentId?: string;
  /** Depth level in question tree */
  depth: number;
  /** Related entities mentioned */
  entities: string[];
  /** Keywords in the question */
  keywords: string[];
  /** Answer format type */
  answerFormat: AnswerFormat;
  /** Content coverage status in user's content */
  coverageStatus: CoverageStatus;
  /** Relevance score to main keyword (0-100) */
  relevanceScore: number;
}

/**
 * Question grouped by category
 */
export interface PAAQuestionGroup {
  /** Group category */
  category: QuestionCategory;
  /** Category label */
  label: string;
  /** Questions in this group */
  questions: PAAQuestion[];
  /** Group icon */
  icon: string;
  /** Average difficulty of group */
  avgDifficulty: PAADifficultyLevel;
}

/**
 * Question cluster by topic
 */
export interface PAACluster {
  /** Cluster ID */
  id: string;
  /** Cluster topic/theme */
  topic: string;
  /** Questions in cluster */
  questions: PAAQuestion[];
  /** Cluster size */
  size: number;
  /** Cluster relevance score */
  relevanceScore: number;
  /** Dominant question type in cluster */
  dominantType: QuestionType;
  /** Cluster keywords */
  keywords: string[];
}

/**
 * Tree node for hierarchical question structure
 */
export interface PAATreeNode {
  /** Question data */
  question: PAAQuestion;
  /** Child nodes */
  children: PAATreeNode[];
  /** Is expanded in UI */
  isExpanded: boolean;
  /** Node path from root */
  path: string[];
}

/**
 * Related search from SERP (PAA-specific)
 */
export interface PAARelatedSearch {
  /** Search query */
  query: string;
  /** Estimated search volume */
  volume?: number;
  /** Relevance to main keyword */
  relevance: number;
  /** Is this a question format */
  isQuestion: boolean;
}

/**
 * Location for PAA lookup
 */
export interface PAALocation {
  /** Country code (US, UK, IN, etc.) */
  countryCode: string;
  /** Country name */
  countryName: string;
  /** Language code */
  languageCode: string;
  /** Google domain */
  googleDomain: string;
}

// =============================================================================
// ENUMS AND UNION TYPES
// =============================================================================

/**
 * Question type classification
 */
export type QuestionType =
  | 'what'      // What is...
  | 'how'       // How to...
  | 'why'       // Why does...
  | 'when'      // When should...
  | 'where'     // Where to...
  | 'who'       // Who is...
  | 'which'     // Which is...
  | 'can'       // Can you...
  | 'does'      // Does it...
  | 'is'        // Is it...
  | 'are'       // Are they...
  | 'will'      // Will it...
  | 'should'    // Should I...
  | 'comparison'// X vs Y
  | 'list'      // Top 10...
  | 'other';

/**
 * Question intent classification
 */
export type QuestionIntent =
  | 'informational'
  | 'navigational'
  | 'transactional'
  | 'commercial'
  | 'educational'
  | 'comparison';

/**
 * Question category for grouping
 */
export type QuestionCategory =
  | 'basics'        // Fundamental questions
  | 'how-to'        // Process/procedure questions
  | 'comparison'    // X vs Y questions
  | 'troubleshooting' // Problem-solving questions
  | 'features'      // Feature-related questions
  | 'pricing'       // Cost-related questions
  | 'alternatives'  // Alternative/option questions
  | 'reviews'       // Opinion/review questions
  | 'other';

/**
 * Answer format in SERP
 */
export type AnswerFormat =
  | 'paragraph'     // Text paragraph
  | 'list'          // Bulleted/numbered list
  | 'table'         // Tabular data
  | 'steps'         // Step-by-step instructions
  | 'video'         // Video snippet
  | 'image'         // Image with caption
  | 'accordion';    // Expandable sections

/**
 * Difficulty level (PAA-specific)
 */
export type PAADifficultyLevel =
  | 'easy'
  | 'medium'
  | 'hard'
  | 'very-hard';

/**
 * Data freshness status
 */
export type DataFreshness =
  | 'fresh'         // Less than 24 hours
  | 'recent'        // 1-7 days
  | 'stale'         // 7-30 days
  | 'outdated';     // More than 30 days

/**
 * Content coverage status
 */
export type CoverageStatus =
  | 'covered'       // Question answered in content
  | 'partial'       // Partially covered
  | 'not-covered'   // Not covered at all
  | 'opportunity';  // High-value uncovered question

// =============================================================================
// UI STATE TYPES
// =============================================================================

/**
 * PAA panel state
 */
export interface PAAState {
  /** PAA data */
  data: PAAData | null;
  /** Loading state */
  isLoading: boolean;
  /** Current stage of loading */
  loadingStage: LoadingStage;
  /** Progress percentage */
  progress: number;
  /** Error message */
  error: string | null;
  /** Active tab */
  activeTab: PAATab;
  /** Active view mode */
  viewMode: ViewMode;
  /** Search/filter query */
  searchQuery: string;
  /** Selected filters */
  filters: PAAFilters;
  /** Selected questions for export */
  selectedQuestions: string[];
  /** Expanded question IDs */
  expandedQuestions: string[];
}

/**
 * Loading stages
 */
export type LoadingStage =
  | 'idle'
  | 'fetching-serp'
  | 'extracting-paa'
  | 'expanding-questions'
  | 'clustering'
  | 'analyzing'
  | 'complete'
  | 'error';

/**
 * PAA panel tabs
 */
export type PAATab =
  | 'all'
  | 'by-type'
  | 'clusters'
  | 'tree'
  | 'coverage'
  | 'opportunities';

/**
 * View modes
 */
export type ViewMode =
  | 'list'
  | 'grid'
  | 'tree'
  | 'cluster';

/**
 * Filter options
 */
export interface PAAFilters {
  /** Filter by question types */
  types: QuestionType[];
  /** Filter by intents */
  intents: QuestionIntent[];
  /** Filter by coverage status */
  coverageStatus: CoverageStatus[];
  /** Filter by difficulty */
  difficulty: PAADifficultyLevel[];
  /** Filter by answer format */
  answerFormats: AnswerFormat[];
  /** Minimum relevance score */
  minRelevance: number;
  /** Only featured questions */
  featuredOnly: boolean;
}

// =============================================================================
// API AND CONFIGURATION TYPES
// =============================================================================

/**
 * PAA fetch options
 */
export interface PAAFetchOptions {
  /** Target keyword */
  keyword: string;
  /** Location */
  location: PAALocation;
  /** Max questions to fetch */
  maxQuestions: number;
  /** Expand child questions */
  expandChildren: boolean;
  /** Max depth for child questions */
  maxDepth: number;
  /** Include related searches */
  includeRelatedSearches: boolean;
  /** Force refresh (ignore cache) */
  forceRefresh: boolean;
}

/**
 * Question analysis options
 */
export interface PAAAnalysisOptions {
  /** Content to analyze for coverage */
  content: string;
  /** Minimum relevance threshold */
  minRelevanceThreshold: number;
  /** Cluster questions by topic */
  clusterQuestions: boolean;
  /** Number of clusters */
  clusterCount: number;
}

/**
 * Export options
 */
export interface PAAExportOptions {
  /** Export format */
  format: 'json' | 'csv' | 'markdown' | 'html';
  /** Include answers */
  includeAnswers: boolean;
  /** Include metadata */
  includeMetadata: boolean;
  /** Only selected questions */
  selectedOnly: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Default fetch options
 */
export const DEFAULT_PAA_OPTIONS: PAAFetchOptions = {
  keyword: '',
  location: {
    countryCode: 'US',
    countryName: 'United States',
    languageCode: 'en',
    googleDomain: 'google.com'
  },
  maxQuestions: 50,
  expandChildren: true,
  maxDepth: 2,
  includeRelatedSearches: true,
  forceRefresh: false
};

/**
 * Default filters
 */
export const DEFAULT_PAA_FILTERS: PAAFilters = {
  types: [],
  intents: [],
  coverageStatus: [],
  difficulty: [],
  answerFormats: [],
  minRelevance: 0,
  featuredOnly: false
};

/**
 * Question type labels
 */
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  what: 'What',
  how: 'How',
  why: 'Why',
  when: 'When',
  where: 'Where',
  who: 'Who',
  which: 'Which',
  can: 'Can',
  does: 'Does',
  is: 'Is',
  are: 'Are',
  will: 'Will',
  should: 'Should',
  comparison: 'Comparison',
  list: 'List',
  other: 'Other'
};

/**
 * Question type icons
 */
export const QUESTION_TYPE_ICONS: Record<QuestionType, string> = {
  what: '❓',
  how: '🔧',
  why: '💡',
  when: '📅',
  where: '📍',
  who: '👤',
  which: '🔀',
  can: '✅',
  does: '🤔',
  is: '❔',
  are: '❔',
  will: '🔮',
  should: '⚖️',
  comparison: '⚔️',
  list: '📋',
  other: '💭'
};

/**
 * Question category labels
 */
export const QUESTION_CATEGORY_LABELS: Record<QuestionCategory, string> = {
  basics: 'Basic Questions',
  'how-to': 'How-To Guides',
  comparison: 'Comparisons',
  troubleshooting: 'Troubleshooting',
  features: 'Features & Specs',
  pricing: 'Pricing & Costs',
  alternatives: 'Alternatives',
  reviews: 'Reviews & Opinions',
  other: 'Other Questions'
};

/**
 * Intent labels (PAA-specific)
 */
export const PAA_INTENT_LABELS: Record<QuestionIntent, string> = {
  informational: 'Informational',
  navigational: 'Navigational',
  transactional: 'Transactional',
  commercial: 'Commercial',
  educational: 'Educational',
  comparison: 'Comparison'
};

/**
 * Intent colors (PAA-specific)
 */
export const PAA_INTENT_COLORS: Record<QuestionIntent, string> = {
  informational: 'blue',
  navigational: 'purple',
  transactional: 'green',
  commercial: 'orange',
  educational: 'cyan',
  comparison: 'pink'
};

/**
 * Difficulty colors (PAA-specific)
 */
export const PAA_DIFFICULTY_COLORS: Record<PAADifficultyLevel, string> = {
  easy: 'green',
  medium: 'yellow',
  hard: 'orange',
  'very-hard': 'red'
};

/**
 * Coverage status colors
 */
export const COVERAGE_STATUS_COLORS: Record<CoverageStatus, string> = {
  covered: 'green',
  partial: 'yellow',
  'not-covered': 'gray',
  opportunity: 'orange'
};

/**
 * Answer format icons
 */
export const ANSWER_FORMAT_ICONS: Record<AnswerFormat, string> = {
  paragraph: '📝',
  list: '📋',
  table: '📊',
  steps: '🔢',
  video: '🎥',
  image: '🖼️',
  accordion: '📑'
};

/**
 * Available locations
 */
export const PAA_LOCATIONS: PAALocation[] = [
  { countryCode: 'US', countryName: 'United States', languageCode: 'en', googleDomain: 'google.com' },
  { countryCode: 'UK', countryName: 'United Kingdom', languageCode: 'en', googleDomain: 'google.co.uk' },
  { countryCode: 'CA', countryName: 'Canada', languageCode: 'en', googleDomain: 'google.ca' },
  { countryCode: 'AU', countryName: 'Australia', languageCode: 'en', googleDomain: 'google.com.au' },
  { countryCode: 'IN', countryName: 'India', languageCode: 'en', googleDomain: 'google.co.in' },
  { countryCode: 'DE', countryName: 'Germany', languageCode: 'de', googleDomain: 'google.de' },
  { countryCode: 'FR', countryName: 'France', languageCode: 'fr', googleDomain: 'google.fr' },
  { countryCode: 'ES', countryName: 'Spain', languageCode: 'es', googleDomain: 'google.es' },
  { countryCode: 'IT', countryName: 'Italy', languageCode: 'it', googleDomain: 'google.it' },
  { countryCode: 'BR', countryName: 'Brazil', languageCode: 'pt', googleDomain: 'google.com.br' },
  { countryCode: 'JP', countryName: 'Japan', languageCode: 'ja', googleDomain: 'google.co.jp' },
  { countryCode: 'MX', countryName: 'Mexico', languageCode: 'es', googleDomain: 'google.com.mx' }
];

/**
 * PAA tabs configuration
 */
export const PAA_TABS: Array<{ value: PAATab; label: string; icon: string }> = [
  { value: 'all', label: 'All Questions', icon: '📋' },
  { value: 'by-type', label: 'By Type', icon: '🏷️' },
  { value: 'clusters', label: 'Topic Clusters', icon: '🎯' },
  { value: 'tree', label: 'Question Tree', icon: '🌳' },
  { value: 'coverage', label: 'Coverage Analysis', icon: '✅' },
  { value: 'opportunities', label: 'Opportunities', icon: '💎' }
];

/**
 * Loading stage messages
 */
export const LOADING_STAGE_MESSAGES: Record<LoadingStage, string> = {
  idle: 'Ready to fetch PAA questions',
  'fetching-serp': 'Fetching SERP data...',
  'extracting-paa': 'Extracting PAA questions...',
  'expanding-questions': 'Expanding child questions...',
  clustering: 'Clustering questions by topic...',
  analyzing: 'Analyzing coverage and opportunities...',
  complete: 'PAA analysis complete!',
  error: 'Error occurred during analysis'
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * PAA question with selection state
 */
export interface SelectablePAAQuestion extends PAAQuestion {
  isSelected: boolean;
}

/**
 * PAA question with expansion state
 */
export interface ExpandablePAAQuestion extends PAAQuestion {
  isExpanded: boolean;
}

/**
 * Question coverage analysis result
 */
export interface CoverageAnalysis {
  /** Total questions analyzed */
  totalQuestions: number;
  /** Questions fully covered */
  covered: number;
  /** Questions partially covered */
  partial: number;
  /** Questions not covered */
  notCovered: number;
  /** High-value opportunities */
  opportunities: number;
  /** Coverage percentage */
  coveragePercentage: number;
  /** Opportunity score */
  opportunityScore: number;
}

/**
 * Question opportunity
 */
export interface PAAOpportunity {
  /** The question */
  question: PAAQuestion;
  /** Opportunity score */
  score: number;
  /** Reason this is an opportunity */
  reason: string;
  /** Recommended answer format */
  recommendedFormat: AnswerFormat;
  /** Suggested section to add */
  suggestedSection?: string;
  /** Word count estimate for answer */
  estimatedWordCount: number;
}

/**
 * PAA statistics
 */
export interface PAAStatistics {
  /** Total questions */
  total: number;
  /** Questions by type */
  byType: Record<QuestionType, number>;
  /** Questions by intent */
  byIntent: Record<QuestionIntent, number>;
  /** Questions by difficulty */
  byDifficulty: Record<PAADifficultyLevel, number>;
  /** Questions by coverage */
  byCoverage: Record<CoverageStatus, number>;
  /** Average relevance score */
  avgRelevance: number;
  /** Total clusters */
  totalClusters: number;
  /** Max tree depth */
  maxTreeDepth: number;
}
