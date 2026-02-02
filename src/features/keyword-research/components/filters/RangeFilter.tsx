"use client"

// ============================================
// RANGE FILTER - Dual Slider + Numeric Inputs
// ============================================

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useKeywordStore } from "../../store"

type RangeKey = "volumeRange" | "kdRange" | "cpcRange" | "geoRange"

type RangePreset = {
  label: string
  range: [number, number]
  color?: string
}

interface RangeFilterProps {
  label: string
  min: number
  max: number
  step?: number
  unit?: string
  presets?: RangePreset[]
  storeKey: RangeKey
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export function RangeFilter({
  label,
  min,
  max,
  step = 1,
  unit,
  presets,
  storeKey,
}: RangeFilterProps) {
  const value = useKeywordStore((state) => state.filters[storeKey]) as [number, number]
  const setFilterRange = useKeywordStore((state) => state.setFilterRange)

  const sliderMin = Math.max(0, min)
  const sliderMax = Math.max(sliderMin, max)

  const normalizeRange = (rawMin: number, rawMax: number): [number, number] => {
    const safeMin = clamp(Math.max(0, rawMin), sliderMin, sliderMax)
    const safeMax = clamp(Math.max(0, rawMax), sliderMin, sliderMax)
    return safeMin <= safeMax ? [safeMin, safeMax] : [safeMax, safeMin]
  }

  const [localValue, setLocalValue] = useState<[number, number]>(() =>
    normalizeRange(value[0] ?? sliderMin, value[1] ?? sliderMax)
  )

  useEffect(() => {
    setLocalValue(normalizeRange(value[0] ?? sliderMin, value[1] ?? sliderMax))
  }, [value, sliderMin, sliderMax])

  const prefixLabel = unit && unit !== "%" ? unit : null
  const suffixLabel = unit === "%" ? unit : null

  const handleSliderChange = (next: number[]) => {
    const rawMin = next[0] ?? sliderMin
    const rawMax = next[1] ?? sliderMax
    setLocalValue(normalizeRange(rawMin, rawMax))
  }

  const handleSliderCommit = (next: number[]) => {
    const rawMin = next[0] ?? sliderMin
    const rawMax = next[1] ?? sliderMax
    const [safeMin, safeMax] = normalizeRange(rawMin, rawMax)
    setFilterRange(storeKey, [safeMin, safeMax])
  }

  const handleMinChange = (raw: string) => {
    const parsed = raw === "" ? 0 : Number.parseFloat(raw)
    const numeric = Number.isFinite(parsed) ? parsed : 0
    const [nextMin, nextMax] = normalizeRange(numeric, localValue[1])
    setLocalValue([nextMin, nextMax])
  }

  const handleMaxChange = (raw: string) => {
    const parsed = raw === "" ? 0 : Number.parseFloat(raw)
    const numeric = Number.isFinite(parsed) ? parsed : 0
    const [nextMin, nextMax] = normalizeRange(localValue[0], numeric)
    setLocalValue([nextMin, nextMax])
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label} Range
      </div>

      <Slider
        value={localValue}
        onValueChange={handleSliderChange}
        onValueCommit={handleSliderCommit}
        min={sliderMin}
        max={sliderMax}
        step={step}
        className="py-2 [&_[data-slot=slider-range]]:bg-[#FFD700]"
      />

      {presets && presets.length > 0 && (
        <div className="space-y-1">
          {presets.map((preset) => {
            const isActive =
              localValue[0] === preset.range[0] && localValue[1] === preset.range[1]
            return (
              <button
                key={preset.label}
                onClick={() => {
                  setLocalValue(preset.range)
                  setFilterRange(storeKey, preset.range)
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50",
                  isActive && "bg-muted/50"
                )}
              >
                {preset.color && (
                  <span className={cn("w-2.5 h-2.5 rounded-full", preset.color)} />
                )}
                <span className="flex-1 text-left">{preset.label}</span>
                <span className="text-xs text-muted-foreground">
                  {preset.range[0]}-{preset.range[1]}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {prefixLabel && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
              {prefixLabel}
            </span>
          )}
          {suffixLabel && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
              {suffixLabel}
            </span>
          )}
          <Input
            type="number"
            min={0}
            step={step}
            placeholder="Min"
            value={localValue[0] || ""}
            onChange={(e) => handleMinChange(e.target.value)}
            onBlur={() => setFilterRange(storeKey, localValue)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setFilterRange(storeKey, localValue)
                event.currentTarget.blur()
              }
            }}
            className={cn("h-8 text-sm", prefixLabel && "pl-9", suffixLabel && "pr-7")}
          />
        </div>
        <span className="text-muted-foreground text-sm">-</span>
        <div className="relative flex-1">
          {prefixLabel && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
              {prefixLabel}
            </span>
          )}
          {suffixLabel && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
              {suffixLabel}
            </span>
          )}
          <Input
            type="number"
            min={0}
            step={step}
            placeholder="Max"
            value={localValue[1] || ""}
            onChange={(e) => handleMaxChange(e.target.value)}
            onBlur={() => setFilterRange(storeKey, localValue)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setFilterRange(storeKey, localValue)
                event.currentTarget.blur()
              }
            }}
            className={cn("h-8 text-sm", prefixLabel && "pl-9", suffixLabel && "pr-7")}
          />
        </div>
      </div>
    </div>
  )
}
