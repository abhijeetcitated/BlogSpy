// ============================================
// COMMUNITY DECAY - Public API
// ============================================
// Shared community decay components
// Import from "@/src/shared/community-decay"
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
  DecayLevel,
  CommunitySource,
  CommunityDecayAnalysis,
} from "@/types/community-decay.types"

// Re-export utility functions
export {
  PLATFORM_INFO,
  getDecayLevel,
  getDecayColor,
  getDecayBgColor,
  formatAge,
} from "@/types/community-decay.types"
