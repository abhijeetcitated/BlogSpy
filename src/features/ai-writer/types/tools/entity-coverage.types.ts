/**
 * Entity Coverage Analysis Types
 * 
 * Comprehensive type definitions for entity coverage analysis:
 * - Named entity recognition (NER)
 * - Entity relationship mapping
 * - Coverage comparison with competitors
 * - Knowledge graph alignment
 */

// =============================================================================
// ENTITY TYPES
// =============================================================================

/**
 * Entity type categories
 */
export type EntityType =
  | 'person'           // People names
  | 'organization'     // Companies, institutions
  | 'location'         // Places, addresses
  | 'product'          // Product names
  | 'brand'            // Brand names
  | 'concept'          // Abstract concepts
  | 'technology'       // Tech terms
  | 'event'            // Events, dates
  | 'quantity'         // Numbers, measurements
  | 'time'             // Dates, times
  | 'money'            // Currency values
  | 'percent'          // Percentages
  | 'attribute'        // Qualities, characteristics
  | 'action'           // Verbs, actions
  | 'topic'            // Main topics
  | 'subtopic'         // Sub-topics
  | 'custom';          // Custom entity type

/**
 * Entity importance level
 */
export type EntityImportance = 'critical' | 'high' | 'medium' | 'low';

/**
 * Entity status in content
 */
export type EntityStatus = 
  | 'covered'          // Entity is well covered
  | 'mentioned'        // Entity is mentioned but not detailed
  | 'missing'          // Entity should be added
  | 'overused';        // Entity is mentioned too many times

/**
 * Entity relationship type
 */
export type RelationshipType =
  | 'is_a'             // X is a Y
  | 'part_of'          // X is part of Y
  | 'related_to'       // X is related to Y
  | 'causes'           // X causes Y
  | 'preceded_by'      // X preceded by Y
  | 'followed_by'      // X followed by Y
  | 'synonym'          // X is synonym of Y
  | 'antonym'          // X is antonym of Y
  | 'attribute_of'     // X is attribute of Y
  | 'located_in'       // X located in Y
  | 'works_for'        // X works for Y
  | 'owns'             // X owns Y
  | 'competes_with'    // X competes with Y
  | 'similar_to'       // X similar to Y
  | 'example_of';      // X is example of Y

// =============================================================================
// ENTITY DATA STRUCTURES
// =============================================================================

/**
 * Individual entity instance
 */
export interface Entity {
  /** Unique identifier */
  id: string;
  
  /** Entity text as found */
  text: string;
  
  /** Normalized/canonical form */
  normalizedText: string;
  
  /** Entity type */
  type: EntityType;
  
  /** Importance level */
  importance: EntityImportance;
  
  /** Coverage status */
  status: EntityStatus;
  
  /** Mention count in content */
  count: number;
  
  /** Positions in content */
  positions: EntityPosition[];
  
  /** Confidence score (0-100) */
  confidence: number;
  
  /** Wikipedia/Knowledge Graph URL if available */
  wikiUrl?: string;
  
  /** Entity description */
  description?: string;
  
  /** Related entities */
  relatedEntities?: string[];
  
  /** Synonyms */
  synonyms?: string[];
  
  /** Sentiment association */
  sentiment?: 'positive' | 'negative' | 'neutral';
  
  /** Whether entity should be linked */
  shouldLink?: boolean;
  
  /** Suggested link URL */
  suggestedLinkUrl?: string;
  
  /** SEO relevance score */
  seoRelevance: number;
  
  /** From competitor analysis */
  isCompetitorEntity?: boolean;
  
  /** Competitor coverage */
  competitorCoverage?: number;
}

/**
 * Entity position in content
 */
export interface EntityPosition {
  /** Start offset */
  start: number;
  
  /** End offset */
  end: number;
  
  /** Line number */
  line: number;
  
  /** Context snippet */
  context?: string;
  
  /** HTML element containing entity */
  element?: string;
  
  /** Is in heading? */
  isInHeading?: boolean;
  
  /** Is in first paragraph? */
  isInFirstParagraph?: boolean;
}

/**
 * Entity relationship
 */
export interface EntityRelationship {
  /** Relationship ID */
  id: string;
  
  /** Source entity ID */
  sourceId: string;
  
  /** Source entity text */
  sourceText: string;
  
  /** Target entity ID */
  targetId: string;
  
  /** Target entity text */
  targetText: string;
  
  /** Relationship type */
  type: RelationshipType;
  
  /** Relationship label */
  label: string;
  
  /** Confidence score */
  confidence: number;
  
  /** Context where relationship found */
  context?: string;
}

/**
 * Entity cluster/group
 */
export interface EntityCluster {
  /** Cluster ID */
  id: string;
  
  /** Cluster name/label */
  name: string;
  
  /** Main topic */
  mainTopic: string;
  
  /** Entity IDs in cluster */
  entityIds: string[];
  
  /** Cluster coherence score */
  coherenceScore: number;
  
  /** Coverage percentage */
  coveragePercent: number;
  
  /** Suggested entities to add */
  suggestedEntities: string[];
}

// =============================================================================
// COVERAGE ANALYSIS
// =============================================================================

/**
 * Entity coverage metrics
 */
export interface EntityCoverageMetrics {
  /** Overall coverage score (0-100) */
  overallScore: number;
  
  /** Total entities found */
  totalEntities: number;
  
  /** Entities by type count */
  entitiesByType: Record<EntityType, number>;
  
  /** Entities by status count */
  entitiesByStatus: Record<EntityStatus, number>;
  
  /** Entities by importance */
  entitiesByImportance: Record<EntityImportance, number>;
  
  /** Critical entities covered */
  criticalEntitiesCovered: number;
  
  /** Critical entities total */
  criticalEntitiesTotal: number;
  
  /** Missing critical entities */
  missingCriticalEntities: string[];
  
  /** Competitor entity coverage */
  competitorCoverage: number;
  
  /** Knowledge graph alignment */
  knowledgeGraphAlignment: number;
  
  /** Entity density (per 100 words) */
  entityDensity: number;
  
  /** Relationship count */
  relationshipCount: number;
  
  /** Cluster count */
  clusterCount: number;
  
  /** Unique entity types used */
  uniqueEntityTypes: number;
  
  /** Average entity confidence */
  averageConfidence: number;
}

/**
 * Competitor entity data
 */
export interface CompetitorEntityData {
  /** Competitor URL */
  url: string;
  
  /** Competitor domain */
  domain: string;
  
  /** Entities found */
  entities: Entity[];
  
  /** Entity coverage score */
  coverageScore: number;
  
  /** Unique entities (not in your content) */
  uniqueEntities: string[];
  
  /** Common entities with your content */
  commonEntities: string[];
}

/**
 * Entity gap analysis
 */
export interface EntityGap {
  /** Gap ID */
  id: string;
  
  /** Entity text */
  entity: string;
  
  /** Entity type */
  type: EntityType;
  
  /** Importance */
  importance: EntityImportance;
  
  /** Gap reason */
  reason: 'missing' | 'undermentioned' | 'competitor_only';
  
  /** Competitors that have it */
  competitorsWithEntity: string[];
  
  /** Average competitor mentions */
  avgCompetitorMentions: number;
  
  /** Suggested context */
  suggestedContext: string;
  
  /** Priority score */
  priority: number;
}

// =============================================================================
// RECOMMENDATIONS
// =============================================================================

/**
 * Entity recommendation
 */
export interface EntityRecommendation {
  /** Recommendation ID */
  id: string;
  
  /** Recommendation type */
  type: 'add' | 'expand' | 'reduce' | 'link' | 'optimize' | 'cluster';
  
  /** Entity or cluster affected */
  target: string;
  
  /** Target type */
  targetType: EntityType;
  
  /** Title */
  title: string;
  
  /** Description */
  description: string;
  
  /** Impact score */
  impact: EntityImportance;
  
  /** Effort level */
  effort: 'low' | 'medium' | 'high';
  
  /** Suggested action */
  suggestedAction?: string;
  
  /** Example implementation */
  example?: string;
  
  /** Affected positions */
  positions?: EntityPosition[];
}

/**
 * Entity suggestion for adding
 */
export interface EntitySuggestion {
  /** Entity text */
  entity: string;
  
  /** Entity type */
  type: EntityType;
  
  /** Why to add */
  reason: string;
  
  /** Suggested context */
  context: string;
  
  /** Relevance score */
  relevance: number;
  
  /** Related to existing entities */
  relatedTo: string[];
  
  /** Source (competitor, knowledge graph, etc.) */
  source: 'competitor' | 'knowledge_graph' | 'related_search' | 'semantic';
}

// =============================================================================
// ANALYSIS RESULTS
// =============================================================================

/**
 * Full entity coverage analysis
 */
export interface EntityCoverageAnalysis {
  /** Analysis timestamp */
  timestamp: Date;
  
  /** Target keyword */
  keyword: string;
  
  /** Content analyzed */
  contentLength: number;
  
  /** Metrics */
  metrics: EntityCoverageMetrics;
  
  /** All entities */
  entities: Entity[];
  
  /** Entity relationships */
  relationships: EntityRelationship[];
  
  /** Entity clusters */
  clusters: EntityCluster[];
  
  /** Entity gaps */
  gaps: EntityGap[];
  
  /** Recommendations */
  recommendations: EntityRecommendation[];
  
  /** Suggestions for new entities */
  suggestions: EntitySuggestion[];
  
  /** Competitor data */
  competitorData?: CompetitorEntityData[];
  
  /** Summary */
  summary: EntityCoverageSummary;
  
  /** Score breakdown */
  scoreBreakdown: EntityScoreBreakdown;
}

/**
 * Entity coverage summary
 */
export interface EntityCoverageSummary {
  /** Main finding */
  mainFinding: string;
  
  /** Strengths */
  strengths: string[];
  
  /** Weaknesses */
  weaknesses: string[];
  
  /** Quick wins */
  quickWins: string[];
  
  /** Priority actions */
  priorityActions: string[];
  
  /** Overall verdict */
  verdict: 'excellent' | 'good' | 'average' | 'needs_work' | 'poor';
}

/**
 * Score breakdown
 */
export interface EntityScoreBreakdown {
  /** Coverage breadth */
  breadthScore: number;
  
  /** Coverage depth */
  depthScore: number;
  
  /** Relevance score */
  relevanceScore: number;
  
  /** Relationship score */
  relationshipScore: number;
  
  /** Competitor parity score */
  competitorParityScore: number;
  
  /** Knowledge graph alignment */
  knowledgeGraphScore: number;
}

// =============================================================================
// SETTINGS
// =============================================================================

/**
 * Entity coverage analysis settings
 */
export interface EntityCoverageSettings {
  /** Enable competitor comparison */
  compareWithCompetitors: boolean;
  
  /** Competitor URLs */
  competitorUrls: string[];
  
  /** Minimum confidence threshold */
  minConfidence: number;
  
  /** Entity types to analyze */
  entityTypes: EntityType[];
  
  /** Minimum entity length */
  minEntityLength: number;
  
  /** Maximum entities to analyze */
  maxEntities: number;
  
  /** Enable relationship extraction */
  extractRelationships: boolean;
  
  /** Enable clustering */
  enableClustering: boolean;
  
  /** Minimum cluster size */
  minClusterSize: number;
  
  /** Custom entities to track */
  customEntities: string[];
  
  /** Ignore common entities */
  ignoreCommonEntities: boolean;
  
  /** Common entities to ignore */
  ignoreList: string[];
  
  /** Language */
  language: string;
  
  /** Include sentiment analysis */
  includeSentiment: boolean;
  
  /** Knowledge graph source */
  knowledgeGraphSource: 'wikidata' | 'google' | 'custom';
}

/**
 * Default settings
 */
export const DEFAULT_ENTITY_COVERAGE_SETTINGS: EntityCoverageSettings = {
  compareWithCompetitors: true,
  competitorUrls: [],
  minConfidence: 60,
  entityTypes: [
    'person', 'organization', 'location', 'product', 'brand',
    'concept', 'technology', 'topic', 'subtopic'
  ],
  minEntityLength: 2,
  maxEntities: 100,
  extractRelationships: true,
  enableClustering: true,
  minClusterSize: 3,
  customEntities: [],
  ignoreCommonEntities: true,
  ignoreList: [
    'the', 'a', 'an', 'this', 'that', 'it', 'they',
    'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did'
  ],
  language: 'en',
  includeSentiment: false,
  knowledgeGraphSource: 'wikidata'
};

// =============================================================================
// EXPORT TYPES
// =============================================================================

export type EntityExportFormat = 'json' | 'csv' | 'markdown';

export interface EntityExportOptions {
  format: EntityExportFormat;
  includeMetrics: boolean;
  includeRelationships: boolean;
  includeRecommendations: boolean;
  includeCompetitorData: boolean;
}

// =============================================================================
// UI TYPES
// =============================================================================

/**
 * Entity visualization mode
 */
export type EntityVisualizationMode = 
  | 'list'           // List view
  | 'graph'          // Network graph
  | 'tree'           // Hierarchy tree
  | 'clusters'       // Cluster view
  | 'heatmap';       // Coverage heatmap

/**
 * Entity filter state
 */
export interface EntityFilterState {
  types: EntityType[];
  status: EntityStatus | 'all';
  importance: EntityImportance | 'all';
  search: string;
  showCompetitorOnly: boolean;
  showMissingOnly: boolean;
  minConfidence: number;
}

/**
 * Entity sort options
 */
export type EntitySortOption = 
  | 'relevance'
  | 'alphabetical'
  | 'count'
  | 'confidence'
  | 'importance'
  | 'type';

// =============================================================================
// HELPER CONSTANTS
// =============================================================================

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  person: 'Person',
  organization: 'Organization',
  location: 'Location',
  product: 'Product',
  brand: 'Brand',
  concept: 'Concept',
  technology: 'Technology',
  event: 'Event',
  quantity: 'Quantity',
  time: 'Time',
  money: 'Money',
  percent: 'Percentage',
  attribute: 'Attribute',
  action: 'Action',
  topic: 'Topic',
  subtopic: 'Sub-topic',
  custom: 'Custom'
};

export const ENTITY_TYPE_ICONS: Record<EntityType, string> = {
  person: '👤',
  organization: '🏢',
  location: '📍',
  product: '📦',
  brand: '™️',
  concept: '💡',
  technology: '💻',
  event: '📅',
  quantity: '🔢',
  time: '⏰',
  money: '💰',
  percent: '📊',
  attribute: '✨',
  action: '⚡',
  topic: '📑',
  subtopic: '📄',
  custom: '🏷️'
};

export const ENTITY_STATUS_LABELS: Record<EntityStatus, string> = {
  covered: 'Well Covered',
  mentioned: 'Mentioned',
  missing: 'Missing',
  overused: 'Overused'
};

export const ENTITY_IMPORTANCE_WEIGHTS: Record<EntityImportance, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

export const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  is_a: 'is a',
  part_of: 'is part of',
  related_to: 'is related to',
  causes: 'causes',
  preceded_by: 'preceded by',
  followed_by: 'followed by',
  synonym: 'synonym of',
  antonym: 'antonym of',
  attribute_of: 'attribute of',
  located_in: 'located in',
  works_for: 'works for',
  owns: 'owns',
  competes_with: 'competes with',
  similar_to: 'similar to',
  example_of: 'example of'
};
