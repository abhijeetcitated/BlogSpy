"use client"

// ============================================
// Country Selector Component
// ============================================

import { useState } from "react"
import { Globe, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Country } from "../types"

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
    <Popover open={open} onOpenChange={onOpenChange}>
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
              onSelect(null)
              onOpenChange(false)
            }}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted/50 transition-colors",
              !selectedCountry && "bg-muted/50"
            )}
          >
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>Worldwide</span>
            {!selectedCountry && <Check className="h-4 w-4 ml-auto text-primary" />}
          </button>

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
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted/50 transition-colors",
                    selectedCountry?.code === country.code && "bg-muted/50"
                  )}
                >
                  <span className="text-base">{country.flag}</span>
                  <span>{country.name}</span>
                  {selectedCountry?.code === country.code && (
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
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted/50 transition-colors",
                    selectedCountry?.code === country.code && "bg-muted/50"
                  )}
                >
                  <span className="text-base">{country.flag}</span>
                  <span>{country.name}</span>
                  {selectedCountry?.code === country.code && (
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
