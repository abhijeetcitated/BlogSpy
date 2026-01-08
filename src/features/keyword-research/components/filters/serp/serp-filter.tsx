"use client"

// ============================================
// SERP Features Filter Popover Component
// ============================================

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
  Megaphone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { SERPFeature } from "../../../types"

interface SerpFilterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedFeatures: SERPFeature[]
  tempSelectedFeatures: SERPFeature[]
  onToggleFeature: (feature: SERPFeature) => void
  onApply: () => void
}

const SERP_FEATURE_OPTIONS: { value: SERPFeature; label: string; icon: typeof Video; color: string }[] = [
  // High Impact Features
  { value: "ai_overview", label: "AI Overview", icon: Bot, color: "text-indigo-400" },
  { value: "featured_snippet", label: "Featured Snippet", icon: FileText, color: "text-amber-500" },
  { value: "faq", label: "FAQ / PAA", icon: HelpCircle, color: "text-blue-400" },
  
  // Media Features
  { value: "video", label: "Video", icon: Video, color: "text-red-500" },
  { value: "image", label: "Image Pack", icon: ImageIcon, color: "text-pink-400" },
  
  // Commerce Features
  { value: "shopping", label: "Shopping", icon: ShoppingCart, color: "text-green-400" },
  { value: "ad", label: "Ads", icon: Megaphone, color: "text-yellow-500" },
  
  // Local & News
  { value: "local", label: "Local Pack", icon: MapPin, color: "text-orange-400" },
  { value: "news", label: "News", icon: Newspaper, color: "text-cyan-400" },
  
  // Other Features
  { value: "reviews", label: "Reviews", icon: Trophy, color: "text-yellow-400" },
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
            "h-7 sm:h-9 gap-0.5 sm:gap-1.5 bg-secondary/50 border-border text-[11px] sm:text-sm px-1.5 sm:px-3 shrink-0 min-w-0",
            hasFilter && "border-indigo-500/50"
          )}
        >
          <FileText className="h-3 w-3 text-indigo-400 shrink-0" />
          <span>SERP</span>
          {hasFilter && (
            <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[10px] bg-indigo-500/20 text-indigo-400">
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
                  onClick={() => onToggleFeature(feature.value)}
                  className="w-full flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded text-xs sm:text-sm transition-colors hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox checked={tempSelectedFeatures.includes(feature.value)} />
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
