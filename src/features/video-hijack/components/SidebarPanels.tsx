"use client"

import { Badge } from "@/components/ui/badge"
import { Target, Users, Lightbulb } from "lucide-react"
import { VIDEO_SEO_TIPS } from "../constants"
import { getOpportunityColor } from "../utils/video-utils"
import type { VideoHijackKeyword, DominantChannel } from "../types"

interface TopOpportunitiesProps {
  opportunities: VideoHijackKeyword[]
}

export function TopOpportunities({ opportunities }: TopOpportunitiesProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Target className="w-4 h-4 text-emerald-500" />
        </div>
        Top Video Opportunities
      </h3>
      <div className="space-y-3">
        {opportunities.slice(0, 5).map((kw, i) => (
          <div key={kw.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-500">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{kw.keyword}</div>
              <div className="text-xs text-muted-foreground">
                {kw.searchVolume.toLocaleString()}/mo
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getOpportunityColor(kw.opportunityLevel)}`}
            >
              {kw.opportunityScore}%
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

interface DominantChannelsProps {
  channels: DominantChannel[]
}

export function DominantChannels({ channels }: DominantChannelsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <Users className="w-4 h-4 text-purple-500" />
        </div>
        Dominant Channels
      </h3>
      <div className="space-y-3">
        {channels.slice(0, 5).map((channel, i) => (
          <div key={channel.channel} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-500">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{channel.channel}</div>
              <div className="text-xs text-muted-foreground">
                {channel.count} keywords | Avg pos {channel.avgPosition}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function QuickTips() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
        </div>
        Video SEO Tips
      </h3>
      <div className="space-y-2">
        {VIDEO_SEO_TIPS.map((tip, i) => (
          <div key={i} className="text-xs text-muted-foreground flex items-start gap-2 p-2 rounded-lg bg-muted/30">
            <span className="text-yellow-500 mt-0.5">!</span>
            {tip}
          </div>
        ))}
      </div>
    </div>
  )
}

interface SidebarPanelsProps {
  opportunities: VideoHijackKeyword[]
  channels: DominantChannel[]
}

export function SidebarPanels({ opportunities, channels }: SidebarPanelsProps) {
  return (
    <div className="space-y-4">
      <TopOpportunities opportunities={opportunities} />
      <DominantChannels channels={channels} />
      <QuickTips />
    </div>
  )
}
