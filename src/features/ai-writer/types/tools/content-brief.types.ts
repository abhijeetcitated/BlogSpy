// =============================================================================
// CONTENT BRIEF TYPES - Comprehensive Brief Generation System
// =============================================================================
// Industry-standard content brief like Surfer SEO, Frase, Clearscope
// Generates detailed briefs from keyword with competitor analysis
// =============================================================================

// -----------------------------------------------------------------------------
// Core Brief Types
// -----------------------------------------------------------------------------

/**
 * Complete content brief structure
 */
export interface ContentBrief {
  id: string;
  keyword: string;
  createdAt: Date;
  updatedAt: Date;
  status: BriefStatus;
  
  // Core sections
  overview: BriefOverview;
  competitors: CompetitorInsight[];
  outline: SuggestedOutline;
  terms: TermRecommendations;
  questions: QuestionSection;
  guidelines: ContentGuidelines;
  
  // Metrics
  metrics: BriefMetrics;
  
  // Metadata
  metadata: BriefMetadata;
}

export type BriefStatus = 'draft' | 'generating' | 'ready' | 'exported';

/**
 * Brief overview section
 */
export interface BriefOverview {
  title: string;
  metaDescription: string;
  searchIntent: SearchIntent;
  difficulty: DifficultyLevel;
  monthlySearchVolume: number;
  cpcEstimate: number;
  trendDirection: TrendDirection;
  targetAudience: string;
  contentType: ContentType;
  estimatedReadTime: number; // minutes
}

export type SearchIntent = 
  | 'informational'
  | 'navigational'
  | 'transactional'
  | 'commercial';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'very-hard';
export type TrendDirection = 'rising' | 'stable' | 'declining';

export type ContentType = 
  | 'blog-post'
  | 'guide'
  | 'listicle'
  | 'how-to'
  | 'comparison'
  | 'review'
  | 'pillar-page'
  | 'landing-page';

// -----------------------------------------------------------------------------
// Competitor Insights
// -----------------------------------------------------------------------------

/**
 * Competitor content analysis
 */
export interface CompetitorInsight {
  rank: number;
  url: string;
  domain: string;
  title: string;
  wordCount: number;
  headingCount: number;
  imageCount: number;
  linkCount: {
    internal: number;
    external: number;
  };
  readability: {
    score: number;
    grade: string;
  };
  contentScore: number;
  topTerms: string[];
  topHeadings: string[];
  uniqueAngles: string[];
  publishDate?: Date;
  lastUpdated?: Date;
}

// -----------------------------------------------------------------------------
// Suggested Outline
// -----------------------------------------------------------------------------

/**
 * AI-generated outline based on SERP analysis
 */
export interface SuggestedOutline {
  title: SuggestedTitle;
  sections: OutlineSection[];
  estimatedWordCount: number;
  estimatedTimeToWrite: number; // hours
}

export interface SuggestedTitle {
  primary: string;
  alternatives: string[];
  clickThroughScore: number;
}

export interface OutlineSection {
  id: string;
  level: 1 | 2 | 3 | 4;
  heading: string;
  suggestedContent: string;
  wordCountTarget: number;
  mustIncludeTerms: string[];
  suggestedSubsections?: OutlineSection[];
  competitorCoverage: number; // % of competitors with similar section
  priority: 'high' | 'medium' | 'low';
}

// -----------------------------------------------------------------------------
// Term Recommendations
// -----------------------------------------------------------------------------

/**
 * Terms and keywords to include
 */
export interface TermRecommendations {
  primary: PrimaryTerm[];
  secondary: SecondaryTerm[];
  nlpEntities: NLPEntity[];
  lsiKeywords: LSIKeyword[];
  semanticGroups: SemanticGroup[];
}

export interface PrimaryTerm {
  term: string;
  targetCount: number;
  currentCount: number;
  importance: number; // 0-100
  inTitle: boolean;
  inH1: boolean;
  competitorUsage: number; // % of competitors using
}

export interface SecondaryTerm {
  term: string;
  suggestedCount: { min: number; max: number };
  importance: number;
  relatedPrimary: string;
}

export interface NLPEntity {
  entity: string;
  type: EntityType;
  salience: number; // 0-1
  sentiment: 'positive' | 'neutral' | 'negative';
  competitorMentions: number;
}

export type EntityType = 
  | 'person'
  | 'organization'
  | 'location'
  | 'product'
  | 'concept'
  | 'event'
  | 'work'
  | 'other';

export interface LSIKeyword {
  keyword: string;
  relevanceScore: number;
  searchVolume: number;
  difficulty: number;
}

export interface SemanticGroup {
  theme: string;
  terms: string[];
  coverage: number; // % needed for good coverage
  importance: 'essential' | 'recommended' | 'optional';
}

// -----------------------------------------------------------------------------
// Questions Section
// -----------------------------------------------------------------------------

/**
 * Questions to answer in content
 */
export interface QuestionSection {
  paaQuestions: BriefPAAQuestion[];
  relatedSearches: BriefRelatedSearch[];
  forumQuestions: ForumQuestion[];
  suggestedFAQ: FAQItem[];
}

export interface BriefPAAQuestion {
  question: string;
  source: 'google-paa';
  priority: number;
  suggestedAnswer: string;
  wordCountTarget: number;
  competitorAnswered: boolean;
}

export interface BriefRelatedSearch {
  query: string;
  volume: number;
  intent: SearchIntent;
}

export interface ForumQuestion {
  question: string;
  source: string;
  upvotes: number;
  answers: number;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  includeInSchema: boolean;
}

// -----------------------------------------------------------------------------
// Content Guidelines
// -----------------------------------------------------------------------------

/**
 * Writing guidelines and constraints
 */
export interface ContentGuidelines {
  wordCount: WordCountTarget;
  structure: StructureGuidelines;
  readability: ReadabilityGuidelines;
  media: MediaGuidelines;
  linking: LinkingGuidelines;
  seo: SEOGuidelines;
  tone: ToneGuidelines;
}

export interface WordCountTarget {
  minimum: number;
  recommended: number;
  maximum: number;
  competitorAverage: number;
  topPerformerAverage: number;
}

export interface StructureGuidelines {
  h2Count: { min: number; max: number };
  h3Count: { min: number; max: number };
  paragraphLength: { min: number; max: number };
  listCount: number;
  tableCount: number;
}

export interface ReadabilityGuidelines {
  targetGrade: number; // Flesch-Kincaid grade level
  sentenceLength: { avg: number; max: number };
  syllablesPerWord: number;
  passiveVoiceMax: number; // percentage
}

export interface MediaGuidelines {
  images: { min: number; recommended: number };
  videos: number;
  infographics: number;
  altTextRequired: boolean;
  compressionRequired: boolean;
}

export interface LinkingGuidelines {
  internalLinks: { min: number; max: number };
  externalLinks: { min: number; max: number };
  authorityDomainsToLink: string[];
  nofollowExternal: boolean;
}

export interface SEOGuidelines {
  titleLength: { min: number; max: number };
  metaDescLength: { min: number; max: number };
  urlSlug: string;
  primaryKeywordInFirst100: boolean;
  schemaType: string[];
  featuredSnippetTarget: boolean;
}

export interface ToneGuidelines {
  voice: 'formal' | 'casual' | 'technical' | 'conversational';
  perspective: 'first-person' | 'second-person' | 'third-person';
  brandGuidelines?: string[];
}

// -----------------------------------------------------------------------------
// Brief Metrics
// -----------------------------------------------------------------------------

export interface BriefMetrics {
  overallScore: number;
  competitivenessScore: number;
  comprehensivenessScore: number;
  optimizationPotential: number;
  estimatedTrafficPotential: number;
  estimatedRankingDifficulty: number;
}

// -----------------------------------------------------------------------------
// Brief Metadata
// -----------------------------------------------------------------------------

export interface BriefMetadata {
  version: string;
  generatedBy: string;
  serpDataDate: Date;
  competitorsAnalyzed: number;
  dataSourcesUsed: string[];
  exportFormats: ExportFormat[];
}

export type ExportFormat = 'pdf' | 'docx' | 'markdown' | 'json' | 'notion' | 'google-docs';

// -----------------------------------------------------------------------------
// Generation Types
// -----------------------------------------------------------------------------

/**
 * Brief generation options
 */
export interface BriefGenerationOptions {
  keyword: string;
  targetUrl?: string;
  language?: string;
  country?: string;
  competitorCount?: number;
  includeQuestions?: boolean;
  includeOutline?: boolean;
  customGuidelines?: Partial<ContentGuidelines>;
}

/**
 * Generation progress
 */
export interface GenerationProgress {
  stage: GenerationStage;
  progress: number;
  message: string;
  startedAt: Date;
  estimatedCompletion?: Date;
}

export type GenerationStage = 
  | 'initializing'
  | 'analyzing-serp'
  | 'extracting-competitors'
  | 'analyzing-content'
  | 'generating-outline'
  | 'extracting-terms'
  | 'gathering-questions'
  | 'calculating-metrics'
  | 'finalizing';

// -----------------------------------------------------------------------------
// Panel State
// -----------------------------------------------------------------------------

export interface ContentBriefPanelState {
  isExpanded: boolean;
  activeTab: BriefTab;
  selectedSection: string | null;
  copyingState: Record<string, boolean>;
}

export type BriefTab = 
  | 'overview'
  | 'outline'
  | 'terms'
  | 'questions'
  | 'competitors'
  | 'guidelines';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const DEFAULT_BRIEF_OPTIONS: Required<BriefGenerationOptions> = {
  keyword: '',
  targetUrl: '',
  language: 'en',
  country: 'us',
  competitorCount: 10,
  includeQuestions: true,
  includeOutline: true,
  customGuidelines: {}
};

export const BRIEF_TABS: Record<BriefTab, { label: string; icon: string }> = {
  overview: { label: 'Overview', icon: 'FileText' },
  outline: { label: 'Outline', icon: 'List' },
  terms: { label: 'Terms', icon: 'Tags' },
  questions: { label: 'Questions', icon: 'HelpCircle' },
  competitors: { label: 'Competitors', icon: 'Users' },
  guidelines: { label: 'Guidelines', icon: 'BookOpen' }
};

export const INTENT_LABELS: Record<SearchIntent, string> = {
  informational: 'Informational',
  navigational: 'Navigational',
  transactional: 'Transactional',
  commercial: 'Commercial Investigation'
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-orange-500',
  'very-hard': 'bg-red-500'
};

export const CONTENT_TYPE_TEMPLATES: Record<ContentType, { wordCount: number; sections: number }> = {
  'blog-post': { wordCount: 1500, sections: 5 },
  'guide': { wordCount: 3000, sections: 8 },
  'listicle': { wordCount: 2000, sections: 10 },
  'how-to': { wordCount: 1800, sections: 6 },
  'comparison': { wordCount: 2500, sections: 7 },
  'review': { wordCount: 2000, sections: 6 },
  'pillar-page': { wordCount: 5000, sections: 12 },
  'landing-page': { wordCount: 800, sections: 4 }
};
