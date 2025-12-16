"use client"

import { useCallback } from "react"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  MoreHorizontal,
  Pencil,
  CalendarPlus,
  ExternalLink,
  Copy,
  ChevronUp,
  ChevronDown,
  Check,
  Target,
  Zap,
  Crown,
  AlertCircle,
  DollarSign,
  BookOpen,
  ShoppingCart,
  Compass,
  Rocket,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { GapKeyword, SortField, SortDirection, TrendDirection, Intent } from "../types"

// ============================================
// Props Interface
// ============================================

interface GapAnalysisTableProps {
  keywords: GapKeyword[]
  selectedRows: Set<string>
  addedKeywords: Set<string>
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onSelectAll: (checked: boolean) => void
  onSelectRow: (id: string, checked: boolean) => void
  onAddToRoadmap: (keyword: GapKeyword) => void
  onBulkAddToRoadmap: () => void
  onClearSelection: () => void
  onWriteArticle?: (keyword: GapKeyword) => void
}

// ============================================
// Constants
// ============================================

const INTENT_CONFIG = {
  commercial: { 
    icon: "commercial", 
    label: "Commercial", 
    bg: "bg-amber-500/10 dark:bg-amber-500/15", 
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30"
  },
  informational: { 
    icon: "info", 
    label: "Info", 
    bg: "bg-blue-500/10 dark:bg-blue-500/15", 
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30"
  },
  transactional: { 
    icon: "transact", 
    label: "Transact", 
    bg: "bg-green-500/10 dark:bg-green-500/15", 
    text: "text-green-600 dark:text-green-400",
    border: "border-green-500/30"
  },
  navigational: { 
    icon: "navigate", 
    label: "Navigate", 
    bg: "bg-purple-500/10 dark:bg-purple-500/15", 
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/30"
  },
}

const GAP_CONFIG = {
  missing: { 
    icon: AlertCircle,
    label: "Missing", 
    bg: "bg-red-500/10 dark:bg-red-500/15", 
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/30"
  },
  weak: { 
    icon: Target,
    label: "Weak", 
    bg: "bg-yellow-500/10 dark:bg-yellow-500/15", 
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-500/30"
  },
  strong: { 
    icon: Crown,
    label: "Strong", 
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15", 
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30"
  },
  shared: { 
    icon: Zap,
    label: "Shared", 
    bg: "bg-blue-500/10 dark:bg-blue-500/15", 
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30"
  },
  all: { 
    icon: Zap,
    label: "All", 
    bg: "bg-muted", 
    text: "text-muted-foreground",
    border: "border-border"
  },
}

const TREND_CONFIG = {
  rising: { 
    icon: Rocket, 
    label: "Trending Up", 
    color: "text-emerald-600 dark:text-emerald-400", 
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    border: "border-emerald-500/30"
  },
  growing: { 
    icon: ArrowUpRight, 
    label: "Growing", 
    color: "text-green-600 dark:text-green-400", 
    bg: "bg-green-500/10 dark:bg-green-500/15",
    border: "border-green-500/30"
  },
  stable: { 
    icon: Minus, 
    label: "Stable", 
    color: "text-slate-600 dark:text-slate-400", 
    bg: "bg-slate-500/10 dark:bg-slate-500/15",
    border: "border-slate-500/30"
  },
  declining: { 
    icon: ArrowDownRight, 
    label: "Declining", 
    color: "text-orange-600 dark:text-orange-400", 
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    border: "border-orange-500/30"
  },
  falling: { 
    icon: TrendingDown, 
    label: "Dropping Fast", 
    color: "text-red-600 dark:text-red-400", 
    bg: "bg-red-500/10 dark:bg-red-500/15",
    border: "border-red-500/30"
  },
}

// ============================================
// Sub Components
// ============================================

// Intent icon mapping
const INTENT_ICONS = {
  commercial: DollarSign,
  informational: BookOpen,
  transactional: ShoppingCart,
  navigational: Compass,
} as const

function IntentBadge({ intent }: { intent: Intent }) {
  const config = INTENT_CONFIG[intent]
  const Icon = INTENT_ICONS[intent]
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border",
      config.bg, config.text, config.border
    )}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  )
}

function GapBadge({ gapType }: { gapType: GapKeyword["gapType"] }) {
  if (gapType === "all") return null
  const config = GAP_CONFIG[gapType]
  const Icon = config.icon
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-default",
          config.bg, config.border
        )}>
          <Icon className={cn("w-3.5 h-3.5", config.text)} />
          <span className={cn("text-xs font-semibold", config.text)}>
            {config.label}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs bg-popover border-border">
        {gapType === "missing" && "You don't rank for this keyword"}
        {gapType === "weak" && "You rank lower than competitors"}
        {gapType === "strong" && "You outrank competitors"}
        {gapType === "shared" && "Similar rankings"}
      </TooltipContent>
    </Tooltip>
  )
}

function RanksDisplay({ 
  yourRank, 
  comp1Rank, 
  comp2Rank 
}: { 
  yourRank: number | null
  comp1Rank: number | null
  comp2Rank: number | null
}) {
  const formatRank = (rank: number | null) => rank ?? "—"
  const getRankStyle = (rank: number | null, isYou: boolean) => {
    if (!rank) return "text-muted-foreground bg-muted"
    if (isYou) {
      if (rank <= 10) return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30"
      if (rank <= 30) return "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 dark:bg-yellow-500/15 border-yellow-500/30"
      return "text-muted-foreground bg-muted border-border"
    }
    return "text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/15 border-red-500/20"
  }

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            "w-8 h-7 flex items-center justify-center rounded-md text-xs font-bold border",
            getRankStyle(yourRank, true)
          )}>
            {formatRank(yourRank)}
          </span>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Your Rank</TooltipContent>
      </Tooltip>
      <span className="text-muted-foreground text-xs">/</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            "w-8 h-7 flex items-center justify-center rounded-md text-xs font-medium border",
            getRankStyle(comp1Rank, false)
          )}>
            {formatRank(comp1Rank)}
          </span>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Competitor 1</TooltipContent>
      </Tooltip>
      <span className="text-muted-foreground text-xs">/</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            "w-8 h-7 flex items-center justify-center rounded-md text-xs font-medium border",
            "border-orange-500/20 text-orange-600 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-500/15"
          )}>
            {formatRank(comp2Rank)}
          </span>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Competitor 2</TooltipContent>
      </Tooltip>
    </div>
  )
}

function KDBar({ kd }: { kd: number }) {
  const getConfig = () => {
    if (kd < 30) return { color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "Easy" }
    if (kd < 50) return { color: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400", label: "Medium" }
    if (kd < 70) return { color: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", label: "Hard" }
    return { color: "bg-red-500", text: "text-red-600 dark:text-red-400", label: "Very Hard" }
  }
  const config = getConfig()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-default">
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden border border-border">
            <div 
              className={cn("h-full rounded-full transition-all", config.color)}
              style={{ width: `${kd}%` }}
            />
          </div>
          <span className={cn("text-xs font-bold w-6 tabular-nums", config.text)}>{kd}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-xs">
        {config.label} difficulty
      </TooltipContent>
    </Tooltip>
  )
}

function TrendIndicator({ trend }: { trend: TrendDirection }) {
  const config = TREND_CONFIG[trend]
  const Icon = config.icon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "p-2 rounded-lg border cursor-default",
          config.bg, config.border
        )}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {config.label}
      </TooltipContent>
    </Tooltip>
  )
}

function AITipButton({ tip, onWrite }: { tip?: string, onWrite: () => void }) {
  if (!tip) return <div className="w-8" />
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-lg bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/15">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-semibold text-sm text-purple-600 dark:text-purple-400">AI Suggestion</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {tip}
          </p>
          <div className="flex gap-2 pt-1">
            <Button 
              size="sm" 
              className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
              onClick={onWrite}
            >
              <Pencil className="w-3 h-3 mr-1.5" />
              Write Article
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs"
              onClick={() => {
                navigator.clipboard.writeText(tip)
                toast.success("✓ Copied to Clipboard", { 
                  description: "AI tip copied",
                  duration: 2000,
                })
              }}
            >
              <Copy className="w-3 h-3 mr-1.5" />
              Copy
            </Button>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function ActionsDropdown({ 
  keyword, 
  isAdded,
  onWrite,
  onAddToCalendar,
  onViewSerp,
  onCopy 
}: { 
  keyword: GapKeyword
  isAdded: boolean
  onWrite: () => void
  onAddToCalendar: () => void
  onViewSerp: () => void
  onCopy: () => void
}) {
  const handleCopy = () => {
    onCopy()
    toast.success("✓ Copied to Clipboard", {
      description: `"${keyword.keyword}"`,
      duration: 2000,
    })
  }

  const handleViewSerp = () => {
    onViewSerp()
  }

  const handleAddToCalendar = () => {
    if (!isAdded) {
      onAddToCalendar()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={onWrite} className="text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 dark:focus:text-emerald-400">
          <Pencil className="w-4 h-4 mr-2.5" />
          Write Article
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAddToCalendar} disabled={isAdded}>
          {isAdded ? (
            <>
              <Check className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">Added to Calendar</span>
            </>
          ) : (
            <>
              <CalendarPlus className="w-4 h-4 mr-2.5" />
              Add to Calendar
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewSerp}>
          <ExternalLink className="w-4 h-4 mr-2.5" />
          View in Google
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2.5" />
          Copy Keyword
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SortHeader({ 
  label, 
  field, 
  currentField, 
  direction, 
  onSort,
  className 
}: { 
  label: string
  field: SortField
  currentField: SortField
  direction: SortDirection
  onSort: (field: SortField) => void
  className?: string
}) {
  const isActive = currentField === field
  
  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        "flex items-center gap-1.5 text-xs font-semibold transition-colors group",
        isActive ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {label}
      <div className={cn(
        "flex flex-col items-center justify-center w-4 h-4",
        isActive ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground/50 group-hover:text-muted-foreground"
      )}>
        {isActive ? (
          direction === "asc" ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        ) : (
          <>
            <ChevronUp className="w-3 h-3 -mb-1" />
            <ChevronDown className="w-3 h-3 -mt-1" />
          </>
        )}
      </div>
    </button>
  )
}

// ============================================
// Main Component
// ============================================

export function GapAnalysisTable({
  keywords,
  selectedRows,
  addedKeywords,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectRow,
  onAddToRoadmap,
  onBulkAddToRoadmap,
  onClearSelection,
  onWriteArticle,
}: GapAnalysisTableProps) {
  
  const allSelected = keywords.length > 0 && selectedRows.size === keywords.length
  const someSelected = selectedRows.size > 0 && selectedRows.size < keywords.length

  const handleWrite = useCallback((keyword: GapKeyword) => {
    if (onWriteArticle) {
      onWriteArticle(keyword)
    } else {
      console.log("Write article for:", keyword.keyword)
    }
  }, [onWriteArticle])

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`
    return vol.toString()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Bulk Actions Bar */}
      {selectedRows.size > 0 && (
        <div className="px-6 py-3 bg-amber-500/5 dark:bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{selectedRows.size}</span>
            </div>
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              keyword{selectedRows.size > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
              onClick={onBulkAddToRoadmap}
            >
              <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
              Add to Calendar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={onClearSelection}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-background border-b border-border">
              <th className="w-12 px-4 py-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  className="border-amber-500/50 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
              </th>
              <th className="px-4 py-4 text-left">
                <SortHeader
                  label="Keyword"
                  field="keyword"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </th>
              <th className="w-28 px-4 py-4 text-center">
                <span className="text-xs font-semibold text-muted-foreground">Gap Status</span>
              </th>
              <th className="w-36 px-4 py-4 text-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs font-semibold text-muted-foreground cursor-help border-b border-dashed border-muted-foreground/50">
                      Rankings
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    <div className="space-y-1">
                      <p><span className="text-emerald-600 dark:text-emerald-400">You</span> / <span className="text-red-600 dark:text-red-400">C1</span> / <span className="text-orange-600 dark:text-orange-400">C2</span></p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-24 px-4 py-4">
                <SortHeader
                  label="Volume"
                  field="volume"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                  className="justify-center"
                />
              </th>
              <th className="w-32 px-4 py-4">
                <SortHeader
                  label="Difficulty"
                  field="kd"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                  className="justify-center"
                />
              </th>
              <th className="w-20 px-4 py-4">
                <SortHeader
                  label="Trend"
                  field="trend"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                  className="justify-center"
                />
              </th>
              <th className="w-28 px-4 py-4 text-center">
                <span className="text-xs font-semibold text-muted-foreground">Actions</span>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-border">
            {keywords.map((keyword, index) => (
              <tr
                key={keyword.id}
                className={cn(
                  "group transition-all duration-150",
                  selectedRows.has(keyword.id) 
                    ? "bg-amber-500/5 dark:bg-amber-500/10" 
                    : "hover:bg-muted/50"
                )}
              >
                {/* Checkbox */}
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selectedRows.has(keyword.id)}
                    onCheckedChange={(checked) => onSelectRow(keyword.id, !!checked)}
                    className="border-amber-500/50 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                </td>

                {/* Keyword + Intent */}
                <td className="px-4 py-4">
                  <div className="space-y-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {keyword.keyword}
                    </span>
                    <div>
                      <IntentBadge intent={keyword.intent} />
                    </div>
                  </div>
                </td>

                {/* Gap Type */}
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <GapBadge gapType={keyword.gapType} />
                  </div>
                </td>

                {/* Ranks */}
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <RanksDisplay
                      yourRank={keyword.yourRank}
                      comp1Rank={keyword.comp1Rank}
                      comp2Rank={keyword.comp2Rank}
                    />
                  </div>
                </td>

                {/* Volume */}
                <td className="px-4 py-4 text-center">
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {formatVolume(keyword.volume)}
                  </span>
                </td>

                {/* KD */}
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <KDBar kd={keyword.kd} />
                  </div>
                </td>

                {/* Trend */}
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <TrendIndicator trend={keyword.trend} />
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <AITipButton 
                      tip={keyword.aiTip} 
                      onWrite={() => handleWrite(keyword)}
                    />
                    <ActionsDropdown
                      keyword={keyword}
                      isAdded={addedKeywords.has(keyword.id)}
                      onWrite={() => handleWrite(keyword)}
                      onAddToCalendar={() => onAddToRoadmap(keyword)}
                      onViewSerp={() => window.open(`https://google.com/search?q=${encodeURIComponent(keyword.keyword)}`, "_blank")}
                      onCopy={() => navigator.clipboard.writeText(keyword.keyword)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {keywords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted border border-border mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground text-sm font-medium">No keywords found</p>
            <p className="text-muted-foreground text-xs mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
