"use client"

import { cn } from "@/lib/utils"
import { Youtube, Music } from "lucide-react"
import { VIDEO_PLATFORM_CONFIG, VIDEO_PLATFORMS } from "../constants/platforms"
import type { VideoPlatformType } from "../types/platforms"

interface VideoPlatformTabsProps {
  activePlatform: VideoPlatformType
  onPlatformChange: (platform: VideoPlatformType) => void
  stats?: Record<VideoPlatformType, { keywords: number; avgHijackScore: number }>
}

const PLATFORM_ICONS: Record<VideoPlatformType, React.ReactNode> = {
  youtube: <Youtube className="w-4 h-4" />,
  tiktok: <Music className="w-4 h-4" />,
}

export function VideoPlatformTabs({ activePlatform, onPlatformChange, stats }: VideoPlatformTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border">
      {VIDEO_PLATFORMS.map((platform) => {
        const config = VIDEO_PLATFORM_CONFIG[platform]
        const isActive = activePlatform === platform
        const platformStats = stats?.[platform]
        
        return (
          <button
            key={platform}
            onClick={() => onPlatformChange(platform)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              isActive
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-lg transition-colors",
                isActive ? config.bgColor : "bg-muted"
              )}
              style={{ color: isActive ? config.color : undefined }}
            >
              {PLATFORM_ICONS[platform]}
            </span>
            <span>{config.name}</span>
            {platformStats && (
              <span className="text-xs text-muted-foreground">
                ({platformStats.keywords})
              </span>
            )}
            {platform === "tiktok" && (
              <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full font-semibold">
                NEW
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// Platform Badge
export function VideoPlatformBadge({ 
  platform, 
  size = "sm" 
}: { 
  platform: VideoPlatformType
  size?: "xs" | "sm" | "md"
}) {
  const config = VIDEO_PLATFORM_CONFIG[platform]
  const sizeClasses = {
    xs: "w-4 h-4 text-[10px]",
    sm: "w-5 h-5 text-xs",
    md: "w-6 h-6 text-sm",
  }
  
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg",
        config.bgColor,
        sizeClasses[size]
      )}
      style={{ color: config.color }}
      title={config.name}
    >
      {config.icon}
    </span>
  )
}

// Platform Comparison Card
export function VideoPlatformComparison({ 
  youtube, 
  tiktok 
}: { 
  youtube: { avgHijackScore: number; keywords: number }
  tiktok: { avgHijackScore: number; keywords: number }
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* YouTube */}
      <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-red-500/10">
            <Youtube className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-sm font-semibold text-foreground">YouTube</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Keywords</span>
            <span className="text-sm font-medium text-foreground">{youtube.keywords}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Avg Hijack</span>
            <span className={cn(
              "text-sm font-bold",
              youtube.avgHijackScore >= 70 ? "text-red-500" : 
              youtube.avgHijackScore >= 50 ? "text-amber-500" : "text-emerald-500"
            )}>
              {youtube.avgHijackScore}%
            </span>
          </div>
        </div>
      </div>

      {/* TikTok */}
      <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-cyan-500/10">
            <Music className="w-4 h-4 text-cyan-500" />
          </div>
          <span className="text-sm font-semibold text-foreground">TikTok</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full font-semibold">
            NEW
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Keywords</span>
            <span className="text-sm font-medium text-foreground">{tiktok.keywords}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Avg Hijack</span>
            <span className={cn(
              "text-sm font-bold",
              tiktok.avgHijackScore >= 70 ? "text-red-500" : 
              tiktok.avgHijackScore >= 50 ? "text-amber-500" : "text-emerald-500"
            )}>
              {tiktok.avgHijackScore}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
