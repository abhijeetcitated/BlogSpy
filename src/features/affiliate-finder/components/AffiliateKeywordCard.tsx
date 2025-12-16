"use client"

import { 
  ExternalLink, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  BarChart2,
  ShoppingBag,
  FileText,
  Minus,
} from "lucide-react"
import { AffiliateKeyword } from "../types"
import { BUYER_INTENT_CONFIG, INTENT_MODIFIERS } from "../constants"
import { formatCurrency, formatNumber, getAffiliateTier } from "../utils"

interface AffiliateKeywordCardProps {
  data: AffiliateKeyword
}

const CONTENT_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  review: { label: "Review Article", icon: "⭐" },
  comparison: { label: "Comparison Post", icon: "⚖️" },
  roundup: { label: "Best X Roundup", icon: "🏆" },
  "deals-page": { label: "Deals/Coupon Page", icon: "🏷️" },
  tutorial: { label: "Tutorial/Guide", icon: "📚" },
  "buying-guide": { label: "Buying Guide", icon: "🛒" },
}

export function AffiliateKeywordCard({ data }: AffiliateKeywordCardProps) {
  const intentConfig = BUYER_INTENT_CONFIG[data.buyerIntent]
  const affiliateTier = getAffiliateTier(data.affiliateScore)
  const contentType = CONTENT_TYPE_LABELS[data.contentType]

  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:border-purple-500/30 transition-colors">
      <div className="flex items-start gap-4">
        {/* Affiliate Score Badge */}
        <div className={`p-3 rounded-xl ${affiliateTier.bg} shrink-0 text-center min-w-[70px]`}>
          <span className={`text-2xl font-bold ${affiliateTier.color}`}>{data.affiliateScore}</span>
          <p className="text-xs text-muted-foreground mt-0.5">Score</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Keyword & Intent */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-lg">
                {data.keyword}
              </h3>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {/* Intent Badge */}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${intentConfig.bgColor} ${intentConfig.color}`}>
                  {intentConfig.label}
                </span>
                {/* Modifiers */}
                {data.modifiers.map(mod => (
                  <span key={mod} className="text-xs text-muted-foreground flex items-center gap-1">
                    {INTENT_MODIFIERS[mod].icon} {INTENT_MODIFIERS[mod].label}
                  </span>
                ))}
                {/* Content Type Suggestion */}
                <span className="text-xs text-purple-400 flex items-center gap-1">
                  {contentType.icon} {contentType.label}
                </span>
              </div>
            </div>

            {/* Estimated Earnings */}
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Est. Monthly</p>
              <p className="text-xl font-bold text-emerald-400">
                {formatCurrency(data.estimatedEarnings.monthly)}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
            {/* Volume */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
                Volume
              </div>
              <p className="font-mono font-semibold text-foreground flex items-center gap-1">
                {formatNumber(data.searchVolume)}
                {data.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-400" />}
                {data.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-400" />}
                {data.trend === 'stable' && <Minus className="h-3 w-3 text-muted-foreground" />}
              </p>
            </div>

            {/* KD */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BarChart2 className="h-3.5 w-3.5" />
                Difficulty
              </div>
              <p className={`font-mono font-semibold ${
                data.keywordDifficulty < 40 ? 'text-emerald-400' : 
                data.keywordDifficulty < 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {data.keywordDifficulty}
              </p>
            </div>

            {/* CPC */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                CPC
              </div>
              <p className="font-mono font-semibold text-cyan-400">
                ${data.cpc.toFixed(2)}
              </p>
            </div>

            {/* Commission */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShoppingBag className="h-3.5 w-3.5" />
                Commission
              </div>
              <p className="font-mono font-semibold text-purple-400">
                {formatCurrency(data.estimatedCommission)}
              </p>
            </div>

            {/* Conversion */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Conversion
              </div>
              <p className={`font-semibold ${
                data.conversionPotential === 'high' ? 'text-emerald-400' :
                data.conversionPotential === 'medium' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {data.conversionPotential.charAt(0).toUpperCase() + data.conversionPotential.slice(1)}
              </p>
            </div>

            {/* Competition */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Affiliates
              </div>
              <p className="font-mono font-semibold text-foreground">
                {data.competitorAffiliates} sites
              </p>
            </div>
          </div>

          {/* Suggested Programs */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">Suggested Programs:</span>
                <div className="flex items-center gap-3">
                  {data.suggestedPrograms.slice(0, 4).map(program => (
                    <span 
                      key={program.id} 
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 text-sm"
                    >
                      <span>{program.logo}</span>
                      <span className="text-foreground">{program.name}</span>
                      <span className="text-xs text-muted-foreground">({program.commissionRate})</span>
                    </span>
                  ))}
                </div>
              </div>
              <button className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                <ExternalLink className="h-3.5 w-3.5" />
                Research
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
