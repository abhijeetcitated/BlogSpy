"use client"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { GEOScoreBreakdownProps } from "@/types/geo.types"
import { Clock, Shield, Video, FileText, Info } from "lucide-react"

/**
 * GEO Score Breakdown - Detailed component view
 */
export function GEOScoreBreakdown({
  components,
  citationSources = [],
  recommendations = [],
}: GEOScoreBreakdownProps) {
  const componentItems = [
    {
      label: "Citation Freshness",
      value: components.citationFreshness,
      max: 25,
      icon: Clock,
      description: "How old are AI's current citations?",
      color: components.citationFreshness >= 15 ? "emerald" : components.citationFreshness >= 10 ? "amber" : "slate"
    },
    {
      label: "Authority Weakness",
      value: components.authorityWeakness,
      max: 25,
      icon: Shield,
      description: "Are weak sources (Reddit/Quora) being cited?",
      color: components.authorityWeakness >= 15 ? "emerald" : components.authorityWeakness >= 10 ? "amber" : "slate"
    },
    {
      label: "Media Gap",
      value: components.mediaGap,
      max: 25,
      icon: Video,
      description: "Is video/image content missing?",
      color: components.mediaGap >= 15 ? "emerald" : components.mediaGap >= 10 ? "amber" : "slate"
    },
    {
      label: "Text Quality",
      value: components.textQuality,
      max: 25,
      icon: FileText,
      description: "Is the AI answer short/generic?",
      color: components.textQuality >= 15 ? "emerald" : components.textQuality >= 10 ? "amber" : "slate"
    },
  ]

  return (
    <div className="space-y-4">
      {/* Component Breakdown */}
      <div className="grid gap-3">
        {componentItems.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-200">{item.label}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-slate-500" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-900 border-slate-700">
                      <p className="text-xs max-w-48">{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className={cn(
                "text-sm font-medium",
                item.color === "emerald" && "text-emerald-400",
                item.color === "amber" && "text-amber-400",
                item.color === "slate" && "text-slate-400"
              )}>
                {item.value}/{item.max}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  item.color === "emerald" && "bg-emerald-500",
                  item.color === "amber" && "bg-amber-500",
                  item.color === "slate" && "bg-slate-500"
                )}
                style={{ width: `${(item.value / item.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Citation Sources */}
      {citationSources.length > 0 && (
        <div className="pt-3 border-t border-slate-700">
          <h4 className="text-xs font-medium text-slate-400 mb-2">Current AI Citations</h4>
          <div className="flex flex-wrap gap-1.5">
            {citationSources.map((source, i) => (
              <span
                key={i}
                className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  source.type === "reddit" && "bg-orange-500/20 text-orange-300",
                  source.type === "quora" && "bg-red-500/20 text-red-300",
                  source.type === "forum" && "bg-amber-500/20 text-amber-300",
                  source.type === "blog" && "bg-blue-500/20 text-blue-300",
                  source.type === "news" && "bg-purple-500/20 text-purple-300",
                  source.type === "official" && "bg-emerald-500/20 text-emerald-300",
                  !["reddit", "quora", "forum", "blog", "news", "official"].includes(source.type) && 
                    "bg-slate-500/20 text-slate-300"
                )}
              >
                {source.domain} ({source.age}d old)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="pt-3 border-t border-slate-700">
          <h4 className="text-xs font-medium text-slate-400 mb-2">Recommendations</h4>
          <ul className="space-y-1.5">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
