"use client"

// ============================================
// SERP Features Filter Popover Component
// ============================================

import { useEffect, useState } from "react"
import {
  ChevronDown,
  Video,
  FileText,
  ImageIcon,
  ShoppingCart,
  MapPin,
  Newspaper,
  Bot,
  HelpCircle,
  Trophy,
  Megaphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useKeywordStore } from "../../store"
import type { SERPFeature } from "../../types"

interface SerpFilterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedFeatures: string[]
}

const SERP_FEATURE_OPTIONS: { value: SERPFeature; label: string; icon: typeof Video; color: string }[] = [
  // High Impact Features
  { value: "ai_overview", label: "AI Overview", icon: Bot, color: "text-indigo-400" },
  { value: "featured_snippet", label: "Featured Snippet", icon: FileText, color: "text-amber-500" },
  { value: "people_also_ask", label: "FAQ / PAA", icon: HelpCircle, color: "text-blue-400" },

  // Media Features
  { value: "video_pack", label: "Video", icon: Video, color: "text-red-500" },
  { value: "image_pack", label: "Image Pack", icon: ImageIcon, color: "text-pink-400" },

  // Commerce Features
  { value: "shopping_ads", label: "Shopping", icon: ShoppingCart, color: "text-green-400" },
  { value: "ads_top", label: "Ads", icon: Megaphone, color: "text-yellow-500" },

  // Local & News
  { value: "local_pack", label: "Local Pack", icon: MapPin, color: "text-orange-400" },
  { value: "top_stories", label: "News", icon: Newspaper, color: "text-cyan-400" },

  // Other Features
  { value: "reviews", label: "Reviews", icon: Trophy, color: "text-yellow-400" },
]

export function SerpFilter({
  open,
  onOpenChange,
  selectedFeatures,
}: SerpFilterProps) {
  const [tempSelected, setTempSelected] = useState<string[]>(selectedFeatures)
  const setSelectedSerpFeatures = useKeywordStore((state) => state.setSelectedSerpFeatures)
  const hasFilter = selectedFeatures.length > 0

  useEffect(() => {
    if (open) {
      setTempSelected(selectedFeatures)
    }
  }, [open, selectedFeatures])

  const toggleTemp = (feature: string) => {
    setTempSelected((prev) =>
      prev.includes(feature) ? prev.filter((item) => item !== feature) : [...prev, feature]
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
          <FileText className="h-3 w-3 text-blue-500 shrink-0" />
          <span>SERP</span>
          {hasFilter && (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 px-1 text-[10px] bg-[#FFD700] text-amber-950"
            >
              {selectedFeatures.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium">SERP Features Filter</span>
          </div>

          <div className="text-xs text-muted-foreground">
            Filter keywords by SERP features. Shows keywords that have these features in search results.
          </div>

          <div className="space-y-1 max-h-[280px] overflow-y-auto">
            {SERP_FEATURE_OPTIONS.map((feature) => {
              const Icon = feature.icon
              return (
                <label
                  key={feature.value}
                  onClick={() => toggleTemp(feature.value)}
                  className="w-full flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded text-xs sm:text-sm transition-colors hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox checked={tempSelected.includes(feature.value)} />
                  <Icon className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", feature.color)} />
                  <span className="flex-1 text-left text-xs sm:text-sm">{feature.label}</span>
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
                setSelectedSerpFeatures([])
              }}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              onClick={() => {
                setSelectedSerpFeatures(tempSelected)
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
