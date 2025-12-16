"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkline, KDRing } from "@/components/charts"
import { GEOScoreBadge } from "@/components/ui/geo-score-ring"
import { RTVMini } from "@/components/ui/rtv-badge"
import { AIOverviewMini } from "@/components/ui/ai-overview-card"
import { CommunityDecayMini } from "@/components/ui/community-decay-badge"
import { VideoOppMini, CommerceOppMini, SocialOppMini } from "@/components/ui/platform-opportunity-badges"
import { generateMockGEOScore } from "@/lib/geo-calculator"
import { generateMockRTV } from "@/lib/rtv-calculator"
import { generateMockAIOverviewAnalysis } from "@/lib/ai-overview-analyzer"
import { generateMockCommunityDecayForId } from "@/lib/community-decay-calculator"
import { generateMockVideoOpportunity } from "@/lib/video-opportunity-calculator"
import { generateMockCommerceOpportunity } from "@/lib/commerce-opportunity-calculator"
import { generateMockSocialOpportunity } from "@/lib/social-opportunity-calculator"
import { Plus, Eye, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

import type { Keyword } from "../types"
import { INTENT_CONFIG, SERP_ICONS } from "../constants/table-config"

interface KeywordTableRowProps {
  item: Keyword
  index: number
  isSelected: boolean
  onSelect: (id: number) => void
}

export function KeywordTableRow({ item, index, isSelected, onSelect }: KeywordTableRowProps) {
  const rtvData = generateMockRTV(item.id, item.volume)
  const aioData = generateMockAIOverviewAnalysis(item.keyword, item.weakSpot.type !== null)
  const decayData = generateMockCommunityDecayForId(item.id, item.keyword)
  const videoData = generateMockVideoOpportunity(item.id, item.keyword)
  const commerceData = generateMockCommerceOpportunity(item.id, item.keyword, item.intent)
  const socialData = generateMockSocialOpportunity(item.id, item.keyword)

  return (
    <tr
      className={cn(
        "border-b border-border hover:bg-muted/50 transition-colors",
        index % 2 === 1 && "bg-muted/20",
        isSelected && "bg-primary/5 hover:bg-primary/10",
      )}
    >
      <td className="p-2 align-middle">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(item.id)}
          aria-label={`Select ${item.keyword}`}
        />
      </td>

      <td className="p-2 align-middle font-medium text-foreground">
        <div className="flex items-center gap-1.5 group w-[160px]">
          <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted transition-all shrink-0">
            <Plus className="h-3 w-3 text-muted-foreground" />
          </button>
          <Link
            href={`/dashboard/research/overview/${encodeURIComponent(item.keyword)}`}
            className="text-sm font-semibold truncate hover:text-primary transition-colors"
          >
            {item.keyword}
          </Link>
        </div>
      </td>

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

      <td className="p-2 align-middle text-right font-mono text-sm tabular-nums">
        {item.volume.toLocaleString()}
      </td>

      <td className="p-2 align-middle text-right">
        <RTVMini 
          rtv={rtvData.rtv} 
          rawVolume={item.volume} 
          opportunityLevel={rtvData.opportunityLevel} 
        />
      </td>

      <td className="p-2 align-middle text-center">
        <Sparkline data={item.trend} />
      </td>

      <td className="p-2 align-middle text-center">
        {item.weakSpot.type ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium cursor-default",
                  "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30",
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Forum Found
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

      <td className="p-2 align-middle text-center">
        <GEOScoreBadge score={item.geoScore ?? generateMockGEOScore(item.id)} />
      </td>

      <td className="p-2 align-middle text-center">
        <AIOverviewMini 
          hasAIOverview={aioData.hasAIOverview}
          isCited={aioData.yourContent.isCited}
          citationPosition={aioData.yourContent.citationPosition}
          opportunityScore={aioData.opportunityScore}
        />
      </td>

      <td className="p-2 align-middle text-center">
        <CommunityDecayMini analysis={decayData} />
      </td>

      <td className="p-2 align-middle text-center">
        <VideoOppMini data={videoData} />
      </td>

      <td className="p-2 align-middle text-center">
        <CommerceOppMini data={commerceData} />
      </td>

      <td className="p-2 align-middle text-center">
        <SocialOppMini data={socialData} />
      </td>

      <td className="p-2 align-middle text-center">
        <div className="flex items-center justify-center">
          <KDRing value={item.kd} />
        </div>
      </td>

      <td className="p-2 align-middle text-right font-mono text-sm tabular-nums">${item.cpc.toFixed(2)}</td>

      <td className="p-2 align-middle">
        <div className="flex items-center gap-1.5">
          {item.serpFeatures.map((feature) => (
            <Tooltip key={feature}>
              <TooltipTrigger asChild>
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">
                  {SERP_ICONS[feature]?.icon}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {SERP_ICONS[feature]?.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </td>

      <td className="p-2 align-middle text-right">
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="sm" className="h-7 px-2.5 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary">
            <Link href={`/dashboard/research/overview/${encodeURIComponent(item.keyword)}`}>
              <Eye className="h-3 w-3" />
              Analyze
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-7 px-2.5 text-xs gap-1.5 hover:bg-emerald-500/10 hover:text-emerald-400">
            <Link href={`/dashboard/creation/ai-writer?topic=${encodeURIComponent(item.keyword)}`}>
              <Pencil className="h-3 w-3" />
              Write
            </Link>
          </Button>
        </div>
      </td>
    </tr>
  )
}
