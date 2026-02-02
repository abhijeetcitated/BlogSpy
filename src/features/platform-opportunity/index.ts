// ============================================
// PLATFORM OPPORTUNITY - Public API
// ============================================

export {
  VideoOppMini,
  CommerceOppMini,
  SocialOppMini,
} from "./components/platform-opportunity-badges"

export type {
  VideoOpportunity,
  CommerceOpportunity,
  SocialOpportunity,
  OpportunityLevel,
  VideoPlatformData,
  SocialPlatformData,
  CommercePlatformData,
} from "./types/platform-opportunity.types"

export {
  calculateVideoOpportunity,
  generateMockVideoOpportunity,
} from "./utils/video-opportunity-calculator"

export {
  calculateSocialOpportunity,
  generateMockSocialOpportunity,
} from "./utils/social-opportunity-calculator"

export {
  calculateCommerceOpportunity,
  generateMockCommerceOpportunity,
} from "./utils/commerce-opportunity-calculator"
