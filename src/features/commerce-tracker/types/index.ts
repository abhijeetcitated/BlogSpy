// Commerce Tracker Types

export type CommercePlatform = "amazon"

// Amazon Product
export interface AmazonProduct {
  asin: string
  title: string
  price: number
  rating: number
  reviewCount: number
  bsr: number // Best Seller Rank
  category: string
  imageUrl: string
  sponsored: boolean
  fulfillment: "FBA" | "FBM" | "Amazon"
  primeEligible: boolean
}

// Amazon Rank Data
export interface AmazonRankData {
  position: number | null
  previousPosition: number | null
  positionChange: number
  searchVolume: number
  sponsored: number // Number of sponsored listings for this keyword
  reviewVelocity: number // Reviews per week for top products
  avgPrice: number
  avgRating: number
  primePercentage: number
  topProducts: AmazonProduct[]
  ourProduct: AmazonProduct | null
  hasOurProduct: boolean
  opportunity: "high" | "medium" | "low"
}

// Commerce Intent
export type CommerceIntent = 
  | "transactional"
  | "comparison"
  | "informational"
  | "branded"

// Commerce Keyword
export interface CommerceKeyword {
  id: string
  keyword: string
  searchVolume: number
  difficulty: number
  cpc: number
  commerceIntent: CommerceIntent
  category: string
  platforms: {
    amazon: AmazonRankData | null
  }
  seasonality: "evergreen" | "seasonal" | "trending"
  lastUpdated: Date
}

// Commerce Summary
export interface CommerceSummary {
  totalKeywords: number
  amazonRanking: number // Keywords ranking on Amazon
  top10Count: number
  avgBSR: number
  totalProducts: number
  avgPrice: number
  avgRating: number
  highOpportunity: number
  primeProducts: number
  sponsoredCompetition: number // Avg sponsored listings per keyword
}

// Commerce Platform Config
export interface CommercePlatformConfig {
  name: string
  icon: string
  color: string
  bgColor: string
  apiSource: string
  creditCost: number
  features: string[]
}
