"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  Flame,
  Search,
  TrendingUp,
  ArrowUpRight,
  Zap,
  ExternalLink,
  Globe,
  ChevronDown,
  Youtube,
  Newspaper,
  ShoppingBag,
  Monitor,
  Calendar,
  Check,
} from "lucide-react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { scaleLinear } from "d3-scale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Area,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

// ============================================
// DATA: Countries with Tiers & Search
// ============================================
const tier1Countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
]

const allCountries = [
  ...tier1Countries,
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
]

// ============================================
// DATA: Country Interest/Volume Data (for heatmap)
// ============================================
const countryInterestData: Record<string, { volume: number; percentage: number }> = {
  "United States of America": { volume: 245000, percentage: 100 },
  "India": { volume: 189000, percentage: 77 },
  "United Kingdom": { volume: 98000, percentage: 40 },
  "Germany": { volume: 76000, percentage: 31 },
  "Canada": { volume: 67000, percentage: 27 },
  "Australia": { volume: 54000, percentage: 22 },
  "France": { volume: 48000, percentage: 20 },
  "Japan": { volume: 42000, percentage: 17 },
  "Brazil": { volume: 38000, percentage: 15 },
  "Netherlands": { volume: 28000, percentage: 11 },
  "Spain": { volume: 25000, percentage: 10 },
  "Italy": { volume: 22000, percentage: 9 },
  "Mexico": { volume: 19000, percentage: 8 },
  "Singapore": { volume: 15000, percentage: 6 },
  "South Korea": { volume: 35000, percentage: 14 },
  "China": { volume: 156000, percentage: 64 },
  "Indonesia": { volume: 32000, percentage: 13 },
  "Philippines": { volume: 18000, percentage: 7 },
  "Vietnam": { volume: 14000, percentage: 6 },
  "Thailand": { volume: 12000, percentage: 5 },
  "Poland": { volume: 16000, percentage: 7 },
  "Sweden": { volume: 11000, percentage: 4 },
  "Norway": { volume: 8000, percentage: 3 },
  "Denmark": { volume: 7000, percentage: 3 },
  "Finland": { volume: 6000, percentage: 2 },
  "Ireland": { volume: 9000, percentage: 4 },
  "Belgium": { volume: 10000, percentage: 4 },
  "Switzerland": { volume: 13000, percentage: 5 },
  "Austria": { volume: 8000, percentage: 3 },
  "New Zealand": { volume: 7000, percentage: 3 },
  "South Africa": { volume: 11000, percentage: 4 },
  "Nigeria": { volume: 14000, percentage: 6 },
  "Kenya": { volume: 5000, percentage: 2 },
  "Egypt": { volume: 8000, percentage: 3 },
  "Israel": { volume: 12000, percentage: 5 },
  "United Arab Emirates": { volume: 16000, percentage: 7 },
  "Saudi Arabia": { volume: 13000, percentage: 5 },
  "Turkey": { volume: 18000, percentage: 7 },
  "Russia": { volume: 28000, percentage: 11 },
  "Ukraine": { volume: 9000, percentage: 4 },
  "Argentina": { volume: 12000, percentage: 5 },
  "Chile": { volume: 7000, percentage: 3 },
  "Colombia": { volume: 10000, percentage: 4 },
  "Peru": { volume: 6000, percentage: 2 },
}

// ============================================
// DATA: City/Region data per country (Cascading)
// ============================================
const cityDataByCountry: Record<string, { name: string; value: number }[]> = {
  IN: [
    { name: "Maharashtra", value: 100 },
    { name: "Delhi", value: 88 },
    { name: "Karnataka", value: 82 },
    { name: "Tamil Nadu", value: 75 },
    { name: "Telangana", value: 70 },
  ],
  US: [
    { name: "California", value: 100 },
    { name: "Texas", value: 85 },
    { name: "New York", value: 82 },
    { name: "Florida", value: 75 },
    { name: "Washington", value: 70 },
  ],
  UK: [
    { name: "London", value: 100 },
    { name: "Manchester", value: 78 },
    { name: "Birmingham", value: 72 },
    { name: "Leeds", value: 65 },
    { name: "Glasgow", value: 60 },
  ],
  CA: [
    { name: "Ontario", value: 100 },
    { name: "British Columbia", value: 85 },
    { name: "Quebec", value: 78 },
    { name: "Alberta", value: 70 },
    { name: "Manitoba", value: 55 },
  ],
  AU: [
    { name: "New South Wales", value: 100 },
    { name: "Victoria", value: 88 },
    { name: "Queensland", value: 75 },
    { name: "Western Australia", value: 65 },
    { name: "South Australia", value: 55 },
  ],
  DEFAULT: [
    { name: "Region 1", value: 100 },
    { name: "Region 2", value: 75 },
    { name: "Region 3", value: 60 },
    { name: "Region 4", value: 45 },
    { name: "Region 5", value: 30 },
  ],
}

// Chart data for velocity analysis
const velocityData = [
  { month: "Jan", actual: 10, forecast: null },
  { month: "Feb", actual: 12, forecast: null },
  { month: "Mar", actual: 15, forecast: null },
  { month: "Apr", actual: 18, forecast: null },
  { month: "May", actual: 22, forecast: null },
  { month: "Jun", actual: 28, forecast: null },
  { month: "Jul", actual: 35, forecast: null },
  { month: "Aug", actual: 45, forecast: null },
  { month: "Sep", actual: 58, forecast: null },
  { month: "Oct", actual: 72, forecast: 72 },
  { month: "Nov", actual: null, forecast: 85 },
  { month: "Dec", actual: null, forecast: 95 },
]

const newsItems = [
  {
    source: "TechCrunch",
    logo: "TC",
    headline: "OpenAI Announces New Agentic AI Framework for Enterprise",
    time: "2 hours ago",
    sentiment: "Positive",
  },
  {
    source: "The Verge",
    logo: "TV",
    headline: "Microsoft Integrates Agentic AI into Copilot Suite",
    time: "5 hours ago",
    sentiment: "Positive",
  },
  {
    source: "Wired",
    logo: "W",
    headline: "The Rise of Autonomous AI Agents in 2025",
    time: "8 hours ago",
    sentiment: "Neutral",
  },
]

const relatedTopics = [
  { topic: "AI Agents Framework", growth: "+50%", status: "Rising" },
  { topic: "Autonomous AI", growth: "+30%", status: "Rising" },
  { topic: "LangChain", growth: null, status: "Top" },
  { topic: "AutoGPT", growth: "+18%", status: "Rising" },
  { topic: "AI Automation", growth: null, status: "Top" },
  { topic: "CrewAI", growth: "+64%", status: "Rising" },
]

const breakoutQueries = [
  { query: "best ai agents 2024", growth: "+2400%", isBreakout: true },
  { query: "how to build ai agents", growth: "+1800%", isBreakout: true },
  { query: "ai agents vs chatbots", growth: "+960%", isBreakout: false },
  { query: "ai agents for business", growth: "+1200%", isBreakout: true },
  { query: "free ai agent tools", growth: "+780%", isBreakout: false },
  { query: "ai agents tutorial", growth: "+1500%", isBreakout: true },
]

// Hotspot markers for the map
const markers: { name: string; coordinates: [number, number]; intensity: number }[] = [
  { name: "North America", coordinates: [-100, 40], intensity: 0.9 },
  { name: "Europe", coordinates: [10, 50], intensity: 0.8 },
  { name: "Asia", coordinates: [100, 35], intensity: 0.95 },
  { name: "India", coordinates: [78, 20], intensity: 1.0 },
  { name: "Australia", coordinates: [133, -27], intensity: 0.5 },
]

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// ============================================
// D3 Color Scale for Heatmap (Blue gradient)
// ============================================
const colorScale = scaleLinear<string>()
  .domain([0, 50, 100])
  .range(["#1e293b", "#1e40af", "#3b82f6"]) // Slate-800 -> Blue-800 -> Blue-500

// ============================================
// COMPONENT: WorldMap with Tooltips & Heatmap
// ============================================
interface TooltipState {
  show: boolean
  content: string
  x: number
  y: number
}

function WorldMap() {
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    content: "",
    x: 0,
    y: 0,
  })

  const handleMouseEnter = useCallback(
    (geo: { properties: { name: string } }, event: React.MouseEvent) => {
      const countryName = geo.properties.name
      const data = countryInterestData[countryName]

      const content = data
        ? `${countryName}: ${data.volume.toLocaleString()} (${data.percentage}%)`
        : `${countryName}: N/A`

      setTooltip({
        show: true,
        content,
        x: event.clientX,
        y: event.clientY,
      })
    },
    []
  )

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltip((prev) => ({
      ...prev,
      x: event.clientX,
      y: event.clientY,
    }))
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, show: false }))
  }, [])

  const getCountryColor = useCallback((countryName: string) => {
    const data = countryInterestData[countryName]
    if (!data) return "#1e293b" // Slate-800 for no data
    return colorScale(data.percentage)
  }, [])

  return (
    <div className="w-full h-full relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [20, 20],
        }}
        className="w-full h-full"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.name
              const hasData = !!countryInterestData[countryName]
              const fillColor = getCountryColor(countryName)

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColor}
                  stroke="#334155"
                  strokeWidth={0.5}
                  onMouseEnter={(e) => handleMouseEnter(geo, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: {
                      outline: "none",
                      transition: "all 0.2s ease",
                    },
                    hover: {
                      fill: hasData ? "#60a5fa" : "#475569", // Blue-400 or Slate-600
                      stroke: "#93c5fd", // Blue-300
                      strokeWidth: 1.5,
                      outline: "none",
                      cursor: "pointer",
                      filter: "brightness(1.2)",
                    },
                    pressed: {
                      outline: "none",
                    },
                  }}
                />
              )
            })
          }
        </Geographies>

        {/* Animated hotspot markers */}
        {markers.map(({ name, coordinates, intensity }) => (
          <Marker key={name} coordinates={coordinates}>
            <circle
              r={6 * intensity}
              fill="#3b82f6"
              fillOpacity={0.5}
              stroke="#60a5fa"
              strokeWidth={2}
              className="animate-pulse"
              style={{
                filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))",
              }}
            />
          </Marker>
        ))}
      </ComposableMap>

      {/* Custom Tooltip */}
      {tooltip.show && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 8,
          }}
        >
          <div className="bg-slate-900 border border-slate-700 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-xl">
            {tooltip.content}
            {/* Arrow indicator */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-slate-700 rotate-45" />
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// COMPONENT: SearchableCountryDropdown
// ============================================
interface SearchableCountryDropdownProps {
  value: string | null
  onChange: (countryCode: string | null) => void
  triggerClassName?: string
}

function SearchableCountryDropdown({ value, onChange, triggerClassName }: SearchableCountryDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selectedCountry = value ? allCountries.find(c => c.code === value) : null

  const filteredTier1 = tier1Countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const filteredOthers = allCountries
    .filter(c => !tier1Countries.some(t => t.code === c.code))
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-11 gap-2 bg-card border-border text-foreground justify-between hover:bg-muted",
            triggerClassName
          )}
        >
          {selectedCountry ? (
            <>
              <span className="text-base">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.name}</span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm">🌍 Worldwide</span>
            </>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 bg-card border-border" align="start">
        {/* Sticky Search Input */}
        <div className="p-2 border-b border-border sticky top-0 bg-card z-10">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-1">
          {/* Worldwide Option - Always at Top */}
          <button
            onClick={() => {
              onChange(null)
              setOpen(false)
              setSearch("")
            }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
              !selectedCountry
                ? "bg-amber-500/20 text-amber-400"
                : "text-foreground hover:bg-muted"
            )}
          >
            <Globe className="h-4 w-4 text-blue-500" />
            <span>🌍 Worldwide</span>
            {!selectedCountry && <Check className="h-4 w-4 ml-auto text-amber-400" />}
          </button>

          {/* Tier-1 Countries */}
          {filteredTier1.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                Top Countries
              </div>
              {filteredTier1.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    onChange(country.code)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    selectedCountry?.code === country.code
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span className="text-base">{country.flag}</span>
                  <span>{country.name}</span>
                  {selectedCountry?.code === country.code && (
                    <Check className="h-4 w-4 ml-auto text-amber-400" />
                  )}
                </button>
              ))}
            </>
          )}

          {/* Other Countries */}
          {filteredOthers.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                All Countries
              </div>
              {filteredOthers.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    onChange(country.code)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    selectedCountry?.code === country.code
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span className="text-base">{country.flag}</span>
                  <span>{country.name}</span>
                  {selectedCountry?.code === country.code && (
                    <Check className="h-4 w-4 ml-auto text-amber-400" />
                  )}
                </button>
              ))}
            </>
          )}

          {filteredTier1.length === 0 && filteredOthers.length === 0 && (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No countries found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ============================================
// COMPONENT: CascadingCityDropdown
// ============================================
interface CascadingCityDropdownProps {
  countryCode: string | null
  value: string | null
  onChange: (city: string | null) => void
}

function CascadingCityDropdown({ countryCode, value, onChange }: CascadingCityDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const cities = useMemo(() => {
    if (!countryCode) return []
    return cityDataByCountry[countryCode] || cityDataByCountry.DEFAULT
  }, [countryCode])

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const isDisabled = !countryCode

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={isDisabled}
          className={cn(
            "h-9 gap-2 bg-card border-border text-foreground justify-between w-full text-sm hover:bg-muted",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="truncate">
            {value || (isDisabled ? "Select country first" : "All Regions")}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0 bg-card border-border" align="end">
        {/* Search Input */}
        <div className="p-2 border-b border-border sticky top-0 bg-card z-10">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 pl-8 text-xs bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="max-h-[250px] overflow-y-auto p-1">
          {/* All Regions Option */}
          <button
            onClick={() => {
              onChange(null)
              setOpen(false)
              setSearch("")
            }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
              !value
                ? "bg-blue-500/20 text-blue-400"
                : "text-foreground hover:bg-muted"
            )}
          >
            <span>All Regions</span>
            {!value && <Check className="h-3.5 w-3.5 ml-auto text-blue-400" />}
          </button>

          {filteredCities.map((city) => (
            <button
              key={city.name}
              onClick={() => {
                onChange(city.name)
                setOpen(false)
                setSearch("")
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors",
                value === city.name
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <span>{city.name}</span>
              <span className="text-xs text-muted-foreground">{city.value}%</span>
            </button>
          ))}

          {filteredCities.length === 0 && (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              No regions found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ============================================
// MAIN COMPONENT: TrendSpotter
// ============================================
export function TrendSpotter() {
  const [searchQuery, setSearchQuery] = useState("AI Agents")
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState("web")
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d")
  
  // Geographic section state (cascading)
  const [geoCountryCode, setGeoCountryCode] = useState<string | null>("IN")
  const [geoCity, setGeoCity] = useState<string | null>(null)

  // Get region data based on selected geo country
  const regionData = useMemo(() => {
    if (!geoCountryCode) return cityDataByCountry.DEFAULT
    return cityDataByCountry[geoCountryCode] || cityDataByCountry.DEFAULT
  }, [geoCountryCode])

  // Platform config with SPECIFIC COLORS for each icon
  const platforms = [
    { value: "web", label: "Web", icon: Monitor, iconColor: "text-blue-400" },
    { value: "youtube", label: "YouTube", icon: Youtube, iconColor: "text-red-500" },
    { value: "news", label: "News", icon: Newspaper, iconColor: "text-green-400" },
    { value: "shopping", label: "Shopping", icon: ShoppingBag, iconColor: "text-orange-400" },
  ]

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Flame className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trend Spotter</h1>
          <p className="text-sm text-muted-foreground">
            Google Trends on steroids - discover viral opportunities before they peak
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter a keyword..."
            className="pl-10 h-11 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-amber-500/50 focus:ring-amber-500/20"
          />
        </div>

        {/* Searchable Country Dropdown with Search Input Inside */}
        <SearchableCountryDropdown
          value={selectedCountryCode}
          onChange={setSelectedCountryCode}
          triggerClassName="min-w-[160px]"
        />

        {/* Platform Toggle Pills - FIXED COLORS */}
        <div className="flex items-center rounded-lg border border-border bg-card p-1">
          {platforms.map((platform) => {
            const isActive = selectedPlatform === platform.value
            return (
              <button
                key={platform.value}
                onClick={() => setSelectedPlatform(platform.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all border",
                  isActive
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                )}
              >
                <platform.icon
                  className={cn(
                    "h-3.5 w-3.5",
                    isActive ? "text-amber-400" : platform.iconColor
                  )}
                />
                {platform.label}
              </button>
            )
          })}
        </div>

        {/* Timeframe Pills */}
        <div className="flex items-center rounded-lg border border-border bg-card p-1">
          {["4H", "24H", "7D", "30D", "12M"].map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf.toLowerCase())}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                selectedTimeframe === tf.toLowerCase()
                  ? "bg-amber-500 text-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tf}
            </button>
          ))}
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground">
            <Calendar className="h-4 w-4" />
          </button>
        </div>

        {/* Analyze Button */}
        <Button className="h-11 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-semibold shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40">
          <Zap className="h-4 w-4 mr-2" />
          Analyze
        </Button>
      </div>

      {/* Velocity Chart - Full Width Row */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Velocity Chart</CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-amber-500 rounded-full" />
                <span>Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 border-t-2 border-dashed border-amber-500/60" />
                <span>Forecast</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative h-[400px] pt-4">
          {/* Breakout Overlay Card - ABSOLUTE POSITIONED */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 shadow-2xl shadow-amber-500/30 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
                  Breakout Detected
                </span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">85% Viral Probability</p>
              <Button
                size="sm"
                className="w-full mt-3 bg-white hover:bg-slate-100 text-black font-semibold"
                asChild
              >
                <Link href={`/dashboard/creation/ai-writer?topic=${encodeURIComponent(searchQuery)}`}>
                  Write Article Now
                </Link>
              </Button>
            </div>
          </div>

          {/* The Chart - ComposedChart for solid + dashed lines */}
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={velocityData} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                {/* Actual Data - Solid Area */}
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fill="url(#colorActual)"
                  dot={false}
                  connectNulls={false}
                />
                {/* Forecast Data - Dashed Line */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={false}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Banner */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-900/30 border border-amber-700/40 rounded-lg">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">
                Peak Predicted: +14% in 3 months
              </span>
              <span className="text-xs text-amber-400/70 ml-2">
                Based on historical patterns and current velocity
              </span>
              <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                +39%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Intelligence - Separate Row */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg font-medium text-foreground">Geographic Interest</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">Volume: 630,000</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Side - The Map (60%) */}
            <div className="lg:col-span-3 space-y-3">
              <div className="relative h-[300px] rounded-lg bg-slate-950 border border-border overflow-hidden">
                <WorldMap />
              </div>
              {/* Legend - Blue Color Scale */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>Low Volume</span>
                <div className="flex gap-0.5">
                  <div className="w-6 h-2 rounded-sm" style={{ backgroundColor: "#1e293b" }} />
                  <div className="w-6 h-2 rounded-sm" style={{ backgroundColor: "#1e3a5f" }} />
                  <div className="w-6 h-2 rounded-sm" style={{ backgroundColor: "#1e40af" }} />
                  <div className="w-6 h-2 rounded-sm" style={{ backgroundColor: "#2563eb" }} />
                  <div className="w-6 h-2 rounded-sm" style={{ backgroundColor: "#3b82f6" }} />
                </div>
                <span>High Volume</span>
              </div>
            </div>

            {/* Right Side - The Data Table (40%) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Top Regions {geoCountryCode ? `in ${allCountries.find(c => c.code === geoCountryCode)?.name || "Selected Country"}` : "Worldwide"}
              </div>

              {/* Cascading Dropdowns */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Country / Region</label>
                  <SearchableCountryDropdown
                    value={geoCountryCode}
                    onChange={(code) => {
                      setGeoCountryCode(code)
                      setGeoCity(null) // Reset city when country changes
                    }}
                    triggerClassName="h-9 w-full text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">City / State</label>
                  <CascadingCityDropdown
                    countryCode={geoCountryCode}
                    value={geoCity}
                    onChange={setGeoCity}
                  />
                </div>
              </div>

              {/* Region List */}
              <div className="space-y-2">
                {regionData.slice(0, 5).map((region, idx) => (
                  <div key={region.name} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-4">{idx + 1}</span>
                    <span className="text-sm text-foreground flex-1">{region.name}</span>
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                        style={{ width: `${region.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-blue-400 w-10 text-right">
                      {region.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Context Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Triggering Events (News Context)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {newsItems.map((news, i) => (
            <Card
              key={i}
              className="bg-card border-border hover:border-muted-foreground/30 transition-all group"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-foreground border border-border">
                      {news.logo}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">{news.source}</span>
                      <p className="text-xs text-muted-foreground">{news.time}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      news.sentiment === "Positive"
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                        : "border-border text-muted-foreground bg-muted"
                    }
                  >
                    {news.sentiment}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
                  {news.headline}
                </p>

                {/* Draft Response - Links to AI Writer */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  asChild
                >
                  <Link href={`/dashboard/creation/ai-writer?type=news&topic=${encodeURIComponent(news.headline)}`}>
                    Draft Response
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Data Lists: Related Topics + Breakout Queries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Related Topics */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Related Topics
              </CardTitle>
              <span className="text-xs text-muted-foreground">Themes rising with &quot;{searchQuery}&quot;</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {relatedTopics.map((item, i) => (
              <Link
                key={i}
                href={`/dashboard/research/overview/${encodeURIComponent(item.topic)}`}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer hover:bg-muted transition-colors group"
              >
                <span className="text-sm text-foreground group-hover:text-amber-400 transition-colors">
                  {item.topic}
                </span>
                <div className="flex items-center gap-2">
                  {item.growth && (
                    <span className="text-sm font-mono text-emerald-400">{item.growth}</span>
                  )}
                  <Badge
                    variant="outline"
                    className={
                      item.status === "Rising"
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs"
                        : "border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs"
                    }
                  >
                    {item.status}
                  </Badge>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-amber-400 transition-colors" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Breakout Queries */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Breakout Queries
              </CardTitle>
              <span className="text-xs text-muted-foreground">The holy 🔥 - exact searches that type</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {breakoutQueries.map((item, i) => (
              <Link
                key={i}
                href={`/dashboard/research/overview/${encodeURIComponent(item.query)}`}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground group-hover:text-amber-400 transition-colors">
                    {item.query}
                  </span>
                  {item.isBreakout && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0">
                      🔥 BREAKOUT
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-emerald-400">{item.growth}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-amber-400 transition-colors" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}