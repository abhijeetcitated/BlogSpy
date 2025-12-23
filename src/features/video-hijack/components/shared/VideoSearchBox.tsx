// Video Search Box Component

"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, GlobeIcon } from "@/components/icons/platform-icons"
import type { SearchMode } from "../../types/common.types"

interface VideoSearchBoxProps {
  searchMode: SearchMode
  setSearchMode: (mode: SearchMode) => void
  searchInput: string
  setSearchInput: (input: string) => void
  isLoading: boolean
  onSearch: () => void
}

export function VideoSearchBox({
  searchMode,
  setSearchMode,
  searchInput,
  setSearchInput,
  isLoading,
  onSearch,
}: VideoSearchBoxProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      {/* Search Mode Toggle */}
      <div className="flex flex-col xs:flex-row xs:items-center gap-2 mb-3 sm:mb-4">
        <span className="text-xs sm:text-sm text-muted-foreground">Search by:</span>
        <div className="flex rounded-lg border border-border p-1 bg-muted/30 w-full xs:w-auto">
          <button
            onClick={() => setSearchMode("keyword")}
            className={cn(
              "flex-1 xs:flex-initial px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1 sm:gap-1.5",
              searchMode === "keyword"
                ? "bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <SearchIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Keyword
          </button>
          <button
            onClick={() => setSearchMode("domain")}
            className={cn(
              "flex-1 xs:flex-initial px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1 sm:gap-1.5",
              searchMode === "domain"
                ? "bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <GlobeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Domain
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          {searchMode === "keyword" ? (
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          ) : (
            <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <Input
            placeholder={
              searchMode === "keyword"
                ? "Enter keyword (e.g., SEO tutorial)"
                : "Enter domain (e.g., example.com)"
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="pl-10 h-10 sm:h-11 bg-background border-border text-foreground text-sm"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={onSearch}
          disabled={isLoading || !searchInput.trim()}
          className="h-10 sm:h-11 px-4 sm:px-6 bg-red-500 hover:bg-red-600 text-white font-semibold w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span className="sm:inline">Searching...</span>
            </>
          ) : (
            <>
              <SearchIcon className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3">
        {searchMode === "keyword"
          ? "Search any topic to discover video opportunities"
          : "Enter your domain to find video keywords"}
      </p>
    </div>
  )
}
