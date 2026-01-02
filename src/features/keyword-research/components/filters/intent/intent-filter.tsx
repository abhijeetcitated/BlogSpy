"use client"

// ============================================
// Intent Filter Popover Component
// ============================================

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { INTENT_OPTIONS } from "../../../constants"

interface IntentFilterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIntents: string[]
  tempSelectedIntents: string[]
  onToggleIntent: (value: string) => void
  onApply: () => void
}

export function IntentFilter({
  open,
  onOpenChange,
  selectedIntents,
  tempSelectedIntents,
  onToggleIntent,
  onApply,
}: IntentFilterProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 sm:h-9 gap-0.5 sm:gap-1.5 bg-secondary/50 border-border text-[11px] sm:text-sm px-1.5 sm:px-3 shrink-0 min-w-0">
          Intent
          {selectedIntents.length > 0 && (
            <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
              {selectedIntents.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-3" align="start">
        <div className="space-y-3">
          <div className="space-y-1">
            {INTENT_OPTIONS.map((intent) => (
              <label
                key={intent.value}
                onClick={() => onToggleIntent(intent.value)}
                className="w-full flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded text-xs sm:text-sm transition-colors hover:bg-muted/50 cursor-pointer"
              >
                <Checkbox checked={tempSelectedIntents.includes(intent.value)} />
                <span className={cn("px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium border", intent.color)}>
                  {intent.value}
                </span>
                <span className="flex-1 text-left text-xs sm:text-sm">{intent.label}</span>
              </label>
            ))}
          </div>
          <Button onClick={onApply} className="w-full bg-primary hover:bg-primary/90">
            Apply Filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
