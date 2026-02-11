export interface DashboardStats {
  rankCount: number
  avgRank: number
  rankDelta: number
  decayCount: number
  creditUsed: number
  creditTotal: number
  trendName: string
  trendGrowth: number
  recentLogs: {
    id: string
    actionType: string
    description: string
    createdAt: string
  }[]
}
