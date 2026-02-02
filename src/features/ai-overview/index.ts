// ============================================
// AI OVERVIEW - Public API
// ============================================
// AI Overview components and utilities
// Import from "@features/ai-overview"
// ============================================

// All components
export {
  // Badges
  AIOverviewStatusBadge,
  AIOpportunityBadge,
  // Citation Components
  CitationSourceCard,
  CitationList,
  // Entity Components
  EntityChip,
  EntityGrid,
  // Recommendation Components
  RecommendationCard,
  RecommendationsList,
  // Main Card Components
  AIOverviewCard,
  AIOverviewMini,
} from "./components"

// All component types
export type {
  AIOverviewStatusBadgeProps,
  AIOpportunityBadgeProps,
  CitationSourceCardProps,
  CitationListProps,
  EntityChipProps,
  EntityGridProps,
  RecommendationCardProps,
  RecommendationsListProps,
  AIOverviewCardProps,
  AIOverviewMiniProps,
} from "./components"

// Re-export types from central types file for convenience
export type {
  CitationPosition,
  CitedContentType,
  EntityType,
  AICitationSource,
  AIEntity,
  CitationGap,
  AIOptimizationRecommendation,
  YourContentAnalysis,
  AIOverviewAnalysis,
} from "@features/ai-overview/types/ai-overview.types"

// Re-export utility functions
export {
  getAIOpportunityColor,
  getAIOpportunityBgColor,
  getContentTypeLabel,
  getEntityTypeLabel,
  getImpactColor,
  getEffortLabel,
  getPriorityLabel,
} from "@features/ai-overview/types/ai-overview.types"
