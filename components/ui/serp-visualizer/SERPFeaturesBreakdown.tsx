"use client"

import { cn } from "@/lib/utils"
import type { SERPElementType } from "@/types/pixel.types"
import { getSERPElementName } from "@/types/pixel.types"
import { SERP_ICONS, SERP_COLORS } from "./constants"

interface SERPFeaturesBreakdownProps {
  elements: SERPElementType[]
  className?: string
}

export function SERPFeaturesBreakdown({
  elements,
  className,
}: SERPFeaturesBreakdownProps) {
  // Count unique features (excluding organic)
  const featureCounts = elements.reduce((acc, el) => {
    if (el !== "organic" && el !== "site_links") {
      acc[el] = (acc[el] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const features = Object.entries(featureCounts)

  if (features.length === 0) {
    return (
      <div className={cn("text-xs text-muted-foreground", className)}>
        No SERP features detected
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-xs font-medium text-muted-foreground">SERP Features</div>
      <div className="flex flex-wrap gap-2">
        {features.map(([type, count]) => (
          <div
            key={type}
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border",
              SERP_COLORS[type as SERPElementType]
            )}
          >
            {SERP_ICONS[type as SERPElementType]}
            <span>{getSERPElementName(type as SERPElementType)}</span>
            {count > 1 && (
              <span className="text-[10px] opacity-70">×{count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
