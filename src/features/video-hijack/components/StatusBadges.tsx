"use client"

import { Badge } from "@/components/ui/badge"
import type { VideoOpportunityLevel, VideoPresence } from "../types"
import { 
  getOpportunityColor, 
  getOpportunityBgColor, 
  getPresenceColor, 
  getPresenceBgColor,
  getPresenceLabel 
} from "../utils/video-utils"

interface OpportunityBadgeProps {
  level: VideoOpportunityLevel
}

export function OpportunityBadge({ level }: OpportunityBadgeProps) {
  if (level === "none") return null
  
  return (
    <Badge 
      variant="secondary" 
      className={`${getOpportunityColor(level)} ${getOpportunityBgColor(level)}`}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)} Opportunity
    </Badge>
  )
}

interface PresenceBadgeProps {
  presence: VideoPresence
}

export function PresenceBadge({ presence }: PresenceBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={`${getPresenceColor(presence)} ${getPresenceBgColor(presence)}`}
    >
      {getPresenceLabel(presence)}
    </Badge>
  )
}
