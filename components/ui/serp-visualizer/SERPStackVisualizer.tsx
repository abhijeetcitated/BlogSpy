"use client"

import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SERPElementType } from "@/types/pixel.types"
import { getSERPElementName } from "@/types/pixel.types"
import { SERP_ICONS, SERP_COLORS } from "./constants"

interface SERPStackVisualizerProps {
  competingElements: SERPElementType[]
  yourPosition: number
  className?: string
}

export function SERPStackVisualizer({
  competingElements,
  yourPosition,
  className,
}: SERPStackVisualizerProps) {
  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {competingElements.map((element, index) => (
        <div
          key={`${element}-${index}`}
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border",
            SERP_COLORS[element]
          )}
          title={getSERPElementName(element)}
        >
          {SERP_ICONS[element]}
          <span className="hidden sm:inline">{getSERPElementName(element)}</span>
        </div>
      ))}
      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/30 border border-emerald-500/50 text-emerald-300">
        <Globe className="h-3 w-3" />
        <span>You #{yourPosition}</span>
      </div>
    </div>
  )
}
