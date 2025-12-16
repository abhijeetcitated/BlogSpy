"use client"

import { useState, useMemo } from "react"
import { ChevronDown, Check, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { cityDataByCountry } from "../__mocks__"

interface CascadingCityDropdownProps {
  countryCode: string | null
  value: string | null
  onChange: (city: string | null) => void
}

export function CascadingCityDropdown({ 
  countryCode, 
  value, 
  onChange 
}: CascadingCityDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const cities = useMemo(() => {
    if (!countryCode) return []
    return cityDataByCountry[countryCode] || cityDataByCountry.DEFAULT
  }, [countryCode])

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const isDisabled = !countryCode

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={isDisabled}
          className={cn(
            "h-9 gap-2 bg-card border-border text-foreground justify-between w-full text-sm hover:bg-muted",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="truncate">
            {value || (isDisabled ? "Select country first" : "All Regions")}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0 bg-card border-border" align="end">
        {/* Search Input */}
        <div className="p-2 border-b border-border sticky top-0 bg-card z-10">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 pl-8 text-xs bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="max-h-[250px] overflow-y-auto p-1">
          {/* All Regions Option */}
          <button
            onClick={() => {
              onChange(null)
              setOpen(false)
              setSearch("")
            }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
              !value
                ? "bg-blue-500/20 text-blue-400"
                : "text-foreground hover:bg-muted"
            )}
          >
            <span>All Regions</span>
            {!value && <Check className="h-3.5 w-3.5 ml-auto text-blue-400" />}
          </button>

          {filteredCities.map((city) => (
            <button
              key={city.name}
              onClick={() => {
                onChange(city.name)
                setOpen(false)
                setSearch("")
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors",
                value === city.name
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <span>{city.name}</span>
              <span className="text-xs text-muted-foreground">{city.value}%</span>
            </button>
          ))}

          {filteredCities.length === 0 && (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              No regions found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
