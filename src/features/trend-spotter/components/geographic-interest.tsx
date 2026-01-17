"use client"

import { useEffect, useMemo, useState } from "react"
import { Globe } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { WorldMap } from "./world-map"
import { SearchableCountryDropdown } from "./searchable-country-dropdown"
import { CascadingCityDropdown } from "./cascading-city-dropdown"
import { ALL_COUNTRIES } from "../constants/map-coordinates"
import { cityDataByCountry, countryInterestData } from "../__mocks__"

interface GeographicInterestProps {
  geoCountryCode: string | null
  setGeoCountryCode: (code: string | null) => void
  geoCity: string | null
  setGeoCity: (city: string | null) => void
  globalVolume?: number | null
  mapData?: Array<{ geo_id: number | string; values: number[] }>
}

function formatCompact(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-"
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value)
}

export function GeographicInterest({
  geoCountryCode,
  setGeoCountryCode,
  geoCity,
  setGeoCity,
  globalVolume,
  mapData = [],
}: GeographicInterestProps) {
  const [localCountryCode, setLocalCountryCode] = useState<string | null>(null)
  const [localRegion, setLocalRegion] = useState<string | null>(null)
  const [regionData, setRegionData] = useState(cityDataByCountry.DEFAULT)
  const [isLoadingRegions, setIsLoadingRegions] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)

  const ITEMS_PER_PAGE = 5

  const mapCountryData = useMemo(() => {
    return mapData
      .map((entry) => {
        const value = entry.values?.[0]
        if (typeof value !== "number" || !Number.isFinite(value)) return null
        const rawId = String(entry.geo_id)
        const upperId = rawId.toUpperCase()
        const countryName = ALL_COUNTRIES.find((country) => country.code === upperId)?.name ?? rawId
        return { name: countryName, value }
      })
      .filter((item): item is { name: string; value: number } => !!item)
      .sort((a, b) => b.value - a.value)
  }, [mapData])

  const countryScore = useMemo(() => {
    if (!localCountryCode) return null
    const match = mapData.find(
      (entry) => String(entry.geo_id).toUpperCase() === localCountryCode.toUpperCase()
    )
    const value = match?.values?.[0]
    return typeof value === "number" && Number.isFinite(value) ? value : null
  }, [localCountryCode, mapData])

  const countryVolume = useMemo(() => {
    if (!localCountryCode) return null
    if (typeof globalVolume !== "number" || !Number.isFinite(globalVolume)) return null
    if (typeof countryScore !== "number" || !Number.isFinite(countryScore)) return null
    return Math.round((countryScore / 100) * globalVolume)
  }, [localCountryCode, globalVolume, countryScore])

  useEffect(() => {
    setPageIndex(0)

    if (!localCountryCode) {
      const topCountries = mapCountryData.length
        ? mapCountryData
        : Object.entries(countryInterestData)
            .sort(([, a], [, b]) => b.percentage - a.percentage)
            .map(([name, data]) => ({ name, value: data.percentage }))
      setRegionData(topCountries.length > 0 ? topCountries : cityDataByCountry.DEFAULT)
      setIsLoadingRegions(false)
      return
    }

    setIsLoadingRegions(true)
    const timer = setTimeout(() => {
      const nextData = cityDataByCountry[localCountryCode] || cityDataByCountry.DEFAULT
      setRegionData(nextData)
      setIsLoadingRegions(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [localCountryCode, mapCountryData])

  useEffect(() => {
    if (geoCountryCode === null && localCountryCode !== null) {
      setLocalCountryCode(null)
    }
  }, [geoCountryCode, localCountryCode])

  useEffect(() => {
    if (geoCity === null && localRegion !== null) {
      setLocalRegion(null)
    }
  }, [geoCity, localRegion])

  const totalPages = Math.ceil(regionData.length / ITEMS_PER_PAGE)
  const pageStart = pageIndex * ITEMS_PER_PAGE
  const visibleRegions = regionData.slice(pageStart, pageStart + ITEMS_PER_PAGE)

  const countryName = localCountryCode
    ? ALL_COUNTRIES.find((country) => country.code === localCountryCode)?.name || "Selected Country"
    : null
  const volumeValue = localCountryCode ? countryVolume : null
  const regionScoreMap = useMemo(() => {
    return new Map(regionData.map((region) => [region.name.toLowerCase(), region.value]))
  }, [regionData])
  const selectedRegionScore = localRegion
    ? regionScoreMap.get(localRegion.toLowerCase())
    : null

  const getRegionStyles = (value: number) => {
    if (value >= 80) return { bar: "from-emerald-500 to-emerald-400", text: "text-emerald-500" }
    if (value >= 60) return { bar: "from-blue-600 to-blue-400", text: "text-blue-500" }
    if (value >= 40) return { bar: "from-amber-500 to-amber-400", text: "text-amber-500" }
    return { bar: "from-slate-500 to-slate-400", text: "text-slate-500" }
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            <CardTitle className="text-base sm:text-lg font-medium text-foreground">
              Geographic Interest
            </CardTitle>
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground text-right space-y-0.5">
            <div>Global Vol: {formatCompact(globalVolume)}</div>
            {countryName && (
              <>
                <div>
                  {countryName} Vol: {formatCompact(volumeValue)}
                </div>
                <div>
                  Trend Score: {typeof countryScore === "number" ? `${countryScore}/100` : "-"}
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Left Side - The Map (60%) */}
          <div className="lg:col-span-3 space-y-2 sm:space-y-3">
            <div className="relative h-[200px] sm:h-[250px] md:h-[300px] rounded-lg bg-zinc-950 border border-border overflow-hidden">
              <WorldMap activeCountryCode={localCountryCode ?? "WORLD"} />
            </div>
            {/* Legend - Blue Color Scale */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <span>Low</span>
              <div className="flex gap-0.5">
                <div
                  className="w-4 sm:w-6 h-1.5 sm:h-2 rounded-sm"
                  style={{ backgroundColor: "#1e293b" }}
                />
                <div
                  className="w-4 sm:w-6 h-1.5 sm:h-2 rounded-sm"
                  style={{ backgroundColor: "#1e3a5f" }}
                />
                <div
                  className="w-4 sm:w-6 h-1.5 sm:h-2 rounded-sm"
                  style={{ backgroundColor: "#1e40af" }}
                />
                <div
                  className="w-4 sm:w-6 h-1.5 sm:h-2 rounded-sm"
                  style={{ backgroundColor: "#2563eb" }}
                />
                <div
                  className="w-4 sm:w-6 h-1.5 sm:h-2 rounded-sm"
                  style={{ backgroundColor: "#3b82f6" }}
                />
              </div>
              <span>High</span>
            </div>
          </div>

          {/* Right Side - The Data Table (40%) */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">
              {localCountryCode
                ? `Top Regions in ${ALL_COUNTRIES.find((country) => country.code === localCountryCode)?.name || "Selected Country"}`
                : "Top Countries"}
            </div>

            {/* Cascading Dropdowns */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-[10px] sm:text-xs text-muted-foreground">
                  Country
                </label>
                <SearchableCountryDropdown
                  value={localCountryCode}
                  onChange={(country) => {
                    setLocalCountryCode(country?.code ?? null)
                    setLocalRegion(null)
                    setGeoCountryCode(country?.code ?? null)
                    setGeoCity(null)
                  }}
                  triggerClassName="h-8 sm:h-9 w-full text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-[10px] sm:text-xs text-muted-foreground">
                  Region
                </label>
                <CascadingCityDropdown
                  countryCode={localCountryCode}
                  value={localRegion}
                  onChange={(value) => {
                    setLocalRegion(value)
                    setGeoCity(value)
                  }}
                />
              </div>
            </div>

            {/* Region List */}
            <div className="space-y-1.5 sm:space-y-2">
              {isLoadingRegions ? (
                <div className="text-xs text-muted-foreground">Loading regions...</div>
              ) : (
                visibleRegions.map((region) => {
                  const styles = getRegionStyles(region.value)
                  return (
                    <div key={region.name} className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm text-foreground flex-1 truncate">
                        {region.name}
                      </span>
                      <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                        <div
                          className={`h-full bg-linear-to-r ${styles.bar} rounded-full`}
                          style={{ width: `${region.value}%` }}
                        />
                      </div>
                      <span className={`text-[10px] sm:text-xs font-mono w-8 sm:w-10 text-right ${styles.text}`}>
                        {region.value}%
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            {localRegion && (
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Region Score:</span>{" "}
                {typeof selectedRegionScore === "number" ? `${selectedRegionScore}%` : "No Data"}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground pt-2">
                <button
                  type="button"
                  className="h-7 w-7 flex items-center justify-center rounded-md bg-white/5 dark:bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 disabled:opacity-50"
                  onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                  disabled={pageIndex === 0}
                  aria-label="Previous regions"
                >
                  ←
                </button>
                <span>
                  Page {pageIndex + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  className="h-7 w-7 flex items-center justify-center rounded-md bg-white/5 dark:bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 disabled:opacity-50"
                  onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={pageIndex >= totalPages - 1}
                  aria-label="Next regions"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
