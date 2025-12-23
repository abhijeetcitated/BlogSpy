// =============================================================================
// AUTO-OPTIMIZE TYPES - Production Level
// =============================================================================
// One-click content optimization like Surfer SEO, Clearscope, MarketMuse
// Automated improvements for SEO, readability, and engagement
// =============================================================================

// =============================================================================
// OPTIMIZATION CATEGORY TYPES
// =============================================================================

/**
 * Categories of optimization
 */
export type OptimizationCategory = 
  | 'readability'
  | 'seo'
  | 'engagement'
  | 'structure'
  | 'grammar'
  | 'style'
  | 'accessibility';

/**
 * Optimization priority levels
 */
export type OptimizationPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Status of an optimization
 */
export type OptimizationStatus = 
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'skipped'
  | 'failed';

// =============================================================================
// OPTIMIZATION ACTION TYPES
// =============================================================================

/**
 * Types of optimization actions
 */
export type OptimizationActionType = 
  // Readability
  | 'shorten-sentence'
  | 'simplify-word'
  | 'break-paragraph'
  | 'remove-passive'
  | 'remove-filler'
  | 'remove-adverb'
  // SEO
  | 'add-keyword'
  | 'add-heading'
  | 'add-meta-description'
  | 'add-alt-text'
  | 'improve-title'
  | 'add-internal-link'
  | 'add-external-link'
  | 'optimize-url'
  // Structure
  | 'add-subheading'
  | 'add-list'
  | 'add-table'
  | 'add-toc'
  | 'reorder-content'
  // Engagement
  | 'add-question'
  | 'add-cta'
  | 'add-hook'
  | 'improve-intro'
  | 'improve-conclusion'
  // Style
  | 'fix-grammar'
  | 'fix-spelling'
  | 'fix-punctuation'
  | 'improve-clarity'
  | 'enhance-tone';

/**
 * Single optimization action
 */
export interface OptimizationAction {
  id: string;
  type: OptimizationActionType;
  category: OptimizationCategory;
  priority: OptimizationPriority;
  status: OptimizationStatus;
  
  // Display info
  title: string;
  description: string;
  impact: string;
  
  // Change details
  location: TextRange;
  originalText: string;
  suggestedText: string;
  
  // Context
  reason: string;
  metrics: OptimizationMetrics;
  
  // Automation
  canAutoApply: boolean;
  requiresReview: boolean;
  aiGenerated: boolean;
  
  // Timestamps
  createdAt: string;
  appliedAt?: string;
}

export interface TextRange {
  start: number;
  end: number;
  lineStart?: number;
  lineEnd?: number;
  paragraphIndex?: number;
  sentenceIndex?: number;
}

export interface OptimizationMetrics {
  scoreBefore: number;
  scoreAfter: number;
  improvement: number;
  confidenceLevel: number;
}

// =============================================================================
// OPTIMIZATION RULE TYPES
// =============================================================================

/**
 * Rule that triggers an optimization
 */
export interface OptimizationRule {
  id: string;
  name: string;
  category: OptimizationCategory;
  description: string;
  enabled: boolean;
  priority: OptimizationPriority;
  
  // Conditions
  conditions: RuleCondition[];
  
  // Action template
  actionType: OptimizationActionType;
  actionTemplate: string;
  
  // Settings
  autoApply: boolean;
  threshold?: number;
}

export interface RuleCondition {
  type: ConditionType;
  operator: ConditionOperator;
  value: number | string | boolean;
  field?: string;
}

export type ConditionType = 
  | 'sentence-length'
  | 'word-syllables'
  | 'paragraph-length'
  | 'keyword-density'
  | 'heading-count'
  | 'readability-score'
  | 'word-type'
  | 'contains-pattern';

export type ConditionOperator = 
  | 'greater-than'
  | 'less-than'
  | 'equals'
  | 'contains'
  | 'matches';

// =============================================================================
// OPTIMIZATION RESULT TYPES
// =============================================================================

/**
 * Result of running optimization analysis
 */
export interface OptimizationAnalysis {
  id: string;
  contentId: string;
  analyzedAt: string;
  
  // Scores
  scoreBefore: OptimizationScores;
  scoreAfter: OptimizationScores;
  
  // Actions
  totalActions: number;
  actionsByCategory: Record<OptimizationCategory, number>;
  actionsByPriority: Record<OptimizationPriority, number>;
  actions: OptimizationAction[];
  
  // Summary
  summary: OptimizationSummary;
  
  // Settings used
  settings: OptimizationSettings;
}

export interface OptimizationScores {
  overall: number;
  readability: number;
  seo: number;
  engagement: number;
  structure: number;
  grammar: number;
}

export interface OptimizationSummary {
  totalImprovements: number;
  readabilityGain: number;
  seoGain: number;
  estimatedTimeToApply: number; // minutes
  topRecommendations: string[];
  warnings: string[];
}

// =============================================================================
// OPTIMIZATION SETTINGS TYPES
// =============================================================================

export interface OptimizationSettings {
  // Target metrics
  targetReadabilityScore: number;
  targetSeoScore: number;
  targetGradeLevel: number;
  targetAudience: OptimizeTargetAudience;
  
  // Category toggles
  enableReadability: boolean;
  enableSeo: boolean;
  enableEngagement: boolean;
  enableStructure: boolean;
  enableGrammar: boolean;
  enableStyle: boolean;
  
  // Aggressiveness
  optimizationLevel: OptimizationLevel;
  
  // Auto-apply settings
  autoApplyMinConfidence: number;
  autoApplyCategories: OptimizationCategory[];
  requireReviewForAI: boolean;
  
  // Preservation settings
  preserveQuotes: boolean;
  preserveCodeBlocks: boolean;
  preserveTechnicalTerms: boolean;
  customPreservePatterns: string[];
  
  // Keyword settings
  primaryKeyword?: string;
  secondaryKeywords: string[];
  targetKeywordDensity: number;
}

export type OptimizeTargetAudience = 
  | 'general'
  | 'professional'
  | 'academic'
  | 'technical'
  | 'casual';

export type OptimizationLevel = 
  | 'conservative'  // Only critical issues
  | 'moderate'      // Critical + high priority
  | 'aggressive'    // All improvements
  | 'custom';

// =============================================================================
// BATCH OPTIMIZATION TYPES
// =============================================================================

/**
 * Batch optimization for applying multiple changes
 */
export interface BatchOptimization {
  id: string;
  actions: OptimizationAction[];
  status: BatchStatus;
  progress: number;
  
  // Results
  appliedCount: number;
  skippedCount: number;
  failedCount: number;
  
  // Timing
  startedAt: string;
  completedAt?: string;
  estimatedDuration: number;
}

export type BatchStatus = 
  | 'queued'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed';

// =============================================================================
// OPTIMIZATION HISTORY TYPES
// =============================================================================

/**
 * History entry for tracking changes
 */
export interface OptimizationHistoryEntry {
  id: string;
  actionId: string;
  timestamp: string;
  
  // Change details
  type: OptimizationActionType;
  category: OptimizationCategory;
  originalText: string;
  newText: string;
  location: TextRange;
  
  // Result
  status: 'applied' | 'reverted' | 'modified';
  
  // Undo support
  canUndo: boolean;
  undoneAt?: string;
}

// =============================================================================
// UI STATE TYPES
// =============================================================================

export interface AutoOptimizeState {
  // Analysis
  analysis: OptimizationAnalysis | null;
  isAnalyzing: boolean;
  analysisProgress: number;
  
  // Actions
  selectedActions: Set<string>;
  appliedActions: Set<string>;
  skippedActions: Set<string>;
  
  // Batch processing
  batch: BatchOptimization | null;
  isBatchRunning: boolean;
  
  // UI state
  activeCategory: OptimizationCategory | 'all';
  activePriority: OptimizationPriority | 'all';
  showApplied: boolean;
  showSkipped: boolean;
  previewAction: OptimizationAction | null;
  
  // Settings
  settings: OptimizationSettings;
  
  // History
  history: OptimizationHistoryEntry[];
  canUndo: boolean;
}

export type AutoOptimizeTab = 
  | 'overview'
  | 'actions'
  | 'settings'
  | 'history';

// =============================================================================
// CONSTANTS
// =============================================================================

export const DEFAULT_OPTIMIZATION_SETTINGS: OptimizationSettings = {
  targetReadabilityScore: 70,
  targetSeoScore: 80,
  targetGradeLevel: 8,
  targetAudience: 'general',
  
  enableReadability: true,
  enableSeo: true,
  enableEngagement: true,
  enableStructure: true,
  enableGrammar: true,
  enableStyle: true,
  
  optimizationLevel: 'moderate',
  
  autoApplyMinConfidence: 0.9,
  autoApplyCategories: ['grammar'],
  requireReviewForAI: true,
  
  preserveQuotes: true,
  preserveCodeBlocks: true,
  preserveTechnicalTerms: true,
  customPreservePatterns: [],
  
  secondaryKeywords: [],
  targetKeywordDensity: 1.5
};

export const CATEGORY_INFO: Record<OptimizationCategory, {
  label: string;
  description: string;
  icon: string;
  color: string;
}> = {
  'readability': {
    label: 'Readability',
    description: 'Improve reading ease and comprehension',
    icon: 'BookOpen',
    color: 'text-blue-500'
  },
  'seo': {
    label: 'SEO',
    description: 'Optimize for search engines',
    icon: 'Search',
    color: 'text-green-500'
  },
  'engagement': {
    label: 'Engagement',
    description: 'Increase reader interest and interaction',
    icon: 'Heart',
    color: 'text-pink-500'
  },
  'structure': {
    label: 'Structure',
    description: 'Improve content organization',
    icon: 'LayoutList',
    color: 'text-purple-500'
  },
  'grammar': {
    label: 'Grammar',
    description: 'Fix grammatical errors',
    icon: 'Spellcheck',
    color: 'text-amber-500'
  },
  'style': {
    label: 'Style',
    description: 'Enhance writing style',
    icon: 'Palette',
    color: 'text-cyan-500'
  },
  'accessibility': {
    label: 'Accessibility',
    description: 'Improve content accessibility',
    icon: 'Accessibility',
    color: 'text-indigo-500'
  }
};

export const PRIORITY_INFO: Record<OptimizationPriority, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
}> = {
  'critical': {
    label: 'Critical',
    description: 'Must fix for quality content',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  'high': {
    label: 'High',
    description: 'Strongly recommended',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  'medium': {
    label: 'Medium',
    description: 'Good to have',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  'low': {
    label: 'Low',
    description: 'Minor improvement',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  }
};

export const ACTION_TYPE_INFO: Record<OptimizationActionType, {
  label: string;
  description: string;
  category: OptimizationCategory;
}> = {
  // Readability
  'shorten-sentence': {
    label: 'Shorten Sentence',
    description: 'Break long sentences into shorter ones',
    category: 'readability'
  },
  'simplify-word': {
    label: 'Simplify Word',
    description: 'Replace complex words with simpler alternatives',
    category: 'readability'
  },
  'break-paragraph': {
    label: 'Break Paragraph',
    description: 'Split long paragraphs for better readability',
    category: 'readability'
  },
  'remove-passive': {
    label: 'Remove Passive Voice',
    description: 'Convert passive voice to active voice',
    category: 'readability'
  },
  'remove-filler': {
    label: 'Remove Filler',
    description: 'Remove unnecessary filler words',
    category: 'readability'
  },
  'remove-adverb': {
    label: 'Remove Adverb',
    description: 'Replace adverbs with stronger verbs',
    category: 'readability'
  },
  // SEO
  'add-keyword': {
    label: 'Add Keyword',
    description: 'Insert target keyword in strategic location',
    category: 'seo'
  },
  'add-heading': {
    label: 'Add Heading',
    description: 'Add SEO-optimized heading',
    category: 'seo'
  },
  'add-meta-description': {
    label: 'Add Meta Description',
    description: 'Generate optimized meta description',
    category: 'seo'
  },
  'add-alt-text': {
    label: 'Add Alt Text',
    description: 'Add descriptive alt text to images',
    category: 'seo'
  },
  'improve-title': {
    label: 'Improve Title',
    description: 'Optimize title for SEO and clicks',
    category: 'seo'
  },
  'add-internal-link': {
    label: 'Add Internal Link',
    description: 'Add relevant internal link',
    category: 'seo'
  },
  'add-external-link': {
    label: 'Add External Link',
    description: 'Add authoritative external link',
    category: 'seo'
  },
  'optimize-url': {
    label: 'Optimize URL',
    description: 'Improve URL structure',
    category: 'seo'
  },
  // Structure
  'add-subheading': {
    label: 'Add Subheading',
    description: 'Add subheading to organize content',
    category: 'structure'
  },
  'add-list': {
    label: 'Convert to List',
    description: 'Convert text to bullet or numbered list',
    category: 'structure'
  },
  'add-table': {
    label: 'Add Table',
    description: 'Present data in table format',
    category: 'structure'
  },
  'add-toc': {
    label: 'Add Table of Contents',
    description: 'Add navigation table of contents',
    category: 'structure'
  },
  'reorder-content': {
    label: 'Reorder Content',
    description: 'Improve content flow and order',
    category: 'structure'
  },
  // Engagement
  'add-question': {
    label: 'Add Question',
    description: 'Add engaging question to content',
    category: 'engagement'
  },
  'add-cta': {
    label: 'Add Call-to-Action',
    description: 'Add compelling call-to-action',
    category: 'engagement'
  },
  'add-hook': {
    label: 'Add Hook',
    description: 'Add attention-grabbing hook',
    category: 'engagement'
  },
  'improve-intro': {
    label: 'Improve Introduction',
    description: 'Make introduction more engaging',
    category: 'engagement'
  },
  'improve-conclusion': {
    label: 'Improve Conclusion',
    description: 'Strengthen conclusion',
    category: 'engagement'
  },
  // Style
  'fix-grammar': {
    label: 'Fix Grammar',
    description: 'Correct grammatical error',
    category: 'grammar'
  },
  'fix-spelling': {
    label: 'Fix Spelling',
    description: 'Correct spelling mistake',
    category: 'grammar'
  },
  'fix-punctuation': {
    label: 'Fix Punctuation',
    description: 'Correct punctuation error',
    category: 'grammar'
  },
  'improve-clarity': {
    label: 'Improve Clarity',
    description: 'Make text clearer',
    category: 'style'
  },
  'enhance-tone': {
    label: 'Enhance Tone',
    description: 'Adjust writing tone',
    category: 'style'
  }
};

export const OPTIMIZATION_TABS: Array<{ id: AutoOptimizeTab; label: string; icon: string }> = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'actions', label: 'Actions', icon: 'ListChecks' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
  { id: 'history', label: 'History', icon: 'History' }
];

export const OPTIMIZATION_LEVELS: Array<{
  value: OptimizationLevel;
  label: string;
  description: string;
}> = [
  {
    value: 'conservative',
    label: 'Conservative',
    description: 'Only fix critical issues'
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Fix critical and high priority issues'
  },
  {
    value: 'aggressive',
    label: 'Aggressive',
    description: 'Apply all possible improvements'
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Configure your own rules'
  }
];
