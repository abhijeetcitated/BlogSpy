"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { 
  Star, 
  Package,
  DollarSign,
  Zap,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  ShoppingCart,
  TrendingUp,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Eye,
} from "lucide-react"
import { COMMERCE_INTENT_COLORS } from "../constants"
import type { CommerceKeyword } from "../types"

interface CommerceKeywordCardProps {
  keyword: CommerceKeyword
  isSelected?: boolean
  onSelect?: () => void
  onDelete?: () => void
}

export function CommerceKeywordCard({ keyword, isSelected, onSelect, onDelete }: CommerceKeywordCardProps) {
  const intentConfig = COMMERCE_INTENT_COLORS[keyword.commerceIntent]
  const data = keyword.platforms.amazon
  
  if (!data) return null

  const amazonSearchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword.keyword)}`

  return (
    <Card className={cn(
      "bg-card border-border hover:border-amber-500/40 transition-all group",
      isSelected && "ring-2 ring-amber-500/50 border-amber-500/50"
    )}>
      <CardContent className="p-2.5 sm:p-3 md:p-4">
        {/* Header Row */}
        <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3 mb-2.5 sm:mb-3 md:mb-4">
          {/* Checkbox - Always Visible */}
          {onSelect && (
            <div 
              className="shrink-0 pt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                className="!h-3 !w-3 sm:!h-3 sm:!w-3 md:!h-3.5 md:!w-3.5 lg:!h-4 lg:!w-4 border border-muted-foreground/40 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
            </div>
          )}
          
          {/* Keyword Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-[13px] sm:text-sm md:text-base leading-tight mb-1 sm:mb-1 md:mb-1.5 line-clamp-2">
              {keyword.keyword}
            </h3>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <Badge className={cn(intentConfig.bg, intentConfig.text, "text-[9px] sm:text-[10px] md:text-[11px] px-1 sm:px-1.5 py-0 sm:py-0.5 font-medium")}>
                {intentConfig.label}
              </Badge>
              <Badge className={cn(
                "text-[9px] sm:text-[10px] md:text-[11px] px-1 sm:px-1.5 py-0 sm:py-0.5 font-medium",
                data.opportunity === "high" ? "bg-emerald-500/20 text-emerald-400" :
                data.opportunity === "medium" ? "bg-amber-500/20 text-amber-400" :
                "bg-red-500/20 text-red-400"
              )}>
                <TrendingUp className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
                {data.opportunity.charAt(0).toUpperCase() + data.opportunity.slice(1)}
              </Badge>
            </div>
          </div>
          
          {/* Position + Actions */}
          <div className="flex items-start gap-1 sm:gap-1.5 md:gap-2 shrink-0">
            {/* Position Badge */}
            {data.position && (
              <div className="flex flex-col items-center gap-0.5">
                <div className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center text-xs sm:text-sm md:text-base font-bold",
                  data.position <= 3 ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30" :
                  data.position <= 10 ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30" :
                  data.position <= 20 ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30" :
                  "bg-muted text-muted-foreground"
                )}>
                  #{data.position}
                </div>
                {data.positionChange !== 0 && (
                  <div className={cn(
                    "flex items-center text-[9px] sm:text-[10px] md:text-xs font-semibold",
                    data.positionChange > 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {data.positionChange > 0 ? <ArrowUp className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" /> : <ArrowDown className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />}
                    {Math.abs(data.positionChange)}
                  </div>
                )}
              </div>
            )}
            
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-6 sm:w-6 md:h-7 md:w-7 p-0 opacity-100 sm:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 sm:w-40">
                <DropdownMenuItem onClick={() => window.open(amazonSearchUrl, "_blank")} className="text-xs sm:text-sm">
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  View on Amazon
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs sm:text-sm">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400 text-xs sm:text-sm">
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Meta Info */}
        <p className="text-[11px] sm:text-[11px] md:text-xs text-muted-foreground mb-2 sm:mb-2.5 md:mb-3">
          <span className="font-medium text-foreground">{keyword.searchVolume.toLocaleString()}</span> searches • {keyword.category}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 py-2 sm:py-2.5 md:py-3 border-y border-border">
          <div className="flex flex-col items-center sm:flex-col md:flex-row md:items-center gap-0.5 sm:gap-1 md:gap-2">
            <div className="p-1 sm:p-1 md:p-1.5 rounded bg-green-500/10 shrink-0">
              <DollarSign className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-green-400" />
            </div>
            <div className="text-center sm:text-center md:text-left">
              <p className="text-[10px] sm:text-[10px] md:text-xs font-semibold text-foreground">${data.avgPrice}</p>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground hidden md:block">Price</p>
            </div>
          </div>
          <div className="flex flex-col items-center sm:flex-col md:flex-row md:items-center gap-0.5 sm:gap-1 md:gap-2">
            <div className="p-1 sm:p-1 md:p-1.5 rounded bg-yellow-500/10 shrink-0">
              <Star className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-yellow-400" />
            </div>
            <div className="text-center sm:text-center md:text-left">
              <p className="text-[10px] sm:text-[10px] md:text-xs font-semibold text-foreground">{data.avgRating}</p>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground hidden md:block">Rating</p>
            </div>
          </div>
          <div className="flex flex-col items-center sm:flex-col md:flex-row md:items-center gap-0.5 sm:gap-1 md:gap-2">
            <div className="p-1 sm:p-1 md:p-1.5 rounded bg-blue-500/10 shrink-0">
              <MessageSquare className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-blue-400" />
            </div>
            <div className="text-center sm:text-center md:text-left">
              <p className="text-[10px] sm:text-[10px] md:text-xs font-semibold text-foreground">{data.reviewVelocity}</p>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground hidden md:block">Reviews</p>
            </div>
          </div>
          <div className="flex flex-col items-center sm:flex-col md:flex-row md:items-center gap-0.5 sm:gap-1 md:gap-2">
            <div className="p-1 sm:p-1 md:p-1.5 rounded bg-purple-500/10 shrink-0">
              <Zap className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-purple-400" />
            </div>
            <div className="text-center sm:text-center md:text-left">
              <p className="text-[10px] sm:text-[10px] md:text-xs font-semibold text-foreground">{data.sponsored}</p>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground hidden md:block">Sponsored</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 sm:pt-2.5 md:pt-3">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Package className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[10px] sm:text-[10px] md:text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{data.primePercentage}%</span> Prime
            </span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 bg-green-500/10 px-1.5 sm:px-1.5 md:px-2 py-0.5 rounded">
            <span className="text-[9px] sm:text-[9px] md:text-[10px] text-muted-foreground">CPC:</span>
            <span className="text-[10px] sm:text-[10px] md:text-xs font-bold text-green-400">${keyword.cpc}</span>
          </div>
        </div>

        {/* Our Product Badge */}
        {data.hasOurProduct && (
          <div className="mt-2 sm:mt-2.5 md:mt-3 pt-2 sm:pt-2.5 md:pt-3 border-t border-border">
            <Badge className="bg-blue-500/20 text-blue-400 text-[9px] sm:text-[10px] md:text-[11px] px-1.5 sm:px-1.5 md:px-2 py-0.5">
              <ShoppingCart className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 mr-0.5 sm:mr-0.5 md:mr-1" />
              Our Product
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Keyword List - Single Column for Uniform Look
export function CommerceKeywordList({ keywords }: { keywords: CommerceKeyword[] }) {
  const filteredKeywords = keywords.filter(k => k.platforms.amazon)
  
  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {filteredKeywords.map((keyword) => (
        <CommerceKeywordCard key={keyword.id} keyword={keyword} />
      ))}
    </div>
  )
}
