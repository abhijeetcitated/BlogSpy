"use client"

// ============================================
// Volume Filter Popover Component
// ============================================

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { VOLUME_PRESETS } from "../../../constants"

interface VolumeFilterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tempRange: [number, number]
  onTempRangeChange: (range: [number, number]) => void
  volumePreset: string | null
  onPresetChange: (preset: string | null) => void
  onApply: () => void
}

export function VolumeFilter({
  open,
  onOpenChange,
  tempRange,
  onTempRangeChange,
  volumePreset,
  onPresetChange,
  onApply,
}: VolumeFilterProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 sm:h-9 gap-0.5 sm:gap-1.5 bg-secondary/50 border-border text-[11px] sm:text-sm px-1.5 sm:px-3 shrink-0 min-w-0">
          Vol
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Presets
          </div>
          <div className="flex flex-wrap gap-1.5">
            {VOLUME_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  onTempRangeChange([preset.min, preset.max])
                  onPresetChange(preset.label)
                }}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                  volumePreset === preset.label
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
            Custom Range
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="From"
              value={tempRange[0] || ""}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Number(e.target.value)
                onTempRangeChange([val, tempRange[1]])
                onPresetChange(null)
              }}
              className="h-8 text-sm"
            />
            <span className="text-muted-foreground">—</span>
            <Input
              type="number"
              placeholder="To"
              value={tempRange[1] || ""}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Number(e.target.value)
                onTempRangeChange([tempRange[0], val])
                onPresetChange(null)
              }}
              className="h-8 text-sm"
            />
          </div>
          <Button onClick={onApply} className="w-full mt-2 bg-primary hover:bg-primary/90">
            Apply Filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
