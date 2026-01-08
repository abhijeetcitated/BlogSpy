"use client"

// ============================================
// WEAK SPOT COLUMN - Unified Badge Design
// ============================================
// Dark Mode SaaS Aesthetic (Zinc-950/Vercel)
// Shows only platforms with rank <= 10, sorted by rank
// Multi-platform in single badge with dividers
// Tooltips show opportunity info on hover
// ============================================

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { WeakSpots } from "../../../../types"

// ============================================
// BRAND SVG ICONS (14x14)
// ============================================

const RedditIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={cn("text-orange-500", className)}>
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
)

const QuoraIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={cn("text-red-600", className)}>
    <path d="M12.738 17.824c-.711-.736-1.36-1.504-2.097-2.503-.738-1.003-1.246-1.81-1.58-2.503h.003c-.84-1.743-1.274-3.675-1.274-5.768C7.79 3.123 10.057 0 14.064 0c4.012 0 6.281 3.123 6.281 7.05 0 3.925-2.269 7.046-6.28 7.046-.568 0-1.096-.064-1.584-.186l-.002.001c.36.546.914 1.22 1.61 1.946 1.104 1.155 2.412 2.028 3.911 2.028v2.115c-2.388 0-4.282-1.334-5.262-2.176zM4.75 24h2.115v-2.115H4.75V24zm9.314-10.95c2.399 0 4.166-1.917 4.166-5.1 0-3.181-1.767-5.095-4.166-5.095-2.397 0-4.162 1.914-4.162 5.096 0 .768.075 1.485.217 2.146.484-.403 1.067-.61 1.733-.61 1.618 0 2.771 1.32 2.771 3.155v.088c-.151.127-.315.24-.559.32z"/>
  </svg>
)

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={cn("text-red-500", className)}>
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
  </svg>
)

// ============================================
// TYPES
// ============================================

interface WeakSpotColumnProps {
  /** Platform ranks - null means not in top 10 SERP */
  weakSpots: WeakSpots
  className?: string
}

type PlatformKey = "reddit" | "quora" | "pinterest"

interface SpotData {
  platform: PlatformKey
  rank: number
  Icon: React.ComponentType<{ className?: string }>
  name: string
}

// ============================================
// PLATFORM CONFIG
// ============================================

const PLATFORM_CONFIG: Record<PlatformKey, { 
  Icon: React.ComponentType<{ className?: string }>, 
  name: string,
  color: string
}> = {
  reddit: { Icon: RedditIcon, name: "Reddit", color: "text-orange-500" },
  quora: { Icon: QuoraIcon, name: "Quora", color: "text-red-600" },
  pinterest: { Icon: PinterestIcon, name: "Pinterest", color: "text-red-500" },
}

// ============================================
// OPPORTUNITY HELPER
// ============================================

function getOpportunityInfo(platform: PlatformKey, rank: number): { title: string; description: string; isHot: boolean } {
  const platformName = PLATFORM_CONFIG[platform].name
  
  if (rank <= 3) {
    return {
      title: `🔥 Hot Opportunity!`,
      description: `${platformName} ranks #${rank} in SERP. Very easy to outrank with quality content!`,
      isHot: true
    }
  } else if (rank <= 5) {
    return {
      title: `✅ Good Opportunity`,
      description: `${platformName} ranks #${rank} in SERP. Strong chance to outrank with comprehensive content.`,
      isHot: false
    }
  } else {
    return {
      title: `📈 Moderate Opportunity`,
      description: `${platformName} ranks #${rank} in SERP. Possible to outrank with targeted SEO.`,
      isHot: false
    }
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export function WeakSpotColumn({ weakSpots, className }: WeakSpotColumnProps) {
  // Build array of valid spots (rank <= 10), sorted by rank ascending
  const validSpots: SpotData[] = React.useMemo(() => {
    if (!weakSpots) return []
    
    const spots: SpotData[] = []
    
    // Check each platform
    const platforms: PlatformKey[] = ["reddit", "quora", "pinterest"]
    for (const platform of platforms) {
      const rank = weakSpots[platform]
      if (rank !== null && rank <= 10) {
        spots.push({
          platform,
          rank,
          Icon: PLATFORM_CONFIG[platform].Icon,
          name: PLATFORM_CONFIG[platform].name,
        })
      }
    }
    
    // Sort by rank ascending (best rank first)
    return spots.sort((a, b) => a.rank - b.rank)
  }, [weakSpots])

  // No valid weak spots - return dash placeholder
  if (validSpots.length === 0) {
    return (
      <span className={cn("text-muted-foreground text-xs", className)}>
        —
      </span>
    )
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 h-7",
        "rounded-md border",
        // Light mode: visible gray background with clear border
        "border-gray-300 bg-gray-100",
        // Dark mode: zinc aesthetic
        "dark:border-zinc-700 dark:bg-zinc-800/80",
        className
      )}
    >
      {validSpots.map((spot, index) => {
        const { Icon } = spot
        const isLast = index === validSpots.length - 1
        const opportunity = getOpportunityInfo(spot.platform, spot.rank)
        
        return (
          <React.Fragment key={spot.platform}>
            {/* Platform Item with Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-default">
                  {/* Icon (14x14) */}
                  <Icon className="w-3.5 h-3.5" />
                  
                  {/* Rank Badge */}
                  <span className="text-xs font-mono text-gray-700 dark:text-zinc-300">
                    #{spot.rank}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className={cn(
                  "font-medium",
                  opportunity.isHot && "text-orange-400"
                )}>
                  {opportunity.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {opportunity.description}
                </p>
              </TooltipContent>
            </Tooltip>
            
            {/* Vertical Divider (except after last item) */}
            {!isLast && (
              <div className="h-3 w-[1px] bg-slate-300 dark:bg-slate-600" />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default WeakSpotColumn
