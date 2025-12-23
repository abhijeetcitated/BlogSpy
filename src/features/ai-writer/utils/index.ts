// ============================================
// AI WRITER - Utils Barrel Export
// ============================================

export {
  analyzeEditorContent,
  updateNLPKeywordsUsage,
  calculateSEOScore,
  getScoreColor,
  getScoreGlow,
  generateSlug,
  generateExportHTML,
} from "./editor-utils"

export {
  parseWriterContext,
  getSourceDisplayName,
  getIntentInfo,
  getContentTypeInfo,
  getDemoContextForDev, // DEV ONLY - TODO: [AUTH] Remove before production
} from "./context-parser"

// NLP Analysis utilities
export {
  countTermOccurrences,
  findTermPositions,
  calculateTermStatus,
  getStatusColor,
  getPriorityColor,
  getPriorityBadge,
  analyzeNLPTerms,
  groupTermsByCategory,
  calculateNLPScore,
  getGradeFromScore,
  generateNLPRecommendations,
  generateNLPTermsFromKeyword,
  performNLPAnalysis,
  DEFAULT_NLP_CONFIG
} from "./nlp-analysis"

// GEO & AEO Analysis utilities (Feature #2 & #3)
export {
  extractTextFromHTML,
  extractHeadings,
  extractLists,
  extractTables,
  extractExternalLinks,
  extractParagraphs,
  detectStatistics,
  detectDefinitions,
  detectFAQPatterns,
  detectStructuredData,
  calculateStructuredContentScore,
  calculateFactualDensityScore,
  calculateAuthorityScore,
  calculateComprehensivenessScore,
  calculateCitationReadinessScore,
  calculateFreshnessScore,
  calculatePlatformScores,
  generateGEORecommendations,
  calculateGrade,
  analyzeGEO,
  calculateDirectAnswersScore,
  calculateListFormatsScore,
  calculateTableFormatsScore,
  calculateFAQStructureScore,
  calculateDefinitionBlocksScore,
  calculateStepByStepScore,
  detectSnippetOpportunities,
  generateAEORecommendations,
  analyzeAEO,
  analyzeGEOAEO
} from "./geo-aeo-analysis"

// Content Targets utilities (Feature #5 & #6)
export {
  calculateTargetStatus,
  calculateTargetProgress,
  countWords,
  extractHeadingsFromHTML,
  countParagraphs,
  countImages,
  countLinks,
  generateTargetsFromCompetitors,
  generateTargetsFromKeyword,
  analyzeContentCounts,
  updateTargetsWithCurrent,
  getAllTargetProgress,
  getStatusColor as getTargetStatusColor,
  getStatusBgColor
} from "./content-targets"
