"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Search,
  Loader2,
  Calendar as CalendarIcon,
  Zap,
  Flame,
  CalendarDays,
  Rocket,
  Sparkles,
  Lock,
  Crown,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

import type { DateRange } from "react-day-picker"

import { SearchableCountryDropdown } from "./searchable-country-dropdown"
import { VelocityChart } from "./velocity-chart"

import { PLATFORM_OPTIONS } from "../constants"
import { ALL_COUNTRIES } from "../constants/map-coordinates"
import {
  calculateForecast,
  calculateViralityScore,
  buildVelocityChartData,
  extractTrendSeries,
  type DataForSEOTrendsItem,
} from "../utils"
import type {
  TrendSpotterPlatformType,
  TrendSpotterRelated,
  TrendSpotterMapEntry,
} from "../services/trend-spotter.api"
import type { VelocityDataPoint } from "../types"
import type { DataPoint, ForecastPoint } from "../utils"

import { GeographicInterest } from "./geographic-interest"
import { RelatedDataLists } from "./related-data-lists"
import { ContentTypeSuggester } from "./content-type-suggester"
import { TrendAlertButton } from "./trend-alert-button"
import { PublishTiming } from "./publish-timing"
import { TriggeringEvents } from "./triggering-events"

type PlatformValue = TrendSpotterPlatformType
type TriggeringTopic = { topic_title: string; topic_type: string; value: number }
type RelatedPayload = TrendSpotterRelated & {
  relatedTopics?: { rising?: TriggeringTopic[] }
}

export function TrendSpotter() {
  // Main search state
  const [searchQuery, setSearchQuery] = useState("AI Agents")
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformValue>("web")
  const [activePlatform, setActivePlatform] = useState<PlatformValue>("web")

  // Top section timeframe state (display uses 4H/24H/7D/30D/12M)
  const [timeframe, setTimeframe] = useState("30D")

  // Date range picker state (optional)
  const [date, setDate] = useState<DateRange | undefined>()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isStale, setIsStale] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const [chartData, setChartData] = useState<VelocityDataPoint[]>([])
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([])
  const [globalVolume, setGlobalVolume] = useState<number>(0)
  const [viralityScore, setViralityScore] = useState<number | null>(null)
  const [platformVolumes, setPlatformVolumes] = useState<Record<PlatformValue, number | null>>({
    web: null,
    youtube: null,
    news: null,
    shopping: null,
  })
  const [mapData, setMapData] = useState<TrendSpotterMapEntry[]>([])
  const [relatedData, setRelatedData] = useState<RelatedPayload | null>(null)

  const searchParams = useSearchParams()

  // Geographic section state (cascading)
  const [geoCountryCode, setGeoCountryCode] = useState<string | null>("IN")
  const [geoCity, setGeoCity] = useState<string | null>(null)

  const formatDateOnly = useCallback((value?: Date) => {
    if (!value) return undefined
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, "0")
    const day = String(value.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }, [])

  const handleAnalyze = useCallback(async (forceRefresh?: boolean, overrideKeyword?: string) => {
    const keyword = (overrideKeyword ?? searchQuery).trim()
    if (!keyword) {
      toast.error("Please enter a keyword")
      return
    }

    setIsLoading(true)

    try {
      const selectedCountry = ALL_COUNTRIES.find(
        (country) => country.code === (selectedCountryCode ?? "US")
      )

      const payload = {
        keyword,
        country: selectedCountry?.code ?? "US",
        timeframe,
        type: selectedPlatform,
        force_refresh: !!forceRefresh,
        start_date: timeframe === "CUSTOM" ? formatDateOnly(date?.from) : undefined,
        end_date: timeframe === "CUSTOM" ? formatDateOnly(date?.to) : undefined,
      }

      const response = await fetch("/api/trend-spotter/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const json = (await response.json()) as {
        success?: boolean
        data?: {
          global_volume?: number | null
          isStale?: boolean
          items?: DataForSEOTrendsItem[]
          platforms?: Record<TrendSpotterPlatformType, {
            chart: { items: DataForSEOTrendsItem[] }
            map: TrendSpotterMapEntry[]
            related: TrendSpotterRelated
          }>
        }
        meta?: { timestamp?: string }
        error?: { message?: string }
      }

      if (!json.success || !json.data) {
        throw new Error(json.error?.message || "Analysis failed")
      }

      const platformData = json.data.platforms?.[selectedPlatform]
      const items: DataForSEOTrendsItem[] =
        platformData?.chart.items ?? json.data.items ?? []
      const { labels, values } = extractTrendSeries(items)

      const history: DataPoint[] = labels.map((label, index) => ({
        date: label,
        value: values[index] ?? 0,
      }))
      const forecast = calculateForecast(history, 3)
      const score = calculateViralityScore(values)

      setViralityScore(score)
      const resolvedVolume =
        typeof json.data.global_volume === "number" && Number.isFinite(json.data.global_volume)
          ? json.data.global_volume
          : 0
      setGlobalVolume(resolvedVolume)
      setPlatformVolumes((prev) => ({
        ...prev,
        [selectedPlatform]: resolvedVolume,
      }))
      setMapData(platformData?.map ?? [])
      const nextRelated = platformData?.related
        ? {
            ...platformData.related,
            relatedTopics: {
              rising: platformData.related.topics.rising.map((item) => ({
                topic_title: item.title ?? "",
                topic_type: item.type ?? "",
                value: item.value ?? 0,
              })),
            },
          }
        : null
      setRelatedData(nextRelated)
      setForecastData(forecast)
      setChartData(buildVelocityChartData(labels, values, []))
      setLastUpdated(json.meta?.timestamp ?? null)

      if (json.data.isStale) {
        setIsStale(true)
        toast.message("Data is from cache. Click Refresh to update.")
      } else {
        setIsStale(false)
        toast.success("Analysis Complete")
      }
    } catch (error) {
      toast.error("Failed to fetch trends. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedCountryCode, selectedPlatform, timeframe, date, formatDateOnly])

  const publishForecastData = useMemo(
    () =>
      forecastData.map((point) => ({
        date: point.date,
        value: point.forecast,
      })),
    [forecastData]
  )

  const relatedListPayload = useMemo(() => {
    if (!relatedData) return undefined
    return {
      result: [
        {
          related_topics: { top: relatedData.topics.top },
          related_queries: { rising: relatedData.queries.rising },
        },
      ],
    }
  }, [relatedData])

  useEffect(() => {
    const queryKeyword = searchParams.get("q")
    if (!queryKeyword) return

    setSearchQuery(queryKeyword)
    handleAnalyze(false, queryKeyword)
  }, [handleAnalyze, searchParams])

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
            aria-label="Search keyword"
            className="pl-10 h-10 sm:h-11 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-amber-500/50 focus:ring-amber-500/20"
          />
        </div>

        {/* Country Dropdown */}
        <div className="order-3 sm:order-2">
          <SearchableCountryDropdown
            value={selectedCountryCode}
            onChange={(country) => setSelectedCountryCode(country?.code ?? null)}
            triggerClassName="min-w-[120px] sm:min-w-[160px]"
          />
        </div>

        {/* Platform Toggle Pills */}
        <div className="flex w-full sm:w-auto flex-wrap md:flex-nowrap items-center rounded-lg border border-border bg-card p-1 order-4 sm:order-3 gap-1 md:gap-0">
          {PLATFORM_OPTIONS.map((platform) => {
            const platformValue = platform.value as PlatformValue
            const isActive = activePlatform === platformValue
            const activeStyles: Record<PlatformValue, { button: string }> = {
              web: {
                button: "bg-blue-500/20 border-blue-500/40",
              },
              youtube: {
                button: "bg-red-500/20 border-red-500/40",
              },
              news: {
                button: "bg-green-500/20 border-green-500/40",
              },
              shopping: {
                button: "bg-orange-500/20 border-orange-500/40",
              },
            }

            const title =
              platformValue === "news"
                ? "Source: Google News"
                : platformValue === "shopping"
                  ? "Source: Google Shopping"
                  : platformValue === "youtube"
                    ? "Source: YouTube Search"
                    : undefined

            return (
              <button
                key={platform.value}
                onClick={() => {
                  setSelectedPlatform(platformValue)
                  setActivePlatform(platformValue)
                }}
                aria-pressed={isActive}
                title={title}
                className={cn(
                  "group flex flex-1 md:flex-initial items-center justify-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-all border",
                  isActive
                    ? activeStyles[platformValue].button
                    : "bg-transparent border-transparent"
                )}
              >
                <platform.icon
                  className={cn(
                    "h-3.5 w-3.5",
                    platform.iconColor
                  )}
                />
                <span
                  className={cn(
                    "hidden lg:inline",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {platform.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Timeframe Pills */}
        <div className="flex items-center rounded-lg border border-border bg-card p-1 order-4">
          {["4H", "24H", "7D", "30D", "12M"].map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf)
                setDate(undefined)
                setCalendarOpen(false)
              }}
              aria-pressed={timeframe === tf}
              className={cn(
                "px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
                timeframe === tf
                    ? "bg-linear-to-br from-[#F59E0B] to-[#D97706] text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-[#F59E0B]/50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tf}
            </button>
          ))}

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "p-1.5 rounded-md hidden sm:block transition-all",
                  calendarOpen || (timeframe === "custom" && !!date?.from && !!date?.to)
                    ? "bg-linear-to-br from-[#F59E0B] to-[#D97706] text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-[#F59E0B]/50"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto max-w-90 p-0 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 shadow-xl inline-block"
              align="end"
            >
              <div className="p-3">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={(nextRange) => {
                    setDate(nextRange)

                    // Only mark as custom when a full range is selected.
                    if (nextRange?.from && nextRange?.to) {
                      setTimeframe("custom")
                      setCalendarOpen(false)
                    }
                  }}
                  numberOfMonths={1}
                  pagedNavigation
                  disabled={{ after: new Date() }}
                  className="p-3"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-bold text-foreground",
                    nav: "space-x-1 flex items-center absolute right-1 top-1",
                    nav_button:
                      "h-7 w-7 bg-zinc-800 hover:bg-zinc-700 border border-border p-0 rounded-md flex items-center justify-center text-foreground transition-all",
                    nav_button_previous: "mr-1",
                    nav_button_next: "",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full justify-between mb-2",
                    head_cell:
                      "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex items-center justify-center",
                    row: "flex w-full mt-2 justify-between",
                    cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                    day:
                      "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md flex items-center justify-center text-foreground hover:bg-muted transition-all",
                    day_selected:
                      "!bg-[#F59E0B] !text-black hover:!bg-[#D97706] font-bold shadow-md",
                    day_today: "bg-muted text-foreground font-semibold border border-border",
                    day_outside: "text-muted-foreground opacity-30",
                    day_disabled: "text-muted-foreground opacity-20 cursor-not-allowed",
                    day_range_middle:
                      "aria-selected:!bg-[#F59E0B]/20 aria-selected:!text-[#F59E0B] rounded-none",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Analyze Button */}
        <Button
          onClick={() => handleAnalyze(isStale)}
          disabled={isLoading || !searchQuery.trim()}
          className={cn(
            "h-10 sm:h-11 px-4 sm:px-6 text-black font-semibold shadow-lg transition-all order-2 sm:order-5 flex-1 sm:flex-none",
            isStale
              ? "bg-linear-to-r from-rose-500 to-orange-600 hover:from-rose-600 hover:to-orange-700 shadow-rose-500/25 hover:shadow-rose-500/40"
              : "bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25 hover:shadow-amber-500/40"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
              <span className="sm:inline">Analyzing...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="sm:inline">
                {isStale ? "Refresh (1 Credit)" : "Analyze"}
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Velocity Chart */}
      <div className={cn("transition-all", isStale && "opacity-60 blur-[1px]")}>
      <VelocityChart
        searchQuery={searchQuery}
        data={chartData}
        forecastData={forecastData}
        globalVolume={globalVolume}
        viralityScore={viralityScore ?? undefined}
        activePlatform={activePlatform}
        selectedPlatform={selectedPlatform}
        timeframe={timeframe}
        dateRange={date}
      />
      </div>

      <PublishTiming searchQuery={searchQuery} forecastData={publishForecastData} />

      {/* Geographic Intelligence */}
      <GeographicInterest
        geoCountryCode={geoCountryCode}
        setGeoCountryCode={setGeoCountryCode}
        geoCity={geoCity}
        setGeoCity={setGeoCity}
        globalVolume={globalVolume}
        mapData={mapData}
      />

      {/* Triggering Events */}
      <TriggeringEvents data={relatedData ?? undefined} />

      {/* Content Type Suggester */}
      <ContentTypeSuggester
        searchQuery={searchQuery}
        chartData={chartData}
        webVolume={platformVolumes.web}
        youtubeVolume={platformVolumes.youtube}
      />

      {/* Related Topics + Breakout Queries */}
      <RelatedDataLists searchQuery={searchQuery} data={relatedListPayload} />

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
                ].map((feature) => (
                  <div key={feature.text} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
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
                  {[
                    { event: "Christmas Gift Guide", color: "bg-red-500", days: "11 days left" },
                    { event: "New Year Resolutions", color: "bg-amber-500", days: "18 days left" },
                    { event: "Valentine's Day", color: "bg-pink-500", days: "62 days left" },
                  ].map((item) => (
                    <div key={item.event} className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/50">
                      <div className={cn("w-1 h-6 rounded-full shrink-0", item.color)} />
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-foreground truncate">{item.event}</div>
                        <div className="text-[9px] text-muted-foreground">{item.days}</div>
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
