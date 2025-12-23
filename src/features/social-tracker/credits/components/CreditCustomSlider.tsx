/**
 * Credit Custom Slider Component
 * Custom credit amount selection with pricing
 */

"use client"

import { memo } from "react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { CUSTOM_SLIDER_CONFIG, formatPrice } from "../config/pricing.config"

interface CustomPricing {
  totalPrice: number
  pricePerCredit: number
  discount: number
  bonusCredits: number
  finalPrice: number
  promoDiscount: number
}

interface CreditCustomSliderProps {
  customCredits: number
  customPricing: CustomPricing
  isLoading: boolean
  onCreditsChange: (credits: number) => void
  onShowPackages: () => void
}

export const CreditCustomSlider = memo(function CreditCustomSlider({
  customCredits,
  customPricing,
  isLoading,
  onCreditsChange,
  onShowPackages,
}: CreditCustomSliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Custom Amount</p>
        <button
          onClick={onShowPackages}
          disabled={isLoading}
          className="text-xs text-pink-500 hover:underline disabled:opacity-50"
        >
          View packages
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground">
            {customCredits.toLocaleString("en-IN")}
          </span>
          <span className="text-sm text-muted-foreground">credits</span>
        </div>
        
        <Slider
          value={[customCredits]}
          onValueChange={([value]) => onCreditsChange(value)}
          min={CUSTOM_SLIDER_CONFIG.minCredits}
          max={CUSTOM_SLIDER_CONFIG.maxCredits}
          step={CUSTOM_SLIDER_CONFIG.step}
          className="py-2"
          disabled={isLoading}
        />
        
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{CUSTOM_SLIDER_CONFIG.minCredits}</span>
          <span>{CUSTOM_SLIDER_CONFIG.maxCredits.toLocaleString("en-IN")}</span>
        </div>
      </div>
      
      {/* Real-time Price Display */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Price per credit</span>
          <span className="font-medium text-foreground">{formatPrice(customPricing.pricePerCredit)}</span>
        </div>
        {customPricing.discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Volume discount</span>
            <Badge className="bg-emerald-500/20 text-emerald-500 text-[10px]">
              {customPricing.discount}% off
            </Badge>
          </div>
        )}
        {customPricing.bonusCredits > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Bonus credits</span>
            <span className="font-medium text-emerald-500">+{customPricing.bonusCredits}</span>
          </div>
        )}
        {customPricing.promoDiscount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Promo discount</span>
            <span className="font-medium text-emerald-500">-{formatPrice(customPricing.promoDiscount)}</span>
          </div>
        )}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Total</span>
          <span className="text-xl font-bold text-foreground">{formatPrice(customPricing.finalPrice)}</span>
        </div>
      </div>
    </div>
  )
})
