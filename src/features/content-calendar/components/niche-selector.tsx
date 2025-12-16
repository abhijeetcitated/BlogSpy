"use client"

import { cn } from "@/lib/utils"
import { nicheConfig } from "../constants"
import type { ContentNiche } from "../types"

interface NicheSelectorProps {
  selectedNiche: ContentNiche | "all"
  onSelect: (niche: ContentNiche | "all") => void
}

export function NicheSelector({ selectedNiche, onSelect }: NicheSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {nicheConfig.map((niche) => {
        const isActive = selectedNiche === niche.value
        return (
          <button
            key={niche.value}
            onClick={() => onSelect(niche.value)}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border",
              isActive
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/20"
                : cn(
                    "bg-card border-border",
                    "text-muted-foreground",
                    "hover:border-muted-foreground/30 hover:text-foreground",
                    "hover:bg-muted active:bg-muted"
                  )
            )}
          >
            <span className={cn(
              "flex items-center justify-center shrink-0",
              isActive ? "text-amber-400" : niche.color
            )}>
              {niche.icon}
            </span>
            <span className="truncate">{niche.label}</span>
          </button>
        )
      })}
    </div>
  )
}
