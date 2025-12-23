// ============================================
// AI WRITER - GEO & AEO Score Types
// ============================================
// Feature #2 & #3: GEO (Generative Engine Optimization)
// and AEO (Answer Engine Optimization) types
// ============================================

/**
 * GEO Score - Generative Engine Optimization
 * Measures how likely content is to be cited by AI systems
 * like ChatGPT, Perplexity, Claude, Gemini
 */
export interface GEOScore {
  score: number              // 0-100 overall score
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  
  // Sub-scores (each 0-100)
  components: {
    structuredContent: number      // Clear headings, lists, tables
    factualDensity: number        // Statistics, data points, citations
    authoritySignals: number      // E-E-A-T, credentials, sources
    comprehensiveness: number     // Topic coverage, depth
    freshness: number             // Recent data, updated info
    citationReadiness: number     // How easily AI can quote
  }
  
  // Analysis details
  analysis: {
    definitionCount: number       // Clear definitions for concepts
    statisticsCount: number       // Numbers, percentages, data
    externalCitations: number     // Links to authoritative sources
    structuredDataTypes: string[] // Schema.org types present
    uniqueInsights: number        // Original research/perspectives
    questionsCovered: number      // FAQs/questions answered
  }
  
  // Recommendations
  recommendations: GEORecommendation[]
  
  // Platform-specific predictions
  platformScores: {
    chatgpt: number
    perplexity: number
    gemini: number
    claude: number
    googleAI: number
  }
}

/**
 * GEO Recommendation
 */
export interface GEORecommendation {
  id: string
  category: 'structure' | 'facts' | 'authority' | 'coverage' | 'freshness' | 'citations'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string           // e.g., "+5-10 points"
  action?: {
    type: 'add' | 'improve' | 'remove'
    target: string
  }
}

/**
 * AEO Score - Answer Engine Optimization
 * Measures how likely content is to appear in featured snippets
 * and voice search results
 */
export interface AEOScore {
  score: number              // 0-100 overall score
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  
  // Sub-scores (each 0-100)
  components: {
    directAnswers: number        // Concise answer paragraphs
    listFormats: number          // Numbered/bulleted lists
    tableFormats: number         // Data tables
    faqStructure: number         // Q&A format
    definitionBlocks: number     // "What is X" format
    stepByStep: number           // How-to instructions
  }
  
  // Snippet opportunities detected
  snippetOpportunities: SnippetOpportunity[]
  
  // Analysis details
  analysis: {
    answerParagraphs: number     // Paragraphs that directly answer questions
    numberedLists: number        // Ordered lists count
    bulletLists: number          // Unordered lists count
    tablesFound: number          // Tables count
    faqPairs: number             // Q&A pairs count
    definitionsFound: number     // Definition statements
    howToSteps: number           // Step-by-step instructions
  }
  
  // Recommendations
  recommendations: AEORecommendation[]
}

/**
 * Snippet opportunity detected in content
 */
export interface SnippetOpportunity {
  id: string
  type: 'paragraph' | 'list' | 'table' | 'definition' | 'how-to'
  targetQuery: string        // The question this could answer
  currentScore: number       // How well optimized (0-100)
  position: {
    start: number
    end: number
  }
  suggestion: string         // How to improve
}

/**
 * AEO Recommendation
 */
export interface AEORecommendation {
  id: string
  type: 'paragraph' | 'list' | 'table' | 'faq' | 'definition' | 'how-to'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  example?: string          // Example of what to add
  targetKeyword?: string    // Related keyword
}

/**
 * Combined SEO Intelligence Score
 * Unified view of SEO + GEO + AEO
 */
export interface SEOIntelligenceScore {
  // Traditional SEO
  seoScore: number
  seoGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  
  // Generative Engine Optimization
  geoScore: GEOScore
  
  // Answer Engine Optimization
  aeoScore: AEOScore
  
  // Overall combined score
  overallScore: number
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  
  // Competitive position
  competitiveAnalysis?: {
    avgCompetitorSEO: number
    avgCompetitorGEO: number
    avgCompetitorAEO: number
    yourPosition: number   // 1-10
  }
}

/**
 * GEO Analysis configuration
 */
export interface GEOConfig {
  // Weights for each component
  weights: {
    structuredContent: number
    factualDensity: number
    authoritySignals: number
    comprehensiveness: number
    freshness: number
    citationReadiness: number
  }
  
  // Thresholds
  minDefinitions: number
  minStatistics: number
  minExternalLinks: number
  minInternalLinks: number
  
  // Target platform priority
  primaryPlatform: 'chatgpt' | 'perplexity' | 'gemini' | 'all'
}

/**
 * Default GEO configuration
 */
export const DEFAULT_GEO_CONFIG: GEOConfig = {
  weights: {
    structuredContent: 0.20,
    factualDensity: 0.20,
    authoritySignals: 0.20,
    comprehensiveness: 0.15,
    freshness: 0.10,
    citationReadiness: 0.15
  },
  minDefinitions: 2,
  minStatistics: 5,
  minExternalLinks: 3,
  minInternalLinks: 5,
  primaryPlatform: 'all'
}

/**
 * AEO Analysis configuration
 */
export interface AEOConfig {
  // Weights for each component
  weights: {
    directAnswers: number
    listFormats: number
    tableFormats: number
    faqStructure: number
    definitionBlocks: number
    stepByStep: number
  }
  
  // Thresholds
  idealAnswerLength: { min: number; max: number }  // Characters
  minListItems: number
  minFAQPairs: number
}

/**
 * Default AEO configuration
 */
export const DEFAULT_AEO_CONFIG: AEOConfig = {
  weights: {
    directAnswers: 0.25,
    listFormats: 0.20,
    tableFormats: 0.10,
    faqStructure: 0.20,
    definitionBlocks: 0.15,
    stepByStep: 0.10
  },
  idealAnswerLength: { min: 40, max: 60 },  // 40-60 words
  minListItems: 3,
  minFAQPairs: 3
}
