// Content ROI Utility Functions

import { 
  ArticleROI, 
  ArticleRevenue, 
  ArticleCost, 
  ArticleTraffic,
  ContentArticle,
  ROIDashboardStats,
  ROITrendData,
  PerformanceTier,
  ArticlePerformanceGroup,
  ContentCostSettings
} from "../types"
import { PERFORMANCE_TIERS, DEFAULT_COST_SETTINGS, SAMPLE_ARTICLES } from "../constants"

// Calculate ROI for a single article
export function calculateArticleROI(
  article: ContentArticle,
  traffic: ArticleTraffic,
  revenue: ArticleRevenue,
  cost: ArticleCost
): ArticleROI {
  const totalRevenue = revenue.totalRevenue
  const totalCost = cost.totalCost
  const profit = totalRevenue - totalCost
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
  const costPerPageview = traffic.pageviews > 0 ? totalCost / traffic.pageviews : 0
  const revenuePerPageview = traffic.pageviews > 0 ? totalRevenue / traffic.pageviews : 0
  
  // Calculate break-even pageviews
  const breakEvenPageviews = revenuePerPageview > 0 
    ? Math.ceil(totalCost / revenuePerPageview)
    : Infinity

  // Calculate days to break even (assuming current traffic rate continues)
  const publishDate = new Date(article.publishDate)
  const now = new Date()
  const daysSincePublish = Math.max(1, Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24)))
  const dailyPageviews = traffic.pageviews / daysSincePublish
  const daysToBreakEven = profit < 0 && dailyPageviews > 0 && revenuePerPageview > 0
    ? Math.ceil((totalCost - totalRevenue) / (dailyPageviews * revenuePerPageview))
    : null

  // Calculate performance score (0-100)
  const performanceScore = calculatePerformanceScore(roi, profitMargin, traffic.pageviews, revenue.rpm)

  return {
    articleId: article.id,
    article,
    traffic,
    revenue,
    cost,
    roi,
    profit,
    profitMargin,
    costPerPageview,
    revenuePerPageview,
    breakEvenPageviews,
    daysToBreakEven,
    isProfit: profit > 0,
    performanceScore,
  }
}

// Calculate performance score based on multiple factors
function calculatePerformanceScore(
  roi: number,
  profitMargin: number,
  pageviews: number,
  rpm: number
): number {
  // ROI score (40% weight) - normalized to 0-100
  const roiScore = Math.min(100, Math.max(0, (roi + 100) / 4))
  
  // Profit margin score (20% weight)
  const marginScore = Math.min(100, Math.max(0, profitMargin + 20))
  
  // Traffic score (20% weight) - logarithmic scale
  const trafficScore = Math.min(100, Math.log10(pageviews + 1) * 20)
  
  // RPM score (20% weight)
  const rpmScore = Math.min(100, rpm * 2)

  return Math.round(
    roiScore * 0.4 +
    marginScore * 0.2 +
    trafficScore * 0.2 +
    rpmScore * 0.2
  )
}

// Get performance tier for an article
export function getPerformanceTier(roi: number): PerformanceTier {
  if (roi >= 200) return "star"
  if (roi >= 50) return "profitable"
  if (roi >= 0) return "break-even"
  if (roi >= -50) return "underperforming"
  return "loss"
}

// Group articles by performance tier
export function groupArticlesByPerformance(articles: ArticleROI[]): ArticlePerformanceGroup[] {
  const groups: Record<PerformanceTier, ArticleROI[]> = {
    star: [],
    profitable: [],
    "break-even": [],
    underperforming: [],
    loss: [],
  }

  articles.forEach(article => {
    const tier = getPerformanceTier(article.roi)
    groups[tier].push(article)
  })

  return Object.entries(PERFORMANCE_TIERS).map(([tier, config]) => ({
    tier: tier as PerformanceTier,
    label: config.label,
    description: config.description,
    color: config.color,
    icon: config.icon,
    count: groups[tier as PerformanceTier].length,
    articles: groups[tier as PerformanceTier].sort((a, b) => b.roi - a.roi),
  }))
}

// Calculate dashboard stats
export function calculateDashboardStats(articles: ArticleROI[]): ROIDashboardStats {
  if (articles.length === 0) {
    return {
      totalArticles: 0,
      profitableArticles: 0,
      unprofitableArticles: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      overallROI: 0,
      avgROIPerArticle: 0,
      avgRevenuePerArticle: 0,
      avgCostPerArticle: 0,
      topPerformerROI: 0,
      worstPerformerROI: 0,
    }
  }

  const totalRevenue = articles.reduce((sum, a) => sum + a.revenue.totalRevenue, 0)
  const totalCost = articles.reduce((sum, a) => sum + a.cost.totalCost, 0)
  const totalProfit = totalRevenue - totalCost
  const profitableArticles = articles.filter(a => a.isProfit).length
  const rois = articles.map(a => a.roi).sort((a, b) => b - a)

  return {
    totalArticles: articles.length,
    profitableArticles,
    unprofitableArticles: articles.length - profitableArticles,
    totalRevenue,
    totalCost,
    totalProfit,
    overallROI: totalCost > 0 ? (totalProfit / totalCost) * 100 : 0,
    avgROIPerArticle: articles.reduce((sum, a) => sum + a.roi, 0) / articles.length,
    avgRevenuePerArticle: totalRevenue / articles.length,
    avgCostPerArticle: totalCost / articles.length,
    topPerformerROI: rois[0] || 0,
    worstPerformerROI: rois[rois.length - 1] || 0,
  }
}

// Estimate article cost based on settings
export function estimateArticleCost(
  wordCount: number,
  writerType: keyof ContentCostSettings['writerRates'] = 'freelancer',
  settings: ContentCostSettings = DEFAULT_COST_SETTINGS
): ArticleCost {
  const writingCost = wordCount * settings.writerRates[writerType]
  const editingCost = settings.avgEditingCostPerArticle
  const imagesCost = settings.avgImageCostPerArticle
  const promotionCost = settings.avgPromotionCostPerArticle
  const toolsCost = settings.monthlyToolsCost / settings.articleCountForToolsCost

  return {
    articleId: '',
    writingCost,
    editingCost,
    imagesCost,
    promotionCost,
    toolsCost,
    totalCost: writingCost + editingCost + imagesCost + promotionCost + toolsCost,
    costSource: 'estimated',
  }
}

// Generate sample ROI data for demo
export function generateSampleROIData(): ArticleROI[] {
  return SAMPLE_ARTICLES.map(sample => {
    const article: ContentArticle = {
      id: sample.id,
      title: sample.title,
      url: sample.url,
      slug: sample.url.replace('/', ''),
      publishDate: sample.publishDate,
      wordCount: sample.wordCount,
      category: sample.category,
      author: 'You',
      status: 'published',
    }

    const traffic: ArticleTraffic = {
      articleId: sample.id,
      pageviews: sample.pageviews,
      uniqueVisitors: Math.floor(sample.pageviews * 0.75),
      avgTimeOnPage: 180 + Math.random() * 120,
      bounceRate: 40 + Math.random() * 30,
      organicTraffic: Math.floor(sample.pageviews * 0.7),
      referralTraffic: Math.floor(sample.pageviews * 0.15),
      socialTraffic: Math.floor(sample.pageviews * 0.1),
      directTraffic: Math.floor(sample.pageviews * 0.05),
    }

    const totalRevenue = sample.adRevenue + sample.affiliateRevenue
    const revenue: ArticleRevenue = {
      articleId: sample.id,
      adRevenue: sample.adRevenue,
      affiliateRevenue: sample.affiliateRevenue,
      sponsoredRevenue: 0,
      totalRevenue,
      rpm: (totalRevenue / sample.pageviews) * 1000,
    }

    const cost: ArticleCost = {
      articleId: sample.id,
      writingCost: sample.writingCost,
      editingCost: 25,
      imagesCost: 15,
      promotionCost: sample.totalCost - sample.writingCost - 40,
      toolsCost: 10,
      totalCost: sample.totalCost,
      costSource: 'manual',
    }

    return calculateArticleROI(article, traffic, revenue, cost)
  })
}

// Generate monthly trend data
export function generateTrendData(articles: ArticleROI[]): ROITrendData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return months.map((month, index) => {
    // Simulate growing trend
    const multiplier = 1 + (index * 0.08)
    const baseRevenue = 600
    const baseCost = 350
    
    const revenue = Math.round(baseRevenue * multiplier * (0.9 + Math.random() * 0.2))
    const cost = Math.round(baseCost * (0.95 + Math.random() * 0.1))
    const profit = revenue - cost
    
    return {
      month,
      revenue,
      cost,
      profit,
      roi: ((revenue - cost) / cost) * 100,
      articleCount: Math.floor(2 + index * 0.5),
    }
  })
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

// Format percentage
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

// Format number with K/M suffix
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
