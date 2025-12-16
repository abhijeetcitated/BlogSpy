"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { WeakSpotType } from "../types/weak-spot.types"
import { getWeakSpotIcon } from "../utils/weak-spot.utils"

interface WeakSpotFiltersProps {
  selectedTypes: WeakSpotType[]
  searchQuery: string
  onToggleType: (type: WeakSpotType) => void
  onSearchChange: (query: string) => void
}

export function WeakSpotFilters({
  selectedTypes,
  searchQuery,
  onToggleType,
  onSearchChange,
}: WeakSpotFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Source:</span>
        {(["reddit", "quora", "linkedin", "medium"] as WeakSpotType[]).map(type => {
          const { icon: Icon, color, bg } = getWeakSpotIcon(type)
          const isActive = selectedTypes.includes(type)
          return (
            <button
              key={type}
              onClick={() => onToggleType(type)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                isActive 
                  ? `${bg} ${color} border border-current/30`
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-3 w-3" />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          )
        })}
      </div>

      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 bg-secondary/50 border-border"
        />
      </div>
    </div>
  )
}
