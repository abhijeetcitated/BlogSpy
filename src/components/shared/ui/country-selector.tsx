"use client"

import { useMemo, useState, useEffect, useCallback, useRef } from "react"
import { Check, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ALL_COUNTRIES, POPULAR_COUNTRIES } from "@/features/keyword-research/constants"
import type { Country } from "@/features/keyword-research/types"

type CountrySelectorProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function CountrySelector({ value, onChange, disabled }: CountrySelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [fullCountries, setFullCountries] = useState<Country[]>([])
  const [isLoadingFull, setIsLoadingFull] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  const selectedCountry = useMemo(
    () =>
      POPULAR_COUNTRIES.find((item) => item.code === value) ??
      ALL_COUNTRIES.find((item) => item.code === value) ??
      fullCountries.find((item) => item.code === value) ??
      null,
    [value, fullCountries]
  )

  const loadFullCountries = useCallback(async () => {
    if (fullCountries.length > 0 || isLoadingFull) return
    setIsLoadingFull(true)
    try {
      const { FULL_COUNTRIES } = await import("@/features/keyword-research/constants/full-countries")
      setFullCountries(FULL_COUNTRIES)
    } catch (error) {
      console.error("Failed to load full countries", error)
    } finally {
      setIsLoadingFull(false)
    }
  }, [fullCountries.length, isLoadingFull])

  useEffect(() => {
    if (search.trim().length >= 2) {
      loadFullCountries()
    }
  }, [search, loadFullCountries])

  const normalizedSearch = search.trim().toLowerCase()
  const filteredPopular = useMemo(
    () =>
      POPULAR_COUNTRIES.filter((item) => {
        const name = item.name.toLowerCase()
        const code = item.code.toLowerCase()
        return name.includes(normalizedSearch) || code.includes(normalizedSearch)
      }),
    [normalizedSearch]
  )

  const filteredAll = useMemo(
    () =>
      ALL_COUNTRIES.filter((item) => {
        const name = item.name.toLowerCase()
        const code = item.code.toLowerCase()
        return name.includes(normalizedSearch) || code.includes(normalizedSearch)
      }),
    [normalizedSearch]
  )

  const existingCodes = useMemo(
    () => new Set([...POPULAR_COUNTRIES.map((c) => c.code), ...ALL_COUNTRIES.map((c) => c.code)]),
    []
  )

  const filteredExtended = useMemo(() => {
    if (normalizedSearch.length < 2) return []
    return fullCountries.filter((item) => {
      if (existingCodes.has(item.code)) return false
      const name = item.name.toLowerCase()
      const code = item.code.toLowerCase()
      return name.includes(normalizedSearch) || code.includes(normalizedSearch)
    })
  }, [existingCodes, fullCountries, normalizedSearch])

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
              <span className="text-xs text-muted-foreground">{selectedCountry.code}</span>
            </span>
          ) : (
            "Select country"
          )}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 z-60 pointer-events-auto"
        align="start"
        portal={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          searchInputRef.current?.focus()
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          triggerRef.current?.focus()
        }}
      >
        <div className="sticky top-0 z-10 bg-popover border-b border-border p-2">
          <Input
            placeholder="Search countries..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9"
            ref={searchInputRef}
            autoFocus
          />
        </div>
        <div className="max-h-75 overflow-y-auto overflow-x-hidden p-1">
          {filteredPopular.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Popular
              </div>
              {filteredPopular.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    onChange(item.code)
                    setOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-2 rounded text-sm hover:bg-accent transition-colors",
                    item.code === value && "bg-accent"
                  )}
                >
                  <span className="text-base">{item.flag}</span>
                  <span className="flex-1 text-left">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.code}</span>
                  {item.code === value && <Check className="ml-2 h-4 w-4 text-primary" />}
                </button>
              ))}
            </>
          )}

          {filteredAll.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">
                All Countries
              </div>
              {filteredAll.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    onChange(item.code)
                    setOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-2 rounded text-sm hover:bg-accent transition-colors",
                    item.code === value && "bg-accent"
                  )}
                >
                  <span className="text-base">{item.flag}</span>
                  <span className="flex-1 text-left">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.code}</span>
                  {item.code === value && <Check className="ml-2 h-4 w-4 text-primary" />}
                </button>
              ))}
            </>
          )}

          {filteredExtended.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">
                More Countries
              </div>
              {filteredExtended.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    onChange(item.code)
                    setOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-2 rounded text-sm hover:bg-accent transition-colors",
                    item.code === value && "bg-accent"
                  )}
                >
                  <span className="text-base">{item.flag}</span>
                  <span className="flex-1 text-left">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.code}</span>
                  {item.code === value && <Check className="ml-2 h-4 w-4 text-primary" />}
                </button>
              ))}
            </>
          )}

          {normalizedSearch &&
            filteredPopular.length === 0 &&
            filteredAll.length === 0 &&
            filteredExtended.length === 0 && (
              <div className="px-2 py-2 text-xs text-muted-foreground">No country found.</div>
            )}

          {isLoadingFull && normalizedSearch.length >= 2 && (
            <div className="px-2 py-2 text-xs text-muted-foreground">Loading more countries...</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
