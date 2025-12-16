"use client"

// ============================================
// SERP Features Filter Popover Component
// ============================================

import { ChevronDown, Video, FileText, ImageIcon, Star, ShoppingCart, HelpCircle, Map, Newspaper, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import React from "react"

interface SerpFilterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedFeatures: string[]
  tempSelectedFeatures: string[]
  onToggleFeature: (feature: string) => void
  onApply: () => void
}

const SERP_FEATURE_OPTIONS = [
  { value: "video", label: "Video Carousel", icon: Video },
  { value: "snippet", label: "Featured Snippet", icon: FileText },
  { value: "image", label: "Image Pack", icon: ImageIcon },
  { value: "reviews", label: "Reviews", icon: Star },
  { value: "shopping", label: "Shopping Results", icon: ShoppingCart },
  { value: "faq", label: "People Also Ask", icon: HelpCircle },
  { value: "local", label: "Local Pack", icon: Map },
  { value: "news", label: "Top Stories", icon: Newspaper },
  { value: "ai_overview", label: "AI Overview", icon: MessageSquare },
]

export function SerpFilter({
  open,
  onOpenChange,
  selectedFeatures,
  tempSelectedFeatures,
  onToggleFeature,
  onApply,
}: SerpFilterProps) {
  const hasFilter = selectedFeatures.length > 0

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "h-8 sm:h-9 gap-1 sm:gap-1.5 bg-secondary/50 border-border text-xs sm:text-sm px-2 sm:px-3 shrink-0",
            hasFilter && "border-indigo-500/50"
          )}
        >
          <FileText className="h-3 w-3 text-indigo-400" />
          <span className="hidden sm:inline">SERP</span>
          {hasFilter && (
            <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs bg-indigo-500/20 text-indigo-400">
              {selectedFeatures.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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
                  onClick={() => onToggleFeature(feature.value)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox checked={tempSelectedFeatures.includes(feature.value)} />
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="flex-1 text-left">{feature.label}</span>
                </label>
              )
            })}
          </div>
          
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                // Clear all selections
                tempSelectedFeatures.forEach(f => onToggleFeature(f))
              }}
              className="flex-1"
            >
              Clear All
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
