"use client"

import {
  SearchIcon,
  ViewsIcon,
  SparklesIcon,
  RefreshIcon,
} from "@/components/icons/platform-icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ViewMode } from "../types"

// Inline SVG Icons for toolbar
const CloseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
)

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.8 11.8 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
)

const GraphIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
)

const ListIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
)

interface TopToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  showHighVolume: boolean
  onToggleHighVolume: () => void
  hideHardKD: boolean
  onToggleHideHardKD: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onGenerate: () => void
  isGenerating?: boolean
  clusterCount?: number
}

export function TopToolbar({
  searchQuery,
  onSearchChange,
  showHighVolume,
  onToggleHighVolume,
  hideHardKD,
  onToggleHideHardKD,
  viewMode,
  onViewModeChange,
  onGenerate,
  isGenerating = false,
  clusterCount = 0,
}: TopToolbarProps) {
  return (
    <div className="shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between gap-4 px-4 py-3">
        {/* Left Section: Search + Results Count */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <Input
              placeholder="Search clusters..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-violet-500/20 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm w-56"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-500 dark:text-zinc-400 transition-colors"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            )}
          </div>
          
          {clusterCount > 0 && (
            <Badge variant="secondary" className="text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {clusterCount} {clusterCount === 1 ? 'Cluster' : 'Clusters'}
            </Badge>
          )}
        </div>

        {/* Center Section: Filter Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleHighVolume}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              showHighVolume
                ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
            title="Filter: Show only high volume keywords (5,000+)"
          >
            <ViewsIcon className="h-3.5 w-3.5" />
            <span>High Volume</span>
            {showHighVolume && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
          
          <button
            onClick={onToggleHideHardKD}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              hideHardKD
                ? "bg-red-50 dark:bg-red-500/20 border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400"
                : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
            title="Filter: Hide hard difficulty keywords (KD > 60)"
          >
            <EyeOffIcon className="h-3.5 w-3.5" />
            <span>Hide Hard KD</span>
            {hideHardKD && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Right Section: View Toggle + Generate */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => onViewModeChange("graph")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === "graph"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
              title="Network Graph View"
            >
              <GraphIcon className="h-3.5 w-3.5" />
              Graph
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
              title="List View"
            >
              <ListIcon className="h-3.5 w-3.5" />
              List
            </button>
          </div>

          {/* Generate Button */}
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="h-9 px-5 bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 dark:shadow-violet-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshIcon className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4 mr-2" />
                Generate Strategy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tablet Layout (md to lg) */}
      <div className="hidden md:flex lg:hidden flex-col gap-3 px-4 py-3">
        {/* Top Row: Search + Generate */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <Input
              placeholder="Search clusters..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-violet-500/20 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm w-full"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-500 dark:text-zinc-400 transition-colors"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="h-9 px-4 bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 transition-all shrink-0"
          >
            {isGenerating ? (
              <RefreshIcon className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <SparklesIcon className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>

        {/* Bottom Row: Filters + View Toggle + Count */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleHighVolume}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                showHighVolume
                  ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                  : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <ViewsIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">High Vol</span>
            </button>
            
            <button
              onClick={onToggleHideHardKD}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                hideHardKD
                  ? "bg-red-50 dark:bg-red-500/20 border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400"
                  : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <EyeOffIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Hide Hard</span>
            </button>
            
            {clusterCount > 0 && (
              <Badge variant="secondary" className="text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {clusterCount}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => onViewModeChange("graph")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "graph"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <GraphIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col gap-1.5 px-2 py-2">
        {/* Search Row */}
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:border-violet-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs w-full"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
            >
              <CloseIcon className="h-2.5 w-2.5" />
            </button>
          )}
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleHighVolume}
              className={`p-1.5 rounded-md transition-all border ${
                showHighVolume
                  ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                  : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
              }`}
              title="High Volume"
            >
              <ViewsIcon className="h-3.5 w-3.5" />
            </button>
            
            <button
              onClick={onToggleHideHardKD}
              className={`p-1.5 rounded-md transition-all border ${
                hideHardKD
                  ? "bg-red-50 dark:bg-red-500/20 border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400"
                  : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
              }`}
              title="Hide Hard KD"
            >
              <EyeOffIcon className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-md p-0.5 border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => onViewModeChange("graph")}
                className={`p-1 rounded transition-all ${
                  viewMode === "graph"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                <GraphIcon className="h-3 w-3" />
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={`p-1 rounded transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                <ListIcon className="h-3 w-3" />
              </button>
            </div>
            
            {clusterCount > 0 && (
              <Badge variant="secondary" className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 h-5">
                {clusterCount}
              </Badge>
            )}
          </div>

          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            size="sm"
            className="h-7 px-2.5 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-semibold shadow-md shadow-violet-500/25"
          >
            {isGenerating ? (
              <RefreshIcon className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <SparklesIcon className="h-3 w-3 mr-1" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
