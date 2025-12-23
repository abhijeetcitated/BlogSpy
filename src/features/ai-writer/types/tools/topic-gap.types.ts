/**
 * Topic Gap Analysis Types
 * 
 * Type definitions for identifying content gaps vs competitors:
 * - Topic extraction and comparison
 * - Content gap identification
 * - Opportunity scoring
 */

// =============================================================================
// CORE TYPES
// =============================================================================

/**
 * Topic types
 */
export type TopicType =
  | 'main'          // Main topic
  | 'subtopic'      // Sub-topic
  | 'related'       // Related topic
  | 'semantic'      // Semantically similar
  | 'question'      // Question-based topic
  | 'long_tail'     // Long-tail variation
  | 'competitor';   // Found in competitor content

/**
 * Gap severity
 */
export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Gap status
 */
export type GapStatus = 
  | 'missing'       // Topic completely missing
  | 'undercovered'  // Topic mentioned but not detailed
  | 'outdated'      // Topic covered but outdated
  | 'opportunity';  // Opportunity to expand

/**
 * Content depth level
 */
export type ContentDepth = 'surface' | 'moderate' | 'deep' | 'comprehensive';

// =============================================================================
// TOPIC DATA STRUCTURES
// =============================================================================

/**
 * Individual topic
 */
export interface Topic {
  /** Unique identifier */
  id: string;
  
  /** Topic text */
  text: string;
  
  /** Normalized form */
  normalizedText: string;
  
  /** Topic type */
  type: TopicType;
  
  /** Parent topic (if subtopic) */
  parentId?: string;
  
  /** Relevance score (0-100) */
  relevance: number;
  
  /** Search volume (if available) */
  searchVolume?: number;
  
  /** Keyword difficulty */
  difficulty?: number;
  
  /** Coverage in your content */
  yourCoverage: ContentDepth | 'none';
  
  /** Coverage in competitor content */
  competitorCoverage: ContentDepth | 'none';
  
  /** Word count covering this topic */
  wordCount: number;
  
  /** Sections mentioning this topic */
  sections: TopicSection[];
  
  /** Related topics */
  relatedTopics: string[];
  
  /** Questions about this topic */
  questions: string[];
  
  /** Competitors covering this topic */
  competitorsWithTopic: string[];
  
  /** Average competitor depth */
  avgCompetitorDepth: ContentDepth | 'none';
}

/**
 * Topic section in content
 */
export interface TopicSection {
  /** Section heading */
  heading?: string;
  
  /** Start position */
  startOffset: number;
  
  /** End position */
  endOffset: number;
  
  /** Word count */
  wordCount: number;
  
  /** Depth level */
  depth: ContentDepth;
}

/**
 * Topic cluster
 */
export interface TopicCluster {
  /** Cluster ID */
  id: string;
  
  /** Main topic */
  mainTopic: string;
  
  /** Subtopics */
  subtopics: string[];
  
  /** Your coverage percentage */
  yourCoverage: number;
  
  /** Competitor coverage percentage */
  competitorCoverage: number;
  
  /** Gap percentage */
  gapPercentage: number;
  
  /** Opportunity score */
  opportunityScore: number;
}

// =============================================================================
// GAP DATA STRUCTURES
// =============================================================================

/**
 * Content gap
 */
export interface ContentGap {
  /** Gap ID */
  id: string;
  
  /** Topic text */
  topic: string;
  
  /** Gap type */
  type: TopicType;
  
  /** Gap status */
  status: GapStatus;
  
  /** Gap severity */
  severity: GapSeverity;
  
  /** Opportunity score (0-100) */
  opportunityScore: number;
  
  /** Search volume */
  searchVolume?: number;
  
  /** Keyword difficulty */
  difficulty?: number;
  
  /** Why this is a gap */
  reason: string;
  
  /** Competitors covering this */
  competitorsWithTopic: string[];
  
  /** Average competitor word count */
  avgCompetitorWords: number;
  
  /** Suggested content to add */
  suggestedContent: string;
  
  /** Suggested word count */
  suggestedWordCount: number;
  
  /** Questions to answer */
  questionsToAnswer: string[];
  
  /** Priority rank */
  priority: number;
  
  /** Effort to fix */
  effort: 'low' | 'medium' | 'high';
  
  /** Impact if fixed */
  impact: 'low' | 'medium' | 'high';
}

/**
 * Gap summary by severity
 */
export interface GapSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

// =============================================================================
// COMPETITOR DATA
// =============================================================================

/**
 * Competitor content analysis
 */
export interface CompetitorContent {
  /** Competitor URL */
  url: string;
  
  /** Competitor domain */
  domain: string;
  
  /** Page title */
  title: string;
  
  /** Total word count */
  wordCount: number;
  
  /** Topics covered */
  topics: Topic[];
  
  /** Unique topics (not in your content) */
  uniqueTopics: string[];
  
  /** Common topics */
  commonTopics: string[];
  
  /** Content depth */
  contentDepth: ContentDepth;
  
  /** Coverage score */
  coverageScore: number;
  
  /** Ranking position (if known) */
  rankingPosition?: number;
}

/**
 * Competitor comparison
 */
export interface CompetitorComparison {
  /** Your content metrics */
  yourContent: {
    wordCount: number;
    topicCount: number;
    depth: ContentDepth;
    coverageScore: number;
  };
  
  /** Average competitor metrics */
  avgCompetitor: {
    wordCount: number;
    topicCount: number;
    depth: ContentDepth;
    coverageScore: number;
  };
  
  /** Gaps vs competitors */
  gaps: ContentGap[];
  
  /** Topics only you cover */
  uniqueToYou: string[];
  
  /** Topics all competitors cover */
  commonToAll: string[];
}

// =============================================================================
// ANALYSIS RESULTS
// =============================================================================

/**
 * Topic gap analysis metrics
 */
export interface TopicGapMetrics {
  /** Overall coverage score (0-100) */
  overallScore: number;
  
  /** Total topics identified */
  totalTopics: number;
  
  /** Topics covered by you */
  topicsCovered: number;
  
  /** Topics missing */
  topicsMissing: number;
  
  /** Topics undercovered */
  topicsUndercovered: number;
  
  /** Competitor parity score */
  competitorParity: number;
  
  /** Content depth score */
  depthScore: number;
  
  /** Opportunity score */
  opportunityScore: number;
  
  /** Word count gap (vs competitor avg) */
  wordCountGap: number;
  
  /** Topic gap percentage */
  topicGapPercentage: number;
  
  /** Clusters with gaps */
  clustersWithGaps: number;
  
  /** Total gaps found */
  totalGaps: number;
  
  /** Critical gaps */
  criticalGaps: number;
}

/**
 * Full topic gap analysis
 */
export interface TopicGapAnalysis {
  /** Analysis timestamp */
  timestamp: Date;
  
  /** Target keyword */
  keyword: string;
  
  /** Your content word count */
  yourWordCount: number;
  
  /** Metrics */
  metrics: TopicGapMetrics;
  
  /** All topics */
  topics: Topic[];
  
  /** Topic clusters */
  clusters: TopicCluster[];
  
  /** Content gaps */
  gaps: ContentGap[];
  
  /** Gap summary */
  gapSummary: GapSummary;
  
  /** Competitor data */
  competitorData: CompetitorContent[];
  
  /** Competitor comparison */
  comparison: CompetitorComparison;
  
  /** Recommendations */
  recommendations: TopicRecommendation[];
  
  /** Summary */
  summary: TopicGapSummary;
  
  /** Quick wins */
  quickWins: QuickWin[];
}

/**
 * Topic gap summary
 */
export interface TopicGapSummary {
  /** Main finding */
  mainFinding: string;
  
  /** Strengths */
  strengths: string[];
  
  /** Weaknesses */
  weaknesses: string[];
  
  /** Top opportunities */
  topOpportunities: string[];
  
  /** Verdict */
  verdict: 'excellent' | 'good' | 'average' | 'needs_work' | 'poor';
  
  /** Estimated word count to add */
  estimatedWordsToAdd: number;
}

// =============================================================================
// RECOMMENDATIONS
// =============================================================================

/**
 * Topic recommendation
 */
export interface TopicRecommendation {
  /** Recommendation ID */
  id: string;
  
  /** Recommendation type */
  type: 'add_topic' | 'expand_topic' | 'add_section' | 'answer_question' | 'update_content';
  
  /** Topic involved */
  topic: string;
  
  /** Title */
  title: string;
  
  /** Description */
  description: string;
  
  /** Impact score */
  impact: GapSeverity;
  
  /** Effort level */
  effort: 'low' | 'medium' | 'high';
  
  /** Suggested content outline */
  suggestedOutline?: string[];
  
  /** Questions to answer */
  questions?: string[];
  
  /** Suggested word count */
  suggestedWordCount: number;
  
  /** Priority */
  priority: number;
}

/**
 * Quick win
 */
export interface QuickWin {
  /** Topic */
  topic: string;
  
  /** Action */
  action: string;
  
  /** Word count needed */
  wordCount: number;
  
  /** Impact */
  impact: GapSeverity;
}

// =============================================================================
// SETTINGS
// =============================================================================

/**
 * Topic gap analysis settings
 */
export interface TopicGapSettings {
  /** Competitor URLs to analyze */
  competitorUrls: string[];
  
  /** Maximum topics to analyze */
  maxTopics: number;
  
  /** Minimum topic relevance */
  minRelevance: number;
  
  /** Include questions */
  includeQuestions: boolean;
  
  /** Include long-tail topics */
  includeLongTail: boolean;
  
  /** Include semantic topics */
  includeSemanticTopics: boolean;
  
  /** Minimum word count for coverage */
  minWordCountForCoverage: number;
  
  /** Deep coverage word threshold */
  deepCoverageWordThreshold: number;
  
  /** Language */
  language: string;
  
  /** Industry/niche */
  industry?: string;
}

/**
 * Default settings
 */
export const DEFAULT_TOPIC_GAP_SETTINGS: TopicGapSettings = {
  competitorUrls: [],
  maxTopics: 50,
  minRelevance: 40,
  includeQuestions: true,
  includeLongTail: true,
  includeSemanticTopics: true,
  minWordCountForCoverage: 50,
  deepCoverageWordThreshold: 200,
  language: 'en',
  industry: undefined
};

// =============================================================================
// UI TYPES
// =============================================================================

/**
 * Filter state
 */
export interface TopicGapFilterState {
  type: TopicType | 'all';
  status: GapStatus | 'all';
  severity: GapSeverity | 'all';
  search: string;
  minOpportunity: number;
  showMissingOnly: boolean;
}

/**
 * Sort options
 */
export type TopicGapSortOption =
  | 'opportunity'
  | 'severity'
  | 'alphabetical'
  | 'searchVolume'
  | 'effort'
  | 'impact';

/**
 * View mode
 */
export type TopicGapViewMode = 'list' | 'grid' | 'clusters' | 'comparison';

// =============================================================================
// CONSTANTS
// =============================================================================

export const GAP_SEVERITY_LABELS: Record<GapSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

export const GAP_STATUS_LABELS: Record<GapStatus, string> = {
  missing: 'Missing',
  undercovered: 'Undercovered',
  outdated: 'Outdated',
  opportunity: 'Opportunity'
};

export const TOPIC_TYPE_LABELS: Record<TopicType, string> = {
  main: 'Main Topic',
  subtopic: 'Sub-topic',
  related: 'Related',
  semantic: 'Semantic',
  question: 'Question',
  long_tail: 'Long-tail',
  competitor: 'Competitor Topic'
};

export const CONTENT_DEPTH_LABELS: Record<ContentDepth, string> = {
  surface: 'Surface Level',
  moderate: 'Moderate',
  deep: 'Deep',
  comprehensive: 'Comprehensive'
};

export const GAP_SEVERITY_WEIGHTS: Record<GapSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

export type TopicGapExportFormat = 'json' | 'csv' | 'markdown';
