"use client"

// ============================================
// GEO COLUMN - Geographic location display
// ============================================

import { cn } from "@/lib/utils"
import { Globe } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface GeoColumnProps {
  country: string
  countryCode: string
  showFlag?: boolean
  showName?: boolean
  className?: string
}

// Country code to flag emoji
const getFlagEmoji = (countryCode: string): string => {
  const code = countryCode.toUpperCase()
  const offset = 127397
  return [...code].map((c) => String.fromCodePoint(c.charCodeAt(0) + offset)).join("")
}

export function GeoColumn({
  country,
  countryCode,
  showFlag = true,
  showName = true,
  className,
}: GeoColumnProps) {
  const flag = getFlagEmoji(countryCode)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex items-center gap-1.5", className)}>
          {showFlag && <span className="text-base">{flag}</span>}
          {showName && (
            <span className="text-sm text-muted-foreground truncate max-w-[60px]">
              {countryCode.toUpperCase()}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {country}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
