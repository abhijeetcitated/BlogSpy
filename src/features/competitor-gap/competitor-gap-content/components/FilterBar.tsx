"use client"

import { Search, Download, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  showHighVolume: boolean
  showLowKD: boolean
  showTrending: boolean
  onHighVolumeChange: (value: boolean) => void
  onLowKDChange: (value: boolean) => void
  onTrendingChange: (value: boolean) => void
  onExport: () => void
  isGapAnalysis: boolean
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  showHighVolume,
  showLowKD,
  showTrending,
  onHighVolumeChange,
  onLowKDChange,
  onTrendingChange,
  onExport,
  isGapAnalysis,
}: FilterBarProps) {
  const activeFilters = [showHighVolume, showLowKD, showTrending].filter(Boolean).length

  return (
    <div className="py-3 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/30 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 sm:flex-none sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isGapAnalysis ? "Search keywords..." : "Search discussions..."}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm bg-background border-border"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 text-sm font-medium border-border hover:bg-muted">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilters > 0 && (
                <span className="ml-1.5 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Quick Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showHighVolume}
              onCheckedChange={onHighVolumeChange}
            >
              High Volume (&gt;1K)
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showLowKD}
              onCheckedChange={onLowKDChange}
            >
              Low Difficulty (&lt;30)
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showTrending}
              onCheckedChange={onTrendingChange}
            >
              Trending Keywords
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                onHighVolumeChange(false)
                onLowKDChange(false)
                onTrendingChange(false)
                toast.info("Filters cleared")
              }}
              className="text-muted-foreground"
            >
              Clear All Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 text-xs sm:text-sm font-medium border-border hover:bg-muted" 
          onClick={onExport}
        >
          <Download className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Export CSV</span>
        </Button>
      </div>
    </div>
  )
}
