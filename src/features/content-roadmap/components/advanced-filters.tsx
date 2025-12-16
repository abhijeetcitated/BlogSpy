"use client"

// ============================================
// Advanced Filters Component
// ============================================

import { useState } from "react"
import {
  Filter,
  X,
  Calendar,
  User,
  Tag,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  Lightbulb,
  PenTool,
  Flame,
  Clock,
  CalendarDays,
  CalendarClock,
  AlertTriangle,
  FileText,
  BookOpen,
  GraduationCap,
  Star,
  GitCompare,
  ListOrdered,
  Newspaper,
  FolderOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { TaskStatus, TaskTag, TaskFilters } from "../types"
import { TAG_COLORS, TAG_LABELS, ASSIGNEES } from "../types"

interface AdvancedFiltersProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  activeFilterCount: number
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  activeFilterCount,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false)

  const updateFilter = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onFiltersChange({
      status: "all",
      assignee: "",
      tag: "all",
      dateRange: "all",
      search: filters.search, // Keep search
    })
  }

  const allTags: TaskTag[] = ["blog", "guide", "tutorial", "review", "comparison", "listicle", "news", "case-study"]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-2 border-slate-700/50 bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all",
            activeFilterCount > 0 && "border-purple-500/50 bg-purple-500/10 text-purple-300"
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-purple-500 text-white text-[10px] font-bold"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-5 bg-slate-900 border border-slate-800 shadow-2xl rounded-xl" align="end">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-semibold text-sm text-white">Filters</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 px-2 text-xs gap-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(v) => updateFilter("status", v as TaskStatus | "all")}
            >
              <SelectTrigger className="h-9 bg-slate-800 border-slate-700 text-sm text-white rounded-lg">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border border-slate-800 shadow-2xl rounded-lg">
                <SelectItem value="all" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">All Statuses</SelectItem>
                <SelectItem value="backlog" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-slate-400" />
                    Backlog
                  </div>
                </SelectItem>
                <SelectItem value="ready" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                  <div className="flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-blue-400" />
                    Ready to Write
                  </div>
                </SelectItem>
                <SelectItem value="progress" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-amber-400" />
                    In Progress
                  </div>
                </SelectItem>
                <SelectItem value="published" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Published
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              Assignee
            </label>
            <Select
              value={filters.assignee || "all"}
              onValueChange={(v) => updateFilter("assignee", v === "all" ? "" : v)}
            >
              <SelectTrigger className="h-9 bg-slate-800 border-slate-700 text-sm text-white rounded-lg">
                <SelectValue placeholder="All assignees" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border border-slate-800 shadow-2xl rounded-lg">
                <SelectItem value="all" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">All Assignees</SelectItem>
                {ASSIGNEES.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", a.color)} />
                      {a.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Due Date
            </label>
            <Select
              value={filters.dateRange}
              onValueChange={(v) => updateFilter("dateRange", v as TaskFilters["dateRange"])}
            >
              <SelectTrigger className="h-9 bg-slate-800 border-slate-700 text-sm text-white rounded-lg">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border border-slate-800 shadow-2xl rounded-lg">
                <SelectItem value="all" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    Any Time
                  </div>
                </SelectItem>
                <SelectItem value="today" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    Due Today
                  </div>
                </SelectItem>
                <SelectItem value="week" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-purple-400" />
                    This Week
                  </div>
                </SelectItem>
                <SelectItem value="month" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    This Month
                  </div>
                </SelectItem>
                <SelectItem value="overdue" className="text-sm text-red-400 focus:bg-red-500/10 focus:text-red-300">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    Overdue
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tag Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <Tag className="h-3.5 w-3.5" />
              Content Type
            </label>
            <Select
              value={filters.tag}
              onValueChange={(v) => updateFilter("tag", v as TaskTag | "all")}
            >
              <SelectTrigger className="h-9 bg-slate-800 border-slate-700 text-sm text-white rounded-lg">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border border-slate-800 shadow-2xl rounded-lg">
                <SelectItem value="all" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">All Types</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag} className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", TAG_COLORS[tag].bg.replace("/20", ""))} />
                      {TAG_LABELS[tag]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="pt-3 border-t border-slate-800">
              <p className="text-xs text-slate-500 mb-2">Active filters:</p>
              <div className="flex flex-wrap gap-1.5">
                {filters.status !== "all" && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-slate-800/80 text-slate-300 gap-1.5 px-2 py-0.5 rounded-md"
                  >
                    Status: {filters.status}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-400 transition-colors"
                      onClick={() => updateFilter("status", "all")}
                    />
                  </Badge>
                )}
                {filters.assignee && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-slate-800/80 text-slate-300 gap-1.5 px-2 py-0.5 rounded-md"
                  >
                    Assignee: {filters.assignee}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-400 transition-colors"
                      onClick={() => updateFilter("assignee", "")}
                    />
                  </Badge>
                )}
                {filters.dateRange !== "all" && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-slate-800/80 text-slate-300 gap-1.5 px-2 py-0.5 rounded-md"
                  >
                    Date: {filters.dateRange}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-400 transition-colors"
                      onClick={() => updateFilter("dateRange", "all")}
                    />
                  </Badge>
                )}
                {filters.tag !== "all" && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-slate-800/80 text-slate-300 gap-1.5 px-2 py-0.5 rounded-md"
                  >
                    Tag: {TAG_LABELS[filters.tag as TaskTag]}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-400 transition-colors"
                      onClick={() => updateFilter("tag", "all")}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
