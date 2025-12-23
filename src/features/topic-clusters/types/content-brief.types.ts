// ============================================
// CONTENT BRIEFS - AI Writer Integration Types
// ============================================
// Generated content briefs ready for AI Writer

import type { SearchIntent } from "./keyword-pool.types"
import type { SubKeywordPlacement, ClusterArticleType, InternalLink } from "./cluster-analysis.types"

// ============================================
// CONTENT BRIEF (Output for AI Writer)
// ============================================

export interface ContentBrief {
  id: string
  type: "pillar" | "cluster"
  
  // Target keyword
  primaryKeyword: string
  primaryVolume: number
  primaryKD: number
  primaryIntent: SearchIntent
  
  // Secondary keywords to include
  secondaryKeywords: SecondaryKeyword[]
  
  // Content structure
  structure: ContentStructure
  
  // Word count targets
  wordCount: WordCountTargets
  
  // Internal linking
  internalLinks: InternalLinkBrief[]
  
  // SEO recommendations
  seoRecommendations: SEORecommendations
  
  // Content angle
  contentAngle: ContentAngle
  
  // Status
  status: BriefStatus
  createdAt: Date
  updatedAt: Date
  
  // Parent info (for clusters)
  parentPillarId?: string
  parentPillarKeyword?: string
}

// ============================================
// SECONDARY KEYWORDS
// ============================================

export interface SecondaryKeyword {
  keyword: string
  volume: number
  placement: SubKeywordPlacement
  usage: "heading" | "body" | "faq" | "meta"
  priority: "must-include" | "should-include" | "optional"
  frequency: number               // Recommended times to use
}

// ============================================
// CONTENT STRUCTURE
// ============================================

export interface ContentStructure {
  title: TitleSuggestion
  metaDescription: MetaDescriptionSuggestion
  
  // Outline
  outline: OutlineSection[]
  
  // FAQ
  faqs: FAQItem[]
  
  // Schema markup suggestions
  schemaTypes: SchemaType[]
}

export interface TitleSuggestion {
  primary: string
  alternatives: string[]
  powerWords: string[]
  charCount: number
}

export interface MetaDescriptionSuggestion {
  primary: string
  alternatives: string[]
  charCount: number
  includesKeyword: boolean
  includesCTA: boolean
}

export interface OutlineSection {
  level: "h2" | "h3"
  heading: string
  targetKeyword?: string
  targetVolume?: number
  wordCountTarget: number
  contentGuidance: string
  subsections?: OutlineSection[]
}

export interface FAQItem {
  question: string
  keyword?: string
  volume?: number
  answerGuidance: string
  wordCountTarget: number
}

export type SchemaType = 
  | "Article"
  | "HowTo"
  | "FAQ"
  | "Review"
  | "Comparison"
  | "Product"
  | "BreadcrumbList"

// ============================================
// WORD COUNT
// ============================================

export interface WordCountTargets {
  total: number
  introduction: number
  mainContent: number
  conclusion: number
  faqSection: number
  
  // Per section breakdown
  sectionBreakdown: SectionWordCount[]
}

export interface SectionWordCount {
  sectionId: string
  heading: string
  target: number
  min: number
  max: number
}

// ============================================
// INTERNAL LINKING
// ============================================

export interface InternalLinkBrief {
  targetUrl?: string
  targetKeyword: string
  targetType: "pillar" | "cluster" | "existing"
  anchorText: string
  placement: "introduction" | "body" | "conclusion" | "contextual"
  importance: "required" | "recommended" | "optional"
  context: string                 // Where/how to include
}

// ============================================
// SEO RECOMMENDATIONS
// ============================================

export interface SEORecommendations {
  // Keyword density
  keywordDensity: {
    primary: { min: number; max: number }
    secondary: { min: number; max: number }
  }
  
  // On-page elements
  titleTag: {
    includeKeyword: boolean
    position: "start" | "middle" | "end"
    maxLength: number
  }
  
  metaDescription: {
    includeKeyword: boolean
    includeCTA: boolean
    maxLength: number
  }
  
  url: {
    suggestion: string
    includeKeyword: boolean
    maxLength: number
  }
  
  // Content optimization
  imageCount: { min: number; max: number }
  videoRecommended: boolean
  tableOfContents: boolean
  
  // Featured snippet optimization
  snippetOptimization?: SnippetOptimization
}

export interface SnippetOptimization {
  targetType: "paragraph" | "list" | "table" | "steps"
  position: string                // Where in content
  format: string                  // How to structure
  maxLength: number
}

// ============================================
// CONTENT ANGLE
// ============================================

export interface ContentAngle {
  type: ClusterArticleType | "pillar-guide"
  tone: ContentTone
  audience: string
  uniqueAngle: string
  competitorGaps: string[]        // What competitors miss
  valueProposition: string
}

export type ContentTone = 
  | "educational"
  | "professional"
  | "conversational"
  | "authoritative"
  | "persuasive"

// ============================================
// BRIEF STATUS
// ============================================

export type BriefStatus = 
  | "draft"                       // Just generated
  | "reviewed"                    // User reviewed
  | "approved"                    // Ready for AI Writer
  | "in-progress"                 // Being written
  | "completed"                   // Content created
  | "published"                   // Live on site

// ============================================
// AI WRITER EXPORT
// ============================================

export interface AIWriterExport {
  brief: ContentBrief
  
  // Pre-formatted prompts for AI
  prompts: AIWriterPrompts
  
  // Export format
  format: "json" | "markdown" | "notion"
}

export interface AIWriterPrompts {
  titlePrompt: string
  introductionPrompt: string
  sectionPrompts: SectionPrompt[]
  conclusionPrompt: string
  faqPrompt?: string
  metaPrompt: string
}

export interface SectionPrompt {
  heading: string
  prompt: string
  keywords: string[]
  wordCount: number
}

// ============================================
// BRIEF TEMPLATE
// ============================================

export interface BriefTemplate {
  id: string
  name: string
  type: "pillar" | "cluster" | "both"
  
  // Template settings
  wordCountMultiplier: number
  h2PerThousandWords: number
  h3PerH2: number
  faqCount: number
  
  // Structure template
  defaultSections: string[]
  requiredElements: string[]
  
  // SEO defaults
  seoDefaults: Partial<SEORecommendations>
}

export const DEFAULT_PILLAR_TEMPLATE: BriefTemplate = {
  id: "default-pillar",
  name: "Pillar Content Template",
  type: "pillar",
  wordCountMultiplier: 0.1,       // 10% of total volume = word count (min 2500)
  h2PerThousandWords: 3,
  h3PerH2: 2,
  faqCount: 5,
  defaultSections: [
    "What is [Topic]?",
    "Why [Topic] Matters",
    "How [Topic] Works",
    "Types of [Topic]",
    "Best Practices",
    "Common Mistakes",
    "Tools & Resources",
    "Conclusion"
  ],
  requiredElements: ["table-of-contents", "faq-section", "internal-links"],
  seoDefaults: {
    keywordDensity: { primary: { min: 0.5, max: 2 }, secondary: { min: 0.3, max: 1 } },
    imageCount: { min: 5, max: 15 },
    videoRecommended: true,
    tableOfContents: true
  }
}

export const DEFAULT_CLUSTER_TEMPLATE: BriefTemplate = {
  id: "default-cluster",
  name: "Cluster Article Template",
  type: "cluster",
  wordCountMultiplier: 0.05,      // 5% of volume = word count (min 1500)
  h2PerThousandWords: 4,
  h3PerH2: 1,
  faqCount: 3,
  defaultSections: [
    "Introduction",
    "Main Topic Deep Dive",
    "Key Takeaways",
    "Conclusion"
  ],
  requiredElements: ["pillar-link", "related-clusters"],
  seoDefaults: {
    keywordDensity: { primary: { min: 1, max: 3 }, secondary: { min: 0.5, max: 1.5 } },
    imageCount: { min: 3, max: 8 },
    videoRecommended: false,
    tableOfContents: false
  }
}
