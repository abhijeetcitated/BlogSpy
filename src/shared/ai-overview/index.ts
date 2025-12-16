// ============================================
// AI OVERVIEW - Public API
// ============================================
// Shared AI Overview components and utilities
// Import from "@/src/shared/ai-overview"
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
} from "@/types/ai-overview.types"

// Re-export utility functions
export {
  getAIOpportunityColor,
  getAIOpportunityBgColor,
  getContentTypeLabel,
  getEntityTypeLabel,
  getImpactColor,
  getEffortLabel,
  getPriorityLabel,
} from "@/types/ai-overview.types"
