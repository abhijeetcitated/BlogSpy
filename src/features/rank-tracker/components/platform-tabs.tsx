"use client"

import { cn } from "@/lib/utils"
import { PLATFORM_CONFIG, SEARCH_PLATFORMS } from "../constants/platforms"
import type { SearchPlatform } from "../types/platforms"
import { GoogleIcon, BingIcon, YahooIcon, DuckDuckGoIcon } from "./platform-icons"

interface PlatformTabsProps {
  activePlatform: SearchPlatform
  onPlatformChange: (platform: SearchPlatform) => void
  stats?: Record<SearchPlatform, { tracked: number; avgRank: number }>
}

const PLATFORM_ICONS: Record<SearchPlatform, React.ReactNode> = {
  google: <GoogleIcon size={16} />,
  bing: <BingIcon size={16} />,
  yahoo: <YahooIcon size={16} />,
  duckduckgo: <DuckDuckGoIcon size={16} />,
}

export function PlatformTabs({ activePlatform, onPlatformChange, stats }: PlatformTabsProps) {
  return (
    <div className="flex w-full sm:inline-flex sm:w-auto items-center rounded-lg border border-border bg-card p-1">
      {SEARCH_PLATFORMS.map((platform) => {
        const config = PLATFORM_CONFIG[platform]
        const isActive = activePlatform === platform
        const platformStats = stats?.[platform]
        const hasKeywords = platformStats && platformStats.tracked > 0
        
        return (
          <button
            key={platform}
            onClick={() => onPlatformChange(platform)}
            className={cn(
              "flex flex-1 sm:flex-initial items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all border",
              isActive
                ? "border-opacity-50"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
            style={{
              borderColor: isActive ? `${config.color}80` : undefined,
              backgroundColor: isActive ? `${config.color}20` : undefined,
              color: isActive ? config.color : undefined,
            }}
          >
            <span
              className={cn(
                "flex items-center justify-center",
                isActive ? "" : ""
              )}
              style={{ color: isActive ? config.color : undefined }}
            >
              {PLATFORM_ICONS[platform]}
            </span>
            <span className="hidden sm:inline">{config.name}</span>
            {platformStats && (
              <span 
                className={cn(
                  "text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                  hasKeywords
                    ? "text-white"
                    : "bg-muted text-muted-foreground"
                )}
                style={{
                  backgroundColor: hasKeywords ? (isActive ? config.color : '#10b981') : undefined,
                }}
              >
                {platformStats.tracked}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// Individual Platform Badge
export function PlatformBadge({ 
  platform, 
  size = "sm" 
}: { 
  platform: SearchPlatform
  size?: "xs" | "sm" | "md"
}) {
  const config = PLATFORM_CONFIG[platform]
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6",
  }
  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
  }
  
  const icons: Record<SearchPlatform, React.ReactNode> = {
    google: <GoogleIcon size={iconSizes[size]} />,
    bing: <BingIcon size={iconSizes[size]} />,
    yahoo: <YahooIcon size={iconSizes[size]} />,
    duckduckgo: <DuckDuckGoIcon size={iconSizes[size]} />,
  }
  
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md",
        config.bgColor,
        sizeClasses[size]
      )}
      title={config.name}
    >
      {icons[platform]}
    </span>
  )
}

// Platform Selector Dropdown
export function PlatformSelector({
  selectedPlatforms,
  onSelectionChange,
}: {
  selectedPlatforms: SearchPlatform[]
  onSelectionChange: (platforms: SearchPlatform[]) => void
}) {
  const togglePlatform = (platform: SearchPlatform) => {
    if (selectedPlatforms.includes(platform)) {
      onSelectionChange(selectedPlatforms.filter((p) => p !== platform))
    } else {
      onSelectionChange([...selectedPlatforms, platform])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {SEARCH_PLATFORMS.map((platform) => {
        const config = PLATFORM_CONFIG[platform]
        const isSelected = selectedPlatforms.includes(platform)
        
        return (
          <button
            key={platform}
            onClick={() => togglePlatform(platform)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all border",
              isSelected
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-border bg-muted/50 text-muted-foreground hover:border-border/80"
            )}
          >
            {PLATFORM_ICONS[platform]}
            <span>{config.name}</span>
            {isSelected && (
              <span className="text-emerald-400">✓</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
