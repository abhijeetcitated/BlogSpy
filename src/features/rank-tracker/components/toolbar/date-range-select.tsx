// ============================================
// RANK TRACKER - Date Range Select Component
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

export type DateRangeValue = "7d" | "30d" | "90d" | "all"

interface DateRangeSelectProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  className?: string
}

/**
 * Reusable date range select for filtering rank data
 * @description Used in both mobile and desktop views
 */
export const DateRangeSelect = memo(function DateRangeSelect({
  value,
  onChange,
  className,
}: DateRangeSelectProps) {
  return (
    <div className={className}>
      <span className="text-xs text-muted-foreground mr-2">Date Range:</span>
      <Select 
        value={value} 
        onValueChange={(v) => onChange(v as DateRangeValue)}
      >
        <SelectTrigger 
          className="h-7 w-24 text-xs bg-background border-border text-foreground"
          aria-label="Select date range"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="7d" className="text-foreground focus:bg-muted">
            7 Days
          </SelectItem>
          <SelectItem value="30d" className="text-foreground focus:bg-muted">
            30 Days
          </SelectItem>
          <SelectItem value="90d" className="text-foreground focus:bg-muted">
            90 Days
          </SelectItem>
          <SelectItem value="all" className="text-foreground focus:bg-muted">
            All Time
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
})
