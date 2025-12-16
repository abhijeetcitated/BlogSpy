// Affiliate Keyword Finder Types
// Find high-commission affiliate keywords with buyer intent

export type BuyerIntent = 'transactional' | 'commercial' | 'informational' | 'navigational'

export type IntentModifier = 
  | 'best'
  | 'review'
  | 'vs'
  | 'alternative'
  | 'comparison'
  | 'top'
  | 'cheapest'
  | 'discount'
  | 'coupon'
  | 'deal'
  | 'buy'
  | 'price'
  | 'worth it'
  | 'pros cons'

export interface AffiliateKeyword {
  id: string
  keyword: string
  searchVolume: number
  keywordDifficulty: number
  cpc: number // Cost per click - indicator of commercial value
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
  buyerIntent: BuyerIntent
  intentScore: number // 0-100, higher = more buyer intent
  modifiers: IntentModifier[]
  // Affiliate specific
  affiliateScore: number // 0-100, overall affiliate potential
  estimatedCommission: number // Per conversion
  conversionPotential: 'high' | 'medium' | 'low'
  competitorAffiliates: number // How many affiliate sites ranking
  suggestedPrograms: AffiliateProgram[]
  // Content suggestions
  contentType: ContentType
  estimatedEarnings: {
    monthly: number
    yearly: number
  }
}

export type ContentType = 
  | 'review'
  | 'comparison'
  | 'roundup'
  | 'tutorial'
  | 'deals-page'
  | 'buying-guide'

export interface AffiliateProgram {
  id: string
  name: string
  logo: string
  category: string
  commissionRate: string // e.g., "3-10%", "$50 flat"
  commissionType: 'percentage' | 'flat' | 'recurring'
  cookieDuration: number // days
  avgOrderValue: number
  payoutThreshold: number
  rating: number // 1-5
  popularity: 'high' | 'medium' | 'low'
}

export interface AffiliateNiche {
  id: string
  name: string
  icon: string
  avgCommission: string
  topPrograms: string[]
  competitionLevel: 'high' | 'medium' | 'low'
  growthTrend: 'growing' | 'stable' | 'declining'
}

export interface KeywordSearchFilters {
  query: string
  minVolume: number
  maxDifficulty: number
  minAffiliateScore: number
  intentTypes: BuyerIntent[]
  modifiers: IntentModifier[]
  niche: string | null
  sortBy: 'affiliateScore' | 'volume' | 'difficulty' | 'commission' | 'cpc'
  sortOrder: 'asc' | 'desc'
}

export interface AffiliateFinderStats {
  totalKeywords: number
  highIntentKeywords: number
  avgAffiliateScore: number
  totalEstimatedMonthly: number
  topNiche: string
  avgCommission: number
}

export interface CommissionEstimate {
  keyword: string
  monthlyTraffic: number
  clickThroughRate: number
  conversionRate: number
  avgCommission: number
  monthlyEarnings: number
  yearlyEarnings: number
}
