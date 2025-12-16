// ============================================
// MONETIZATION - Utility Functions
// ============================================

import { 
  BlogNiche, 
  AdNetwork, 
  MonthlyProjection, 
  EarningsBreakdown,
  CalculatorInputs,
  CalculatorResults 
} from "../types"
import { BLOG_NICHES, AD_NETWORKS } from "../constants"

/**
 * Get niche by ID
 */
export function getNicheById(nicheId: string): BlogNiche | undefined {
  return BLOG_NICHES.find(n => n.id === nicheId)
}

/**
 * Calculate effective RPM based on niche and network
 */
export function calculateEffectiveRpm(
  niche: BlogNiche,
  network: AdNetwork | null
): number {
  const nicheMultiplier = niche.avgRpm / 20 // Normalize to average niche
  const baseRpm = network ? network.avgRpm : 15 // Default if no network
  return Math.round(baseRpm * nicheMultiplier)
}

/**
 * Get recommended ad networks based on traffic
 */
export function getRecommendedNetworks(monthlyPageviews: number): AdNetwork[] {
  return AD_NETWORKS.filter(network => network.minTraffic <= monthlyPageviews)
    .sort((a, b) => b.avgRpm - a.avgRpm)
}

/**
 * Calculate monthly earnings
 */
export function calculateMonthlyEarnings(pageviews: number, rpm: number): number {
  return Math.round((pageviews / 1000) * rpm)
}

/**
 * Generate 12-month projections with growth (January to December)
 */
export function generateProjections(
  startingPageviews: number,
  rpm: number,
  monthlyGrowthRate: number = 0.05 // 5% default growth
): MonthlyProjection[] {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]
  
  const projections: MonthlyProjection[] = []
  
  let currentTraffic = startingPageviews
  
  // Always start from January (index 0) and go through December
  for (let i = 0; i < 12; i++) {
    const earnings = calculateMonthlyEarnings(currentTraffic, rpm)
    
    projections.push({
      month: months[i],
      traffic: Math.round(currentTraffic),
      earnings,
      rpm,
    })
    
    currentTraffic *= (1 + monthlyGrowthRate)
  }
  
  return projections
}

/**
 * Generate earnings breakdown by network
 */
export function generateBreakdown(
  monthlyPageviews: number,
  niche: BlogNiche,
  eligibleNetworks: AdNetwork[]
): EarningsBreakdown[] {
  return eligibleNetworks.map(network => {
    const effectiveRpm = calculateEffectiveRpm(niche, network)
    const monthlyEarnings = calculateMonthlyEarnings(monthlyPageviews, effectiveRpm)
    
    return {
      adNetwork: network.name,
      estimatedRpm: effectiveRpm,
      monthlyEarnings,
      yearlyEarnings: monthlyEarnings * 12,
    }
  })
}

/**
 * Main calculator function
 */
export function calculateEarnings(inputs: CalculatorInputs): CalculatorResults {
  const niche = getNicheById(inputs.niche) || BLOG_NICHES[4] // Default to tech
  const recommendedNetworks = getRecommendedNetworks(inputs.monthlyPageviews)
  const bestNetwork = recommendedNetworks[0] || AD_NETWORKS[0]
  
  const estimatedRpm = inputs.customRpm || calculateEffectiveRpm(niche, inputs.adNetwork || bestNetwork)
  const monthlyEarnings = calculateMonthlyEarnings(inputs.monthlyPageviews, estimatedRpm)
  
  return {
    estimatedRpm,
    monthlyEarnings,
    yearlyEarnings: monthlyEarnings * 12,
    dailyEarnings: Math.round(monthlyEarnings / 30),
    projections: generateProjections(inputs.monthlyPageviews, estimatedRpm),
    breakdown: generateBreakdown(inputs.monthlyPageviews, niche, recommendedNetworks),
    recommendedNetworks,
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format large numbers (1K, 10K, 1M)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`
  }
  return num.toString()
}
