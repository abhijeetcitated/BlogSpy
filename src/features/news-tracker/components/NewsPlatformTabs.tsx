"use client"

import { cn } from "@/lib/utils"
import { NEWS_PLATFORM_CONFIG, NEWS_PLATFORMS } from "../constants"
import type { NewsPlatform } from "../types"

interface NewsPlatformTabsProps {
  activePlatform: NewsPlatform
  onPlatformChange: (platform: NewsPlatform) => void
  stats?: Record<NewsPlatform, { count: number }>
}

// Real Google News SVG Icon
const GoogleNewsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="10" fill="#4285F4"/>
    <rect x="7" y="8" width="10" height="2" rx="1" fill="white"/>
    <rect x="7" y="11" width="7" height="2" rx="1" fill="white"/>
    <rect x="7" y="14" width="10" height="2" rx="1" fill="white"/>
  </svg>
)

// Real Google Discover SVG Icon  
const GoogleDiscoverIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="10" fill="#EA4335"/>
    <path d="M12 6l1.5 3.5 3.5 1.5-3.5 1.5L12 16l-1.5-3.5L7 11l3.5-1.5L12 6z" fill="white"/>
    <circle cx="12" cy="12" r="2" fill="#FBBC05"/>
  </svg>
)

const PLATFORM_ICONS: Record<NewsPlatform, React.ReactNode> = {
  "google-news": <GoogleNewsIcon className="w-4 h-4" />,
  "google-discover": <GoogleDiscoverIcon className="w-4 h-4" />,
}

export function NewsPlatformTabs({ activePlatform, onPlatformChange, stats }: NewsPlatformTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border w-fit">
      {NEWS_PLATFORMS.map((platform) => {
        const config = NEWS_PLATFORM_CONFIG[platform]
        const isActive = activePlatform === platform
        const platformStats = stats?.[platform]
        
        return (
          <button
            key={platform}
            onClick={() => onPlatformChange(platform)}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all",
              isActive
                ? platform === "google-news" 
                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-sm"
                  : "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
            )}
          >
            <span className="flex items-center justify-center">
              {PLATFORM_ICONS[platform]}
            </span>
            <span>{config.name}</span>
            {platformStats && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                isActive 
                  ? platform === "google-news"
                    ? "bg-blue-500/30 text-blue-600 dark:text-blue-300"
                    : "bg-red-500/30 text-red-600 dark:text-red-300"
                  : "bg-muted text-muted-foreground"
              )}>
                {platformStats.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// Platform Badge
export function NewsPlatformBadge({ 
  platform, 
  size = "sm" 
}: { 
  platform: NewsPlatform
  size?: "xs" | "sm" | "md"
}) {
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6",
  }
  
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md",
        sizeClasses[size]
      )}
      title={NEWS_PLATFORM_CONFIG[platform].name}
    >
      {PLATFORM_ICONS[platform]}
    </span>
  )
}
