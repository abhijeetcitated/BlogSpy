// ============================================
// Country Dropdown Component
// ============================================
// Searchable dropdown with Worldwide, Tier-1, and Other Countries
// ============================================

"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { ChevronDown, Search, Globe, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  WORLDWIDE, 
  TIER1_COUNTRIES, 
  OTHER_COUNTRIES, 
  searchCountries,
  type Country 
} from "../constants/countries"

interface CountryDropdownProps {
  value: string
  onChange: (countryCode: string) => void
  className?: string
  /** Optional: keyword counts per country code */
  countryStats?: Record<string, number>
}

export function CountryDropdown({ value, onChange, className, countryStats }: CountryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Get selected country display
  const selectedCountry = useMemo(() => {
    if (value === "worldwide") return WORLDWIDE
    const found = [...TIER1_COUNTRIES, ...OTHER_COUNTRIES].find(
      (c) => c.code === value
    )
    return found || WORLDWIDE
  }, [value])

  // Filtered countries based on search
  const filteredCountries = useMemo(() => {
    return searchCountries(searchQuery)
  }, [searchQuery])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (country: Country) => {
    onChange(country.code)
    setIsOpen(false)
    setSearchQuery("")
  }

  const hasResults = 
    filteredCountries.worldwide || 
    filteredCountries.tier1.length > 0 || 
    filteredCountries.others.length > 0

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
          "border-border bg-card hover:bg-muted",
          isOpen && "ring-2 ring-emerald-500/20 border-emerald-500/50"
        )}
      >
        <span className="text-base">{selectedCountry.flag}</span>
        <span className="text-foreground truncate">{selectedCountry.name}</span>
        <span className="text-muted-foreground text-xs hidden sm:inline">
          {selectedCountry.code === "worldwide" ? "WW" : selectedCountry.code}
        </span>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-1 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
          {/* Search Box */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-9 pr-3 py-2 text-sm rounded-lg",
                  "bg-muted/50 border border-border",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50",
                  "placeholder:text-muted-foreground"
                )}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-72 overflow-y-auto">
            {!hasResults && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No countries found for "{searchQuery}"
              </div>
            )}

            {/* Worldwide Option */}
            {filteredCountries.worldwide && (
              <div className="p-1">
                <CountryOption
                  country={filteredCountries.worldwide}
                  isSelected={value === "worldwide"}
                  onClick={() => handleSelect(filteredCountries.worldwide!)}
                  count={countryStats?.worldwide}
                  showGlobeIcon
                />
              </div>
            )}

            {/* Tier 1 Countries */}
            {filteredCountries.tier1.length > 0 && (
              <div className="border-t border-border">
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                  Top Countries
                </div>
                <div className="p-1">
                  {filteredCountries.tier1.map((country) => (
                    <CountryOption
                      key={country.code}
                      country={country}
                      isSelected={value === country.code}
                      onClick={() => handleSelect(country)}
                      count={countryStats?.[country.code]}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Countries */}
            {filteredCountries.others.length > 0 && (
              <div className="border-t border-border">
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                  All Countries
                </div>
                <div className="p-1">
                  {filteredCountries.others.map((country) => (
                    <CountryOption
                      key={country.code}
                      country={country}
                      isSelected={value === country.code}
                      onClick={() => handleSelect(country)}
                      count={countryStats?.[country.code]}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Country Option Item
function CountryOption({
  country,
  isSelected,
  onClick,
  count,
  showGlobeIcon = false,
}: {
  country: Country
  isSelected: boolean
  onClick: () => void
  count?: number
  showGlobeIcon?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        isSelected
          ? "bg-emerald-500/10 text-emerald-500"
          : "hover:bg-muted text-foreground"
      )}
    >
      <span className="text-lg">{country.flag}</span>
      <span className="flex-1 text-left">{country.name}</span>
      {count !== undefined && count > 0 && (
        <span className={cn(
          "text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
          isSelected 
            ? "bg-emerald-500 text-white" 
            : "bg-muted text-muted-foreground"
        )}>
          {count}
        </span>
      )}
      {country.code !== "worldwide" && (
        <span className="text-xs text-muted-foreground">{country.code}</span>
      )}
      {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
    </button>
  )
}
