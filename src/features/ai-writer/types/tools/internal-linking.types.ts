// =============================================================================
// INTERNAL LINKING TYPES - Production Level
// =============================================================================
// Smart internal linking suggestions like Yoast, Link Whisper, Surfer SEO
// Helps build strong internal link structure for SEO
// =============================================================================

// =============================================================================
// LINK TYPES
// =============================================================================

/**
 * Types of internal links
 */
export type InternalLinkType = 
  | 'contextual'     // Natural in-content link
  | 'navigational'   // Navigation/menu link
  | 'related'        // Related posts/content
  | 'pillar'         // Link to pillar content
  | 'cluster'        // Link within topic cluster
  | 'footer'         // Footer link
  | 'sidebar';       // Sidebar link

/**
 * Link relevance level
 */
export type LinkRelevance = 'high' | 'medium' | 'low';

/**
 * Link position in content
 */
export type LinkPosition = 
  | 'introduction'
  | 'body'
  | 'conclusion'
  | 'heading'
  | 'list-item';

// =============================================================================
// SITE CONTENT TYPES
// =============================================================================

/**
 * Represents a page on the site that can be linked to
 */
export interface SitePage {
  id: string;
  url: string;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  
  // Metadata
  publishedAt?: string;
  updatedAt?: string;
  lastUpdated?: string;
  author?: string;
  category?: string;
  
  // SEO data
  primaryKeyword?: string;
  secondaryKeywords: string[];
  categories?: string[];
  tags: string[];
  
  // Link metrics
  inboundLinks: number;
  outboundLinks: number;
  pageAuthority?: number;
  
  // Content analysis
  wordCount: number;
  headings?: string[];
  topicCluster?: string;
  isPillarContent: boolean;
}

/**
 * Site link graph for understanding link structure
 */
export interface SiteLinkGraph {
  pages: SitePage[];
  links: InternalLink[];
  clusters: TopicCluster[];
  orphanPages: string[];   // Pages with no internal links
  hubPages: string[];      // Pages with many links
}

/**
 * Existing internal link
 */
export interface InternalLink {
  id: string;
  sourcePageId: string;
  targetPageId: string;
  anchorText: string;
  linkType: InternalLinkType;
  position: LinkPosition;
  createdAt: string;
}

/**
 * Topic cluster for organizing content
 */
export interface TopicCluster {
  id: string;
  name: string;
  pillarPageId: string;
  clusterPageIds: string[];
  primaryKeyword: string;
  secondaryKeywords: string[];
}

// =============================================================================
// SUGGESTION TYPES
// =============================================================================

/**
 * An internal link suggestion
 */
export interface LinkSuggestion {
  id: string;
  
  // What to link
  anchorText: string;
  position: LinkTextPosition;
  
  // Where to link
  targetPage: SitePage;
  targetUrl: string;
  
  // Why to link
  relevance: LinkRelevance;
  relevanceScore: number;
  matchReason: MatchReason[];
  
  // Link type
  linkType: InternalLinkType;
  suggestedPosition: LinkPosition;
  
  // Context
  surroundingText: string;
  alternativeAnchors: string[];
  
  // Metrics
  seoImpact: SEOImpact;
  
  // Status
  status: SuggestionStatus;
}

export interface LinkTextPosition {
  start: number;
  end: number;
  paragraphIndex: number;
  sentenceIndex?: number;
}

export type MatchReason = 
  | 'keyword-match'        // Exact keyword match
  | 'semantic-similarity'  // Semantically related
  | 'topic-cluster'        // Same topic cluster
  | 'category-match'       // Same category
  | 'tag-match'            // Shared tags
  | 'entity-match'         // Mentions same entity
  | 'pillar-content'       // Links to pillar page
  | 'orphan-rescue';       // Helps orphan page

export interface SEOImpact {
  linkEquityFlow: number;      // 0-100 estimated link equity
  topicalRelevance: number;    // 0-100 topic relevance
  anchorOptimization: number;  // 0-100 anchor text quality
  structuralBenefit: number;   // 0-100 site structure benefit
  overallImpact: number;       // 0-100 combined score
}

export type SuggestionStatus = 
  | 'pending'
  | 'accepted'
  | 'applied'
  | 'rejected'
  | 'dismissed'
  | 'modified';

// =============================================================================
// ANALYSIS TYPES
// =============================================================================

/**
 * Full internal linking analysis result
 */
export interface InternalLinkingAnalysis {
  id: string;
  contentId: string;
  analyzedAt: string;
  
  // Current state
  existingLinks: ExistingLinkInfo[];
  existingLinkCount: number;
  
  // Suggestions
  suggestions: LinkSuggestion[];
  totalSuggestions: number;
  highRelevanceSuggestions: number;
  
  // Metrics
  metrics: LinkingMetrics;
  
  // Issues and recommendations
  issues: LinkingIssue[];
  recommendations: LinkingRecommendation[];
  
  // Site context
  siteStats: SiteStats;
}

export interface ExistingLinkInfo {
  url: string;
  anchorText: string;
  position: LinkTextPosition;
  targetPage?: SitePage;
  isValid: boolean;
  issues: string[];
}

export interface LinkingMetrics {
  // Link counts
  internalLinkCount: number;
  externalLinkCount: number;
  optimalLinkCount: number;
  
  // Ratios
  linksPerWord: number;
  linksPerParagraph: number;
  
  // Distribution
  linkDistribution: LinkDistribution;
  
  // Quality
  averageRelevance: number;
  anchorTextVariety: number;
  
  // Score
  overallScore: number;
}

export interface LinkDistribution {
  introduction: number;
  body: number;
  conclusion: number;
  headings: number;
  lists: number;
}

export interface LinkingIssue {
  id: string;
  type: LinkingIssueType;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
  affectedLinks?: string[];
}

export type LinkingIssueType = 
  | 'too-few-links'
  | 'too-many-links'
  | 'poor-distribution'
  | 'same-anchor-text'
  | 'orphan-content'
  | 'broken-link'
  | 'missing-pillar-link'
  | 'cluster-isolation'
  | 'over-optimization';

export interface LinkingRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: string;
}

export interface SiteStats {
  totalPages: number;
  averageLinksPerPage: number;
  orphanPageCount: number;
  topLinkedPages: Array<{ pageId: string; linkCount: number }>;
  clusterCount: number;
}

// =============================================================================
// ANCHOR TEXT TYPES
// =============================================================================

/**
 * Anchor text suggestion
 */
export interface AnchorTextSuggestion {
  text: string;
  score: number;
  type: AnchorTextType;
  keyword?: string;
}

export type AnchorTextType = 
  | 'exact-match'      // Exact keyword match
  | 'partial-match'    // Contains keyword
  | 'branded'          // Brand name
  | 'naked-url'        // URL as anchor
  | 'generic'          // "click here", "read more"
  | 'natural';         // Natural phrase

// =============================================================================
// SETTINGS TYPES
// =============================================================================

export interface InternalLinkingSettings {
  // Suggestion settings
  minRelevanceScore: number;
  maxSuggestionsPerPage: number;
  includeOrphanPages: boolean;
  prioritizePillarContent: boolean;
  preferPillarContent: boolean;
  sameCategoryOnly: boolean;
  autoApplyHighRelevance: boolean;
  
  // Link density settings
  targetLinksPerParagraph: number;
  targetLinksPerWord: number;
  minWordsBetweenLinks: number;
  
  // Anchor text settings
  avoidExactMatchAnchors: boolean;
  preferNaturalAnchors: boolean;
  anchorTextVarietyThreshold: number;
  
  // Filtering
  excludeUrls: string[];
  excludeCategories: string[];
  focusOnClusters: string[];
  
  // Display
  showLowRelevance: boolean;
  highlightExisting: boolean;
}

export const DEFAULT_INTERNAL_LINKING_SETTINGS: InternalLinkingSettings = {
  minRelevanceScore: 50,
  maxSuggestionsPerPage: 20,
  includeOrphanPages: true,
  prioritizePillarContent: true,
  preferPillarContent: true,
  sameCategoryOnly: false,
  autoApplyHighRelevance: false,
  
  targetLinksPerParagraph: 1,
  targetLinksPerWord: 0.01,
  minWordsBetweenLinks: 100,
  
  avoidExactMatchAnchors: true,
  preferNaturalAnchors: true,
  anchorTextVarietyThreshold: 0.7,
  
  excludeUrls: [],
  excludeCategories: [],
  focusOnClusters: [],
  
  showLowRelevance: false,
  highlightExisting: true
};

// =============================================================================
// UI STATE TYPES
// =============================================================================

export interface InternalLinkingState {
  // Analysis
  analysis: InternalLinkingAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  
  // Site data
  sitePages: SitePage[];
  linkGraph: SiteLinkGraph | null;
  isLoadingSite: boolean;
  
  // Suggestions
  filteredSuggestions: LinkSuggestion[];
  selectedSuggestion: LinkSuggestion | null;
  
  // Filters
  relevanceFilter: LinkRelevance | 'all';
  typeFilter: InternalLinkType | 'all';
  searchQuery: string;
  
  // Settings
  settings: InternalLinkingSettings;
  
  // Actions history
  acceptedSuggestions: Set<string>;
  rejectedSuggestions: Set<string>;
}

export type InternalLinkingTab = 
  | 'overview'
  | 'suggestions'
  | 'issues'
  | 'existing'
  | 'structure'
  | 'settings';

// =============================================================================
// CONSTANTS
// =============================================================================

export const LINK_TYPE_INFO: Record<InternalLinkType, {
  label: string;
  description: string;
  icon: string;
}> = {
  'contextual': {
    label: 'Contextual',
    description: 'Natural link within content',
    icon: 'Link'
  },
  'navigational': {
    label: 'Navigational',
    description: 'Navigation menu link',
    icon: 'Menu'
  },
  'related': {
    label: 'Related',
    description: 'Related content link',
    icon: 'Layers'
  },
  'pillar': {
    label: 'Pillar',
    description: 'Link to pillar content',
    icon: 'Building'
  },
  'cluster': {
    label: 'Cluster',
    description: 'Topic cluster link',
    icon: 'Network'
  },
  'footer': {
    label: 'Footer',
    description: 'Footer area link',
    icon: 'FooterIcon'
  },
  'sidebar': {
    label: 'Sidebar',
    description: 'Sidebar widget link',
    icon: 'PanelLeft'
  }
};

export const RELEVANCE_INFO: Record<LinkRelevance, {
  label: string;
  color: string;
  bgColor: string;
  minScore: number;
}> = {
  'high': {
    label: 'High',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    minScore: 75
  },
  'medium': {
    label: 'Medium',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    minScore: 50
  },
  'low': {
    label: 'Low',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    minScore: 0
  }
};

export const MATCH_REASON_INFO: Record<MatchReason, {
  label: string;
  description: string;
}> = {
  'keyword-match': {
    label: 'Keyword Match',
    description: 'Contains target keyword'
  },
  'semantic-similarity': {
    label: 'Semantic Match',
    description: 'Semantically related content'
  },
  'topic-cluster': {
    label: 'Topic Cluster',
    description: 'Part of same topic cluster'
  },
  'category-match': {
    label: 'Category Match',
    description: 'Same content category'
  },
  'tag-match': {
    label: 'Tag Match',
    description: 'Shares common tags'
  },
  'entity-match': {
    label: 'Entity Match',
    description: 'Mentions same entities'
  },
  'pillar-content': {
    label: 'Pillar Content',
    description: 'Links to pillar page'
  },
  'orphan-rescue': {
    label: 'Orphan Rescue',
    description: 'Helps isolated page'
  }
};

export const ISSUE_TYPE_INFO: Record<LinkingIssueType, {
  label: string;
  description: string;
}> = {
  'too-few-links': {
    label: 'Too Few Links',
    description: 'Content has fewer internal links than recommended'
  },
  'too-many-links': {
    label: 'Too Many Links',
    description: 'Content has excessive internal links'
  },
  'poor-distribution': {
    label: 'Poor Distribution',
    description: 'Links are not evenly distributed throughout content'
  },
  'same-anchor-text': {
    label: 'Duplicate Anchors',
    description: 'Multiple links use the same anchor text'
  },
  'orphan-content': {
    label: 'Orphan Content',
    description: 'Page has no internal links pointing to it'
  },
  'broken-link': {
    label: 'Broken Link',
    description: 'Internal link points to non-existent page'
  },
  'missing-pillar-link': {
    label: 'Missing Pillar Link',
    description: 'No link to related pillar content'
  },
  'cluster-isolation': {
    label: 'Cluster Isolation',
    description: 'Page not connected to its topic cluster'
  },
  'over-optimization': {
    label: 'Over-Optimization',
    description: 'Too many exact-match anchor texts'
  }
};

export const INTERNAL_LINKING_TABS: Array<{ id: InternalLinkingTab; label: string; icon: string }> = [
  { id: 'overview', label: 'Overview', icon: 'BarChart3' },
  { id: 'suggestions', label: 'Suggestions', icon: 'Lightbulb' },
  { id: 'issues', label: 'Issues', icon: 'AlertTriangle' },
  { id: 'existing', label: 'Existing', icon: 'Link' },
  { id: 'settings', label: 'Settings', icon: 'Settings' }
];

export const OPTIMAL_LINKS_PER_1000_WORDS = 3;
export const MAX_LINKS_PER_1000_WORDS = 10;
export const MIN_ANCHOR_TEXT_LENGTH = 2;
export const MAX_ANCHOR_TEXT_LENGTH = 60;
