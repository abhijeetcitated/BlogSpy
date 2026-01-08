// Affiliate Keyword Finder Utilities

import { 
  AffiliateKeyword, 
  BuyerIntent, 
  IntentModifier, 
  ContentType,
  AffiliateFinderStats,
  CommissionEstimate,
  AffiliateProgram,
} from "../types"
import { 
  SAMPLE_AFFILIATE_KEYWORDS, 
  AFFILIATE_PROGRAMS, 
  AFFILIATE_NICHES,
  INTENT_MODIFIERS,
  BUYER_INTENT_CONFIG,
  AFFILIATE_SCORE_TIERS,
} from "../constants"

// Calculate affiliate score based on multiple factors
export function calculateAffiliateScore(
  volume: number,
  cpc: number,
  kd: number,
  intent: BuyerIntent,
  modifiers: IntentModifier[]
): number {
  // Base score from CPC (commercial value indicator)
  const cpcScore = Math.min(30, cpc * 2)
  
  // Intent score
  const intentScores: Record<BuyerIntent, number> = {
    transactional: 30,
    commercial: 25,
    informational: 10,
    navigational: 5,
  }
  const intentScore = intentScores[intent]
  
  // Modifier score (average of all modifiers)
  const modifierScore = modifiers.length > 0
    ? modifiers.reduce((sum, mod) => sum + INTENT_MODIFIERS[mod].score, 0) / modifiers.length / 4
    : 0
  
  // Volume score (logarithmic)
  const volumeScore = Math.min(15, Math.log10(volume + 1) * 3)
  
  // Difficulty penalty
  const difficultyPenalty = kd > 60 ? (kd - 60) / 4 : 0
  
  const totalScore = cpcScore + intentScore + modifierScore + volumeScore - difficultyPenalty
  return Math.min(100, Math.max(0, Math.round(totalScore)))
}

// Get suggested affiliate programs for a keyword
export function getSuggestedPrograms(niche: string): AffiliateProgram[] {
  const nicheConfig = AFFILIATE_NICHES.find(n => n.id === niche)
  if (!nicheConfig) return AFFILIATE_PROGRAMS.slice(0, 3)
  
  // Match programs by category
  const categoryMap: Record<string, string[]> = {
    hosting: ["bluehost", "amazon"],
    "seo-tools": ["semrush", "shareasale", "impact"],
    "email-marketing": ["convertkit", "shareasale", "cj"],
    vpn: ["shareasale", "cj", "impact"],
    finance: ["cj", "impact", "shareasale"],
    "online-courses": ["shareasale", "impact", "amazon"],
    software: ["impact", "shareasale", "cj"],
    fitness: ["amazon", "shareasale", "cj"],
  }
  
  const programIds = categoryMap[niche] || ["amazon", "shareasale", "cj"]
  return AFFILIATE_PROGRAMS.filter(p => programIds.includes(p.id))
}

// Estimate commission based on keyword metrics
export function estimateCommission(
  volume: number,
  cpc: number,
  niche: string
): number {
  // Rough estimation based on niche average
  const nicheConfig = AFFILIATE_NICHES.find(n => n.id === niche)
  const baseCommission = nicheConfig?.avgCommission.includes("$") 
    ? parseFloat(nicheConfig.avgCommission.replace(/[^0-9.-]/g, '')) 
    : cpc * 3
  
  return Math.round(baseCommission * (1 + (cpc / 20)))
}

// Suggest content type based on modifiers
export function suggestContentType(modifiers: IntentModifier[]): ContentType {
  if (modifiers.includes("review")) return "review"
  if (modifiers.includes("vs") || modifiers.includes("comparison")) return "comparison"
  if (modifiers.includes("best") || modifiers.includes("top")) return "roundup"
  if (modifiers.includes("coupon") || modifiers.includes("discount") || modifiers.includes("deal")) return "deals-page"
  if (modifiers.includes("alternative")) return "comparison"
  return "buying-guide"
}

// Generate full affiliate keyword data from sample
export function generateAffiliateKeywords(): AffiliateKeyword[] {
  return SAMPLE_AFFILIATE_KEYWORDS.map((sample, index) => {
    const affiliateScore = calculateAffiliateScore(
      sample.volume,
      sample.cpc,
      sample.kd,
      sample.intent,
      sample.modifiers
    )
    
    const suggestedPrograms = getSuggestedPrograms(sample.niche)
    const estimatedCommission = estimateCommission(sample.volume, sample.cpc, sample.niche)
    const contentType = suggestContentType(sample.modifiers)
    
    // Estimate monthly earnings
    const clickThroughRate = sample.intent === 'transactional' ? 0.08 : 0.05
    const conversionRate = sample.intent === 'transactional' ? 0.12 : 0.06
    const monthlyClicks = sample.volume * clickThroughRate
    const monthlyConversions = monthlyClicks * conversionRate
    const monthlyEarnings = monthlyConversions * estimatedCommission
    
    return {
      id: `kw-${index + 1}`,
      keyword: sample.keyword,
      searchVolume: sample.volume,
      keywordDifficulty: sample.kd,
      cpc: sample.cpc,
      trend: Math.random() > 0.3 ? 'up' : Math.random() > 0.5 ? 'stable' : 'down',
      trendPercent: Math.round(Math.random() * 30 - 10),
      buyerIntent: sample.intent,
      intentScore: INTENT_MODIFIERS[sample.modifiers[0]]?.score || 70,
      modifiers: sample.modifiers,
      affiliateScore: sample.affiliateScore || affiliateScore,
      estimatedCommission,
      conversionPotential: affiliateScore > 85 ? 'high' : affiliateScore > 60 ? 'medium' : 'low',
      competitorAffiliates: Math.floor(Math.random() * 8) + 2,
      suggestedPrograms,
      contentType,
      estimatedEarnings: {
        monthly: Math.round(monthlyEarnings),
        yearly: Math.round(monthlyEarnings * 12),
      },
    }
  })
}

// Calculate dashboard stats
export function calculateAffiliateStats(keywords: AffiliateKeyword[]): AffiliateFinderStats {
  if (keywords.length === 0) {
    return {
      totalKeywords: 0,
      highIntentKeywords: 0,
      avgAffiliateScore: 0,
      totalEstimatedMonthly: 0,
      topNiche: "",
      avgCommission: 0,
    }
  }
  
  const highIntent = keywords.filter(k => 
    k.buyerIntent === 'transactional' || k.buyerIntent === 'commercial'
  ).length
  
  const totalMonthly = keywords.reduce((sum, k) => sum + k.estimatedEarnings.monthly, 0)
  const avgScore = keywords.length > 0 ? keywords.reduce((sum, k) => sum + k.affiliateScore, 0) / keywords.length : 0
  const avgCommission = keywords.length > 0 ? keywords.reduce((sum, k) => sum + k.estimatedCommission, 0) / keywords.length : 0
  
  // Find top niche
  const nicheCounts: Record<string, number> = {}
  SAMPLE_AFFILIATE_KEYWORDS.forEach(k => {
    nicheCounts[k.niche] = (nicheCounts[k.niche] || 0) + 1
  })
  const topNiche = Object.entries(nicheCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ""
  
  return {
    totalKeywords: keywords.length,
    highIntentKeywords: highIntent,
    avgAffiliateScore: Math.round(avgScore),
    totalEstimatedMonthly: Math.round(totalMonthly),
    topNiche: AFFILIATE_NICHES.find(n => n.id === topNiche)?.name || topNiche,
    avgCommission: Math.round(avgCommission),
  }
}

// Get affiliate score tier
export function getAffiliateTier(score: number) {
  if (score >= AFFILIATE_SCORE_TIERS.excellent.min) return AFFILIATE_SCORE_TIERS.excellent
  if (score >= AFFILIATE_SCORE_TIERS.good.min) return AFFILIATE_SCORE_TIERS.good
  if (score >= AFFILIATE_SCORE_TIERS.moderate.min) return AFFILIATE_SCORE_TIERS.moderate
  return AFFILIATE_SCORE_TIERS.low
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format number with K/M suffix
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
