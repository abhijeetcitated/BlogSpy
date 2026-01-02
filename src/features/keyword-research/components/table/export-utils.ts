// ============================================
// KEYWORD TABLE - CSV Export Utility
// ============================================

import type { Keyword } from "../../types"
import { generateMockGEOScore } from "@/lib/geo-calculator"
import { generateMockRTV } from "@/lib/rtv-calculator"
import { generateMockAIOverviewAnalysis } from "@/lib/ai-overview-analyzer"
import { generateMockCommunityDecayForId } from "@/lib/community-decay-calculator"
import { generateMockVideoOpportunity } from "@/lib/video-opportunity-calculator"
import { generateMockCommerceOpportunity } from "@/lib/commerce-opportunity-calculator"
import { generateMockSocialOpportunity } from "@/lib/social-opportunity-calculator"

/**
 * Generate CSV content from keywords with all BlogSpy metrics
 */
export function generateKeywordCSV(keywords: Keyword[]): string {
  const headers = [
    'Keyword', 
    'Volume', 
    'RTV', 
    'RTV %', 
    'KD', 
    'KD Level',
    'CPC', 
    'Intent', 
    'Trend Growth %',
    'Weak Spot',
    'Weak Spot Rank',
    'GEO Score',
    'GEO Level',
    'AIO Cited',
    'AIO Position',
    'AIO Opportunity',
    'Decay Score',
    'Video Opp',
    'Commerce Opp',
    'Social Opp',
    'SERP Features'
  ]
  
  const rows = keywords.map(k => {
    // Calculate all metrics
    const rtvData = generateMockRTV(k.id, k.volume)
    const aioData = generateMockAIOverviewAnalysis(k.keyword, k.weakSpot.type !== null)
    const decayData = generateMockCommunityDecayForId(k.id, k.keyword)
    const geoScore = k.geoScore ?? generateMockGEOScore(k.id)
    const videoData = generateMockVideoOpportunity(k.id, k.keyword)
    const commerceData = generateMockCommerceOpportunity(k.id, k.keyword, k.intent)
    const socialData = generateMockSocialOpportunity(k.id, k.keyword)
    
    // Calculate trend growth
    const trendGrowth = k.trend.length >= 2 
      ? (((k.trend[k.trend.length - 1] - k.trend[0]) / Math.max(k.trend[0], 1)) * 100).toFixed(1)
      : "0"
    
    // Get KD level
    const kdLevel = k.kd <= 14 ? "Very Easy" : k.kd <= 29 ? "Easy" : k.kd <= 49 ? "Moderate" : k.kd <= 69 ? "Hard" : k.kd <= 84 ? "Very Hard" : "Extreme"
    
    // Get GEO level
    const geoLevel = geoScore >= 80 ? "Excellent" : geoScore >= 60 ? "Good" : geoScore >= 40 ? "Moderate" : "Low"
    
    return [
      `"${k.keyword}"`,
      k.volume,
      rtvData.rtv,
      `${rtvData.rtv > 0 ? ((rtvData.rtv / k.volume) * 100).toFixed(1) : 0}%`,
      k.kd,
      kdLevel,
      k.cpc.toFixed(2),
      `"${k.intent.join(', ')}"`,
      `${trendGrowth}%`,
      k.weakSpot.type || "-",
      k.weakSpot.rank || "-",
      geoScore,
      geoLevel,
      aioData.yourContent.isCited ? "Yes" : "No",
      aioData.yourContent.citationPosition || "-",
      `${aioData.opportunityScore}%`,
      decayData?.decayScore ?? "-",
      `${videoData.score}%`,
      `${commerceData.score}%`,
      `${socialData.score}%`,
      `"${k.serpFeatures.join(', ')}"`
    ].join(',')
  })
  
  return [headers.join(','), ...rows].join('\n')
}

/**
 * Download keywords as CSV file
 */
export function downloadKeywordsCSV(keywords: Keyword[], selectedIds?: Set<number>): void {
  // Get data to export (selected rows or all)
  const exportData = selectedIds && selectedIds.size > 0 
    ? keywords.filter(k => selectedIds.has(k.id))
    : keywords
  
  const csvContent = generateKeywordCSV(exportData)
  
  // Download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `blogspy-keywords-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
