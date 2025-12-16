"use client"

// ============================================
// GEO Score Filter Popover Component
// ============================================

import { Sparkles, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface GeoFilterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tempRange: [number, number]
  onTempRangeChange: (range: [number, number]) => void
  onApply: () => void
}

const GEO_LEVELS = [
  { label: "Excellent", range: "80-100", min: 80, max: 100, color: "bg-emerald-500" },
  { label: "Good", range: "60-79", min: 60, max: 79, color: "bg-cyan-500" },
  { label: "Moderate", range: "40-59", min: 40, max: 59, color: "bg-amber-500" },
  { label: "Low", range: "0-39", min: 0, max: 39, color: "bg-red-500" },
]

export function GeoFilter({
  open,
  onOpenChange,
  tempRange,
  onTempRangeChange,
  onApply,
}: GeoFilterProps) {
  const hasFilter = tempRange[0] > 0 || tempRange[1] < 100

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "h-8 sm:h-9 gap-1 sm:gap-1.5 bg-secondary/50 border-border text-xs sm:text-sm px-2 sm:px-3 shrink-0",
            hasFilter && "border-cyan-500/50"
          )}
        >
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span className="hidden sm:inline">GEO</span>
          {hasFilter && (
            <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs bg-cyan-500/20 text-cyan-400">
              {tempRange[0]}-{tempRange[1]}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium">GEO Score Filter</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Generative Engine Optimization score. Higher score = better chance to get cited by AI Overview.
          </div>

          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
            Score Levels
          </div>
          <div className="space-y-1">
            {GEO_LEVELS.map((level) => (
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
            <span>{tempRange[0]}</span>
            <span>{tempRange[1]}</span>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onTempRangeChange([0, 100])}
              className="flex-1"
            >
              Reset
            </Button>
            <Button onClick={onApply} className="flex-1 bg-primary hover:bg-primary/90">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
