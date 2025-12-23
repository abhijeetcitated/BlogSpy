// =============================================================================
// CITATION/SOURCE SUGGESTION TYPES - Production Level
// =============================================================================
// Smart citation and source suggestions like Frase, Clearscope, Content Harmony
// Helps build authority through proper citations and references
// =============================================================================

// =============================================================================
// SOURCE TYPES
// =============================================================================

/**
 * Types of sources for citations
 */
export type SourceType = 
  | 'academic'        // Scholarly articles, journals
  | 'government'      // .gov sites
  | 'news'            // News articles
  | 'industry'        // Industry publications
  | 'research'        // Research papers
  | 'statistics'      // Statistical data
  | 'expert'          // Expert quotes/opinions
  | 'official'        // Official documentation
  | 'book'            // Book references
  | 'case-study';     // Case studies

/**
 * Authority level of a source
 */
export type SourceAuthority = 'high' | 'medium' | 'low';

/**
 * Citation format styles
 */
export type CitationStyle = 
  | 'inline'          // In-text citation
  | 'footnote'        // Footnote reference
  | 'bibliography'    // Bibliography entry
  | 'hyperlink';      // Simple hyperlink

// =============================================================================
// SOURCE/CITATION TYPES
// =============================================================================

/**
 * A potential source for citation
 */
export interface CitationSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  
  // Source info
  type: SourceType;
  authority: SourceAuthority;
  authorityScore: number;  // 0-100
  
  // Content
  snippet: string;
  publishedDate?: string;
  author?: string;
  organization?: string;
  
  // Metadata
  domainAuthority?: number;
  trustFlow?: number;
  isHttps: boolean;
  isDoFollow: boolean;
  
  // Relevance
  relevanceScore: number;
  matchingKeywords: string[];
  matchingClaims: string[];
}

/**
 * A claim in the content that needs citation
 */
export interface CitableClaim {
  id: string;
  text: string;
  type: ClaimType;
  position: ClaimPosition;
  
  // Context
  surroundingText: string;
  paragraph: number;
  
  // Analysis
  needsCitation: boolean;
  citationPriority: CitationPriority;
  reason: string;
  
  // Suggestions
  suggestedSources: CitationSource[];
  status: ClaimStatus;
}

export interface ClaimPosition {
  start: number;
  end: number;
  paragraphIndex: number;
  sentenceIndex: number;
}

export type ClaimType = 
  | 'statistic'       // Numbers, percentages
  | 'fact'            // Factual statement
  | 'quote'           // Direct quote
  | 'research'        // Research findings
  | 'definition'      // Term definition
  | 'comparison'      // Comparative claim
  | 'prediction'      // Future prediction
  | 'historical'      // Historical fact
  | 'expert-opinion'; // Expert viewpoint

export type CitationPriority = 'critical' | 'high' | 'medium' | 'low';

export type ClaimStatus = 
  | 'uncited'
  | 'needs-source'
  | 'cited'
  | 'skipped';

// =============================================================================
// CITATION TYPES
// =============================================================================

/**
 * A citation to be added
 */
export interface Citation {
  id: string;
  claimId: string;
  sourceId: string;
  
  // Source details
  source: CitationSource;
  
  // Citation text
  anchorText: string;
  citationText: string;
  style: CitationStyle;
  
  // Position
  insertPosition: InsertPosition;
  
  // Status
  status: 'pending' | 'applied' | 'modified' | 'removed';
  appliedAt?: string;
}

export interface InsertPosition {
  type: 'inline' | 'end-of-sentence' | 'end-of-paragraph' | 'footnote';
  offset: number;
  afterText?: string;
}

// =============================================================================
// ANALYSIS TYPES
// =============================================================================

/**
 * Full citation analysis result
 */
export interface CitationAnalysis {
  id: string;
  contentId: string;
  analyzedAt: string;
  
  // Claims found
  claims: CitableClaim[];
  totalClaims: number;
  uncitedClaims: number;
  criticalClaims: number;
  
  // Existing citations
  existingCitations: ExistingCitation[];
  existingCitationCount: number;
  
  // Source suggestions
  suggestedSources: CitationSource[];
  topSources: CitationSource[];
  
  // Metrics
  metrics: CitationMetrics;
  
  // Issues
  issues: CitationIssue[];
  
  // Recommendations
  recommendations: CitationRecommendation[];
}

export interface ExistingCitation {
  id: string;
  url: string;
  anchorText: string;
  position: ClaimPosition;
  sourceInfo?: CitationSource;
  isValid: boolean;
  issues: string[];
}

export interface CitationMetrics {
  // Counts
  totalClaims: number;
  citedClaims: number;
  uncitedClaims: number;
  
  // Coverage
  citationCoverage: number;     // 0-100 percentage
  criticalCoverage: number;     // Critical claims covered
  
  // Quality
  averageSourceAuthority: number;
  sourceTypeDistribution: Record<SourceType, number>;
  
  // Score
  overallScore: number;
  trustScore: number;
  authorityScore: number;
}

export interface CitationIssue {
  id: string;
  type: CitationIssueType;
  severity: 'error' | 'warning' | 'info';
  message: string;
  claimId?: string;
  suggestion: string;
}

export type CitationIssueType = 
  | 'missing-citation'
  | 'weak-source'
  | 'outdated-source'
  | 'broken-link'
  | 'low-authority'
  | 'unverifiable-claim'
  | 'circular-citation'
  | 'self-citation'
  | 'too-many-same-source';

export interface CitationRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: string;
  affectedClaims?: string[];
}

// =============================================================================
// SETTINGS TYPES
// =============================================================================

export interface CitationSettings {
  // Detection settings
  detectStatistics: boolean;
  detectFacts: boolean;
  detectQuotes: boolean;
  detectResearch: boolean;
  
  // Source preferences
  preferredSourceTypes: SourceType[];
  minSourceAuthority: number;
  maxSourceAge: number;  // In years
  
  // Citation style
  defaultStyle: CitationStyle;
  autoInsertStyle: boolean;
  
  // Filtering
  excludeDomains: string[];
  preferDomains: string[];
  requireHttps: boolean;
  
  // Display
  showLowPriority: boolean;
  highlightUncited: boolean;
  groupByPriority: boolean;
}

export const DEFAULT_CITATION_SETTINGS: CitationSettings = {
  detectStatistics: true,
  detectFacts: true,
  detectQuotes: true,
  detectResearch: true,
  
  preferredSourceTypes: ['academic', 'government', 'research', 'statistics'],
  minSourceAuthority: 50,
  maxSourceAge: 5,
  
  defaultStyle: 'hyperlink',
  autoInsertStyle: true,
  
  excludeDomains: ['wikipedia.org'],
  preferDomains: [],
  requireHttps: true,
  
  showLowPriority: false,
  highlightUncited: true,
  groupByPriority: true
};

// =============================================================================
// UI STATE TYPES
// =============================================================================

export interface CitationState {
  // Analysis
  analysis: CitationAnalysis | null;
  isAnalyzing: boolean;
  isSearchingSources: boolean;
  error: string | null;
  
  // Selection
  selectedClaim: CitableClaim | null;
  selectedSource: CitationSource | null;
  
  // Filters
  priorityFilter: CitationPriority | 'all';
  typeFilter: ClaimType | 'all';
  statusFilter: ClaimStatus | 'all';
  searchQuery: string;
  
  // Settings
  settings: CitationSettings;
  
  // History
  appliedCitations: Map<string, Citation>;
  skippedClaims: Set<string>;
}

export type CitationTab = 
  | 'overview'
  | 'claims'
  | 'sources'
  | 'applied'
  | 'settings';

// =============================================================================
// CONSTANTS
// =============================================================================

export const SOURCE_TYPE_INFO: Record<SourceType, {
  label: string;
  description: string;
  icon: string;
  authorityBonus: number;
}> = {
  'academic': {
    label: 'Academic',
    description: 'Scholarly journals and papers',
    icon: 'GraduationCap',
    authorityBonus: 20
  },
  'government': {
    label: 'Government',
    description: 'Official government sources',
    icon: 'Landmark',
    authorityBonus: 25
  },
  'news': {
    label: 'News',
    description: 'News publications',
    icon: 'Newspaper',
    authorityBonus: 10
  },
  'industry': {
    label: 'Industry',
    description: 'Industry publications',
    icon: 'Building',
    authorityBonus: 15
  },
  'research': {
    label: 'Research',
    description: 'Research organizations',
    icon: 'FlaskConical',
    authorityBonus: 20
  },
  'statistics': {
    label: 'Statistics',
    description: 'Statistical data sources',
    icon: 'BarChart',
    authorityBonus: 15
  },
  'expert': {
    label: 'Expert',
    description: 'Expert opinions',
    icon: 'User',
    authorityBonus: 10
  },
  'official': {
    label: 'Official',
    description: 'Official documentation',
    icon: 'FileText',
    authorityBonus: 15
  },
  'book': {
    label: 'Book',
    description: 'Book references',
    icon: 'BookOpen',
    authorityBonus: 15
  },
  'case-study': {
    label: 'Case Study',
    description: 'Case studies',
    icon: 'FolderSearch',
    authorityBonus: 10
  }
};

export const CLAIM_TYPE_INFO: Record<ClaimType, {
  label: string;
  description: string;
  icon: string;
  defaultPriority: CitationPriority;
}> = {
  'statistic': {
    label: 'Statistic',
    description: 'Numbers and percentages',
    icon: 'Percent',
    defaultPriority: 'critical'
  },
  'fact': {
    label: 'Fact',
    description: 'Factual statements',
    icon: 'CheckCircle',
    defaultPriority: 'high'
  },
  'quote': {
    label: 'Quote',
    description: 'Direct quotations',
    icon: 'Quote',
    defaultPriority: 'critical'
  },
  'research': {
    label: 'Research',
    description: 'Research findings',
    icon: 'Search',
    defaultPriority: 'high'
  },
  'definition': {
    label: 'Definition',
    description: 'Term definitions',
    icon: 'BookText',
    defaultPriority: 'medium'
  },
  'comparison': {
    label: 'Comparison',
    description: 'Comparative claims',
    icon: 'Scale',
    defaultPriority: 'medium'
  },
  'prediction': {
    label: 'Prediction',
    description: 'Future predictions',
    icon: 'TrendingUp',
    defaultPriority: 'low'
  },
  'historical': {
    label: 'Historical',
    description: 'Historical facts',
    icon: 'History',
    defaultPriority: 'high'
  },
  'expert-opinion': {
    label: 'Expert Opinion',
    description: 'Expert viewpoints',
    icon: 'MessageSquare',
    defaultPriority: 'medium'
  }
};

export const CITATION_PRIORITY_INFO: Record<CitationPriority, {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  'critical': {
    label: 'Critical',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Must have citation - statistics, quotes'
  },
  'high': {
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Strongly recommended - facts, research'
  },
  'medium': {
    label: 'Medium',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Recommended - definitions, comparisons'
  },
  'low': {
    label: 'Low',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    description: 'Optional - common knowledge'
  }
};

export const AUTHORITY_INFO: Record<SourceAuthority, {
  label: string;
  color: string;
  minScore: number;
}> = {
  'high': {
    label: 'High Authority',
    color: 'text-green-600',
    minScore: 75
  },
  'medium': {
    label: 'Medium Authority',
    color: 'text-yellow-600',
    minScore: 50
  },
  'low': {
    label: 'Low Authority',
    color: 'text-gray-600',
    minScore: 0
  }
};

export const CITATION_TABS: Array<{ id: CitationTab; label: string; icon: string }> = [
  { id: 'overview', label: 'Overview', icon: 'BarChart3' },
  { id: 'claims', label: 'Claims', icon: 'FileSearch' },
  { id: 'sources', label: 'Sources', icon: 'Globe' },
  { id: 'applied', label: 'Applied', icon: 'CheckCircle' },
  { id: 'settings', label: 'Settings', icon: 'Settings' }
];

export const CITATION_ISSUE_TYPE_INFO: Record<CitationIssueType, {
  label: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
}> = {
  'missing-citation': {
    label: 'Missing Citation',
    description: 'Claim requires citation but has none',
    severity: 'error'
  },
  'weak-source': {
    label: 'Weak Source',
    description: 'Source has low authority',
    severity: 'warning'
  },
  'outdated-source': {
    label: 'Outdated Source',
    description: 'Source is too old',
    severity: 'warning'
  },
  'broken-link': {
    label: 'Broken Link',
    description: 'Citation link is broken',
    severity: 'error'
  },
  'low-authority': {
    label: 'Low Authority',
    description: 'Source domain has low authority',
    severity: 'warning'
  },
  'unverifiable-claim': {
    label: 'Unverifiable',
    description: 'Cannot find supporting sources',
    severity: 'info'
  },
  'circular-citation': {
    label: 'Circular Citation',
    description: 'Source cites back to this content',
    severity: 'warning'
  },
  'self-citation': {
    label: 'Self Citation',
    description: 'Citing own website too much',
    severity: 'info'
  },
  'too-many-same-source': {
    label: 'Overused Source',
    description: 'Same source cited too many times',
    severity: 'info'
  }
};

// Patterns for detecting citable claims
export const CLAIM_PATTERNS = {
  statistic: /(\d+(?:\.\d+)?%|\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(of|percent|million|billion|thousand)/gi,
  research: /(research|study|studies|survey|report|analysis)\s*(shows?|found|indicates?|suggests?|reveals?|demonstrates?)/gi,
  quote: /"([^"]+)"/g,
  according: /according to|as reported by|as stated by/gi,
  fact: /(is|are|was|were)\s+(the\s+)?(most|least|largest|smallest|first|only|best|worst)/gi,
  comparison: /(more than|less than|higher than|lower than|compared to|versus|vs\.?)/gi
};
