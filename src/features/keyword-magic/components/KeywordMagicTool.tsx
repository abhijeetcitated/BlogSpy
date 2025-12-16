"use client"

import { useState } from "react"
import { Search, ChevronDown, Clock, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { KeywordTable } from "./KeywordTable"

// Country data for dropdown
const countryData = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "IN", name: "India", flag: "🇮🇳" },
]

// Default filters
const defaultFilters = {
  minVolume: 0,
  maxVolume: 1000000,
  minKD: 0,
  maxKD: 100,
  intent: "all",
}

// Trending keywords mock data
const trendingKeywords = [
  { keyword: "AI agents 2024", volume: "45K", growth: "+320%" },
  { keyword: "Claude vs GPT-4", volume: "28K", growth: "+180%" },
  { keyword: "Perplexity AI search", volume: "22K", growth: "+250%" },
]

// Recent searches
const recentSearches = [
  { keyword: "best seo tools", date: "2 hours ago" },
  { keyword: "ai content writer", date: "Yesterday" },
  { keyword: "keyword research tips", date: "3 days ago" },
]

export function KeywordMagicTool() {
  const [seedKeyword, setSeedKeyword] = useState("")
  const [selectedCountry, setSelectedCountry] = useState(countryData[0])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    if (seedKeyword.trim()) {
      setHasSearched(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={seedKeyword}
            onChange={(e) => setSeedKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a seed keyword (e.g., 'ai tools', 'seo software')"
            className="pl-10 h-11 bg-secondary/50 border-border"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-colors min-w-[140px]">
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-foreground">{selectedCountry.name}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
          </button>
          <Button
            onClick={handleSearch}
            className="bg-emerald-500 hover:bg-emerald-600 text-white h-11 px-6"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Results or Initial State */}
      {hasSearched ? (
        <KeywordTable />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Searches */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Searches
            </h3>
            <div className="space-y-3">
              {recentSearches.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSeedKeyword(item.keyword)
                    setHasSearched(true)
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="text-sm font-medium text-foreground">{item.keyword}</span>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trending Keywords */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Trending Keywords</h3>
            <div className="space-y-3">
              {trendingKeywords.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSeedKeyword(item.keyword)
                    setHasSearched(true)
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                >
                  <div>
                    <span className="text-sm font-medium text-foreground">{item.keyword}</span>
                    <span className="ml-2 text-xs text-muted-foreground font-mono">{item.volume}</span>
                  </div>
                  <span className="text-xs font-medium text-green-400">{item.growth}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
