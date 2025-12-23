/**
 * Pricing Packages Component
 * Displays and handles package selection
 */

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { CREDIT_PACKAGES, formatPrice } from "./pricing-utils"

interface PricingPackagesProps {
  selectedPackage: string | null
  onSelectPackage: (packageId: string) => void
  isLoading: boolean
  compact?: boolean
}

export function PricingPackages({ selectedPackage, onSelectPackage, isLoading, compact = false }: PricingPackagesProps) {
  return (
    <div className="space-y-2">
      {CREDIT_PACKAGES.slice(0, compact ? 2 : 4).map((pkg) => (
        <button
          key={pkg.id}
          onClick={() => onSelectPackage(pkg.id)}
          disabled={isLoading}
          className={cn(
            "w-full p-2 sm:p-2.5 rounded-lg border transition-all text-left relative group",
            selectedPackage === pkg.id
              ? "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500/50"
              : "border-border hover:border-orange-500/50 hover:bg-muted/30"
          )}
        >
          {pkg.popular && (
            <div className="absolute -top-px -right-px">
              <div className="bg-linear-to-r from-orange-500 to-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-md rounded-tr-lg">
                BEST
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className={cn(
              "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
              selectedPackage === pkg.id
                ? "bg-orange-500 border-orange-500 text-white"
                : "border-muted-foreground/40 bg-transparent"
            )}>
              {selectedPackage === pkg.id && <Check className="w-2.5 h-2.5" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-semibold text-foreground">{pkg.name}</span>
                {pkg.savings > 0 && (
                  <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">
                    -{pkg.savings}%
                  </span>
                )}
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">{pkg.credits} credits</p>
            </div>
            
            <div className="text-right shrink-0">
              <p className="text-xs sm:text-sm font-bold text-foreground">{formatPrice(pkg.price)}</p>
            </div>
          </div>

          {selectedPackage === pkg.id && (
            <div className="mt-2 pt-2 border-t border-border/50 grid grid-cols-2 gap-1">
              {pkg.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{feature}</span>
                </div>
              ))}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
