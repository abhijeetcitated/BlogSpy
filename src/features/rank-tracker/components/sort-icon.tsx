// ============================================
// RANK TRACKER - Sort Icon Component
// ============================================

"use client"

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import type { SortField, SortDirection } from "../types"

interface SortIconProps {
  /** Current field being sorted */
  currentSortField: SortField
  /** This icon's field */
  field: SortField
  /** Current sort direction */
  sortDirection: SortDirection
}

/**
 * Sort indicator icon for table headers
 */
export function SortIcon({ currentSortField, field, sortDirection }: SortIconProps) {
  if (currentSortField !== field) {
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />
  }
  
  return sortDirection === "asc" ? (
    <ArrowUp className="h-3 w-3 text-emerald-400" />
  ) : (
    <ArrowDown className="h-3 w-3 text-emerald-400" />
  )
}
