"use client"

import { useMemo, useState } from "react"
import { Globe, ChevronDown, Check, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { ALL_COUNTRIES, type CountryGeo } from "../constants/map-coordinates"

interface SearchableCountryDropdownProps {
  value: string | null
  onChange: (country: CountryGeo | null) => void
  triggerClassName?: string
  triggerAriaLabel?: string
}

export function SearchableCountryDropdown({
  value,
  onChange,
  triggerClassName,
  triggerAriaLabel = "Select country",
}: SearchableCountryDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selectedCountry = value
    ? ALL_COUNTRIES.find((country) => country.code === value)
    : null

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return ALL_COUNTRIES.filter((country) => country.code !== "WORLD")
    return ALL_COUNTRIES.filter(
      (country) =>
        country.code !== "WORLD" &&
        (country.name.toLowerCase().includes(query) ||
          country.code.toLowerCase().includes(query))
    )
  }, [search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={triggerAriaLabel}
          className={cn(
            "h-11 gap-2 bg-card border-border text-foreground justify-between hover:bg-muted",
            triggerClassName
          )}
        >
          {selectedCountry ? (
            <span className="text-sm flex items-center">
              <span className="inline-block w-8 font-medium text-slate-500 dark:text-slate-400">
                {selectedCountry.code}
              </span>
              <span className="font-medium text-foreground dark:text-white">
                {selectedCountry.name}
              </span>
            </span>
          ) : (
            <>
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Worldwide</span>
            </>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 bg-card border-border" align="start">
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
            <span>Worldwide</span>
            {!selectedCountry && <Check className="h-4 w-4 ml-auto text-amber-400" />}
          </button>

          {filteredCountries.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                Countries
              </div>
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    onChange(country)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    selectedCountry?.code === country.code
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "text-foreground hover:bg-muted dark:hover:bg-slate-800"
                  )}
                >
                  <span className="flex items-center">
                    <span className="inline-block w-8 font-medium text-slate-500 dark:text-slate-400">
                      {country.code}
                    </span>
                    <span className="font-medium text-foreground dark:text-white">
                      {country.name}
                    </span>
                  </span>
                  {selectedCountry?.code === country.code && (
                    <Check className="h-4 w-4 ml-auto text-amber-600 dark:text-amber-400" />
                  )}
                </button>
              ))}
            </>
          )}

          {filteredCountries.length === 0 && (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No countries found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
