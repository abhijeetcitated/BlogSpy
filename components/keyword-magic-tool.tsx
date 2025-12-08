"use client"

import { useState } from "react"
import { Search, X, Upload, Download, Home, FlaskConical, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { KeywordTable } from "@/components/keyword-table"
import { cn } from "@/lib/utils"

const countryData = [
  { code: "us", flag: "🇺🇸", name: "US", active: true },
  { code: "in", flag: "🇮🇳", name: "IN", active: false },
  { code: "uk", flag: "🇬🇧", name: "UK", active: false },
]

const defaultFilters = [
  { id: "volume", label: "Volume", value: "> 1000", active: true },
  { id: "kd", label: "KD %", value: "< 40", active: true },
  { id: "intent", label: "Intent", value: "Commercial", active: true },
  { id: "include", label: "Include Keywords", value: "", active: false },
  { id: "exclude", label: "Exclude", value: "", active: false },
]

const trendingKeywords = [
  { keyword: "ai agents 2024", volume: "45K", growth: "+320%" },
  { keyword: "claude 3 vs gpt-4", volume: "28K", growth: "+180%" },
  { keyword: "best seo tools", volume: "22K", growth: "+45%" },
  { keyword: "midjourney alternatives", volume: "18K", growth: "+92%" },
]

const recentSearches = [
  { keyword: "ai writing tools", date: "2 hours ago" },
  { keyword: "content optimization", date: "Yesterday" },
  { keyword: "keyword research", date: "3 days ago" },
]

export function KeywordMagicTool() {
  const [activeCountry, setActiveCountry] = useState("us")
  const [filters, setFilters] = useState(defaultFilters)
  const [broadMatch, setBroadMatch] = useState(true)
  const [phraseMatch, setPhraseMatch] = useState(false)
  const [seedKeyword, setSeedKeyword] = useState("")
  const [hasSearched, setHasSearched] = useState(true) // Set to false to show empty state

  const removeFilter = (id: string) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, active: false } : f)))
  }

  const activeFilters = filters.filter((f) => f.active)

  const handleSearch = () => {
    if (seedKeyword.trim()) {
      setHasSearched(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Home className="h-4 w-4" />
        <ChevronRight className="h-3 w-3" />
        <span>Research</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">Keyword Magic</span>
      </nav>

      {/* Search Header */}
      <div className="space-y-4">
        {/* Large Input + Search Button */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <FlaskConical className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter seed keyword (e.g., 'best ai tools')..."
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-12 h-14 text-base bg-background border-border focus-visible:ring-primary/30"
            />
          </div>
          <Button size="lg" className="h-14 px-8 gap-2" onClick={handleSearch}>
            <Search className="h-5 w-5" />
            Search
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {countryData.map((country) => (
            <button
              key={country.code}
              onClick={() => setActiveCountry(country.code)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-all",
                activeCountry === country.code
                  ? "bg-primary/10 border-primary/50 text-foreground"
                  : "bg-card/50 border-border text-muted-foreground hover:border-muted-foreground/50",
              )}
            >
              <span className="text-lg">{country.flag}</span>
              <span className="font-medium">{country.name}</span>
            </button>
          ))}
        </div>

        {hasSearched && (
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>
              Volume: <span className="text-foreground font-mono font-medium">1.2M</span>
            </span>
            <span className="w-px h-4 bg-border" />
            <span>
              Difficulty: <span className="text-orange-400 font-medium">Hard (72%)</span>
            </span>
            <span className="w-px h-4 bg-border" />
            <span>
              CPC: <span className="text-foreground font-mono font-medium">$2.50</span>
            </span>
          </div>
        )}
      </div>

      {/* Advanced Filter Bar (Horizontal) */}
      <div className="sticky top-0 z-20 -mx-6 px-6 py-3 bg-background/95 backdrop-blur-sm border-y border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          {activeFilters.map((filter) => (
            <button
              key={filter.id}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-primary/10 border border-primary/20 hover:border-primary/40 transition-all"
            >
              <span className="text-muted-foreground">{filter.label}</span>
              <span className="text-foreground font-medium">{filter.value}</span>
              <X
                className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFilter(filter.id)
                }}
              />
            </button>
          ))}

          <button className="px-3 py-1.5 rounded-full text-sm border border-dashed border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-all">
            + Include Keywords
          </button>
          <button className="px-3 py-1.5 rounded-full text-sm border border-dashed border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-all">
            + Exclude
          </button>

          {/* Match Toggles */}
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={broadMatch}
                onCheckedChange={setBroadMatch}
                className="data-[state=checked]:bg-primary"
              />
              <span className={cn("text-sm", broadMatch ? "text-foreground" : "text-muted-foreground")}>
                Broad Match
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={phraseMatch}
                onCheckedChange={setPhraseMatch}
                className="data-[state=checked]:bg-primary"
              />
              <span className={cn("text-sm", phraseMatch ? "text-foreground" : "text-muted-foreground")}>
                Phrase Match
              </span>
            </label>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-8 bg-transparent">
            <Upload className="h-4 w-4" />
            Bulk Import
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {hasSearched ? (
        <KeywordTable />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Searches */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Recent Searches</h3>
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
