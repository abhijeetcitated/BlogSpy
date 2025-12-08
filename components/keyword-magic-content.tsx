"use client"

import { useState, useMemo } from "react"
import { Search, Filter, ChevronDown, Check, Globe, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { KeywordTable, type Keyword } from "@/components/keyword-table"
import { cn } from "@/lib/utils"

// Mock Keywords Data - 15+ items with diverse intents, volumes, KD, CPC, and Weak Spots
const MOCK_KEYWORDS: Keyword[] = [
  {
    id: 1,
    keyword: "best ai tools 2024",
    intent: ["C", "I"],
    volume: 74500,
    trend: [20, 35, 28, 45, 52, 58, 65, 72, 80, 85, 90, 95],
    weakSpot: { type: "reddit", rank: 7 },
    kd: 42,
    cpc: 4.2,
    serpFeatures: ["video", "snippet"],
  },
  {
    id: 2,
    keyword: "ai writing tools free",
    intent: ["T"],
    volume: 33200,
    trend: [30, 35, 40, 45, 50, 55, 58, 62, 65, 70, 72, 75],
    weakSpot: { type: "quora", rank: 5 },
    kd: 35,
    cpc: 2.8,
    serpFeatures: ["snippet", "faq"],
  },
  {
    id: 3,
    keyword: "chatgpt alternatives",
    intent: ["C", "T"],
    volume: 28100,
    trend: [15, 25, 40, 55, 60, 58, 55, 52, 50, 48, 45, 42],
    weakSpot: { type: null },
    kd: 58,
    cpc: 3.5,
    serpFeatures: ["shopping"],
  },
  {
    id: 4,
    keyword: "what is generative ai",
    intent: ["I"],
    volume: 22400,
    trend: [25, 30, 35, 40, 45, 48, 52, 55, 58, 60, 62, 65],
    weakSpot: { type: "reddit", rank: 9 },
    kd: 28,
    cpc: 1.9,
    serpFeatures: ["snippet", "faq"],
  },
  {
    id: 5,
    keyword: "ai image generator",
    intent: ["T"],
    volume: 165000,
    trend: [40, 50, 60, 70, 75, 80, 82, 85, 88, 90, 92, 95],
    weakSpot: { type: null },
    kd: 62,
    cpc: 3.2,
    serpFeatures: ["video", "image"],
  },
  {
    id: 6,
    keyword: "best ai for coding",
    intent: ["C", "I"],
    volume: 18700,
    trend: [10, 15, 22, 30, 38, 45, 52, 58, 65, 70, 75, 80],
    weakSpot: { type: "quora", rank: 8 },
    kd: 45,
    cpc: 5.5,
    serpFeatures: ["reviews"],
  },
  {
    id: 7,
    keyword: "ai tools for business",
    intent: ["C"],
    volume: 14200,
    trend: [35, 38, 42, 45, 48, 50, 52, 55, 58, 60, 62, 65],
    weakSpot: { type: "reddit", rank: 6 },
    kd: 52,
    cpc: 6.8,
    serpFeatures: ["reviews", "shopping"],
  },
  {
    id: 8,
    keyword: "claude vs chatgpt",
    intent: ["C"],
    volume: 12100,
    trend: [5, 10, 18, 28, 40, 55, 65, 72, 78, 82, 85, 88],
    weakSpot: { type: null },
    kd: 38,
    cpc: 4.2,
    serpFeatures: ["video", "reviews"],
  },
  {
    id: 9,
    keyword: "ai productivity tools",
    intent: ["C", "T"],
    volume: 9800,
    trend: [20, 25, 30, 35, 40, 45, 50, 55, 58, 62, 65, 68],
    weakSpot: { type: "reddit", rank: 4 },
    kd: 32,
    cpc: 3.8,
    serpFeatures: ["snippet"],
  },
  {
    id: 10,
    keyword: "ai content generator",
    intent: ["T"],
    volume: 8400,
    trend: [30, 35, 38, 42, 45, 48, 50, 52, 55, 58, 60, 62],
    weakSpot: { type: null },
    kd: 55,
    cpc: 4.8,
    serpFeatures: ["reviews"],
  },
  {
    id: 11,
    keyword: "free ai tools online",
    intent: ["T", "I"],
    volume: 7200,
    trend: [40, 45, 48, 52, 55, 58, 60, 62, 65, 68, 70, 72],
    weakSpot: { type: "quora", rank: 3 },
    kd: 25,
    cpc: 1.5,
    serpFeatures: ["video", "snippet"],
  },
  {
    id: 12,
    keyword: "ai seo tools",
    intent: ["C"],
    volume: 6100,
    trend: [15, 20, 28, 35, 42, 48, 55, 60, 65, 70, 75, 80],
    weakSpot: { type: "reddit", rank: 10 },
    kd: 48,
    cpc: 7.2,
    serpFeatures: ["shopping", "reviews"],
  },
  {
    id: 13,
    keyword: "how to use midjourney",
    intent: ["I"],
    volume: 45600,
    trend: [50, 55, 60, 65, 68, 72, 75, 78, 80, 82, 85, 88],
    weakSpot: { type: "reddit", rank: 3 },
    kd: 18,
    cpc: 2.1,
    serpFeatures: ["video", "snippet", "faq"],
  },
  {
    id: 14,
    keyword: "ai marketing automation",
    intent: ["C", "T"],
    volume: 5400,
    trend: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
    weakSpot: { type: null },
    kd: 68,
    cpc: 12.5,
    serpFeatures: ["shopping", "reviews"],
  },
  {
    id: 15,
    keyword: "ai chatbot for website",
    intent: ["T", "C"],
    volume: 4800,
    trend: [35, 40, 45, 48, 52, 55, 58, 60, 62, 65, 68, 70],
    weakSpot: { type: "quora", rank: 6 },
    kd: 41,
    cpc: 8.9,
    serpFeatures: ["shopping"],
  },
  {
    id: 16,
    keyword: "openai api tutorial",
    intent: ["I"],
    volume: 3200,
    trend: [10, 15, 22, 30, 40, 50, 58, 65, 72, 78, 82, 85],
    weakSpot: { type: "reddit", rank: 2 },
    kd: 22,
    cpc: 3.4,
    serpFeatures: ["video", "snippet"],
  },
  {
    id: 17,
    keyword: "ai video editing software",
    intent: ["T"],
    volume: 19800,
    trend: [45, 50, 55, 60, 62, 65, 68, 70, 72, 75, 78, 80],
    weakSpot: { type: null },
    kd: 72,
    cpc: 5.6,
    serpFeatures: ["video", "shopping", "reviews"],
  },
  {
    id: 18,
    keyword: "machine learning course free",
    intent: ["N", "T"],
    volume: 28500,
    trend: [60, 62, 65, 68, 70, 72, 74, 76, 78, 80, 82, 84],
    weakSpot: { type: "reddit", rank: 5 },
    kd: 35,
    cpc: 4.2,
    serpFeatures: ["faq", "reviews"],
  },
]

const popularCountries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "IN", name: "India", flag: "🇮🇳" },
]

const allCountries = [
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
]

const kdLevels = [
  { label: "Very Easy", range: "0-14", min: 0, max: 14, color: "bg-green-500" },
  { label: "Easy", range: "15-29", min: 15, max: 29, color: "bg-green-400" },
  { label: "Moderate", range: "30-49", min: 30, max: 49, color: "bg-yellow-500" },
  { label: "Hard", range: "50-69", min: 50, max: 69, color: "bg-orange-500" },
  { label: "Very Hard", range: "70-84", min: 70, max: 84, color: "bg-red-400" },
  { label: "Extreme", range: "85-100", min: 85, max: 100, color: "bg-red-600" },
]

const intentOptions = [
  { value: "I", label: "Informational", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { value: "C", label: "Commercial", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  { value: "T", label: "Transactional", color: "bg-green-500/15 text-green-400 border-green-500/30" },
  { value: "N", label: "Navigational", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
]

export function KeywordMagicContent() {
  const [filterText, setFilterText] = useState("")
  const [matchType, setMatchType] = useState<"broad" | "phrase" | "exact" | "related" | "questions">("broad")
  const [bulkMode, setBulkMode] = useState<"explore" | "bulk">("explore")
  const [bulkKeywords, setBulkKeywords] = useState("")

  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string; flag: string } | null>(null)
  const [countrySearch, setCountrySearch] = useState("")
  const [countryOpen, setCountryOpen] = useState(false)
  
  // Popover open states for filters
  const [volumeOpen, setVolumeOpen] = useState(false)
  const [kdOpen, setKdOpen] = useState(false)
  const [intentOpen, setIntentOpen] = useState(false)
  const [cpcOpen, setCpcOpen] = useState(false)

  // Temporary filter states (before Apply is clicked)
  const [tempVolumeRange, setTempVolumeRange] = useState<[number, number]>([0, 500000])
  const [tempKdRange, setTempKdRange] = useState<[number, number]>([0, 100])
  const [tempSelectedIntents, setTempSelectedIntents] = useState<string[]>([])
  const [tempCpcRange, setTempCpcRange] = useState<[number, number]>([0, 50])

  // Applied filter states (after Apply is clicked)
  const [volumeRange, setVolumeRange] = useState<[number, number]>([0, 500000])
  const [volumePreset, setVolumePreset] = useState<string | null>(null)
  const [kdRange, setKdRange] = useState<[number, number]>([0, 100])
  const [selectedIntents, setSelectedIntents] = useState<string[]>([])
  const [cpcRange, setCpcRange] = useState<[number, number]>([0, 50])
  
  const [includeTerms, setIncludeTerms] = useState<string[]>([])
  const [excludeTerms, setExcludeTerms] = useState<string[]>([])
  const [includeInput, setIncludeInput] = useState("")
  const [excludeInput, setExcludeInput] = useState("")

  const filteredPopularCountries = popularCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase()),
  )

  const filteredAllCountries = allCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase()),
  )

  const toggleIntent = (value: string) => {
    setTempSelectedIntents((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  // Apply filter functions
  const applyVolumeFilter = () => {
    setVolumeRange(tempVolumeRange)
    setVolumeOpen(false)
  }

  const applyKdFilter = () => {
    setKdRange(tempKdRange)
    setKdOpen(false)
  }

  const applyIntentFilter = () => {
    setSelectedIntents(tempSelectedIntents)
    setIntentOpen(false)
  }

  const applyCpcFilter = () => {
    setCpcRange(tempCpcRange)
    setCpcOpen(false)
  }

  const addIncludeTerm = () => {
    if (includeInput.trim() && !includeTerms.includes(includeInput.trim())) {
      setIncludeTerms([...includeTerms, includeInput.trim()])
      setIncludeInput("")
    }
  }

  const addExcludeTerm = () => {
    if (excludeInput.trim() && !excludeTerms.includes(excludeInput.trim())) {
      setExcludeTerms([...excludeTerms, excludeInput.trim()])
      setExcludeInput("")
    }
  }

  // Filtered Keywords using useMemo
  const filteredKeywords = useMemo(() => {
    return MOCK_KEYWORDS.filter((keyword) => {
      // 1. Filter by search text (filterText) based on matchType
      if (filterText.trim()) {
        const searchTerm = filterText.toLowerCase()
        const keywordText = keyword.keyword.toLowerCase()
        
        switch (matchType) {
          case "exact":
            // Exact match - keyword must equal search term
            if (keywordText !== searchTerm) return false
            break
          case "phrase":
            // Phrase match - keyword must contain the exact phrase
            if (!keywordText.includes(searchTerm)) return false
            break
          case "questions":
            // Questions - keyword must start with question words
            const questionWords = ["how", "what", "why", "when", "where", "which", "who", "can", "does", "is"]
            const startsWithQuestion = questionWords.some(q => keywordText.startsWith(q))
            if (!startsWithQuestion || !keywordText.includes(searchTerm)) return false
            break
          case "related":
            // Related - keyword must contain at least one word from search
            const searchWords = searchTerm.split(" ")
            const hasRelated = searchWords.some(word => keywordText.includes(word))
            if (!hasRelated) return false
            break
          case "broad":
          default:
            // Broad match - any word from search term appears
            const words = searchTerm.split(" ")
            const matchesAny = words.some(word => keywordText.includes(word))
            if (!matchesAny) return false
            break
        }
      }

      // 2. Filter by Volume range
      if (volumeRange[0] > 0 || volumeRange[1] < 500000) {
        if (keyword.volume < volumeRange[0] || keyword.volume > volumeRange[1]) return false
      }

      // 3. Filter by KD range
      if (kdRange[0] > 0 || kdRange[1] < 100) {
        if (keyword.kd < kdRange[0] || keyword.kd > kdRange[1]) return false
      }

      // 4. Filter by Intent
      if (selectedIntents.length > 0) {
        const hasMatchingIntent = keyword.intent.some(i => selectedIntents.includes(i))
        if (!hasMatchingIntent) return false
      }

      // 5. Filter by CPC range
      if (cpcRange[0] > 0 || cpcRange[1] < 50) {
        if (keyword.cpc < cpcRange[0] || keyword.cpc > cpcRange[1]) return false
      }

      // 6. Include terms - keyword must contain ALL include terms
      if (includeTerms.length > 0) {
        const keywordLower = keyword.keyword.toLowerCase()
        const hasAllIncludeTerms = includeTerms.every(term => 
          keywordLower.includes(term.toLowerCase())
        )
        if (!hasAllIncludeTerms) return false
      }

      // 7. Exclude terms - keyword must NOT contain ANY exclude terms
      if (excludeTerms.length > 0) {
        const keywordLower = keyword.keyword.toLowerCase()
        const hasAnyExcludeTerm = excludeTerms.some(term => 
          keywordLower.includes(term.toLowerCase())
        )
        if (hasAnyExcludeTerm) return false
      }

      return true
    })
  }, [
    filterText,
    matchType,
    volumeRange,
    kdRange,
    selectedIntents,
    cpcRange,
    includeTerms,
    excludeTerms,
  ])

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Keyword Magic: AI Tools</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Discover high-value keywords with competitive insights
            </p>
          </div>

          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 gap-2 bg-secondary/50 border-border min-w-[180px] justify-between"
              >
                {selectedCountry ? (
                  <>
                    <span className="text-base">{selectedCountry.flag}</span>
                    <span className="text-sm font-medium">{selectedCountry.name}</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Worldwide</span>
                  </>
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="end">
              <div className="p-2 border-b border-border">
                <Input
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto p-1">
                {/* Worldwide Option */}
                <button
                  onClick={() => {
                    setSelectedCountry(null)
                    setCountryOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted/50 transition-colors",
                    !selectedCountry && "bg-muted/50",
                  )}
                >
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>Worldwide</span>
                  {!selectedCountry && <Check className="h-4 w-4 ml-auto text-primary" />}
                </button>

                {/* Popular Section */}
                {filteredPopularCountries.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Popular
                    </div>
                    {filteredPopularCountries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          setSelectedCountry(country)
                          setCountryOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted/50 transition-colors",
                          selectedCountry?.code === country.code && "bg-muted/50",
                        )}
                      >
                        <span className="text-base">{country.flag}</span>
                        <span>{country.name}</span>
                        {selectedCountry?.code === country.code && <Check className="h-4 w-4 ml-auto text-primary" />}
                      </button>
                    ))}
                  </>
                )}

                {/* All Countries Section */}
                {filteredAllCountries.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">
                      All Countries
                    </div>
                    {filteredAllCountries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => {
                          setSelectedCountry(country)
                          setCountryOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted/50 transition-colors",
                          selectedCountry?.code === country.code && "bg-muted/50",
                        )}
                      >
                        <span className="text-base">{country.flag}</span>
                        <span>{country.name}</span>
                        {selectedCountry?.code === country.code && <Check className="h-4 w-4 ml-auto text-primary" />}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 space-y-3">
        {/* Bulk Mode Toggle */}
        <div className="flex items-center rounded-lg bg-secondary/50 p-0.5 w-fit">
          <button
            onClick={() => setBulkMode("explore")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              bulkMode === "explore"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="h-4 w-4" />
            Explore
          </button>
          <button
            onClick={() => setBulkMode("bulk")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              bulkMode === "bulk"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="h-4 w-4" />
            Bulk Analysis
          </button>
        </div>

        {bulkMode === "explore" ? (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input for Explore Mode */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by keyword..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-9 h-9 bg-secondary/50 border-border"
              />
            </div>

          {/* Volume Filter Popover */}
          <Popover open={volumeOpen} onOpenChange={setVolumeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-secondary/50 border-border">
                Volume
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-3" align="start">
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Presets</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "High (10K+)", min: 10000, max: 500000 },
                    { label: "Medium (1K-10K)", min: 1000, max: 10000 },
                    { label: "Low (0-1K)", min: 0, max: 1000 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setTempVolumeRange([preset.min, preset.max])
                        setVolumePreset(preset.label)
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                        volumePreset === preset.label
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
                  Custom Range
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="From"
                    value={tempVolumeRange[0] || ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : Number(e.target.value)
                      setTempVolumeRange([val, tempVolumeRange[1]])
                      setVolumePreset(null)
                    }}
                    className="h-8 text-sm"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="number"
                    placeholder="To"
                    value={tempVolumeRange[1] || ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : Number(e.target.value)
                      setTempVolumeRange([tempVolumeRange[0], val])
                      setVolumePreset(null)
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <Button onClick={applyVolumeFilter} className="w-full mt-2 bg-primary hover:bg-primary/90">
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* KD Filter Popover */}
          <Popover open={kdOpen} onOpenChange={setKdOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-secondary/50 border-border">
                KD %
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-3" align="start">
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Difficulty Levels
                </div>
                <div className="space-y-1">
                  {kdLevels.map((level) => (
                    <button
                      key={level.label}
                      onClick={() => setTempKdRange([level.min, level.max])}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50",
                        tempKdRange[0] === level.min && tempKdRange[1] === level.max && "bg-muted/50",
                      )}
                    >
                      <span className={cn("w-2.5 h-2.5 rounded-full", level.color)} />
                      <span className="flex-1 text-left">{level.label}</span>
                      <span className="text-xs text-muted-foreground">{level.range}</span>
                    </button>
                  ))}
                </div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
                  Custom Range
                </div>
                <Slider
                  value={tempKdRange}
                  onValueChange={(v) => setTempKdRange(v as [number, number])}
                  min={0}
                  max={100}
                  step={1}
                  className="py-2"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{tempKdRange[0]}%</span>
                  <span>{tempKdRange[1]}%</span>
                </div>
                <Button onClick={applyKdFilter} className="w-full mt-2 bg-primary hover:bg-primary/90">
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Intent Filter Popover */}
          <Popover open={intentOpen} onOpenChange={setIntentOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-secondary/50 border-border">
                Intent
                {selectedIntents.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {selectedIntents.length}
                  </Badge>
                )}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-3" align="start">
              <div className="space-y-3">
                <div className="space-y-1">
                  {intentOptions.map((intent) => (
                    <label
                      key={intent.value}
                      onClick={() => toggleIntent(intent.value)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox checked={tempSelectedIntents.includes(intent.value)} />
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", intent.color)}>
                        {intent.value}
                      </span>
                      <span className="flex-1 text-left">{intent.label}</span>
                    </label>
                  ))}
                </div>
                <Button onClick={applyIntentFilter} className="w-full bg-primary hover:bg-primary/90">
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* CPC Filter Popover */}
          <Popover open={cpcOpen} onOpenChange={setCpcOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-secondary/50 border-border">
                CPC
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-3" align="start">
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Price Range</div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      placeholder="Min"
                      value={tempCpcRange[0] || ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : Number(e.target.value)
                        setTempCpcRange([val, tempCpcRange[1]])
                      }}
                      className="h-8 text-sm pl-6"
                    />
                  </div>
                  <span className="text-muted-foreground">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={tempCpcRange[1] || ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : Number(e.target.value)
                        setTempCpcRange([tempCpcRange[0], val])
                      }}
                      className="h-8 text-sm pl-6"
                    />
                  </div>
                </div>
                <Button onClick={applyCpcFilter} className="w-full mt-2 bg-primary hover:bg-primary/90">
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Include/Exclude Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-secondary/50 border-border">
                <Filter className="h-3.5 w-3.5" />
                Include/Exclude
                {(includeTerms.length > 0 || excludeTerms.length > 0) && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {includeTerms.length + excludeTerms.length}
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
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add term..."
                      value={includeInput}
                      onChange={(e) => setIncludeInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addIncludeTerm()}
                      className="h-8 text-sm flex-1"
                    />
                    <Button size="sm" onClick={addIncludeTerm} className="h-8">
                      Add
                    </Button>
                  </div>
                  {includeTerms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {includeTerms.map((term) => (
                        <Badge
                          key={term}
                          variant="secondary"
                          className="bg-green-500/15 text-green-400 border border-green-500/30 cursor-pointer hover:bg-green-500/25"
                          onClick={() => setIncludeTerms(includeTerms.filter((t) => t !== term))}
                        >
                          {term} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Exclude Keywords
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add term..."
                      value={excludeInput}
                      onChange={(e) => setExcludeInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addExcludeTerm()}
                      className="h-8 text-sm flex-1"
                    />
                    <Button size="sm" onClick={addExcludeTerm} className="h-8">
                      Add
                    </Button>
                  </div>
                  {excludeTerms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {excludeTerms.map((term) => (
                        <Badge
                          key={term}
                          variant="secondary"
                          className="bg-red-500/15 text-red-400 border border-red-500/30 cursor-pointer hover:bg-red-500/25"
                          onClick={() => setExcludeTerms(excludeTerms.filter((t) => t !== term))}
                        >
                          {term} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

            {/* Match Type Toggle */}
            <div className="flex items-center rounded-lg bg-secondary/50 p-0.5 ml-auto">
              <button
                onClick={() => setMatchType("broad")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  matchType === "broad"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Broad
              </button>
              <button
                onClick={() => setMatchType("phrase")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  matchType === "phrase"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Phrase
              </button>
              <button
                onClick={() => setMatchType("exact")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  matchType === "exact"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Exact
              </button>
              <button
                onClick={() => setMatchType("related")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  matchType === "related"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Related
              </button>
              <button
                onClick={() => setMatchType("questions")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  matchType === "questions"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Questions
              </button>
            </div>
          </div>
        ) : (
          /* Bulk Mode Input */
          <div className="w-full space-y-3">
            <div className="relative">
              <textarea
                placeholder="Paste up to 100 keywords, one per line..."
                value={bulkKeywords}
                onChange={(e) => setBulkKeywords(e.target.value)}
                className="w-full h-32 p-3 text-sm bg-secondary/50 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground"
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {bulkKeywords.split('\n').filter(line => line.trim()).length} / 100 keywords
              </div>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => {
                console.log("Analyzing keywords:", bulkKeywords.split('\n').filter(line => line.trim()))
              }}
            >
              <Sparkles className="h-4 w-4" />
              Analyze Keywords
            </Button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto pb-20">
        <KeywordTable keywords={filteredKeywords} />
      </div>
    </div>
  )
}
