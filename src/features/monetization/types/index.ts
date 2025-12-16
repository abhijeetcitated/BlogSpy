// ============================================
// MONETIZATION - Types
// ============================================

export interface BlogNiche {
  id: string
  name: string
  icon: string
  avgRpm: number
  minRpm: number
  maxRpm: number
  description: string
}

export interface AdNetwork {
  id: string
  name: string
  logo: string
  minTraffic: number
  avgRpm: number
  requirements: string
  approvalDifficulty: "Easy" | "Medium" | "Hard"
}

export interface MonthlyProjection {
  month: string
  traffic: number
  earnings: number
  rpm: number
}

export interface EarningsBreakdown {
  adNetwork: string
  estimatedRpm: number
  monthlyEarnings: number
  yearlyEarnings: number
}

export interface CalculatorInputs {
  niche: string
  monthlyPageviews: number
  adNetwork: AdNetwork | null
  customRpm: number | null
}

export interface CalculatorResults {
  estimatedRpm: number
  monthlyEarnings: number
  yearlyEarnings: number
  dailyEarnings: number
  projections: MonthlyProjection[]
  breakdown: EarningsBreakdown[]
  recommendedNetworks: AdNetwork[]
}

export interface TrafficMilestone {
  pageviews: number
  label: string
  networks: string[]
  avgEarnings: string
}
