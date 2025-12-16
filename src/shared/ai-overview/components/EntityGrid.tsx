"use client"

import { cn } from "@/lib/utils"
import { type AIEntity } from "@/types/ai-overview.types"
import { EntityChip } from "./EntityChip"
import { AlertTriangle } from "lucide-react"

// ============================================
// ENTITY GRID
// ============================================

export interface EntityGridProps {
  entities: AIEntity[]
  showMissingFirst?: boolean
  className?: string
}

export function EntityGrid({ 
  entities, 
  showMissingFirst = true,
  className 
}: EntityGridProps) {
  const sortedEntities = showMissingFirst
    ? [...entities].sort((a, b) => {
        if (!a.isFromYourContent && b.isFromYourContent) return -1
        if (a.isFromYourContent && !b.isFromYourContent) return 1
        return b.frequency - a.frequency
      })
    : entities

  const missingCount = entities.filter(e => !e.isFromYourContent).length

  return (
    <div className={cn("space-y-3", className)}>
      {missingCount > 0 && (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span className="text-xs text-amber-300">
            {missingCount} entity(ies) missing from your content
          </span>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {sortedEntities.map((entity) => (
          <EntityChip key={entity.name} entity={entity} />
        ))}
      </div>
    </div>
  )
}
