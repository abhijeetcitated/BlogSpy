"use client"

import { Search, Filter, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import type { EventCategory, EventSource, IndustryNiche, Season } from "../../types"
import { sourceConfig, categoryConfig, seasonIcons, seasonColors } from "../../constants"

// Event categories for filter dropdown
const EVENT_CATEGORIES: EventCategory[] = [
  "All", "Shopping", "Health", "Entertainment", "Travel", "Lifestyle", 
  "Finance", "Tech", "Sports", "Education", "Food", "Fashion", "Media", "Environment"
]

// Industry niches for filter dropdown
const INDUSTRY_NICHES: IndustryNiche[] = [
  "All", "Tech", "Health", "Finance", "E-commerce", "SaaS", 
  "Marketing", "Travel", "Food", "Fashion", "Education"
]

// Seasons for legend display
const SEASONS: Season[] = ["winter", "spring", "summer", "fall"]

interface CalendarFiltersProps {
  calendarSearch: string
  selectedSource: EventSource | "all"
  selectedCategory: EventCategory
  selectedNiche: IndustryNiche
  hasActiveFilters: boolean
  onSearchChange: (value: string) => void
  onSourceChange: (source: EventSource | "all") => void
  onCategoryChange: (category: EventCategory) => void
  onNicheChange: (niche: IndustryNiche) => void
  onClearFilters: () => void
}

export function CalendarFilters({
  calendarSearch,
  selectedSource,
  selectedCategory,
  selectedNiche,
  hasActiveFilters,
  onSearchChange,
  onSourceChange,
  onCategoryChange,
  onNicheChange,
  onClearFilters,
}: CalendarFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border/50">
      {/* Search */}
      <div className="relative flex-1 min-w-[150px] max-w-[200px]">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={calendarSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-7 pl-7 text-xs bg-muted/50 border-border/50"
        />
      </div>

      {/* Source Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "h-7 text-[10px] gap-1",
              selectedSource !== "all" && "bg-blue-500/20 border-blue-500/30 text-blue-400"
            )}
          >
            {selectedSource === "all" 
              ? "📊 All Sources" 
              : `${sourceConfig[selectedSource].icon} ${sourceConfig[selectedSource].label}`
            }
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-1" align="start">
          <button
            onClick={() => onSourceChange("all")}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-muted transition-colors text-left",
              selectedSource === "all" && "bg-muted"
            )}
          >
            📊 All Sources
            {selectedSource === "all" && <Check className="h-3 w-3 ml-auto text-emerald-400" />}
          </button>
          {(Object.entries(sourceConfig) as [EventSource, typeof sourceConfig[EventSource]][]).map(([key, src]) => (
            <button
              key={key}
              onClick={() => onSourceChange(key)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-muted transition-colors text-left",
                selectedSource === key && "bg-muted"
              )}
            >
              <span>{src.icon}</span>
              <span>{src.label}</span>
              {selectedSource === key && <Check className="h-3 w-3 ml-auto text-emerald-400" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Category Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "h-7 text-[10px] gap-1",
              selectedCategory !== "All" && `${categoryConfig[selectedCategory].bgColor} ${categoryConfig[selectedCategory].color} border-current/30`
            )}
          >
            <Filter className="h-3 w-3" />
            {selectedCategory}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1 max-h-64 overflow-y-auto" align="start">
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-muted transition-colors text-left",
                selectedCategory === cat && "bg-muted"
              )}
            >
              <div className={`w-2 h-2 rounded-full ${categoryConfig[cat].bgColor}`} />
              {cat}
              {selectedCategory === cat && <Check className="h-3 w-3 ml-auto text-emerald-400" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Niche Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "h-7 text-[10px] gap-1",
              selectedNiche !== "All" && "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
            )}
          >
            🏢 {selectedNiche === "All" ? "All Industries" : selectedNiche}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1" align="start">
          {INDUSTRY_NICHES.map((niche) => (
            <button
              key={niche}
              onClick={() => onNicheChange(niche)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-muted transition-colors text-left",
                selectedNiche === niche && "bg-muted"
              )}
            >
              {niche}
              {selectedNiche === niche && <Check className="h-3 w-3 ml-auto text-emerald-400" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-7 text-[10px] text-muted-foreground hover:text-foreground"
        >
          Clear All
        </Button>
      )}

      {/* Season Legend - Right Side */}
      <div className="flex items-center gap-1 ml-auto">
        {SEASONS.map((season) => {
          const Icon = seasonIcons[season]
          return (
            <div 
              key={season} 
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] ${seasonColors[season]}`}
            >
              <Icon className="h-2.5 w-2.5" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
