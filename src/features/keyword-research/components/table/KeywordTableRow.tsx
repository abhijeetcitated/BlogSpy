"use client"

// ============================================
// KEYWORD TABLE - Row Component (Streamlined 10 Columns)
// ============================================

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkline, KDRing } from "@/components/charts"
import {
  Bot,
  Video,
  FileText,
  ImageIcon,
  ShoppingCart,
  MapPin,
  Newspaper,
  HelpCircle,
  Star,
  Megaphone,
  ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

import type { Keyword } from "../../types"
import { INTENT_CONFIG } from "../../constants/table-config"
import { WeakSpotColumn } from "./columns/weak-spot/weak-spot-column"
import { RefreshColumn } from "./columns/refresh"

interface KeywordTableRowProps {
  item: Keyword
  index: number
  isSelected: boolean
  onSelect: (id: number) => void
  onKeywordClick?: (keyword: Keyword) => void
}

export function KeywordTableRow({ item, index, isSelected, onSelect, onKeywordClick }: KeywordTableRowProps) {
  // Row click handler - opens drawer
  const handleRowClick = () => {
    onKeywordClick?.(item)
  }
  const hasAio = item.hasAio ?? item.serpFeatures?.includes("ai_overview")
  const displaySerpFeatures = item.serpFeatures || []

  return (
    <tr
      onClick={handleRowClick}
      className={cn(
        "border-b border-border transition-colors cursor-pointer group",
        index % 2 === 1 && "bg-muted/10",
        isSelected && "bg-amber-500/10",
      )}
    >
      {/* 1. Checkbox */}
      <td
        className="px-2 py-2 align-middle text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(item.id)}
            aria-label={`Select ${item.keyword}`}
          />
        </div>
      </td>

      {/* 2. Keyword - Left aligned for readability */}
      <td className="px-2 py-2 align-middle font-medium text-foreground text-left">
        <span
          className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:text-amber-400 transition-colors"
        >
          {item.keyword}
          <ArrowUpRight
            className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-amber-400 transition-all"
          />
        </span>
      </td>

      {/* 3. Intent - Center aligned */}
      <td className="px-2 py-2 align-middle text-center">
        <div className="flex items-center justify-center gap-0.5">
          {item.intent.map((int, idx) => (
            <Tooltip key={int + idx}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-semibold border cursor-default",
                    INTENT_CONFIG[int].color,
                  )}
                >
                  {INTENT_CONFIG[int].label}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {INTENT_CONFIG[int].tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </td>

      {/* 4. Volume - Center aligned */}
      <td className="px-2 py-2 align-middle text-center">
        <div className="flex items-center justify-center font-mono text-sm tabular-nums">
          {item.volume.toLocaleString()}
        </div>
      </td>

      {/* 5. Trend - Center aligned */}
      <td className="px-2 py-2 align-middle text-center">
        <div className="flex items-center justify-center">
          <Sparkline data={item.trend} />
        </div>
      </td>

      {/* 6. KD % - Center aligned */}
      <td className="px-2 py-2 align-middle text-center">
        <div className="flex items-center justify-center">
          <KDRing value={item.kd} />
        </div>
      </td>

      {/* 7. CPC - Center aligned */}
      <td className="px-2 py-2 align-middle text-center">
        <div className="flex items-center justify-center font-mono text-sm tabular-nums">
          ${item.cpc.toFixed(2)}
        </div>
      </td>

      {/* 8. Weak Spot (All 3 Platforms) - Center aligned */}
      <td className="px-2 py-2 align-middle text-center">
        <div className="flex items-center justify-center">
          <WeakSpotColumn weakSpots={item.weakSpots} />
        </div>
      </td>

      {/* 9. GEO Score - Center aligned */}
      <td className="px-2 py-2 align-middle text-center">
        <div className="flex items-center justify-center">
          {item.geoScore !== undefined && item.geoScore > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn(
                  "inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold",
                  item.geoScore >= 70 ? "bg-emerald-500/20 text-emerald-500" :
                  item.geoScore >= 40 ? "bg-amber-500/20 text-amber-500" :
                  "bg-red-500/20 text-red-500"
                )}>
                  {hasAio && <Bot className="h-3 w-3" />}
                  {item.geoScore}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-medium">GEO Score: {item.geoScore}/100</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.geoScore >= 70 ? "High potential to appear in AI answers" :
                   item.geoScore >= 40 ? "Moderate AI visibility potential" :
                   "Low AI visibility - focus on traditional SEO"}
                </p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground/50 text-xs">—</span>
          )}
        </div>
      </td>

      {/* 10. SERP Features - Center aligned */}
      <td className="px-2 py-2 align-middle text-center">
        <div className="flex items-center justify-center">
          {displaySerpFeatures.length > 0 ? (
            <div className="flex items-center justify-center gap-0.5 flex-wrap">
              {displaySerpFeatures.slice(0, 3).map((feature, idx) => {
                const getFeatureIcon = () => {
                  switch (feature) {
                    case 'ai_overview': return <Bot className="h-3.5 w-3.5" />
                    case 'video': return <Video className="h-3.5 w-3.5" />
                    case 'snippet':
                    case 'featured_snippet': return <FileText className="h-3.5 w-3.5" />
                    case 'image': return <ImageIcon className="h-3.5 w-3.5" />
                    case 'shopping': return <ShoppingCart className="h-3.5 w-3.5" />
                    case 'local': return <MapPin className="h-3.5 w-3.5" />
                    case 'news': return <Newspaper className="h-3.5 w-3.5" />
                    case 'faq': return <HelpCircle className="h-3.5 w-3.5" />
                    case 'reviews': return <Star className="h-3.5 w-3.5" />
                    case 'ad': return <Megaphone className="h-3.5 w-3.5" />
                    default: return <FileText className="h-3.5 w-3.5" />
                  }
                }
                const getFeatureColor = () => {
                  switch (feature) {
                    case 'ai_overview': return 'text-indigo-400'
                    case 'video': return 'text-red-500'
                    case 'snippet':
                    case 'featured_snippet': return 'text-amber-500'
                    case 'image': return 'text-pink-400'
                    case 'shopping': return 'text-green-400'
                    case 'local': return 'text-orange-400'
                    case 'news': return 'text-cyan-400'
                    case 'faq': return 'text-blue-400'
                    case 'reviews': return 'text-yellow-400'
                    case 'ad': return 'text-yellow-500'
                    default: return 'text-muted-foreground'
                  }
                }
                const getFeatureLabel = () => {
                  switch (feature) {
                    case 'ai_overview': return 'AI Overview'
                    case 'snippet':
                    case 'featured_snippet': return 'Featured Snippet'
                    case 'faq': return 'FAQ / PAA'
                    default: return feature.charAt(0).toUpperCase() + feature.slice(1)
                  }
                }
                return (
                  <Tooltip key={`${feature}-${idx}`}>
                    <TooltipTrigger asChild>
                      <span className={cn("inline-flex items-center justify-center w-5 h-5 cursor-default", getFeatureColor())}>
                        {getFeatureIcon()}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {getFeatureLabel()}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
              {displaySerpFeatures.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{displaySerpFeatures.length - 3}</span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground/50 text-xs">—</span>
          )}
        </div>
      </td>

      {/* 11. Refresh - Center aligned */}
      <td
        className="px-2 py-2 align-middle text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <RefreshColumn
          id={String(item.id)}
          keyword={item.keyword}
          lastUpdated={
            item.lastUpdated instanceof Date
              ? item.lastUpdated.toISOString()
              : item.lastUpdated ?? null
          }
        />
      </td>

    </tr>
  )
}
