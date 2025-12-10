"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { 
  Search, 
  Loader2, 
  X, 
  History, 
  TrendingUp,
  Sparkles,
  Globe,
  Filter,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface KeywordSearchFormProps {
  onSearch: (keyword: string, options?: SearchOptions) => void | Promise<void>
  isLoading?: boolean
  placeholder?: string
  showHistory?: boolean
  showSuggestions?: boolean
  showFilters?: boolean
  recentSearches?: string[]
  suggestions?: string[]
  className?: string
}

interface SearchOptions {
  location: string
  language: string
  device: "desktop" | "mobile" | "all"
}

const locations = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "IN", name: "India" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
]

const defaultSuggestions = [
  "seo tools",
  "keyword research",
  "content marketing",
  "backlink analysis",
  "rank tracking",
]

export function KeywordSearchForm({
  onSearch,
  isLoading = false,
  placeholder = "Enter a keyword or phrase...",
  showHistory = true,
  showSuggestions = true,
  showFilters = true,
  recentSearches = [],
  suggestions = defaultSuggestions,
  className,
}: KeywordSearchFormProps) {
  const [keyword, setKeyword] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [options, setOptions] = useState<SearchOptions>({
    location: "US",
    language: "en",
    device: "all",
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (keyword.trim()) {
      onSearch(keyword.trim(), options)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setKeyword(suggestion)
    onSearch(suggestion, options)
    setIsFocused(false)
  }

  const handleClear = () => {
    setKeyword("")
    inputRef.current?.focus()
  }

  const showDropdown = isFocused && !isLoading && (
    (showHistory && recentSearches.length > 0) ||
    (showSuggestions && suggestions.length > 0 && !keyword)
  )

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                ref={inputRef}
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder={placeholder}
                disabled={isLoading}
                className="h-12 pl-12 pr-10 text-base bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
              {keyword && !isLoading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-emerald-500" />
              )}
            </div>

            {/* Dropdown for suggestions/history */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xl z-50">
                {showHistory && recentSearches.length > 0 && (
                  <div className="mb-2">
                    <p className="px-2 py-1 text-xs font-medium text-slate-500 uppercase">Recent Searches</p>
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(search)}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <History className="h-4 w-4 text-slate-500" />
                        {search}
                      </button>
                    ))}
                  </div>
                )}

                {showSuggestions && suggestions.length > 0 && !keyword && (
                  <div>
                    <p className="px-2 py-1 text-xs font-medium text-slate-500 uppercase">Popular Keywords</p>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-12 px-4 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {options.location}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 bg-slate-900 border-slate-800">
                <p className="px-2 py-1 text-xs font-medium text-slate-500 uppercase mb-1">Location</p>
                {locations.map((loc) => (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => setOptions({ ...options, location: loc.code })}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors",
                      options.location === loc.code
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    {loc.name}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}

          {/* Search Button */}
          <Button
            type="submit"
            disabled={isLoading || !keyword.trim()}
            className="h-12 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Quick filters */}
      {showFilters && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-slate-500">Quick filters:</span>
          {["Questions", "Long-tail", "Commercial", "Informational"].map((filter) => (
            <Badge
              key={filter}
              variant="outline"
              className="cursor-pointer border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
            >
              {filter}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
