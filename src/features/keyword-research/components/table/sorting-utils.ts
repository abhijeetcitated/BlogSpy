// ============================================
// KEYWORD TABLE - Sorting Utilities
// ============================================

import type { Keyword } from "../../types"
import type { SortField, SortDirection } from "../../constants/table-config"
import { generateMockGEOScore } from "@/lib/geo-calculator"
import { generateMockRTV } from "@/lib/rtv-calculator"
import { generateMockAIOverviewAnalysis } from "@/lib/ai-overview-analyzer"
import { generateMockCommunityDecayForId } from "@/lib/community-decay-calculator"
import { generateMockVideoOpportunity } from "@/lib/video-opportunity-calculator"
import { generateMockCommerceOpportunity } from "@/lib/commerce-opportunity-calculator"
import { generateMockSocialOpportunity } from "@/lib/social-opportunity-calculator"

/**
 * Sort keywords by specified field and direction
 */
export function sortKeywords(
  keywords: Keyword[],
  sortField: SortField,
  sortDirection: SortDirection
): Keyword[] {
  if (!sortField) return keywords

  return [...keywords].sort((a, b) => {
    let comparison = 0
    
    switch (sortField) {
      case "keyword":
        comparison = a.keyword.localeCompare(b.keyword)
        break
      case "volume":
        comparison = a.volume - b.volume
        break
      case "rtv":
        const aRtv = generateMockRTV(a.id, a.volume).rtv
        const bRtv = generateMockRTV(b.id, b.volume).rtv
        comparison = aRtv - bRtv
        break
      case "kd":
        comparison = a.kd - b.kd
        break
      case "cpc":
        comparison = a.cpc - b.cpc
        break
      case "trend":
        const aTrend = a.trend.length >= 2 
          ? ((a.trend[a.trend.length - 1] - a.trend[0]) / Math.max(a.trend[0], 1)) * 100
          : 0
        const bTrend = b.trend.length >= 2 
          ? ((b.trend[b.trend.length - 1] - b.trend[0]) / Math.max(b.trend[0], 1)) * 100
          : 0
        comparison = aTrend - bTrend
        break
      case "geoScore":
        const aGeo = a.geoScore ?? generateMockGEOScore(a.id)
        const bGeo = b.geoScore ?? generateMockGEOScore(b.id)
        comparison = aGeo - bGeo
        break
      case "aioScore":
        const aAio = generateMockAIOverviewAnalysis(a.keyword, a.weakSpot.type !== null)
        const bAio = generateMockAIOverviewAnalysis(b.keyword, b.weakSpot.type !== null)
        comparison = aAio.opportunityScore - bAio.opportunityScore
        break
      case "decayScore":
        const aDecay = generateMockCommunityDecayForId(a.id, a.keyword)
        const bDecay = generateMockCommunityDecayForId(b.id, b.keyword)
        comparison = (aDecay?.decayScore ?? 0) - (bDecay?.decayScore ?? 0)
        break
      case "videoOpp":
        const aVideo = generateMockVideoOpportunity(a.id, a.keyword)
        const bVideo = generateMockVideoOpportunity(b.id, b.keyword)
        comparison = aVideo.score - bVideo.score
        break
      case "commerceOpp":
        const aCommerce = generateMockCommerceOpportunity(a.id, a.keyword, a.intent)
        const bCommerce = generateMockCommerceOpportunity(b.id, b.keyword, b.intent)
        comparison = aCommerce.score - bCommerce.score
        break
      case "socialOpp":
        const aSocial = generateMockSocialOpportunity(a.id, a.keyword)
        const bSocial = generateMockSocialOpportunity(b.id, b.keyword)
        comparison = aSocial.score - bSocial.score
        break
      default:
        comparison = 0
    }

    return sortDirection === "asc" ? comparison : -comparison
  })
}
