// Content ROI Tracker Types
// 100% UNIQUE feature - Track actual ROI of every blog post

export interface ContentArticle {
  id: string
  title: string
  url: string
  slug: string
  publishDate: string
  wordCount: number
  category: string
  author: string
  status: 'published' | 'draft' | 'archived'
}

export interface ArticleTraffic {
  articleId: string
  pageviews: number
  uniqueVisitors: number
  avgTimeOnPage: number // in seconds
  bounceRate: number // 0-100
  organicTraffic: number
  referralTraffic: number
  socialTraffic: number
  directTraffic: number
}

export interface ArticleRevenue {
  articleId: string
  adRevenue: number
  affiliateRevenue: number
  sponsoredRevenue: number
  totalRevenue: number
  rpm: number // Revenue per 1000 pageviews
}

export interface ArticleCost {
  articleId: string
  writingCost: number
  editingCost: number
  imagesCost: number
  promotionCost: number
  toolsCost: number
  totalCost: number
  costSource: 'manual' | 'estimated' | 'ai-calculated'
}

export interface ArticleROI {
  articleId: string
  article: ContentArticle
  traffic: ArticleTraffic
  revenue: ArticleRevenue
  cost: ArticleCost
  // Calculated metrics
  roi: number // (revenue - cost) / cost * 100
  profit: number // revenue - cost
  profitMargin: number // profit / revenue * 100
  costPerPageview: number
  revenuePerPageview: number
  breakEvenPageviews: number
  daysToBreakEven: number | null
  isProfit: boolean
  performanceScore: number // 0-100 score based on multiple factors
}

export interface ROIDashboardStats {
  totalArticles: number
  profitableArticles: number
  unprofitableArticles: number
  totalRevenue: number
  totalCost: number
  totalProfit: number
  overallROI: number
  avgROIPerArticle: number
  avgRevenuePerArticle: number
  avgCostPerArticle: number
  topPerformerROI: number
  worstPerformerROI: number
}

export interface ROITrendData {
  month: string
  revenue: number
  cost: number
  profit: number
  roi: number
  articleCount: number
}

export interface ContentCostSettings {
  // Default costs per article
  avgWritingCostPerWord: number
  avgEditingCostPerArticle: number
  avgImageCostPerArticle: number
  avgPromotionCostPerArticle: number
  monthlyToolsCost: number
  articleCountForToolsCost: number // Divide monthly tools by this
  // Writer type rates
  writerRates: {
    self: number // Per word
    freelancer: number
    agency: number
    aiAssisted: number
  }
}

export interface ROIFilterOptions {
  dateRange: 'all' | '7d' | '30d' | '90d' | '1y'
  category: string | null
  profitability: 'all' | 'profitable' | 'unprofitable' | 'break-even'
  sortBy: 'roi' | 'revenue' | 'cost' | 'profit' | 'pageviews' | 'date'
  sortOrder: 'asc' | 'desc'
}

export type PerformanceTier = 'star' | 'profitable' | 'break-even' | 'underperforming' | 'loss'

export interface ArticlePerformanceGroup {
  tier: PerformanceTier
  label: string
  description: string
  color: string
  icon: string
  count: number
  articles: ArticleROI[]
}
