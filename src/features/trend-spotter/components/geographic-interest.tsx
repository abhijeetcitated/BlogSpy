"use client"

import { useMemo } from "react"
import { Globe } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { WorldMap } from "./world-map"
import { SearchableCountryDropdown } from "./searchable-country-dropdown"
import { CascadingCityDropdown } from "./cascading-city-dropdown"
import { allCountries } from "../constants"
import { cityDataByCountry } from "../__mocks__"

interface GeographicInterestProps {
  geoCountryCode: string | null
  setGeoCountryCode: (code: string | null) => void
  geoCity: string | null
  setGeoCity: (city: string | null) => void
}

export function GeographicInterest({
  geoCountryCode,
  setGeoCountryCode,
  geoCity,
  setGeoCity,
}: GeographicInterestProps) {
  // Get region data based on selected geo country
  const regionData = useMemo(() => {
    if (!geoCountryCode) return cityDataByCountry.DEFAULT
    return cityDataByCountry[geoCountryCode] || cityDataByCountry.DEFAULT
  }, [geoCountryCode])

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
          <span className="text-xs sm:text-sm text-muted-foreground">Volume: 630,000</span>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Left Side - The Map (60%) */}
          <div className="lg:col-span-3 space-y-2 sm:space-y-3">
            <div className="relative h-[200px] sm:h-[250px] md:h-[300px] rounded-lg bg-zinc-950 border border-border overflow-hidden">
              <WorldMap />
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
              Top Regions{" "}
              {geoCountryCode
                ? `in ${allCountries.find((c) => c.code === geoCountryCode)?.name || "Selected Country"}`
                : "Worldwide"}
            </div>

            {/* Cascading Dropdowns */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-[10px] sm:text-xs text-muted-foreground">
                  Country
                </label>
                <SearchableCountryDropdown
                  value={geoCountryCode}
                  onChange={(code) => {
                    setGeoCountryCode(code)
                    setGeoCity(null) // Reset city when country changes
                  }}
                  triggerClassName="h-8 sm:h-9 w-full text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-[10px] sm:text-xs text-muted-foreground">
                  City
                </label>
                <CascadingCityDropdown
                  countryCode={geoCountryCode}
                  value={geoCity}
                  onChange={setGeoCity}
                />
              </div>
            </div>

            {/* Region List */}
            <div className="space-y-1.5 sm:space-y-2">
              {regionData.slice(0, 5).map((region, idx) => (
                <div key={region.name} className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground w-3 sm:w-4">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-foreground flex-1 truncate">
                    {region.name}
                  </span>
                  <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                    <div
                      className="h-full bg-linear-to-r from-blue-600 to-blue-400 rounded-full"
                      style={{ width: `${region.value}%` }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-mono text-blue-400 w-8 sm:w-10 text-right">
                    {region.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
