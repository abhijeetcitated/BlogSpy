/**
 * Custom Credit Slider Component
 * Allows users to select custom credit amount
 */

import { Slider } from "@/components/ui/slider"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { CUSTOM_SLIDER, formatPrice, calculateCustomPrice } from "./pricing-utils"

interface CustomCreditSliderProps {
  isActive: boolean
  onActivate: () => void
  credits: number
  onCreditsChange: (credits: number) => void
  isLoading: boolean
  compact?: boolean
}

export function CustomCreditSlider({
  isActive,
  onActivate,
  credits,
  onCreditsChange,
  isLoading,
  compact = false,
}: CustomCreditSliderProps) {
  const customPrice = calculateCustomPrice(credits)

  if (compact) return null

  return (
    <>
      <button
        onClick={onActivate}
        disabled={isLoading}
        className={cn(
          "w-full p-2 sm:p-2.5 rounded-lg border transition-all text-left",
          isActive
            ? "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500/50"
            : "border-dashed border-muted-foreground/30 hover:border-orange-500/50"
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
            isActive
              ? "bg-orange-500 border-orange-500 text-white"
              : "border-muted-foreground/40 bg-transparent"
          )}>
            {isActive && <Check className="w-2.5 h-2.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-foreground">Custom</span>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Choose your own</p>
          </div>
        </div>
      </button>

      {isActive && (
        <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{credits} Credits</span>
            <span className="text-lg font-bold text-orange-500">{formatPrice(customPrice)}</span>
          </div>
          <Slider
            value={[credits]}
            onValueChange={([val]) => onCreditsChange(val)}
            min={CUSTOM_SLIDER.min}
            max={CUSTOM_SLIDER.max}
            step={CUSTOM_SLIDER.step}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{CUSTOM_SLIDER.min} credits</span>
            <span>{formatPrice(CUSTOM_SLIDER.pricePerCredit)}/credit</span>
            <span>{CUSTOM_SLIDER.max} credits</span>
          </div>
        </div>
      )}
    </>
  )
}
