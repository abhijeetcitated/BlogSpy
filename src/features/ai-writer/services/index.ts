// ============================================
// AI WRITER SERVICES - Index Export
// ============================================

// AI Operations
export { 
  aiWriterService, 
  AIWriterService,
  type AIOperation,
  type AIRequestParams,
  type AIOperationOptions,
  type AIResponse,
  type AIStreamCallbacks
} from './ai-writer.service'

// Draft Management
export { 
  draftService, 
  DraftService,
  type Draft,
  type DraftListItem,
  type DraftFilters,
  type AutoSaveConfig
} from './draft.service'

// Version History
export { 
  versionHistoryService, 
  VersionHistoryService,
  type ContentVersion,
  type VersionDiff,
  type DiffChange,
  type VersionCompareResult
} from './version-history.service'

// Competitor Analysis
export { 
  competitorService, 
  CompetitorService,
  type SERPResult,
  type SERPAnalysis,
  type CompetitorContentAnalysis
} from './competitor.service'

// Credits System
export { 
  creditsService, 
  CreditsService,
  type CreditPlan,
  type CreditBalance,
  type CreditTransaction,
  type CreditUsageStats,
  type OperationCost,
  CREDIT_PLANS,
  OPERATION_COSTS
} from './credits.service'

// Export
export { 
  exportService, 
  ExportService,
  type ExportFormat,
  type ExportOptions,
  type ExportResult,
  type WordPressExport,
  type ContentMetadata
} from './export.service'

// Schema Generation
export { 
  schemaService, 
  SchemaService,
  type SchemaType,
  type SchemaConfig,
  type ArticleSchemaData,
  type FAQItem,
  type HowToStep,
  type HowToSchemaData,
  type ReviewSchemaData,
  type BreadcrumbItem,
  type GeneratedSchema
} from './schema.service'

// Readability Analysis
export { 
  readabilityService, 
  ReadabilityService,
  type ReadabilityScore,
  type ContentStats,
  type ReadabilityAnalysis,
  type ReadabilityIssue
} from './readability.service'
