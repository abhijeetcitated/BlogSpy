"use client"

// ============================================
// KEYWORD TABLE - Row Component (Streamlined 10 Columns)
// ============================================

import Link from "next/link"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkline, KDRing } from "@/components/charts"
import { 
  Bot, 
  MessageSquare,
  Video,
  FileText,
  ImageIcon,
  HelpCircle,
  ShoppingCart,
  Map,
  Star,
  Newspaper,
  RefreshCw,
  CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"

import type { Keyword } from "../../types"
import { INTENT_CONFIG } from "../../constants/table-config"

interface KeywordTableRowProps {
  item: Keyword
  index: number
  isSelected: boolean
  onSelect: (id: number) => void
  onRefresh?: (id: number) => void
}

export function KeywordTableRow({ item, index, isSelected, onSelect, onRefresh }: KeywordTableRowProps) {
  return (
    <tr
      className={cn(
        "border-b border-border hover:bg-muted/50 transition-colors",
        index % 2 === 1 && "bg-muted/20",
        isSelected && "bg-primary/5 hover:bg-primary/10",
      )}
    >
      {/* 1. Checkbox */}
      <td className="px-2 py-2 align-middle">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(item.id)}
          aria-label={`Select ${item.keyword}`}
        />
      </td>

      {/* 2. Keyword */}
      <td className="pl-2 py-2 align-middle font-medium text-foreground">
        <Link
          href={`/dashboard/research/overview/${encodeURIComponent(item.keyword)}`}
          className="text-sm font-semibold hover:text-primary transition-colors"
        >
          {item.keyword}
        </Link>
      </td>

      {/* 3. Intent */}
      <td className="p-2 align-middle text-center">
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

      {/* 4. Volume */}
      <td className="p-2 align-middle text-center font-mono text-sm tabular-nums">
        {item.volume.toLocaleString()}
      </td>

      {/* 5. Trend */}
      <td className="p-2 align-middle text-center">
        <div className="flex justify-center">
          <Sparkline data={item.trend} />
        </div>
      </td>

      {/* 6. KD % */}
      <td className="p-2 align-middle text-center">
        <div className="flex items-center justify-center">
          <KDRing value={item.kd} />
        </div>
      </td>

      {/* 7. CPC */}
      <td className="p-2 align-middle text-center font-mono text-sm tabular-nums">
        ${item.cpc.toFixed(2)}
      </td>

      {/* 8. Weak Spot */}
      <td className="p-2 align-middle text-center">
        {item.weakSpot.type ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-default",
                  "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30",
                )}
              >
                <MessageSquare className="h-3 w-3" />
                {item.weakSpot.type === "reddit" ? "Reddit" : "Quora"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="font-medium">{item.weakSpot.type === "reddit" ? "Reddit" : "Quora"} ranks #{item.weakSpot.rank}</p>
              <p className="text-muted-foreground">Easy to outrank!</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground/50 text-xs">—</span>
        )}
      </td>

      {/* 9. GEO Score */}
      <td className="p-2 align-middle text-center">
        {item.geoScore !== undefined && item.geoScore > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn(
                "inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-semibold",
                item.geoScore >= 70 ? "bg-emerald-500/20 text-emerald-500" :
                item.geoScore >= 40 ? "bg-amber-500/20 text-amber-500" :
                "bg-red-500/20 text-red-500"
              )}>
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
      </td>

      {/* 10. SERP Features */}
      <td className="p-2 align-middle text-center">
        {item.serpFeatures && item.serpFeatures.length > 0 ? (
          <div className="flex items-center justify-center gap-0.5 flex-wrap">
            {item.serpFeatures.slice(0, 3).map((feature, idx) => (
              <Tooltip key={feature + idx}>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "inline-flex items-center justify-center w-5 h-5 cursor-default",
                    feature === 'video' && "text-red-500",
                    feature === 'snippet' && "text-amber-500",
                    feature === 'image' && "text-pink-500",
                    feature === 'faq' && "text-blue-500",
                    feature === 'shopping' && "text-green-500",
                    feature === 'local' && "text-orange-500",
                    feature === 'reviews' && "text-yellow-500",
                    feature === 'news' && "text-cyan-500",
                    feature === 'ai_overview' && "text-indigo-400"
                  )}>
                    {feature === 'video' && <Video className="h-3.5 w-3.5" />}
                    {feature === 'snippet' && <FileText className="h-3.5 w-3.5" />}
                    {feature === 'image' && <ImageIcon className="h-3.5 w-3.5" />}
                    {feature === 'faq' && <HelpCircle className="h-3.5 w-3.5" />}
                    {feature === 'shopping' && <ShoppingCart className="h-3.5 w-3.5" />}
                    {feature === 'local' && <Map className="h-3.5 w-3.5" />}
                    {feature === 'reviews' && <Star className="h-3.5 w-3.5" />}
                    {feature === 'news' && <Newspaper className="h-3.5 w-3.5" />}
                    {feature === 'ai_overview' && <Bot className="h-3.5 w-3.5" />}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs capitalize">
                  {feature.replace('_', ' ')}
                </TooltipContent>
              </Tooltip>
            ))}
            {item.serpFeatures.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{item.serpFeatures.length - 3}</span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground/50 text-xs">—</span>
        )}
      </td>

      {/* 11. Refresh */}
      <td className="p-2 align-middle text-center">
        <div className="flex flex-col items-center gap-1">
          {item.isRefreshing ? (
            <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
          ) : (
            <>
              {item.lastUpdated && new Date().getTime() - item.lastUpdated.getTime() < 3000 ? (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">Done</span>
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => onRefresh?.(item.id)}
                      className="p-1.5 text-orange-500 hover:text-orange-600 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">Refresh metrics</p>
                    <p className="text-muted-foreground">Last: {item.lastUpdated ? item.lastUpdated.toLocaleDateString() : "Never"}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
