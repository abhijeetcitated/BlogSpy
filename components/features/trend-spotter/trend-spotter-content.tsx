"use client"

import { useState } from "react"
import {
  Flame,
  Search,
  Rocket,
  TrendingUp,
  ArrowUpRight,
  Zap,
  Clock,
  ExternalLink,
  Globe,
  ChevronDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
} from "lucide-react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VelocityChart } from "@/components/charts"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const timeRanges = [
  { label: "Past 4 Hours", value: "4h" },
  { label: "Past 24 Hours", value: "24h" },
  { label: "Past 7 Days", value: "7d" },
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

const trendingTopics = [
  { topic: "Agentic AI", category: "Tech", growth: 450, volume: "2.4M" },
  { topic: "Claude 4", category: "Tech", growth: 280, volume: "1.8M" },
  { topic: "Ozempic alternatives", category: "Health", growth: 190, volume: "890K" },
  { topic: "Quantum computing", category: "Tech", growth: 145, volume: "650K" },
  { topic: "Remote work 2025", category: "Business", growth: 120, volume: "420K" },
  { topic: "Plant-based protein", category: "Health", growth: 95, volume: "380K" },
]

// Seasonal Trend Calendar Data
type Season = "winter" | "spring" | "summer" | "fall"
interface SeasonalTrend {
  month: string
  season: Season
  events: {
    name: string
    keyword: string
    predictedVolume: string
    confidence: number
    daysUntil: number
    category: string
  }[]
}

const seasonalCalendar: SeasonalTrend[] = [
  {
    month: "January",
    season: "winter",
    events: [
      { name: "New Year Resolutions", keyword: "fitness goals 2025", predictedVolume: "125K", confidence: 92, daysUntil: 15, category: "Health" },
      { name: "Winter Sales", keyword: "winter clearance deals", predictedVolume: "89K", confidence: 88, daysUntil: 20, category: "Shopping" },
    ]
  },
  {
    month: "February",
    season: "winter",
    events: [
      { name: "Valentine's Day", keyword: "romantic gift ideas", predictedVolume: "210K", confidence: 95, daysUntil: 45, category: "Lifestyle" },
      { name: "Super Bowl", keyword: "super bowl party snacks", predictedVolume: "180K", confidence: 90, daysUntil: 38, category: "Entertainment" },
    ]
  },
  {
    month: "March",
    season: "spring",
    events: [
      { name: "Spring Break", keyword: "spring break destinations", predictedVolume: "320K", confidence: 87, daysUntil: 75, category: "Travel" },
      { name: "Tax Season", keyword: "tax filing tips", predictedVolume: "450K", confidence: 94, daysUntil: 60, category: "Finance" },
    ]
  },
  {
    month: "April",
    season: "spring",
    events: [
      { name: "Easter", keyword: "easter decoration ideas", predictedVolume: "95K", confidence: 91, daysUntil: 100, category: "Lifestyle" },
      { name: "Earth Day", keyword: "sustainable living tips", predictedVolume: "78K", confidence: 85, daysUntil: 110, category: "Environment" },
    ]
  },
  {
    month: "May",
    season: "spring",
    events: [
      { name: "Mother's Day", keyword: "mothers day gift guide", predictedVolume: "280K", confidence: 93, daysUntil: 130, category: "Lifestyle" },
      { name: "Memorial Day", keyword: "memorial day sales 2025", predictedVolume: "165K", confidence: 89, daysUntil: 145, category: "Shopping" },
    ]
  },
  {
    month: "June",
    season: "summer",
    events: [
      { name: "Father's Day", keyword: "fathers day gifts", predictedVolume: "195K", confidence: 92, daysUntil: 160, category: "Lifestyle" },
      { name: "Summer Vacation", keyword: "summer travel deals", predictedVolume: "380K", confidence: 88, daysUntil: 170, category: "Travel" },
    ]
  },
  {
    month: "July",
    season: "summer",
    events: [
      { name: "4th of July", keyword: "july 4th fireworks near me", predictedVolume: "420K", confidence: 96, daysUntil: 185, category: "Entertainment" },
      { name: "Prime Day", keyword: "amazon prime day deals", predictedVolume: "550K", confidence: 91, daysUntil: 195, category: "Shopping" },
    ]
  },
  {
    month: "August",
    season: "summer",
    events: [
      { name: "Back to School", keyword: "back to school supplies", predictedVolume: "680K", confidence: 95, daysUntil: 220, category: "Shopping" },
      { name: "Summer End", keyword: "end of summer activities", predictedVolume: "145K", confidence: 82, daysUntil: 235, category: "Lifestyle" },
    ]
  },
  {
    month: "September",
    season: "fall",
    events: [
      { name: "Labor Day", keyword: "labor day weekend trips", predictedVolume: "175K", confidence: 89, daysUntil: 250, category: "Travel" },
      { name: "Fall Fashion", keyword: "fall fashion trends 2025", predictedVolume: "220K", confidence: 86, daysUntil: 260, category: "Fashion" },
    ]
  },
  {
    month: "October",
    season: "fall",
    events: [
      { name: "Halloween", keyword: "halloween costume ideas", predictedVolume: "890K", confidence: 97, daysUntil: 290, category: "Entertainment" },
      { name: "Breast Cancer Awareness", keyword: "breast cancer awareness", predictedVolume: "125K", confidence: 93, daysUntil: 280, category: "Health" },
    ]
  },
  {
    month: "November",
    season: "fall",
    events: [
      { name: "Black Friday", keyword: "black friday deals 2025", predictedVolume: "1.2M", confidence: 98, daysUntil: 320, category: "Shopping" },
      { name: "Thanksgiving", keyword: "thanksgiving recipes", predictedVolume: "450K", confidence: 94, daysUntil: 315, category: "Food" },
    ]
  },
  {
    month: "December",
    season: "winter",
    events: [
      { name: "Christmas", keyword: "christmas gift ideas", predictedVolume: "980K", confidence: 97, daysUntil: 350, category: "Shopping" },
      { name: "Year in Review", keyword: "best of 2025", predictedVolume: "320K", confidence: 90, daysUntil: 360, category: "Media" },
    ]
  },
]

const seasonIcons = {
  winter: Snowflake,
  spring: Flower2,
  summer: Sun,
  fall: Leaf,
}

const seasonColors = {
  winter: "text-blue-400 bg-blue-500/20",
  spring: "text-pink-400 bg-pink-500/20",
  summer: "text-amber-400 bg-amber-500/20",
  fall: "text-orange-400 bg-orange-500/20",
}

const regionData = [
  { rank: 1, name: "California", value: 100 },
  { rank: 2, name: "New York", value: 75 },
  { rank: 3, name: "Texas", value: 62 },
  { rank: 4, name: "Florida", value: 48 },
  { rank: 5, name: "Washington", value: 41 },
]

// Hotspot markers for the map
const markers = [
  { name: "North America", coordinates: [-100, 40], intensity: 0.9 },
  { name: "Europe", coordinates: [10, 50], intensity: 0.8 },
  { name: "Asia", coordinates: [100, 35], intensity: 0.7 },
  { name: "India", coordinates: [78, 20], intensity: 0.6 },
  { name: "Australia", coordinates: [133, -27], intensity: 0.5 },
]

// GeoJSON URL for world map
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

function WorldMap() {
  return (
    <div className="w-full h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 140,
          center: [0, 20],
        }}
        className="w-full h-full"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              // Highlight specific regions with higher intensity
              const isHighlighted = ["United States of America", "China", "India", "United Kingdom", "Germany", "France"].includes(
                geo.properties.name
              )
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isHighlighted ? "#3b82f6" : "#60a5fa"}
                  fillOpacity={isHighlighted ? 0.7 : 0.3}
                  stroke="#1e293b"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: {
                      fill: "#3b82f6",
                      fillOpacity: 0.9,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: { outline: "none" },
                  }}
                />
              )
            })
          }
        </Geographies>
        
        {/* Animated markers for hotspots */}
        {markers.map(({ name, coordinates, intensity }) => (
          <Marker key={name} coordinates={coordinates as [number, number]}>
            <circle
              r={6}
              fill="#3b82f6"
              fillOpacity={intensity}
              stroke="#60a5fa"
              strokeWidth={1.5}
              className="animate-pulse"
              style={{
                filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))",
              }}
            />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  )
}

export function TrendSpotter() {
  const [activeTimeRange, setActiveTimeRange] = useState("24h")
  const [searchQuery, setSearchQuery] = useState("Agentic AI")
  const [regionType, setRegionType] = useState<"Region" | "City">("Region")
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <div className="space-y-6">
      {/* Velocity Search Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-semibold text-foreground">Trend Spotter</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter a topic to analyze viral velocity (e.g., 'Agentic AI')..."
              className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Time Toggle */}
          <div className="flex rounded-lg border border-border bg-card p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setActiveTimeRange(range.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTimeRange === range.value
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prediction Engine - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - The Graph */}
        <Card className="lg:col-span-2 bg-card border-border relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Velocity Analysis</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {/* Glowing Badge Overlay */}
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/20 px-3 py-1.5">
                <Rocket className="h-3.5 w-3.5 mr-1.5" />
                High Velocity: +450% Slope
              </Badge>
            </div>
            <VelocityChart />
          </CardContent>
        </Card>

        {/* Right Side - The Verdict Card */}
        <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <CardHeader className="relative">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <CardTitle className="text-sm font-medium text-emerald-400">Breakout Detected</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Topic</p>
                <p className="text-xl font-semibold text-foreground">{searchQuery}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Forecast</p>
                <p className="text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Likely to peak in 12 hours
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Velocity Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-emerald-400">+450%</span>
                  <span className="text-sm text-muted-foreground">24h growth</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${i <= 4 ? "bg-emerald-500" : "bg-muted"}`} />
                  ))}
                </div>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600">
              <Zap className="h-4 w-4 mr-2" />
              Write Article Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Interest Section */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg font-medium text-foreground">Geographic Interest</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Side - The Map (60%) */}
            <div className="lg:col-span-3 space-y-3">
              <div
                className="relative h-[300px] rounded-xl bg-slate-900/50 border border-slate-800/50 overflow-hidden"
                style={{ boxShadow: "0 0 40px rgba(59, 130, 246, 0.1)" }}
              >
                <WorldMap />
              </div>
              {/* Legend */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>Low Interest</span>
                <div className="flex gap-0.5">
                  <div className="w-6 h-2 rounded-sm bg-blue-500/20" />
                  <div className="w-6 h-2 rounded-sm bg-blue-500/40" />
                  <div className="w-6 h-2 rounded-sm bg-blue-500/60" />
                  <div className="w-6 h-2 rounded-sm bg-blue-500/80" />
                  <div className="w-6 h-2 rounded-sm bg-blue-500" />
                </div>
                <span>High Interest</span>
              </div>
            </div>

            {/* Right Side - The Data Table (40%) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Interest by Sub-region</h3>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 bg-card border-border text-foreground">
                        {regionType}
                        <ChevronDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem
                        onClick={() => setRegionType("Region")}
                        className="text-foreground hover:bg-muted"
                      >
                        Region
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setRegionType("City")}
                        className="text-foreground hover:bg-muted"
                      >
                        City
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-card border-border">
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Region List */}
              <div className="space-y-2">
                {regionData.map((region) => (
                  <div key={region.rank} className="flex items-center gap-3 group">
                    <span className="text-xs font-medium text-muted-foreground w-4">{region.rank}.</span>
                    <span className="text-sm text-foreground flex-1 truncate">{region.name}</span>
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                        style={{ width: `${region.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-8 text-right">{region.value}</span>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">{currentPage} of 15</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setCurrentPage(Math.min(15, currentPage + 1))}
                  disabled={currentPage === 15}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Context */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
          Triggering Events (News)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {newsItems.map((news, i) => (
            <Card
              key={i}
              className="bg-card border-border hover:border-muted-foreground/30 transition-colors cursor-pointer group"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-foreground">
                      {news.logo}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{news.source}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      news.sentiment === "Positive"
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                        : "border-muted text-muted-foreground"
                    }
                  >
                    {news.sentiment}
                  </Badge>
                </div>

                <p className="text-sm text-foreground line-clamp-2 group-hover:text-emerald-400 transition-colors">
                  {news.headline}
                </p>

                <p className="text-xs text-muted-foreground">{news.time}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending Now Ticker */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          Trending Now
        </h2>

        <Card className="bg-card border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Topic
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Category
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Growth
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Volume
                  </th>
                </tr>
              </thead>
              <tbody>
                {trendingTopics.map((topic, i) => (
                  <tr
                    key={i}
                    className={`border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${
                      i % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-foreground hover:text-emerald-400 transition-colors">
                        {topic.topic}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs border-muted text-muted-foreground">
                        {topic.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-sm font-mono text-emerald-400">
                        <ArrowUpRight className="h-3.5 w-3.5" />+{topic.growth}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono text-muted-foreground">{topic.volume}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Seasonal Trend Calendar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            Trend Calendar
            <Badge variant="outline" className="ml-2 text-xs border-purple-500/30 text-purple-400">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Predicted
            </Badge>
          </h2>
          <div className="flex items-center gap-3 text-xs">
            {(["winter", "spring", "summer", "fall"] as Season[]).map((season) => {
              const Icon = seasonIcons[season]
              return (
                <div key={season} className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${seasonColors[season]}`}>
                  <Icon className="h-3 w-3" />
                  <span className="capitalize">{season}</span>
                </div>
              )
            })}
          </div>
        </div>

        <Card className="bg-card border-border overflow-hidden">
          <div className="grid grid-cols-4 gap-px bg-border">
            {seasonalCalendar.map((month, idx) => {
              const SeasonIcon = seasonIcons[month.season]
              return (
                <div 
                  key={idx} 
                  className={`p-4 bg-card hover:bg-muted/30 transition-colors ${
                    idx < 4 ? "" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">{month.month}</span>
                    <div className={`p-1.5 rounded-md ${seasonColors[month.season]}`}>
                      <SeasonIcon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {month.events.map((event, eventIdx) => (
                      <div 
                        key={eventIdx}
                        className="p-2 rounded-lg bg-muted/30 border border-border/50 hover:border-emerald-500/30 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground group-hover:text-emerald-400 transition-colors">
                            {event.name}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] px-1.5 py-0 ${
                              event.confidence >= 90 
                                ? "border-emerald-500/30 text-emerald-400" 
                                : event.confidence >= 85 
                                  ? "border-amber-500/30 text-amber-400"
                                  : "border-muted text-muted-foreground"
                            }`}
                          >
                            {event.confidence}%
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-1.5 truncate">
                          "{event.keyword}"
                        </p>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-purple-400 font-mono">{event.predictedVolume}</span>
                          <span className="text-muted-foreground">
                            {event.daysUntil < 30 ? (
                              <span className="text-amber-400 font-medium">In {event.daysUntil}d</span>
                            ) : (
                              `${event.daysUntil}d away`
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Quick Actions for Calendar */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 inline mr-1 text-purple-400" />
            AI predictions based on historical trends & current velocity data
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Download className="h-3 w-3 mr-1" />
              Export Calendar
            </Button>
            <Button size="sm" className="h-8 text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30">
              <Calendar className="h-3 w-3 mr-1" />
              Add to Google Calendar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
