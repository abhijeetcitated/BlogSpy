"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Search, 
  Monitor, 
  Youtube, 
  Newspaper, 
  ShoppingBag, 
  Calendar, 
  Zap, 
  Flame,
  CalendarDays,
  Rocket,
  Sparkles,
  Lock,
  Crown
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { SearchableCountryDropdown } from "./components/searchable-country-dropdown"
import { VelocityChart } from "./components/velocity-chart"
import { GeographicInterest } from "./components/geographic-interest"
import { NewsContext } from "./components/news-context"
import { RelatedDataLists } from "./components/related-data-lists"
import { ContentTypeSuggester } from "./components/content-type-suggester"
import { TrendAlertButton } from "./components/trend-alert-button"

// Platform configuration
const platforms = [
  { value: "web", label: "Web", icon: Monitor, iconColor: "text-blue-400" },
  { value: "youtube", label: "YouTube", icon: Youtube, iconColor: "text-red-500" },
  { value: "news", label: "News", icon: Newspaper, iconColor: "text-green-400" },
  { value: "shopping", label: "Shopping", icon: ShoppingBag, iconColor: "text-orange-400" },
]

export function TrendSpotter() {
  // Main search state
  const [searchQuery, setSearchQuery] = useState("AI Agents")
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState("web")
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d")
  
  // Geographic section state (cascading)
  const [geoCountryCode, setGeoCountryCode] = useState<string | null>("IN")
  const [geoCity, setGeoCity] = useState<string | null>(null)

  return (
    <div className="min-h-full space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
            <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Trend Spotter</h1>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none">
              Google Trends on steroids - discover viral opportunities
            </p>
          </div>
        </div>
        {/* Alert Button */}
        <TrendAlertButton keyword={searchQuery} />
      </div>

      {/* Unlock Content Calendar - Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-linear-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-purple-500/20 p-3 sm:p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 shrink-0">
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-foreground">Content Calendar</h3>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0 font-bold">
                  <Crown className="h-2.5 w-2.5 mr-0.5" />
                  PRO
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Plan content around 100+ seasonal events & holidays
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10 flex-1 sm:flex-none"
              asChild
            >
              <Link href="/dashboard/research/content-calendar">
                <Sparkles className="h-3 w-3 mr-1" />
                Try Free
              </Link>
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 flex-1 sm:flex-none"
              asChild
            >
              <Link href="/pricing">
                Unlock Now
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1 sm:min-w-[200px] md:min-w-[280px] sm:max-w-md order-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter a keyword..."
            className="pl-10 h-10 sm:h-11 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-amber-500/50 focus:ring-amber-500/20"
          />
        </div>

        {/* Country Dropdown */}
        <div className="order-3 sm:order-2">
          <SearchableCountryDropdown
            value={selectedCountryCode}
            onChange={setSelectedCountryCode}
            triggerClassName="min-w-[120px] sm:min-w-[160px]"
          />
        </div>

        {/* Platform Toggle Pills - Hidden on mobile, shown on tablet+ */}
        <div className="hidden md:flex items-center rounded-lg border border-border bg-card p-1 order-4 sm:order-3">
          {platforms.map((platform) => {
            const isActive = selectedPlatform === platform.value
            return (
              <button
                key={platform.value}
                onClick={() => setSelectedPlatform(platform.value)}
                className={cn(
                  "flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-all border",
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
                <span className="hidden lg:inline">{platform.label}</span>
              </button>
            )
          })}
        </div>

        {/* Timeframe Pills */}
        <div className="flex items-center rounded-lg border border-border bg-card p-1 order-4">
          {["4H", "24H", "7D", "30D", "12M"].map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf.toLowerCase())}
              className={cn(
                "px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
                selectedTimeframe === tf.toLowerCase()
                  ? "bg-amber-500 text-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tf}
            </button>
          ))}
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hidden sm:block">
            <Calendar className="h-4 w-4" />
          </button>
        </div>

        {/* Analyze Button */}
        <Button className="h-10 sm:h-11 px-4 sm:px-6 bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-semibold shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 order-2 sm:order-5 flex-1 sm:flex-none">
          <Zap className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="sm:inline">Analyze</span>
        </Button>
      </div>

      {/* Velocity Chart */}
      <VelocityChart searchQuery={searchQuery} />

      {/* Geographic Intelligence */}
      <GeographicInterest
        geoCountryCode={geoCountryCode}
        setGeoCountryCode={setGeoCountryCode}
        geoCity={geoCity}
        setGeoCity={setGeoCity}
      />

      {/* News Context Section */}
      <NewsContext />

      {/* Content Type Suggester */}
      <ContentTypeSuggester searchQuery={searchQuery} />

      {/* Related Topics + Breakout Queries */}
      <RelatedDataLists searchQuery={searchQuery} />

      {/* Unlock Content Calendar - Bottom Card */}
      <Card className="relative overflow-hidden bg-linear-to-br from-purple-500/5 via-pink-500/5 to-amber-500/5 border-purple-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-linear-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl" />
        <CardContent className="relative p-4 sm:p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
            {/* Left Content */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-linear-to-br from-purple-500 to-pink-600 shadow-xl shadow-purple-500/30 w-fit">
                  <CalendarDays className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">Unlock Content Calendar</h3>
                    <Badge className="bg-linear-to-r from-amber-500 to-orange-500 text-black border-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 font-bold">
                      <Sparkles className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5 sm:mr-1" />
                      PRO
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Never miss a seasonal opportunity again
                  </p>
                </div>
              </div>

              {/* Feature List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {[
                  { icon: CalendarDays, text: "100+ Seasonal Events" },
                  { icon: Sparkles, text: "AI Content Suggestions" },
                  { icon: Rocket, text: "Auto-Schedule Publishing" },
                  { icon: Crown, text: "Priority Niche Alerts" },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="p-1 rounded-md bg-purple-500/10 shrink-0">
                      <feature.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-400" />
                    </div>
                    <span className="truncate">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 h-9 sm:h-10"
                  asChild
                >
                  <Link href="/dashboard/research/content-calendar">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Preview Calendar
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 h-9 sm:h-10"
                  asChild
                >
                  <Link href="/pricing">
                    <Lock className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Link>
                </Button>
                <span className="text-xs text-muted-foreground text-center sm:text-left">
                  or <Link href="/pricing" className="text-amber-400 hover:underline">Start 7-day trial</Link>
                </span>
              </div>
            </div>

            {/* Right Preview - Hidden on mobile/tablet */}
            <div className="hidden xl:block shrink-0">
              <div className="relative w-56 h-44 rounded-xl bg-card border border-border overflow-hidden shadow-2xl shadow-purple-500/10">
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent" />
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-muted-foreground">Upcoming Events</span>
                  </div>
                  {["Christmas Gift Guide", "New Year Resolutions", "Valentine's Day"].map((event, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/50">
                      <div className={cn(
                        "w-1 h-6 rounded-full shrink-0",
                        idx === 0 ? "bg-red-500" : idx === 1 ? "bg-amber-500" : "bg-pink-500"
                      )} />
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-foreground truncate">{event}</div>
                        <div className="text-[9px] text-muted-foreground">
                          {idx === 0 ? "11 days left" : idx === 1 ? "18 days left" : "62 days left"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Blur overlay */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
