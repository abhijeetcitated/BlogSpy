"use client"

// ============================================
// Include/Exclude Filter Popover Component
// ============================================

import { useState } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useKeywordStore } from "../../store"

function normalizeTerm(term: string): string {
  return term.trim().toLowerCase()
}

function parseTerms(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((term) => normalizeTerm(term))
    .filter((term) => term.length > 0)
}

export function IncludeExcludeFilter() {
  const includeTerms = useKeywordStore((state) => state.filters.includeTerms)
  const excludeTerms = useKeywordStore((state) => state.filters.excludeTerms)
  const setIncludeTerms = useKeywordStore((state) => state.setIncludeTerms)
  const setExcludeTerms = useKeywordStore((state) => state.setExcludeTerms)

  const [open, setOpen] = useState(false)
  const [includeInput, setIncludeInput] = useState("")
  const [excludeInput, setExcludeInput] = useState("")

  const totalCount = includeTerms.length + excludeTerms.length
  const hasFilters = totalCount > 0

  const addIncludeTerms = (raw: string) => {
    const nextTerms = parseTerms(raw)
    if (nextTerms.length === 0) return
    const merged = new Set(includeTerms)
    for (const term of nextTerms) merged.add(term)
    setIncludeTerms(Array.from(merged))
  }

  const addExcludeTerms = (raw: string) => {
    const nextTerms = parseTerms(raw)
    if (nextTerms.length === 0) return
    const merged = new Set(excludeTerms)
    for (const term of nextTerms) merged.add(term)
    setExcludeTerms(Array.from(merged))
  }

  const handleIncludeSubmit = () => {
    if (!includeInput.trim()) return
    addIncludeTerms(includeInput)
    setIncludeInput("")
  }

  const handleExcludeSubmit = () => {
    if (!excludeInput.trim()) return
    addExcludeTerms(excludeInput)
    setExcludeInput("")
  }

  const handleReset = () => {
    setIncludeTerms([])
    setExcludeTerms([])
    setIncludeInput("")
    setExcludeInput("")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 sm:h-9 gap-0.5 sm:gap-1.5 bg-secondary/50 border-border text-foreground text-[11px] sm:text-sm px-1.5 sm:px-3 shrink-0 min-w-0",
            hasFilters && "border-[#FFD700]/70"
          )}
        >
          <Filter className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          <span className="hidden sm:inline">Include/Exclude</span>
          <span className="sm:hidden">+/-</span>
          {hasFilters && (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 px-1 text-[10px] bg-[#FFD700] text-amber-950"
            >
              Filters ({totalCount})
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-3" align="start">
        <div className="space-y-4">
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Include Keywords
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {includeTerms.map((term) => (
                <Badge
                  key={term}
                  variant="secondary"
                  className="gap-1 border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                >
                  {term}
                  <button
                    type="button"
                    className="ml-1 text-xs"
                    onClick={() => {
                      const next = includeTerms.filter((item) => item !== term)
                      setIncludeTerms(next)
                    }}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Type and press Enter"
              value={includeInput}
              onChange={(e) => setIncludeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault()
                  handleIncludeSubmit()
                }
              }}
              onBlur={() => {
                if (includeInput.trim()) handleIncludeSubmit()
              }}
              className="h-8 text-sm"
            />
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Exclude Keywords
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {excludeTerms.map((term) => (
                <Badge
                  key={term}
                  variant="secondary"
                  className="gap-1 border bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                >
                  {term}
                  <button
                    type="button"
                    className="ml-1 text-xs"
                    onClick={() => {
                      const next = excludeTerms.filter((item) => item !== term)
                      setExcludeTerms(next)
                    }}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Type and press Enter"
              value={excludeInput}
              onChange={(e) => setExcludeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault()
                  handleExcludeSubmit()
                }
              }}
              onBlur={() => {
                if (excludeInput.trim()) handleExcludeSubmit()
              }}
              className="h-8 text-sm"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
              Reset
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
