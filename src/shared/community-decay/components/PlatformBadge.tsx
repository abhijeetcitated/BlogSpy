"use client"

import { cn } from "@/lib/utils"
import {
  type CommunityPlatform,
  PLATFORM_INFO,
  getCommunityDecayLevel,
  getCommunityDecayColor,
  formatAge,
} from "@/types/community-decay.types"

// ============================================
// PLATFORM BADGE
// ============================================

export interface PlatformBadgeProps {
  platform: CommunityPlatform
  ageInDays: number
  rank?: number
  className?: string
}

export function PlatformBadge({
  platform,
  ageInDays,
  rank,
  className,
}: PlatformBadgeProps) {
  const platformInfo = PLATFORM_INFO[platform]
  const decayLevel = getCommunityDecayLevel(ageInDays)

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-lg",
        platformInfo.bgColor,
        className
      )}
    >
      <span className="text-lg">{platformInfo.icon}</span>
      <div className="flex flex-col">
        <span className={cn("text-xs font-medium", platformInfo.color)}>
          {platformInfo.name}
          {rank && <span className="ml-1 opacity-70">#{rank}</span>}
        </span>
        <span className={cn("text-xs", getCommunityDecayColor(decayLevel))}>
          {formatAge(ageInDays)} old
        </span>
      </div>
    </div>
  )
}
