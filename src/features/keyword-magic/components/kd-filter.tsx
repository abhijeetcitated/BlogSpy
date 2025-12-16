"use client"

// ============================================
// KD Filter Popover Component
// ============================================

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { KD_LEVELS } from "../constants"

interface KDFilterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tempRange: [number, number]
  onTempRangeChange: (range: [number, number]) => void
  onApply: () => void
}

export function KDFilter({
  open,
  onOpenChange,
  tempRange,
  onTempRangeChange,
  onApply,
}: KDFilterProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 sm:h-9 gap-1 sm:gap-1.5 bg-secondary/50 border-border text-xs sm:text-sm px-2 sm:px-3 shrink-0">
          KD
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Difficulty Levels
          </div>
          <div className="space-y-1">
            {KD_LEVELS.map((level) => (
              <button
                key={level.label}
                onClick={() => onTempRangeChange([level.min, level.max])}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50",
                  tempRange[0] === level.min && tempRange[1] === level.max && "bg-muted/50"
                )}
              >
                <span className={cn("w-2.5 h-2.5 rounded-full", level.color)} />
                <span className="flex-1 text-left">{level.label}</span>
                <span className="text-xs text-muted-foreground">{level.range}</span>
              </button>
            ))}
          </div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
            Custom Range
          </div>
          <Slider
            value={tempRange}
            onValueChange={(v) => onTempRangeChange(v as [number, number])}
            min={0}
            max={100}
            step={1}
            className="py-2"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{tempRange[0]}%</span>
            <span>{tempRange[1]}%</span>
          </div>
          <Button onClick={onApply} className="w-full mt-2 bg-primary hover:bg-primary/90">
            Apply Filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
