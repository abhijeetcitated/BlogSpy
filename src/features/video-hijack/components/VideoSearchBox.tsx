// Video Search Box Component

"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "@/components/icons/platform-icons"

interface VideoSearchBoxProps {
  searchInput: string
  setSearchInput: (input: string) => void
  isLoading: boolean
  onSearch: () => void
}

export function VideoSearchBox({
  searchInput,
  setSearchInput,
  isLoading,
  onSearch,
}: VideoSearchBoxProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter a topic to find viral video opportunities (e.g. 'ai agents')..."
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
        Search any topic to discover video opportunities
      </p>
    </div>
  )
}
