// =============================================================================
// COMPETITOR ANALYSIS TYPES - Live SERP Analysis with Content Gap Detection
// =============================================================================
// Industry-standard competitor analysis like Surfer SEO, Clearscope, Frase
// Real-time top 10 SERP analysis with comprehensive content comparison
// =============================================================================

// -----------------------------------------------------------------------------
// SERP Competitor Types
// -----------------------------------------------------------------------------

/**
 * Individual competitor from SERP results
 */
export interface SERPCompetitor {
  id: string;
  rank: number;
  url: string;
  domain: string;
  title: string;
  metaDescription: string;
  
  // Content metrics
  wordCount: number;
  headingCount: HeadingBreakdown;
  paragraphCount: number;
  imageCount: number;
  videoCount: number;
  
  // Link metrics
  internalLinks: number;
  externalLinks: number;
  
  // Structure analysis
  headings: CompetitorHeading[];
  outlineStructure: CompetitorOutlineSection[];
  
  // Content features
  hasFAQ: boolean;
  hasTableOfContents: boolean;
  hasSchema: boolean;
  schemaTypes: string[];
  
  // Engagement signals (estimated)
  estimatedReadTime: number;
  contentAge: string | null;
  lastUpdated: string | null;
  
  // Quality indicators
  domainAuthority: number;
  pageAuthority: number;
  
  // NLP analysis
  topTerms: CompetitorTerm[];
  entities: CompetitorEntity[];
  topicCoverage: number;
}

/**
 * Heading breakdown by level
 */
export interface HeadingBreakdown {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
  total: number;
}

/**
 * Individual heading from competitor content
 */
export interface CompetitorHeading {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  position: number; // Character position in content
  wordCount: number; // Words in this section
}

/**
 * Outline section extracted from competitor
 */
export interface CompetitorOutlineSection {
  id: string;
  level: number;
  heading: string;
  subSections: CompetitorOutlineSection[];
  estimatedWordCount: number;
  topics: string[];
}

/**
 * Term found in competitor content
 */
export interface CompetitorTerm {
  term: string;
  frequency: number;
  density: number;
  importance: number; // 0-100 based on position and frequency
  inHeadings: boolean;
  inFirstParagraph: boolean;
}

/**
 * Named entity from competitor content
 */
export interface CompetitorEntity {
  entity: string;
  type: CompetitorEntityType;
  frequency: number;
  competitors: number; // How many competitors mention this
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export type CompetitorEntityType = 
  | 'person'
  | 'organization'
  | 'location'
  | 'product'
  | 'brand'
  | 'concept'
  | 'technology'
  | 'event'
  | 'other';

// -----------------------------------------------------------------------------
// Content Gap Types
// -----------------------------------------------------------------------------

/**
 * Content gap analysis results
 */
export interface ContentGapAnalysis {
  // Missing topics
  missingTopics: MissingTopic[];
  
  // Missing terms
  missingTerms: MissingTerm[];
  
  // Missing entities
  missingEntities: MissingEntity[];
  
  // Missing headings/sections
  missingSections: MissingSection[];
  
  // Missing questions
  missingQuestions: MissingQuestion[];
  
  // Structural gaps
  structuralGaps: StructuralGap[];
  
  // Overall gap score (0-100, lower is better)
  gapScore: number;
  
  // Coverage percentage
  topicCoverage: number;
  termCoverage: number;
  entityCoverage: number;
  structureCoverage: number;
}

/**
 * Missing topic not covered in your content
 */
export interface MissingTopic {
  id: string;
  topic: string;
  description: string;
  competitorsCovering: number;
  competitorPercentage: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  suggestedHeading: string;
  suggestedWordCount: number;
  relatedTerms: string[];
}

/**
 * Missing NLP term
 */
export interface MissingTerm {
  term: string;
  avgCompetitorFrequency: number;
  competitorsCovering: number;
  importance: number;
  suggestedUsage: number;
  context: string; // Example usage from competitors
}

/**
 * Missing named entity
 */
export interface MissingEntity {
  entity: string;
  type: CompetitorEntityType;
  competitorsCovering: number;
  relevance: number;
  context: string;
}

/**
 * Missing section/heading
 */
export interface MissingSection {
  id: string;
  heading: string;
  level: number;
  competitorsCovering: number;
  avgPosition: number;
  avgWordCount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  subtopics: string[];
}

/**
 * Missing question (FAQ, PAA style)
 */
export interface MissingQuestion {
  question: string;
  frequency: number;
  answerType: 'paragraph' | 'list' | 'steps' | 'definition';
  suggestedAnswerLength: number;
  source: 'paa' | 'competitor-faq' | 'competitor-heading' | 'inferred';
}

/**
 * Structural gap in content
 */
export interface StructuralGap {
  type: StructuralGapType;
  current: number;
  recommended: number;
  min: number;
  max: number;
  avg: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
}

export type StructuralGapType = 
  | 'word-count'
  | 'heading-count'
  | 'paragraph-count'
  | 'image-count'
  | 'video-count'
  | 'internal-links'
  | 'external-links'
  | 'list-count'
  | 'table-count';

// -----------------------------------------------------------------------------
// Competitor Comparison Types
// -----------------------------------------------------------------------------

/**
 * Your content vs competitors comparison
 */
export interface CompetitorComparison {
  yourContent: ContentMetrics;
  competitorAverage: ContentMetrics;
  competitorMin: ContentMetrics;
  competitorMax: ContentMetrics;
  topCompetitor: ContentMetrics;
  
  // Comparison scores
  scores: ComparisonScores;
  
  // Position prediction
  positionPrediction: PositionPrediction;
}

/**
 * Content metrics for comparison
 */
export interface ContentMetrics {
  wordCount: number;
  headingCount: HeadingBreakdown;
  paragraphCount: number;
  imageCount: number;
  videoCount: number;
  internalLinks: number;
  externalLinks: number;
  readingTime: number;
  uniqueTerms: number;
  entityCount: number;
}

/**
 * Comparison scores across dimensions
 */
export interface ComparisonScores {
  overall: number; // 0-100
  contentLength: ScoreDetail;
  structure: ScoreDetail;
  termCoverage: ScoreDetail;
  entityCoverage: ScoreDetail;
  readability: ScoreDetail;
  multimedia: ScoreDetail;
  linking: ScoreDetail;
}

/**
 * Score detail with comparison
 */
export interface ScoreDetail {
  score: number;
  vsAverage: number; // Percentage vs average (-100 to +100)
  vsTop: number; // Percentage vs top competitor
  status: 'excellent' | 'good' | 'needs-work' | 'poor';
  recommendation: string;
}

/**
 * Predicted SERP position
 */
export interface PositionPrediction {
  estimatedPosition: number;
  confidence: number; // 0-100
  factors: PositionFactor[];
}

/**
 * Factor affecting position prediction
 */
export interface PositionFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

// -----------------------------------------------------------------------------
// SERP Analysis Types
// -----------------------------------------------------------------------------

/**
 * Full SERP analysis result
 */
export interface SERPAnalysis {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  intent: CompetitorSearchIntent;
  
  // Competitors
  competitors: SERPCompetitor[];
  
  // Aggregated metrics
  averageMetrics: ContentMetrics;
  topPerformerMetrics: ContentMetrics;
  
  // Common patterns
  commonHeadings: CommonPattern[];
  commonTerms: CommonPattern[];
  commonEntities: CommonPattern[];
  commonQuestions: CommonPattern[];
  
  // Content features frequency
  featureFrequency: FeatureFrequency;
  
  // Timestamp
  analyzedAt: string;
}

export type CompetitorSearchIntent = 
  | 'informational'
  | 'navigational'
  | 'transactional'
  | 'commercial'
  | 'local';

/**
 * Common pattern across competitors
 */
export interface CommonPattern {
  item: string;
  frequency: number; // How many competitors have this
  percentage: number; // Percentage of competitors
  avgPosition: number; // Average position in content (0-1)
  importance: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Feature frequency across competitors
 */
export interface FeatureFrequency {
  faq: number;
  tableOfContents: number;
  video: number;
  infographic: number;
  downloadable: number;
  interactive: number;
  schemaMarkup: number;
  authorBox: number;
  lastUpdated: number;
  statistics: number;
}

// -----------------------------------------------------------------------------
// Live Analysis State
// -----------------------------------------------------------------------------

/**
 * Live analysis state
 */
export interface LiveAnalysisState {
  status: AnalysisStatus;
  progress: number;
  currentStep: string;
  error: string | null;
  
  // Results
  serpAnalysis: SERPAnalysis | null;
  contentGaps: ContentGapAnalysis | null;
  comparison: CompetitorComparison | null;
  
  // Selected competitors
  selectedCompetitors: string[];
  
  // Settings
  settings: AnalysisSettings;
}

export type AnalysisStatus = 
  | 'idle'
  | 'analyzing'
  | 'completed'
  | 'error'
  | 'partial';

/**
 * Analysis settings
 */
export interface AnalysisSettings {
  competitorCount: number; // How many competitors to analyze (default 10)
  includeLocal: boolean;
  location: string;
  language: string;
  device: 'desktop' | 'mobile';
  freshness: 'any' | 'day' | 'week' | 'month' | 'year';
}

// -----------------------------------------------------------------------------
// UI State Types
// -----------------------------------------------------------------------------

/**
 * Competitor panel view state
 */
export interface CompetitorPanelState {
  activeTab: 'overview' | 'gaps' | 'comparison' | 'outline';
  expandedCompetitors: string[];
  sortBy: CompetitorSortOption;
  sortOrder: 'asc' | 'desc';
  filterBy: CompetitorFilterOption;
}

export type CompetitorSortOption = 
  | 'rank'
  | 'wordCount'
  | 'headings'
  | 'authority'
  | 'topicCoverage';

export type CompetitorFilterOption = 
  | 'all'
  | 'similar-length'
  | 'top-3'
  | 'top-5'
  | 'top-10';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const DEFAULT_ANALYSIS_SETTINGS: AnalysisSettings = {
  competitorCount: 10,
  includeLocal: false,
  location: 'United States',
  language: 'en',
  device: 'desktop',
  freshness: 'any'
};

export const DEFAULT_PANEL_STATE: CompetitorPanelState = {
  activeTab: 'overview',
  expandedCompetitors: [],
  sortBy: 'rank',
  sortOrder: 'asc',
  filterBy: 'all'
};

export const PRIORITY_COLORS = {
  critical: 'text-red-500',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-green-500'
} as const;

export const STATUS_COLORS = {
  excellent: 'text-green-500',
  good: 'text-blue-500',
  'needs-work': 'text-yellow-500',
  poor: 'text-red-500'
} as const;

export const GAP_THRESHOLDS = {
  excellent: 20,
  good: 40,
  needsWork: 60,
  poor: 80
} as const;
