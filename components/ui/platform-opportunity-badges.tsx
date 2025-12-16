"use client"

// ============================================
// PLATFORM OPPORTUNITY BADGES
// ============================================
// Mini components for Video, Commerce, Social opportunities
// Used in Keyword Magic table
// ============================================

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Video, ShoppingCart, Share2 } from "lucide-react"
import { 
  type VideoOpportunity, 
  type CommerceOpportunity, 
  type SocialOpportunity,
  type OpportunityLevel,
  getPlatformOpportunityColor,
} from "@/types/platform-opportunity.types"

// ============================================
// SHARED COMPONENTS
// ============================================

interface OpportunityBadgeProps {
  score: number
  level: OpportunityLevel
  icon: React.ReactNode
  label: string
  tooltipContent: React.ReactNode
  className?: string
}

function OpportunityBadge({ 
  score, 
  level, 
  icon, 
  label,
  tooltipContent,
  className 
}: OpportunityBadgeProps) {
  const colorClasses = getPlatformOpportunityColor(level)
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border cursor-default transition-colors",
            colorClasses,
            className
          )}
        >
          {icon}
          <span className="tabular-nums">{score}%</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  )
}

// ============================================
// VIDEO OPPORTUNITY MINI
// ============================================

export interface VideoOppMiniProps {
  data: VideoOpportunity
  className?: string
}

export function VideoOppMini({ data, className }: VideoOppMiniProps) {
  if (data.score === 0) {
    return <span className="text-muted-foreground/50 text-xs">—</span>
  }

  return (
    <OpportunityBadge
      score={data.score}
      level={data.level}
      icon={<Video className="h-3 w-3" />}
      label="Video"
      className={className}
      tooltipContent={
        <div className="space-y-1.5">
          <p className="font-medium">Video Opportunity: {data.score}%</p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>YouTube: {data.youtube.opportunityScore}% {data.youtube.hasWeakCompetition && "✓ Weak competition"}</p>
            <p>TikTok: {data.tiktok.opportunityScore}% {data.tiktok.hasWeakCompetition && "✓ Weak competition"}</p>
          </div>
          {data.isVideoFriendly && (
            <p className="text-xs text-green-400">✓ Video-friendly keyword</p>
          )}
          {data.recommendation && (
            <p className="text-xs text-primary mt-1">{data.recommendation}</p>
          )}
        </div>
      }
    />
  )
}

// ============================================
// COMMERCE OPPORTUNITY MINI
// ============================================

export interface CommerceOppMiniProps {
  data: CommerceOpportunity
  className?: string
}

export function CommerceOppMini({ data, className }: CommerceOppMiniProps) {
  if (!data.isCommerceFriendly || data.score < 10) {
    return <span className="text-muted-foreground/50 text-xs">—</span>
  }

  return (
    <OpportunityBadge
      score={data.score}
      level={data.level}
      icon={<ShoppingCart className="h-3 w-3" />}
      label="Commerce"
      className={className}
      tooltipContent={
        <div className="space-y-1.5">
          <p className="font-medium">Commerce Opportunity: {data.score}%</p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Amazon: {data.amazon.opportunityScore}%</p>
            {data.amazon.hasWeakListings && (
              <p className="text-green-400">✓ Weak listings found</p>
            )}
            {data.amazon.productCount && data.amazon.productCount > 0 && (
              <p>Products: {data.amazon.productCount.toLocaleString()}</p>
            )}
          </div>
          {data.recommendation && (
            <p className="text-xs text-primary mt-1">{data.recommendation}</p>
          )}
        </div>
      }
    />
  )
}

// ============================================
// SOCIAL OPPORTUNITY MINI
// ============================================

export interface SocialOppMiniProps {
  data: SocialOpportunity
  className?: string
}

export function SocialOppMini({ data, className }: SocialOppMiniProps) {
  if (data.score === 0) {
    return <span className="text-muted-foreground/50 text-xs">—</span>
  }

  return (
    <OpportunityBadge
      score={data.score}
      level={data.level}
      icon={<Share2 className="h-3 w-3" />}
      label="Social"
      className={className}
      tooltipContent={
        <div className="space-y-1.5">
          <p className="font-medium">Social Opportunity: {data.score}%</p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Pinterest: {data.pinterest.opportunityScore}% {data.pinterest.hasEngagementOpportunity && "✓"}</p>
            <p>X: {data.x.opportunityScore}% {data.x.hasEngagementOpportunity && "✓"}</p>
            <p>Instagram: {data.instagram.opportunityScore}% {data.instagram.hasEngagementOpportunity && "✓"}</p>
          </div>
          {data.isSocialFriendly && (
            <p className="text-xs text-green-400">✓ Social-friendly keyword</p>
          )}
          {data.recommendation && (
            <p className="text-xs text-primary mt-1">{data.recommendation}</p>
          )}
        </div>
      }
    />
  )
}

// ============================================
// EXPORTS
// ============================================

export type {
  VideoOpportunity,
  CommerceOpportunity,
  SocialOpportunity,
}
