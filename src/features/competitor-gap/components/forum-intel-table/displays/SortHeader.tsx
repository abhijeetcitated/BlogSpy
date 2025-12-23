"use client"

import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SortField, SortDirection } from "../../../types"

interface SortHeaderProps {
  label: string
  field: SortField
  currentField: SortField
  direction: SortDirection
  onSort: (field: SortField) => void
  className?: string
}

export function SortHeader({ 
  label, 
  field, 
  currentField, 
  direction, 
  onSort,
  className 
}: SortHeaderProps) {
  const isActive = currentField === field
  
  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        "flex items-center gap-1.5 text-xs font-semibold transition-colors group",
        isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {label}
      <div className={cn(
        "flex flex-col items-center justify-center w-4 h-4",
        isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/50 group-hover:text-muted-foreground"
      )}>
        {isActive ? (
          direction === "asc" ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        ) : (
          <>
            <ChevronUp className="w-3 h-3 -mb-1" />
            <ChevronDown className="w-3 h-3 -mt-1" />
          </>
        )}
      </div>
    </button>
  )
}
