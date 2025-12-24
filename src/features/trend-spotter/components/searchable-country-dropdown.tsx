"use client"

import { useState } from "react"
import { Globe, ChevronDown, Check, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { tier1Countries, allCountries } from "../constants"

interface SearchableCountryDropdownProps {
  value: string | null
  onChange: (countryCode: string | null) => void
  triggerClassName?: string
  triggerAriaLabel?: string
}

export function SearchableCountryDropdown({ 
  value, 
  onChange, 
  triggerClassName,
  triggerAriaLabel = "Select country"
}: SearchableCountryDropdownProps) {
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
          aria-label={triggerAriaLabel}
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
