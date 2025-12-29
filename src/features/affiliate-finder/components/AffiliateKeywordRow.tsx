"use client"

/**
 * AffiliateKeywordRow - Individual keyword row component
 * 
 * Extracted from AffiliateFinderDashboard.tsx for better maintainability
 * Original location: Lines 750-937 (~187 lines)
 * 
 * Performance: Uses React.memo to prevent unnecessary re-renders
 */

import { memo } from "react"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarPlus,
  Pencil,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatNumber, getAffiliateTier } from "../utils"
import { BUYER_INTENT_CONFIG, INTENT_MODIFIERS } from "../constants"
import { CONTENT_TYPE_CONFIG, PROGRAM_ICONS } from "../constants/icons"
import type { AffiliateKeyword } from "../types"

// ============================================
// Types
// ============================================

export interface AffiliateKeywordRowProps {
  keyword: AffiliateKeyword
  isAddedToCalendar: boolean
  isCopied: boolean
  onWriteArticle: () => void
  onAddToCalendar: () => void
  onCopy: () => void
  onViewSerp: () => void
}

// ============================================
// Component (wrapped with memo for performance)
// ============================================

function AffiliateKeywordRowComponent({ 
  keyword, 
  isAddedToCalendar, 
  isCopied,
  onWriteArticle, 
  onAddToCalendar, 
  onCopy,
  onViewSerp,
}: AffiliateKeywordRowProps) {
  const intentConfig = BUYER_INTENT_CONFIG[keyword.buyerIntent]
  const affiliateTier = getAffiliateTier(keyword.affiliateScore)
  const contentType = CONTENT_TYPE_CONFIG[keyword.contentType]
  const ContentIcon = contentType?.icon || Sparkles

  return (
    <div className="px-3 sm:px-6 py-4 hover:bg-muted/30 transition-colors overflow-hidden">
      <div className="flex items-start gap-2 sm:gap-4">
        {/* Affiliate Score */}
        <div className={`p-2 sm:p-3 rounded-xl ${affiliateTier.bg} shrink-0 text-center min-w-[50px] sm:min-w-[60px]`}>
          <span className={`text-lg sm:text-xl font-bold ${affiliateTier.color}`}>{keyword.affiliateScore}</span>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Score</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {/* Keyword & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground text-sm sm:text-base break-words">
                {keyword.keyword}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {/* Intent Badge */}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${intentConfig.bgColor} ${intentConfig.color}`}>
                  {intentConfig.label}
                </span>
                {/* Modifiers */}
                {keyword.modifiers.slice(0, 2).map(mod => {
                  const modConfig = INTENT_MODIFIERS[mod]
                  return (
                    <span 
                      key={mod} 
                      className="px-2 py-0.5 rounded-full text-[10px] bg-muted/50 text-muted-foreground"
                      title={modConfig.description}
                    >
                      {modConfig.label}
                    </span>
                  )
                })}
                {/* Content Type */}
                <span className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/10",
                  contentType?.color || "text-purple-400"
                )}>
                  <ContentIcon className="h-3 w-3" />
                  {contentType?.label}
                </span>
              </div>
            </div>

            {/* Monthly Earnings */}
            <div className="text-left sm:text-right shrink-0">
              <p className="text-lg sm:text-xl font-bold text-emerald-400">
                {formatCurrency(keyword.estimatedEarnings.monthly)}
              </p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Est. Monthly</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mt-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Volume</p>
              <p className="font-mono text-sm font-semibold text-foreground flex items-center gap-1">
                {formatNumber(keyword.searchVolume)}
                {keyword.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-400" />}
                {keyword.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-400" />}
                {keyword.trend === 'stable' && <Minus className="h-3 w-3 text-muted-foreground" />}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">KD</p>
              <p className={`font-mono text-sm font-semibold ${
                keyword.keywordDifficulty < 40 ? 'text-emerald-400' : 
                keyword.keywordDifficulty < 60 ? 'text-amber-400' : 'text-red-400'
              }`}>{keyword.keywordDifficulty}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">CPC</p>
              <p className="font-mono text-sm font-semibold text-cyan-400">${keyword.cpc.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Commission</p>
              <p className="font-mono text-sm font-semibold text-purple-400">{formatCurrency(keyword.estimatedCommission)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Conversion</p>
              <p className={`text-sm font-semibold capitalize ${
                keyword.conversionPotential === 'high' ? 'text-emerald-400' :
                keyword.conversionPotential === 'medium' ? 'text-amber-400' : 'text-red-400'
              }`}>{keyword.conversionPotential}</p>
            </div>
          </div>

          {/* Programs & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 pt-3 border-t border-border gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Programs:</span>
              {keyword.suggestedPrograms.slice(0, 3).map(program => {
                const programIcon = PROGRAM_ICONS[program.id]
                const ProgramIconComponent = programIcon?.icon || ExternalLink
                return (
                  <span 
                    key={program.id} 
                    className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-muted/50 text-[10px] sm:text-xs"
                  >
                    <ProgramIconComponent className={cn("h-2.5 w-2.5 sm:h-3 sm:w-3", programIcon?.color || "text-muted-foreground")} />
                    <span className="text-foreground">{program.name}</span>
                  </span>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1 self-end sm:self-auto">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 sm:h-8 px-2 sm:px-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs sm:text-sm"
                onClick={onWriteArticle}
              >
                <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                Write
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 sm:h-8 sm:w-8 p-0 ${isAddedToCalendar ? 'text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={onAddToCalendar}
                disabled={isAddedToCalendar}
              >
                {isAddedToCalendar ? (
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <CalendarPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 sm:h-8 sm:w-8 p-0 ${isCopied ? 'text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={onCopy}
              >
                {isCopied ? (
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={onViewSerp}
              >
                <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export memoized component to prevent unnecessary re-renders
export const AffiliateKeywordRow = memo(AffiliateKeywordRowComponent)
export default AffiliateKeywordRow
