// ============================================
// FILTER POPOVER - Reusable Range Filter
// ============================================

"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface RangePreset {
  label: string
  min: number
  max: number
}

interface RangeFilterPopoverProps {
  label: string
  presets: RangePreset[]
  open: boolean
  onOpenChange: (open: boolean) => void
  tempRange: [number, number]
  onTempRangeChange: (range: [number, number]) => void
  presetLabel: string
  onPresetChange: (preset: string) => void
  onApply: () => void
  minPlaceholder?: string
  maxPlaceholder?: string
  defaultMin?: number
  defaultMax?: number
}

export function RangeFilterPopover({
  label,
  presets,
  open,
  onOpenChange,
  tempRange,
  onTempRangeChange,
  presetLabel,
  onPresetChange,
  onApply,
  minPlaceholder = "From",
  maxPlaceholder = "To",
  defaultMin = 0,
  defaultMax = 100,
}: RangeFilterPopoverProps) {
  const displayPreset = label === "KD %" && presetLabel !== "Any" 
    ? presetLabel.split(" ")[0] 
    : presetLabel

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 bg-secondary/50 border-border"
        >
          {label}
          {presetLabel !== "Any" && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {displayPreset}
            </Badge>
          )}
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label} Range
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  onTempRangeChange([preset.min, preset.max])
                  onPresetChange(preset.label)
                }}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                  presetLabel === preset.label
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
              placeholder={minPlaceholder}
              value={tempRange[0] || ""}
              onChange={(e) => {
                const val = e.target.value === "" ? defaultMin : Number(e.target.value)
                onTempRangeChange([val, tempRange[1]])
                onPresetChange("Custom")
              }}
              className="h-8 text-sm"
            />
            <span className="text-muted-foreground">—</span>
            <Input
              type="number"
              placeholder={maxPlaceholder}
              value={tempRange[1] || ""}
              onChange={(e) => {
                const val = e.target.value === "" ? defaultMax : Number(e.target.value)
                onTempRangeChange([tempRange[0], val])
                onPresetChange("Custom")
              }}
              className="h-8 text-sm"
            />
          </div>
          <Button
            onClick={onApply}
            className="w-full mt-2 bg-primary hover:bg-primary/90"
          >
            Apply Filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
