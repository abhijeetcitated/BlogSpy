"use client"

// ============================================
// Country Selector Component
// ============================================

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Country } from "../../types"

interface CountrySelectorProps {
  selectedCountry: Country | null
  onSelect: (country: Country | null) => void
  popularCountries: Country[]
  allCountries: Country[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CountrySelector({
  selectedCountry,
  onSelect,
  popularCountries,
  allCountries,
  open,
  onOpenChange,
}: CountrySelectorProps) {
  const [countrySearch, setCountrySearch] = useState("")

  const defaultCountry = useMemo<Country | null>(() => {
    const fromPopular = popularCountries.find((c) => c.code === "US")
    if (fromPopular) return fromPopular
    const fromAll = allCountries.find((c) => c.code === "US")
    return fromAll ?? null
  }, [allCountries, popularCountries])

  const effectiveSelectedCountry = selectedCountry ?? defaultCountry

  useEffect(() => {
    if (!selectedCountry && defaultCountry) {
      onSelect(defaultCountry)
    }
  }, [defaultCountry, onSelect, selectedCountry])

  const filteredPopular = popularCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const filteredAll = allCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 gap-1.5 sm:gap-2 bg-secondary/50 border-border hover:bg-accent min-w-0 sm:min-w-[180px] justify-between px-2 sm:px-3"
        >
        {effectiveSelectedCountry ? (
          <>
            <span className="text-base">{effectiveSelectedCountry.flag}</span>
            <span className="text-xs sm:text-sm font-medium truncate max-w-20 sm:max-w-none">{effectiveSelectedCountry.name}</span>
          </>
        ) : (
          <span className="text-xs sm:text-sm">Select country</span>
        )}
        <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground ml-auto shrink-0" />
      </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] p-0" 
        align="end" 
        sideOffset={8}
      >
        <div className="p-2 border-b border-border">
          <Input
            placeholder="Search countries..."
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
            className="h-8 text-sm bg-input border-border"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1">
          {/* Popular Section */}
          {filteredPopular.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Popular
              </div>
              {filteredPopular.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    onSelect(country)
                    onOpenChange(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                    effectiveSelectedCountry?.code === country.code && "bg-accent"
                  )}
                >
                  <span className="text-base">{country.flag}</span>
                  <span>{country.name}</span>
                  {effectiveSelectedCountry?.code === country.code && (
                    <Check className="h-4 w-4 ml-auto text-primary" />
                  )}
                </button>
              ))}
            </>
          )}

          {/* All Countries Section */}
          {filteredAll.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">
                All Countries
              </div>
              {filteredAll.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    onSelect(country)
                    onOpenChange(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                    effectiveSelectedCountry?.code === country.code && "bg-accent"
                  )}
                >
                  <span className="text-base">{country.flag}</span>
                  <span>{country.name}</span>
                  {effectiveSelectedCountry?.code === country.code && (
                    <Check className="h-4 w-4 ml-auto text-primary" />
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
