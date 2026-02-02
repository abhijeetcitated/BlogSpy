"use client"

// ============================================
// Intent Filter Popover Component (Legacy)
// ============================================

import { useEffect, useState } from "react"
import { ChevronDown, Info, ShoppingCart, FileText, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useKeywordStore } from "../../store"

interface IntentFilterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIntents: string[]
}

const INTENT_OPTIONS = [
  {
    value: "I",
    label: "Informational",
    shortLabel: "I",
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  {
    value: "C",
    label: "Commercial",
    shortLabel: "C",
    icon: ShoppingCart,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },
  {
    value: "T",
    label: "Transactional",
    shortLabel: "T",
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-500/10 border-green-500/20",
  },
  {
    value: "N",
    label: "Navigational",
    shortLabel: "N",
    icon: Navigation,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10 border-orange-500/20",
  },
]

export function IntentFilter({ open, onOpenChange, selectedIntents }: IntentFilterProps) {
  const [tempSelected, setTempSelected] = useState<string[]>(selectedIntents)
  const setSelectedIntents = useKeywordStore((state) => state.setSelectedIntents)
  const hasFilter = selectedIntents.length > 0

  useEffect(() => {
    if (open) {
      setTempSelected(selectedIntents)
    }
  }, [open, selectedIntents])

  const toggleTemp = (value: string) => {
    setTempSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    )
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 sm:h-9 gap-0.5 sm:gap-1.5 bg-secondary/50 border-border text-foreground text-[11px] sm:text-sm px-1.5 sm:px-3 shrink-0 min-w-0",
            hasFilter && "border-[#FFD700]/70"
          )}
        >
          <span>Intent</span>
          {hasFilter && (
            <Badge
              variant="secondary"
              className="ml-0.5 sm:ml-1 h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs bg-[#FFD700] text-amber-950"
            >
              {selectedIntents.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-3" align="start">
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            Select one or more options to filter results.
          </div>
          <div className="space-y-1">
            {INTENT_OPTIONS.map((intent) => {
              const Icon = intent.icon
              return (
                <label
                  key={intent.value}
                  onClick={() => toggleTemp(intent.value)}
                  className="w-full flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded text-xs sm:text-sm transition-colors hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox checked={tempSelected.includes(intent.value)} />
                  <Badge
                    variant="outline"
                    className={cn("h-6 px-1.5 font-medium", intent.bgColor, intent.color)}
                  >
                    <Icon className="h-3 w-3 mr-0.5" />
                    {intent.shortLabel}
                  </Badge>
                  <span className="flex-1 text-left text-xs sm:text-sm">{intent.label}</span>
                </label>
              )
            })}
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTempSelected([])
                setSelectedIntents([])
              }}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              onClick={() => {
                setSelectedIntents(tempSelected)
                onOpenChange(false)
              }}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
