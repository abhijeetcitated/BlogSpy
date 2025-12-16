"use client"

import { cn } from "@/lib/utils"
import type { SERPLayout } from "@/types/pixel.types"
import { getSERPElementName } from "@/types/pixel.types"
import { SERP_COLORS } from "./constants"

interface MiniSERPVisualizerProps {
  layout: SERPLayout
  height?: number
  className?: string
}

export function MiniSERPVisualizer({
  layout,
  height = 200,
  className,
}: MiniSERPVisualizerProps) {
  const scale = height / layout.totalHeight
  const foldLinePosition = 800 * scale // Viewport fold at 800px

  return (
    <div className={cn("relative", className)} style={{ height }}>
      {/* SERP Container */}
      <div className="absolute inset-0 rounded-lg border border-border bg-muted/30 overflow-hidden">
        {/* Fold line */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-amber-500/50 z-20"
          style={{ top: foldLinePosition }}
        >
          <span className="absolute -top-2.5 right-1 text-[8px] text-amber-500 bg-background px-1 rounded">
            fold
          </span>
        </div>

        {/* SERP Elements */}
        {layout.elements.map((element, index) => {
          const top = element.pixelStart * scale
          const elementHeight = Math.max(element.height * scale, 4) // Min 4px

          return (
            <div
              key={`${element.type}-${index}`}
              className={cn(
                "absolute left-1 right-1 rounded-sm border transition-all duration-200",
                element.isYourSite
                  ? "bg-emerald-500/50 border-emerald-500 ring-1 ring-emerald-500 z-10"
                  : SERP_COLORS[element.type]
              )}
              style={{
                top,
                height: elementHeight,
              }}
              title={`${getSERPElementName(element.type)}${element.position ? ` #${element.position}` : ""}`}
            />
          )
        })}

        {/* Your position marker */}
        <div
          className="absolute left-0 w-1 bg-emerald-500 rounded-r z-20"
          style={{
            top: layout.yourPixelRank * scale,
            height: 100 * scale,
          }}
        />
      </div>

      {/* Legend */}
      <div className="absolute -right-2 top-0 bottom-0 flex flex-col justify-between text-[8px] text-muted-foreground">
        <span>0px</span>
        <span>{layout.yourPixelRank}px</span>
        <span>{layout.totalHeight}px</span>
      </div>
    </div>
  )
}
