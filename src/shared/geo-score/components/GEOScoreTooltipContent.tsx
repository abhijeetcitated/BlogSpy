"use client"

import { GEOScoreRingProps, getGEOOpportunityLevel } from "@/types/geo.types"
import { Sparkles, Clock, Shield, Video, FileText } from "lucide-react"

/**
 * Tooltip content for GEO Score
 */
export function GEOScoreTooltipContent({ 
  score, 
  components 
}: { 
  score: number
  components?: GEOScoreRingProps["components"]
}) {
  const opportunity = getGEOOpportunityLevel(score)
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span className="font-semibold text-white">GEO Score: {score}/100</span>
      </div>
      
      <p className="text-xs text-slate-300">
        {opportunity === "high" && "🎯 HIGH opportunity to get cited by AI! Target this keyword."}
        {opportunity === "medium" && "⚡ MEDIUM opportunity. Worth targeting with optimized content."}
        {opportunity === "low" && "📊 LOW opportunity. AI citations are well-established."}
        {opportunity === "none" && "🔒 Difficult to displace current AI citations."}
      </p>
      
      {components && (
        <div className="pt-2 border-t border-slate-700 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Citation Age
            </span>
            <span className="text-slate-200">{components.citationFreshness}/25</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Authority Gap
            </span>
            <span className="text-slate-200">{components.authorityWeakness}/25</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Video className="w-3 h-3" /> Media Gap
            </span>
            <span className="text-slate-200">{components.mediaGap}/25</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Text Quality
            </span>
            <span className="text-slate-200">{components.textQuality}/25</span>
          </div>
        </div>
      )}
    </div>
  )
}
