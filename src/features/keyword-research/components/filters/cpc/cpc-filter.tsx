"use client"

// ============================================
// CPC Filter Popover Component
// ============================================

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface CPCFilterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tempRange: [number, number]
  onTempRangeChange: (range: [number, number]) => void
  onApply: () => void
}

export function CPCFilter({
  open,
  onOpenChange,
  tempRange,
  onTempRangeChange,
  onApply,
}: CPCFilterProps) {
  const isDirty = tempRange[0] !== 0 || tempRange[1] !== 1000

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 sm:h-9 gap-0.5 sm:gap-1.5 bg-secondary/50 border-border text-[11px] sm:text-sm px-1.5 sm:px-3 shrink-0 min-w-0">
          CPC
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-3" align="start">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Price Range
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                type="number"
                min={0}
                placeholder="Min"
                value={tempRange[0] || ""}
                onChange={(e) => {
                  const val =
                    e.target.value === ""
                      ? 0
                      : Math.max(0, Number.parseFloat(e.target.value) || 0)
                  onTempRangeChange([val, tempRange[1]])
                }}
                className="h-8 text-sm pl-6"
              />
            </div>
            <span className="text-muted-foreground">—</span>
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                type="number"
                min={0}
                placeholder="Max"
                value={tempRange[1] || ""}
                onChange={(e) => {
                  const val =
                    e.target.value === ""
                      ? 0
                      : Math.max(0, Number.parseFloat(e.target.value) || 0)
                  onTempRangeChange([tempRange[0], val])
                }}
                className="h-8 text-sm pl-6"
              />
            </div>
          </div>
          <Button
            onClick={onApply}
            className={cn(
              "w-full mt-2 bg-primary hover:bg-primary/90",
              isDirty && "shadow-[0_0_12px_rgba(59,130,246,0.45)]"
            )}
          >
            Apply Filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
