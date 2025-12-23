/**
 * Shared utilities for Social Keyword Cards
 */

import { cn } from "@/lib/utils"
import type { SocialKeyword } from "../../types"

/**
 * Position badge component props
 */
export interface PositionBadgeProps {
  position: number | null
}

/**
 * Get position badge with proper styling
 */
export function PositionBadge({ position }: PositionBadgeProps) {
  if (!position) return null
  
  return (
    <div className={cn(
      "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-sm sm:text-lg font-bold",
      position <= 3 ? "bg-amber-500/20 text-amber-500" :
      position <= 10 ? "bg-emerald-500/20 text-emerald-500" :
      "bg-muted text-muted-foreground"
    )}>
      #{position}
    </div>
  )
}

/**
 * Common props for platform-specific card components
 */
export interface PlatformCardBaseProps {
  keyword: SocialKeyword
  intentConfig: {
    bg: string
    text: string
    label: string
  }
  copiedKeyword: boolean
  onCopyKeyword: () => void
  onViewDetails: () => void
  onDelete: () => void
}

/**
 * Metric box component for displaying stats
 */
export interface MetricBoxProps {
  icon: React.ReactNode
  value: string | number
  label: string
}

export function MetricBox({ icon, value, label }: MetricBoxProps) {
  return (
    <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto mb-0.5 sm:mb-1">
        {icon}
      </div>
      <span className="text-[10px] sm:text-xs font-medium text-foreground">{value}</span>
      <span className="text-[9px] sm:text-[10px] text-muted-foreground block">{label}</span>
    </div>
  )
}

/**
 * Keyword header with copy functionality
 */
export interface KeywordHeaderProps {
  keyword: string
  searchVolume: number
  hoverColor: string
  onCopy: () => void
  children?: React.ReactNode
}

export function KeywordHeader({ 
  keyword, 
  searchVolume, 
  hoverColor,
  onCopy, 
  children 
}: KeywordHeaderProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
        <button 
          onClick={onCopy}
          className={cn(
            "font-semibold text-foreground text-sm sm:text-base truncate transition-colors flex items-center gap-1 group/copy",
            `hover:${hoverColor}`
          )}
          title="Click to copy keyword"
        >
          {keyword}
          <svg 
            className="w-3 h-3 opacity-0 group-hover/copy:opacity-50 transition-opacity" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2"/>
          </svg>
        </button>
        {children}
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground">
        {searchVolume.toLocaleString()} monthly searches
      </p>
    </div>
  )
}
