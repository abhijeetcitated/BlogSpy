"use client"

import { cn } from "@/lib/utils"
import { COMMUNITY_PLATFORM_CONFIG, COMMUNITY_PLATFORMS } from "../constants"
import type { CommunityPlatform } from "../types"

// Custom Reddit Icon
function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  )
}

// Custom Quora Icon
function QuoraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.738 18.394c-.723-1.474-1.566-2.984-3.016-2.984-.467 0-.936.12-1.273.36l-.478-.815c.623-.538 1.562-.894 2.783-.894 2.005 0 3.256 1.147 4.26 2.855.398-1.052.609-2.362.609-3.904 0-4.796-1.803-7.93-5.595-7.93-3.787 0-5.678 3.134-5.678 7.93 0 4.804 1.896 7.813 5.678 7.813.793 0 1.514-.113 2.156-.335l-.446-2.096zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.028 21.473c-5.339 0-9.664-3.796-9.664-9.46 0-5.655 4.325-9.534 9.664-9.534 5.337 0 9.577 3.879 9.577 9.534 0 2.03-.478 3.776-1.3 5.17.64 1.066 1.378 1.706 2.397 1.706.452 0 .789-.112 1.029-.28l.418.875c-.483.395-1.16.664-2.113.664-1.803 0-3.063-.952-3.988-2.391-1.142.925-2.564 1.716-4.02 1.716h-2z"/>
    </svg>
  )
}

interface CommunityPlatformTabsProps {
  activePlatform: CommunityPlatform
  onPlatformChange: (platform: CommunityPlatform) => void
  stats?: Record<CommunityPlatform, { count: number }>
}

const PLATFORM_ICONS: Record<CommunityPlatform, React.ReactNode> = {
  reddit: <RedditIcon className="w-4 h-4" />,
  quora: <QuoraIcon className="w-4 h-4" />,
}

export function CommunityPlatformTabs({ activePlatform, onPlatformChange, stats }: CommunityPlatformTabsProps) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-card p-1 w-fit">
      {COMMUNITY_PLATFORMS.map((platform) => {
        const config = COMMUNITY_PLATFORM_CONFIG[platform]
        const isActive = activePlatform === platform
        const platformStats = stats?.[platform]
        
        return (
          <button
            key={platform}
            onClick={() => onPlatformChange(platform)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all border",
              isActive
                ? platform === "reddit"
                  ? "bg-orange-500/20 text-orange-500 border-orange-500/50"
                  : "bg-red-500/20 text-red-500 border-red-500/50"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center",
                platform === "reddit" ? "text-orange-500" : "text-red-500"
              )}
            >
              {PLATFORM_ICONS[platform]}
            </span>
            <span>{config.name}</span>
            {platformStats && (
              <span className={cn(
                "text-xs font-semibold px-1.5 py-0.5 rounded-md min-w-[20px] text-center",
                platform === "reddit"
                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
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
