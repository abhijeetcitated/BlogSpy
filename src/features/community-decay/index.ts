// ============================================
// COMMUNITY DECAY - Public API
// ============================================
// Community decay components
// Import from "@features/community-decay"
// ============================================

// All components
export {
  CommunityDecayRing,
  PlatformBadge,
  CommunitySourceCard,
  CommunityDecayTooltip,
  CommunityDecayBadge,
  CommunityDecayCard,
  CommunityDecayMini,
  DecayAlertBanner,
} from "./components"

// All component types
export type {
  CommunityDecayRingProps,
  PlatformBadgeProps,
  CommunitySourceCardProps,
  CommunityDecayTooltipProps,
  CommunityDecayBadgeProps,
  CommunityDecayCardProps,
  CommunityDecayMiniProps,
  DecayAlertBannerProps,
} from "./components"

// Re-export types from central types file
export type {
  CommunityPlatform,
  CommunityDecayLevel,
  CommunitySource,
  CommunityDecayAnalysis,
} from "@features/community-decay/types/community-decay.types"

// Re-export utility functions
export {
  PLATFORM_INFO,
  getCommunityDecayLevel,
  getCommunityDecayColor,
  getCommunityDecayBgColor,
  formatAge,
} from "@features/community-decay/types/community-decay.types"
