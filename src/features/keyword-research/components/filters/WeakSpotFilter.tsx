"use client"

// ============================================
// Weak Spot Filter Popover Component
// ============================================

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useKeywordStore } from "../../store"

interface WeakSpotFilterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTypes: string[]
  weakSpotToggle: "all" | "with" | "without"
}

const RedditIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("h-4 w-4", className)}
    aria-label="Reddit"
    fill="#FF4500"
  >
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.094z" />
  </svg>
)

const QuoraIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("h-4 w-4", className)}
    aria-label="Quora"
    fill="#B92B27"
  >
    <path d="M12.738 17.426c-.768-1.476-1.572-2.964-2.984-2.964-.432 0-.864.144-1.152.432l-.576-.96c.576-.528 1.44-.816 2.448-.816 1.872 0 3.024 1.008 3.936 2.4.528-1.008.816-2.352.816-3.936 0-4.416-1.584-7.248-4.992-7.248-3.408 0-5.04 2.832-5.04 7.248 0 4.392 1.632 7.2 5.04 7.2.576 0 1.104-.048 1.584-.192l.48.816c-.768.288-1.392.432-2.256.432C5.112 19.838 2.4 16.07 2.4 11.582c0-4.512 2.712-8.256 7.728-8.256 5.016 0 7.68 3.744 7.68 8.256 0 2.304-.576 4.272-1.584 5.712.864 1.296 1.824 1.824 2.976 1.824 1.008 0 1.44-.336 1.776-.816l.624.768c-.624.816-1.392 1.44-2.736 1.44-1.728 0-3.072-.72-4.224-2.208-.48.072-1.008.144-1.632.144-.048-.024-.144-.024-.27-.02z" />
  </svg>
)

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("h-4 w-4", className)}
    aria-label="Pinterest"
    fill="#E60023"
  >
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345c-.091.378-.293 1.194-.332 1.361-.053.218-.173.265-.4.16-1.492-.695-2.424-2.879-2.424-4.635 0-3.77 2.739-7.227 7.9-7.227 4.147 0 7.37 2.955 7.37 6.899 0 4.117-2.596 7.431-6.199 7.431-1.211 0-2.348-.629-2.738-1.373 0 0-.599 2.282-.745 2.838-.269 1.039-1.001 2.34-1.491 3.134C9.571 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  </svg>
)

const WEAK_SPOT_OPTIONS = [
  { value: "reddit", label: "Reddit", Icon: RedditIcon },
  { value: "quora", label: "Quora", Icon: QuoraIcon },
  { value: "pinterest", label: "Pinterest", Icon: PinterestIcon },
] as const

export function WeakSpotFilter({
  open,
  onOpenChange,
  selectedTypes,
  weakSpotToggle,
}: WeakSpotFilterProps) {
  const setFilter = useKeywordStore((state) => state.setFilter)
  const setWeakSpotFilters = useKeywordStore((state) => state.setWeakSpotFilters)

  const [tempToggle, setTempToggle] = useState<"all" | "with" | "without">(weakSpotToggle)
  const [tempSelected, setTempSelected] = useState<string[]>(selectedTypes)

  useEffect(() => {
    if (open) {
      setTempToggle(weakSpotToggle)
      setTempSelected(selectedTypes)
    }
  }, [open, selectedTypes, weakSpotToggle])

  const hasFilter = weakSpotToggle !== "all" || selectedTypes.length > 0
  const filterCount = useMemo(() => {
    if (selectedTypes.length > 0) return selectedTypes.length
    return weakSpotToggle !== "all" ? 1 : 0
  }, [selectedTypes.length, weakSpotToggle])

  const toggleTemp = (value: string) => {
    setTempSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    )
  }

  const handleApply = () => {
    const nextTypes = tempToggle === "with" ? tempSelected : []
    setFilter("weakSpotToggle", tempToggle)
    setWeakSpotFilters(nextTypes)
    onOpenChange(false)
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
          <Target className="h-3 w-3 text-[#FFD700] shrink-0" />
          <span>Weak Spot</span>
          {filterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 px-1 text-[10px] bg-[#FFD700] text-amber-950"
            >
              {filterCount}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium">Weak Spot Filter</span>
          </div>

          <div className="text-xs text-muted-foreground">
            Focus on keywords where weaker platforms rank in the top 10.
          </div>

          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
            Show Keywords
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { value: "all", label: "All" },
              { value: "with", label: "With" },
              { value: "without", label: "Without" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTempToggle(option.value as "all" | "with" | "without")}
                className={cn(
                  "rounded-md border px-2 py-1 text-center transition-colors",
                  tempToggle === option.value
                    ? "border-amber-500/60 text-amber-500"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
            Platforms
          </div>

          <div className="space-y-1">
            {WEAK_SPOT_OPTIONS.map(({ value, label, Icon }) => (
              <label
                key={value}
                onClick={() => tempToggle === "with" && toggleTemp(value)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                  tempToggle === "with" ? "hover:bg-muted/50 cursor-pointer" : "opacity-50 cursor-not-allowed"
                )}
              >
                <Checkbox checked={tempSelected.includes(value)} disabled={tempToggle !== "with"} />
                <Icon />
                <span className="flex-1 text-left">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTempToggle("all")
                setTempSelected([])
              }}
              className="flex-1"
            >
              Clear
            </Button>
            <Button onClick={handleApply} className="flex-1 bg-primary hover:bg-primary/90">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
