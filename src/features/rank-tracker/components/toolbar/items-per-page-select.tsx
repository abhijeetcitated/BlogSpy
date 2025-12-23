// ============================================
// RANK TRACKER - Items Per Page Select
// ============================================

"use client"

import { memo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ItemsPerPageSelectProps {
  value: number
  onChange: (value: number) => void
  totalItems: number
  className?: string
}

/**
 * Reusable items per page select for pagination
 * @description Used in both mobile and desktop views
 */
export const ItemsPerPageSelect = memo(function ItemsPerPageSelect({
  value,
  onChange,
  totalItems,
  className,
}: ItemsPerPageSelectProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-muted-foreground">Show:</span>
      <Select 
        value={String(value)} 
        onValueChange={(v) => onChange(Number(v))}
      >
        <SelectTrigger 
          className="h-7 w-16 text-xs bg-background border-border text-foreground"
          aria-label="Items per page"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="10" className="text-foreground focus:bg-muted">
            10
          </SelectItem>
          <SelectItem value="25" className="text-foreground focus:bg-muted">
            25
          </SelectItem>
          <SelectItem value="50" className="text-foreground focus:bg-muted">
            50
          </SelectItem>
          <SelectItem value="100" className="text-foreground focus:bg-muted">
            100
          </SelectItem>
        </SelectContent>
      </Select>
      <span className="text-xs text-muted-foreground">
        of {totalItems} keywords
      </span>
    </div>
  )
})
