import type { CommerceKeyword, CommerceSummary, AmazonProduct, CommerceIntent } from "../types"
import { AMAZON_CATEGORIES } from "../constants"

// Generate mock Amazon product
function generateMockProduct(rank: number, isOur: boolean = false): AmazonProduct {
  const fulfillments: ("FBA" | "FBM" | "Amazon")[] = ["FBA", "FBM", "Amazon"]
  return {
    asin: `B${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    title: isOur ? "Your Product - Premium Quality Item" : `Top Seller Product ${rank} - High Quality`,
    price: Math.floor(Math.random() * 150) + 15,
    rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 5000) + 50,
    bsr: Math.floor(Math.random() * 50000) + 1000,
    category: AMAZON_CATEGORIES[Math.floor(Math.random() * AMAZON_CATEGORIES.length)],
    imageUrl: "",
    sponsored: rank <= 3 && Math.random() > 0.5,
    fulfillment: fulfillments[Math.floor(Math.random() * fulfillments.length)],
    primeEligible: Math.random() > 0.3,
  }
}

// Generate mock commerce keywords
export function generateCommerceKeywords(count: number = 12): CommerceKeyword[] {
  const keywords = [
    "wireless earbuds",
    "yoga mat",
    "blender",
    "standing desk",
    "running shoes",
    "water bottle",
    "laptop stand",
    "resistance bands",
    "air purifier",
    "coffee maker",
    "ring light",
    "power bank",
    "ergonomic mouse",
    "weighted blanket",
    "desk organizer",
  ]

  const intents: CommerceIntent[] = ["transactional", "comparison", "informational", "branded"]
  const seasonalities = ["evergreen", "seasonal", "trending"] as const

  return keywords.slice(0, count).map((keyword, i) => {
    const hasOurProduct = Math.random() > 0.6
    const ourPosition = hasOurProduct ? Math.floor(Math.random() * 20) + 1 : null
    const prevPosition = ourPosition ? ourPosition + Math.floor(Math.random() * 10) - 5 : null
    const topProducts = Array.from({ length: 5 }, (_, j) => generateMockProduct(j + 1))
    
    return {
      id: `commerce-${i + 1}`,
      keyword,
      searchVolume: Math.floor(Math.random() * 50000) + 1000,
      difficulty: Math.floor(Math.random() * 80) + 10,
      cpc: Number((Math.random() * 3 + 0.5).toFixed(2)),
      commerceIntent: intents[Math.floor(Math.random() * intents.length)],
      category: AMAZON_CATEGORIES[Math.floor(Math.random() * AMAZON_CATEGORIES.length)],
      seasonality: seasonalities[Math.floor(Math.random() * seasonalities.length)],
      platforms: {
        amazon: {
          position: ourPosition,
          previousPosition: prevPosition,
          positionChange: prevPosition && ourPosition ? prevPosition - ourPosition : 0,
          searchVolume: Math.floor(Math.random() * 30000) + 500,
          sponsored: Math.floor(Math.random() * 8) + 1,
          reviewVelocity: Math.floor(Math.random() * 20) + 2,
          avgPrice: Math.floor(Math.random() * 100) + 20,
          avgRating: Number((3.8 + Math.random() * 1.0).toFixed(1)),
          primePercentage: Math.floor(Math.random() * 40) + 50,
          topProducts,
          ourProduct: hasOurProduct ? generateMockProduct(ourPosition!, true) : null,
          hasOurProduct,
          opportunity: Math.random() > 0.6 ? "high" : Math.random() > 0.3 ? "medium" : "low",
        },
      },
      lastUpdated: new Date(Date.now() - Math.random() * 86400000 * 3),
    }
  })
}

// Generate mock summary
export function generateCommerceSummary(keywords: CommerceKeyword[]): CommerceSummary {
  const amazonKeywords = keywords.filter(k => k.platforms.amazon)
  const withPosition = amazonKeywords.filter(k => k.platforms.amazon?.position)
  const top10 = withPosition.filter(k => k.platforms.amazon!.position! <= 10)
  const highOpp = amazonKeywords.filter(k => k.platforms.amazon?.opportunity === "high")

  return {
    totalKeywords: keywords.length,
    amazonRanking: withPosition.length,
    top10Count: top10.length,
    avgBSR: Math.floor(amazonKeywords.reduce((acc, k) => {
      const products = k.platforms.amazon?.topProducts || []
      return acc + (products.reduce((s, p) => s + p.bsr, 0) / (products.length || 1))
    }, 0) / (amazonKeywords.length || 1)),
    totalProducts: amazonKeywords.reduce((acc, k) => acc + (k.platforms.amazon?.topProducts.length || 0), 0),
    avgPrice: Number((amazonKeywords.reduce((acc, k) => acc + (k.platforms.amazon?.avgPrice || 0), 0) / (amazonKeywords.length || 1)).toFixed(2)),
    avgRating: Number((amazonKeywords.reduce((acc, k) => acc + (k.platforms.amazon?.avgRating || 0), 0) / (amazonKeywords.length || 1)).toFixed(1)),
    highOpportunity: highOpp.length,
    primeProducts: Math.floor(Math.random() * 20) + 10,
    sponsoredCompetition: Number((amazonKeywords.reduce((acc, k) => acc + (k.platforms.amazon?.sponsored || 0), 0) / (amazonKeywords.length || 1)).toFixed(1)),
  }
}

// Pre-generated mock data
export const MOCK_COMMERCE_KEYWORDS = generateCommerceKeywords(12)
export const MOCK_COMMERCE_SUMMARY = generateCommerceSummary(MOCK_COMMERCE_KEYWORDS)
