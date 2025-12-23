/**
 * Featured Snippet Optimizer Types
 * 
 * Comprehensive type definitions for featured snippet optimization
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type SnippetType = 
  | 'paragraph'
  | 'list'
  | 'table'
  | 'video'
  | 'definition'
  | 'comparison'
  | 'how_to'
  | 'calculation';

export type SnippetQuality = 'excellent' | 'good' | 'moderate' | 'poor' | 'unoptimized';
export type OptimizationImpact = 'high' | 'medium' | 'low';
export type ContentElement = 'heading' | 'paragraph' | 'list' | 'table' | 'image' | 'code';

export const SNIPPET_TYPE_LABELS: Record<SnippetType, string> = {
  paragraph: 'Paragraph Snippet',
  list: 'List Snippet',
  table: 'Table Snippet',
  video: 'Video Snippet',
  definition: 'Definition Snippet',
  comparison: 'Comparison Snippet',
  how_to: 'How-To Snippet',
  calculation: 'Calculator Snippet'
};

export const SNIPPET_TYPE_DESCRIPTIONS: Record<SnippetType, string> = {
  paragraph: 'A brief text answer (40-60 words) directly answering a query',
  list: 'Ordered or unordered list format (5-8 items typically)',
  table: 'Structured data in rows and columns for comparisons',
  video: 'Video content with timestamp markers',
  definition: '"What is" or "Definition of" style answers',
  comparison: 'Side-by-side comparisons of topics',
  how_to: 'Step-by-step instructions',
  calculation: 'Mathematical or formula-based answers'
};

// =============================================================================
// QUERY ANALYSIS
// =============================================================================

export interface QueryIntent {
  type: 'informational' | 'navigational' | 'transactional' | 'commercial';
  snippetPotential: number;
  bestSnippetTypes: SnippetType[];
  triggerWords: string[];
}

export interface TargetQuery {
  query: string;
  intent: QueryIntent;
  currentRanking?: number;
  hasSnippet: boolean;
  competitorSnippet?: string;
  suggestedFormat: SnippetType;
}

// =============================================================================
// CONTENT ANALYSIS
// =============================================================================

export interface ContentSection {
  id: string;
  type: ContentElement;
  content: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
  snippetScore: number;
  snippetType: SnippetType | null;
  issues: SnippetIssue[];
  optimizations: SnippetOptimization[];
}

export interface SnippetCandidate {
  id: string;
  content: string;
  type: SnippetType;
  score: number;
  quality: SnippetQuality;
  wordCount: number;
  targetQuery?: string;
  strengths: string[];
  weaknesses: string[];
  optimizedVersion?: string;
}

export interface SnippetIssue {
  id: string;
  type: 'length' | 'format' | 'clarity' | 'structure' | 'keyword' | 'completeness';
  severity: 'error' | 'warning' | 'info';
  message: string;
  location?: { start: number; end: number };
  suggestion: string;
}

export interface SnippetOptimization {
  id: string;
  type: 'rewrite' | 'restructure' | 'add_element' | 'remove_element' | 'format_change';
  priority: OptimizationImpact;
  title: string;
  description: string;
  currentContent?: string;
  suggestedContent?: string;
  expectedImpact: string;
}

// =============================================================================
// SCORING & METRICS
// =============================================================================

export interface SnippetMetrics {
  overallScore: number;
  quality: SnippetQuality;
  
  formatScore: number;
  clarityScore: number;
  relevanceScore: number;
  structureScore: number;
  completenessScore: number;
  
  candidateCount: number;
  highQualityCount: number;
  issueCount: number;
  optimizationCount: number;
}

export interface FormatAnalysis {
  currentFormat: SnippetType | null;
  recommendedFormat: SnippetType;
  formatFitScore: number;
  alternatives: {
    format: SnippetType;
    score: number;
    reason: string;
  }[];
}

// =============================================================================
// OPTIMIZATION TEMPLATES
// =============================================================================

export interface SnippetTemplate {
  type: SnippetType;
  structure: string;
  example: string;
  bestPractices: string[];
  avoidPatterns: string[];
  optimalLength: { min: number; max: number };
}

export const SNIPPET_TEMPLATES: Record<SnippetType, SnippetTemplate> = {
  paragraph: {
    type: 'paragraph',
    structure: '[Definition/Answer] + [Supporting detail] + [Conclusion]',
    example: 'A featured snippet is a special search result that appears at the top of Google\'s organic results. It provides a direct answer to a user\'s query, typically extracted from a webpage. Featured snippets can significantly increase click-through rates.',
    bestPractices: [
      'Keep between 40-60 words',
      'Start with a direct answer',
      'Include target keyword naturally',
      'Use simple, clear language',
      'End with actionable insight'
    ],
    avoidPatterns: [
      'Starting with "I" or first person',
      'Vague or incomplete answers',
      'Excessive jargon',
      'Long run-on sentences'
    ],
    optimalLength: { min: 40, max: 60 }
  },
  list: {
    type: 'list',
    structure: '[Intro heading] + [5-8 list items] + [Brief conclusion]',
    example: '## Top Benefits of SEO\n1. Increased organic traffic\n2. Better user experience\n3. Higher conversion rates\n4. Long-term results\n5. Cost-effective marketing',
    bestPractices: [
      'Use 5-8 items for optimal display',
      'Start items with action verbs',
      'Keep items parallel in structure',
      'Include numbers when relevant',
      'Order by importance or steps'
    ],
    avoidPatterns: [
      'Too many items (10+)',
      'Inconsistent formatting',
      'Items that are too long',
      'Missing introductory context'
    ],
    optimalLength: { min: 5, max: 8 }
  },
  table: {
    type: 'table',
    structure: '[Clear header row] + [3-5 data rows] + [Consistent columns]',
    example: '| Feature | Free Plan | Pro Plan |\n|---------|-----------|----------|\n| Storage | 5GB | 100GB |\n| Users | 1 | Unlimited |',
    bestPractices: [
      'Use clear, descriptive headers',
      'Limit to 3-4 columns',
      'Keep data cells concise',
      'Include comparison data',
      'Maintain consistent formatting'
    ],
    avoidPatterns: [
      'Too many columns',
      'Empty cells',
      'Inconsistent data types',
      'Missing headers'
    ],
    optimalLength: { min: 3, max: 5 }
  },
  video: {
    type: 'video',
    structure: '[Video title] + [Description] + [Timestamps]',
    example: 'How to Optimize for Featured Snippets [15:32]\n0:00 Introduction\n2:15 Types of snippets\n5:30 Optimization tips',
    bestPractices: [
      'Include chapter markers',
      'Add descriptive timestamps',
      'Optimize video title',
      'Include transcript',
      'Use schema markup'
    ],
    avoidPatterns: [
      'Missing timestamps',
      'Poor video quality',
      'No transcript',
      'Clickbait titles'
    ],
    optimalLength: { min: 3, max: 10 }
  },
  definition: {
    type: 'definition',
    structure: '[Term] is [category] that [definition] + [key characteristics]',
    example: 'Featured snippets are search results displayed at the top of Google\'s organic results that provide direct answers to user queries.',
    bestPractices: [
      'Start with the term being defined',
      'Use "is" or "are" structure',
      'Include category classification',
      'Add distinguishing features',
      'Keep under 50 words'
    ],
    avoidPatterns: [
      'Circular definitions',
      'Using the term in definition',
      'Overly technical language',
      'Incomplete explanations'
    ],
    optimalLength: { min: 30, max: 50 }
  },
  comparison: {
    type: 'comparison',
    structure: '[Topic A] vs [Topic B] + [Key differences] + [Recommendation]',
    example: '## SEO vs SEM\n**SEO** focuses on organic rankings, while **SEM** includes paid advertising. SEO provides long-term results; SEM offers immediate visibility.',
    bestPractices: [
      'Clearly state both options',
      'Highlight key differences',
      'Use parallel structure',
      'Include when to use each',
      'Remain objective'
    ],
    avoidPatterns: [
      'Biased comparisons',
      'Missing key differences',
      'Confusing organization',
      'Incomplete analysis'
    ],
    optimalLength: { min: 50, max: 100 }
  },
  how_to: {
    type: 'how_to',
    structure: '[Brief intro] + [Numbered steps] + [Tips/warnings]',
    example: '## How to Optimize Content\n1. Research target keywords\n2. Analyze competitor snippets\n3. Structure content clearly\n4. Test and iterate',
    bestPractices: [
      'Number all steps',
      'Start steps with verbs',
      'Keep steps actionable',
      'Include time estimates',
      'Add helpful tips'
    ],
    avoidPatterns: [
      'Vague instructions',
      'Missing steps',
      'Overly complex steps',
      'No logical order'
    ],
    optimalLength: { min: 4, max: 8 }
  },
  calculation: {
    type: 'calculation',
    structure: '[Formula] + [Variables explained] + [Example calculation]',
    example: 'CTR = (Clicks / Impressions) × 100\n\nExample: 500 clicks / 10,000 impressions = 5% CTR',
    bestPractices: [
      'Show formula clearly',
      'Define all variables',
      'Include worked example',
      'Use standard notation',
      'Add practical context'
    ],
    avoidPatterns: [
      'Complex unexplained formulas',
      'Missing units',
      'No examples',
      'Inconsistent notation'
    ],
    optimalLength: { min: 20, max: 60 }
  }
};

// =============================================================================
// TRIGGER WORDS & PATTERNS
// =============================================================================

export const SNIPPET_TRIGGER_PATTERNS: Record<SnippetType, RegExp[]> = {
  paragraph: [
    /^what is/i,
    /^who is/i,
    /^why is/i,
    /definition of/i,
    /meaning of/i
  ],
  list: [
    /^how to/i,
    /^ways to/i,
    /tips for/i,
    /best\s+\w+\s+for/i,
    /top\s+\d+/i,
    /types of/i
  ],
  table: [
    /vs\.?$/i,
    /versus/i,
    /compared to/i,
    /comparison/i,
    /difference between/i
  ],
  video: [
    /^how to/i,
    /tutorial/i,
    /guide/i,
    /watch/i
  ],
  definition: [
    /^what is/i,
    /^what are/i,
    /define\s/i,
    /definition/i,
    /meaning/i
  ],
  comparison: [
    /vs\.?\s/i,
    /versus/i,
    /or\s+\w+\?$/i,
    /difference/i,
    /better/i
  ],
  how_to: [
    /^how to/i,
    /^how do/i,
    /^how can/i,
    /steps to/i,
    /guide to/i
  ],
  calculation: [
    /calculate/i,
    /formula/i,
    /equation/i,
    /how much/i,
    /converter/i
  ]
};

// =============================================================================
// RESULT TYPES
// =============================================================================

export interface SnippetOptimizerResult {
  id: string;
  timestamp: Date;
  
  content: string;
  targetQueries: TargetQuery[];
  
  metrics: SnippetMetrics;
  formatAnalysis: FormatAnalysis;
  
  candidates: SnippetCandidate[];
  sections: ContentSection[];
  
  issues: SnippetIssue[];
  optimizations: SnippetOptimization[];
  
  recommendations: SnippetRecommendation[];
  optimizedContent?: string;
}

export interface SnippetRecommendation {
  id: string;
  priority: OptimizationImpact;
  category: 'format' | 'content' | 'structure' | 'keywords' | 'technical';
  title: string;
  description: string;
  action: string;
  impact: string;
}

// =============================================================================
// SETTINGS & CONFIG
// =============================================================================

export interface SnippetOptimizerSettings {
  targetSnippetType: SnippetType | 'auto';
  targetQuery?: string;
  analyzeCompetitors: boolean;
  generateOptimizedVersion: boolean;
  maxSuggestions: number;
  focusOnParagraph: boolean;
  focusOnList: boolean;
  focusOnTable: boolean;
}

export const DEFAULT_SNIPPET_SETTINGS: SnippetOptimizerSettings = {
  targetSnippetType: 'auto',
  analyzeCompetitors: true,
  generateOptimizedVersion: true,
  maxSuggestions: 10,
  focusOnParagraph: true,
  focusOnList: true,
  focusOnTable: true
};

// =============================================================================
// UI STATE
// =============================================================================

export interface SnippetOptimizerPanelState {
  activeTab: string;
  selectedCandidateId: string | null;
  selectedSnippetType: SnippetType | 'all';
  filterPriority: OptimizationImpact | 'all';
  showOptimizedPreview: boolean;
}

// =============================================================================
// EXPORT OPTIONS
// =============================================================================

export interface SnippetExportOptions {
  format: 'markdown' | 'html' | 'json';
  includeAnalysis: boolean;
  includeOptimized: boolean;
  includeCandidates: boolean;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

export interface UseSnippetOptimizerOptions {
  settings?: Partial<SnippetOptimizerSettings>;
  onComplete?: (result: SnippetOptimizerResult) => void;
  onError?: (error: Error) => void;
}

export interface UseSnippetOptimizerReturn {
  result: SnippetOptimizerResult | null;
  isAnalyzing: boolean;
  error: Error | null;
  
  metrics: SnippetMetrics | null;
  candidates: SnippetCandidate[];
  issues: SnippetIssue[];
  optimizations: SnippetOptimization[];
  recommendations: SnippetRecommendation[];
  
  analyze: (content: string, targetQuery?: string) => Promise<void>;
  reanalyze: () => Promise<void>;
  
  getCandidatesByType: (type: SnippetType) => SnippetCandidate[];
  getCandidatesByQuality: (quality: SnippetQuality) => SnippetCandidate[];
  
  optimizeCandidate: (candidateId: string) => string | null;
  getOptimizedContent: () => string;
  
  filterIssues: (severity?: 'error' | 'warning' | 'info') => SnippetIssue[];
  filterOptimizations: (priority?: OptimizationImpact) => SnippetOptimization[];
  
  applyOptimization: (optimizationId: string) => void;
  dismissOptimization: (optimizationId: string) => void;
  
  exportReport: (options: SnippetExportOptions) => string;
  
  settings: SnippetOptimizerSettings;
  updateSettings: (settings: Partial<SnippetOptimizerSettings>) => void;
}

// =============================================================================
// QUALITY THRESHOLDS
// =============================================================================

export const QUALITY_THRESHOLDS = {
  excellent: 85,
  good: 70,
  moderate: 50,
  poor: 30,
  unoptimized: 0
};

export const OPTIMAL_WORD_COUNTS: Record<SnippetType, { min: number; max: number }> = {
  paragraph: { min: 40, max: 60 },
  list: { min: 50, max: 150 },
  table: { min: 30, max: 100 },
  video: { min: 20, max: 50 },
  definition: { min: 30, max: 50 },
  comparison: { min: 50, max: 100 },
  how_to: { min: 60, max: 200 },
  calculation: { min: 20, max: 60 }
};
