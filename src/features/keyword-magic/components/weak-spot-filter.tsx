"use client"

// ============================================
// Weak Spot Filter Popover Component
// ============================================

import { Target, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface WeakSpotFilterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tempHasWeakSpot: boolean | null // null = any, true = only with weak spots, false = only without
  tempWeakSpotTypes: string[] // ["reddit", "quora"]
  onTempHasWeakSpotChange: (value: boolean | null) => void
  onToggleWeakSpotType: (type: string) => void
  onApply: () => void
}

const WEAK_SPOT_TYPES = [
  { value: "reddit", label: "Reddit", color: "bg-orange-500", icon: "🔗" },
  { value: "quora", label: "Quora", color: "bg-red-500", icon: "❓" },
]

export function WeakSpotFilter({
  open,
  onOpenChange,
  tempHasWeakSpot,
  tempWeakSpotTypes,
  onTempHasWeakSpotChange,
  onToggleWeakSpotType,
  onApply,
}: WeakSpotFilterProps) {
  const hasFilter = tempHasWeakSpot !== null || tempWeakSpotTypes.length > 0

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "h-8 sm:h-9 gap-1 sm:gap-1.5 bg-secondary/50 border-border text-xs sm:text-sm px-2 sm:px-3 shrink-0",
            hasFilter && "border-green-500/50"
          )}
        >
          <Target className="h-3 w-3 text-green-400" />
          <span className="hidden sm:inline">Weak Spot</span>
          <span className="sm:hidden">WS</span>
          {hasFilter && (
            <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs bg-green-500/20 text-green-400">
              ✓
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium">Weak Spot Filter</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Filter keywords where Reddit/Quora is ranking high (easy to outrank).
          </div>

          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
            Show Keywords
          </div>
          
          <div className="space-y-1">
            <button
              onClick={() => onTempHasWeakSpotChange(null)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50",
                tempHasWeakSpot === null && "bg-muted/50"
              )}
            >
              <span className={cn("w-2.5 h-2.5 rounded-full bg-muted-foreground/30")} />
              <span className="flex-1 text-left">All Keywords</span>
            </button>
            <button
              onClick={() => onTempHasWeakSpotChange(true)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50",
                tempHasWeakSpot === true && "bg-muted/50"
              )}
            >
              <span className={cn("w-2.5 h-2.5 rounded-full bg-green-500")} />
              <span className="flex-1 text-left">With Weak Spots Only</span>
            </button>
            <button
              onClick={() => onTempHasWeakSpotChange(false)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50",
                tempHasWeakSpot === false && "bg-muted/50"
              )}
            >
              <span className={cn("w-2.5 h-2.5 rounded-full bg-slate-500")} />
              <span className="flex-1 text-left">Without Weak Spots</span>
            </button>
          </div>

          {tempHasWeakSpot === true && (
            <>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
                Platform Type
              </div>
              <div className="space-y-1">
                {WEAK_SPOT_TYPES.map((type) => (
                  <label
                    key={type.value}
                    onClick={() => onToggleWeakSpotType(type.value)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox checked={tempWeakSpotTypes.includes(type.value) || tempWeakSpotTypes.length === 0} />
                    <span>{type.icon}</span>
                    <span className="flex-1 text-left">{type.label}</span>
                  </label>
                ))}
              </div>
            </>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                onTempHasWeakSpotChange(null)
              }}
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
