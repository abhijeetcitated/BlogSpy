/**
 * Credit Package List Component
 * Displays selectable credit packages
 */

"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronRight, TrendingUp } from "lucide-react"
import { 
  CREDIT_PACKAGES, 
  calculateBonusCredits,
  formatPrice,
} from "../config/pricing.config"

interface CreditPackageListProps {
  selectedPackage: string | null
  isFirstPurchase: boolean
  isLoading: boolean
  onPackageSelect: (packageId: string) => void
  onShowCustom: () => void
}

function getPackageColorClass(color: string, isSelected: boolean) {
  const colors: Record<string, { border: string; bg: string; gradient: string }> = {
    blue: { 
      border: isSelected ? "border-blue-500" : "border-border hover:border-blue-500/50",
      bg: isSelected ? "bg-blue-500/10" : "hover:bg-muted/50",
      gradient: "from-blue-500 to-cyan-500",
    },
    pink: { 
      border: isSelected ? "border-pink-500" : "border-border hover:border-pink-500/50",
      bg: isSelected ? "bg-pink-500/10" : "hover:bg-muted/50",
      gradient: "from-pink-500 to-rose-500",
    },
    purple: { 
      border: isSelected ? "border-purple-500" : "border-border hover:border-purple-500/50",
      bg: isSelected ? "bg-purple-500/10" : "hover:bg-muted/50",
      gradient: "from-purple-500 to-violet-500",
    },
    amber: { 
      border: isSelected ? "border-amber-500" : "border-border hover:border-amber-500/50",
      bg: isSelected ? "bg-amber-500/10" : "hover:bg-muted/50",
      gradient: "from-amber-500 to-orange-500",
    },
    green: { 
      border: isSelected ? "border-emerald-500" : "border-border hover:border-emerald-500/50",
      bg: isSelected ? "bg-emerald-500/10" : "hover:bg-muted/50",
      gradient: "from-emerald-500 to-teal-500",
    },
  }
  return colors[color] || colors.pink
}

export const CreditPackageList = memo(function CreditPackageList({
  selectedPackage,
  isFirstPurchase,
  isLoading,
  onPackageSelect,
  onShowCustom,
}: CreditPackageListProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Select Package</p>
      <div className="grid gap-2">
        {CREDIT_PACKAGES.map((pkg) => {
          const isSelected = selectedPackage === pkg.id
          const colorClasses = getPackageColorClass(pkg.color, isSelected)
          const bonusCredits = calculateBonusCredits(pkg.credits, isFirstPurchase)

          return (
            <button
              key={pkg.id}
              onClick={() => onPackageSelect(pkg.id)}
              disabled={isLoading}
              className={cn(
                "relative flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                colorClasses.border,
                colorClasses.bg,
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {pkg.popular && (
                <Badge className={cn(
                  "absolute -top-2 left-3 text-white text-[9px] px-2",
                  `bg-linear-to-r ${colorClasses.gradient}`
                )}>
                  {pkg.badge || "Best Value"}
                </Badge>
              )}
              
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                  isSelected 
                    ? "border-pink-500 bg-pink-500" 
                    : "border-muted-foreground/30"
                )}>
                  {isSelected && (
                    <Check className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">{pkg.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {pkg.credits.toLocaleString("en-IN")} Credits
                    </span>
                    {bonusCredits > 0 && (
                      <Badge variant="secondary" className="text-[9px] bg-emerald-500/20 text-emerald-500">
                        +{bonusCredits} Bonus
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">
                      {formatPrice(pkg.pricePerCredit)}/credit
                    </span>
                    {pkg.savings > 0 && (
                      <span className="text-[10px] text-emerald-500">
                        Save {pkg.savings}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {pkg.originalPrice > pkg.price && (
                  <span className="text-xs text-muted-foreground line-through mr-1">
                    {formatPrice(pkg.originalPrice)}
                  </span>
                )}
                <span className="text-lg font-bold text-foreground">{formatPrice(pkg.price)}</span>
              </div>
            </button>
          )
        })}
      </div>
      
      {/* Custom Amount Toggle */}
      <button
        onClick={onShowCustom}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-muted-foreground/30 hover:border-pink-500/50 transition-colors text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        <TrendingUp className="w-3 h-3" />
        Need a custom amount?
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
})
