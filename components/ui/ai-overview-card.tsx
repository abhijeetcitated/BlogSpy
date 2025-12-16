"use client"

// ============================================
// AI OVERVIEW CARD - Re-export from src/shared
// ============================================
// This file is kept for backward compatibility
// New code should import from "@/src/shared/ai-overview"
// ============================================

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
} from "@/src/shared/ai-overview"

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
} from "@/src/shared/ai-overview"
