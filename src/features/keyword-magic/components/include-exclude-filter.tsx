"use client"

// ============================================
// Include/Exclude Filter Popover Component
// ============================================

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface IncludeExcludeFilterProps {
  includeTerms: string[]
  excludeTerms: string[]
  includeInput: string
  excludeInput: string
  onIncludeInputChange: (value: string) => void
  onExcludeInputChange: (value: string) => void
  onAddIncludeTerm: () => void
  onAddExcludeTerm: () => void
  onRemoveIncludeTerm: (term: string) => void
  onRemoveExcludeTerm: (term: string) => void
}

export function IncludeExcludeFilter({
  includeTerms,
  excludeTerms,
  includeInput,
  excludeInput,
  onIncludeInputChange,
  onExcludeInputChange,
  onAddIncludeTerm,
  onAddExcludeTerm,
  onRemoveIncludeTerm,
  onRemoveExcludeTerm,
}: IncludeExcludeFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 sm:h-9 gap-1 sm:gap-1.5 bg-secondary/50 border-border text-xs sm:text-sm px-2 sm:px-3 shrink-0">
          <Filter className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">Include/Exclude</span>
          <span className="sm:hidden">+/-</span>
          {(includeTerms.length > 0 || excludeTerms.length > 0) && (
            <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
              {includeTerms.length + excludeTerms.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-3" align="start">
        <div className="space-y-4">
          {/* Include Section */}
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Include Keywords
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add term..."
                value={includeInput}
                onChange={(e) => onIncludeInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onAddIncludeTerm()}
                className="h-8 text-sm flex-1"
              />
              <Button size="sm" onClick={onAddIncludeTerm} className="h-8">
                Add
              </Button>
            </div>
            {includeTerms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {includeTerms.map((term) => (
                  <Badge
                    key={term}
                    variant="secondary"
                    className="bg-green-500/15 text-green-400 border border-green-500/30 cursor-pointer hover:bg-green-500/25"
                    onClick={() => onRemoveIncludeTerm(term)}
                  >
                    {term} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Exclude Section */}
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Exclude Keywords
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add term..."
                value={excludeInput}
                onChange={(e) => onExcludeInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onAddExcludeTerm()}
                className="h-8 text-sm flex-1"
              />
              <Button size="sm" onClick={onAddExcludeTerm} className="h-8">
                Add
              </Button>
            </div>
            {excludeTerms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {excludeTerms.map((term) => (
                  <Badge
                    key={term}
                    variant="secondary"
                    className="bg-red-500/15 text-red-400 border border-red-500/30 cursor-pointer hover:bg-red-500/25"
                    onClick={() => onRemoveExcludeTerm(term)}
                  >
                    {term} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
