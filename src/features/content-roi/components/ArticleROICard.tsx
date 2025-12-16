"use client"

import { 
  ExternalLink, 
  Calendar, 
  Eye, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
} from "lucide-react"
import { ArticleROI, PerformanceTier } from "../types"
import { PERFORMANCE_TIERS, CONTENT_CATEGORIES, PerformanceIcons, CategoryIcons } from "../constants"
import { formatCurrency, formatPercent, formatNumber, getPerformanceTier } from "../utils"

interface ArticleROICardProps {
  data: ArticleROI
}

export function ArticleROICard({ data }: ArticleROICardProps) {
  const tier = getPerformanceTier(data.roi)
  const tierConfig = PERFORMANCE_TIERS[tier]
  const category = CONTENT_CATEGORIES.find(c => c.id === data.article.category)

  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-5 hover:border-border/80 transition-colors overflow-hidden">
      <div className="flex items-start gap-2 sm:gap-4">
        {/* Performance Icon */}
        <div className={`p-2 sm:p-3 rounded-xl ${tierConfig.bgColor} shrink-0 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6`}>
          {PerformanceIcons[tier]()}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                {data.article.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {new Date(data.article.publishDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="hidden xs:flex items-center gap-1">
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {data.article.wordCount.toLocaleString()} words
                </span>
                {category && (
                  <span className="hidden sm:flex items-center gap-1">
                    <span className="text-muted-foreground">{CategoryIcons[category.id] ? CategoryIcons[category.id]() : null}</span>
                    {category.name}
                  </span>
                )}
              </div>
            </div>

            {/* ROI Badge */}
            <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg ${tierConfig.bgColor} shrink-0`}>
              <span className={`font-mono font-bold text-sm sm:text-base ${tierConfig.color}`}>
                {formatPercent(data.roi)}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">ROI</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 mt-3 sm:mt-4">
            {/* Traffic */}
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">Pageviews</span>
                <span className="xs:hidden">Views</span>
              </div>
              <p className="font-mono font-semibold text-xs sm:text-sm text-foreground">
                {formatNumber(data.traffic.pageviews)}
              </p>
            </div>

            {/* Revenue */}
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />
                Revenue
              </div>
              <p className="font-mono font-semibold text-xs sm:text-sm text-emerald-400">
                {formatCurrency(data.revenue.totalRevenue)}
              </p>
            </div>

            {/* Cost */}
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500" />
                Cost
              </div>
              <p className="font-mono font-semibold text-xs sm:text-sm text-red-400">
                {formatCurrency(data.cost.totalCost)}
              </p>
            </div>

            {/* Profit - Hidden on very small mobile */}
            <div className="space-y-0.5 sm:space-y-1 hidden sm:block">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Profit
              </div>
              <p className={`font-mono font-semibold text-xs sm:text-sm ${data.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(data.profit)}
              </p>
            </div>

            {/* RPM - Hidden on very small mobile */}
            <div className="space-y-0.5 sm:space-y-1 hidden sm:block">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                RPM
              </div>
              <p className="font-mono font-semibold text-xs sm:text-sm text-cyan-400">
                ${data.revenue.rpm.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Ads:</span>
                <span className="font-mono text-foreground">{formatCurrency(data.revenue.adRevenue)}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500" />
                <span className="text-muted-foreground">Aff:</span>
                <span className="font-mono text-foreground">{formatCurrency(data.revenue.affiliateRevenue)}</span>
              </div>
              {data.revenue.sponsoredRevenue > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-500" />
                  <span className="text-muted-foreground">Spon:</span>
                  <span className="font-mono text-foreground">{formatCurrency(data.revenue.sponsoredRevenue)}</span>
                </div>
              )}
              <a 
                href={data.article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
              >
                <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden xs:inline">View</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
