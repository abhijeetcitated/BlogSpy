/**
 * Purchase Button Component
 * Purchase action button with trust badges
 */

import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, Sparkles, ChevronRight } from "lucide-react"

interface PurchaseButtonProps {
  onClick: () => void
  disabled: boolean
  isLoading: boolean
}

export function PurchaseButton({ onClick, disabled, isLoading }: PurchaseButtonProps) {
  return (
    <div className="space-y-3">
      <Button
        onClick={onClick}
        disabled={disabled}
        className="w-full h-10 sm:h-11 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/25"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4 mr-2" />
            Purchase Credits
            <ChevronRight className="w-4 h-4 ml-1" />
          </>
        )}
      </Button>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          Secure Payment
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Instant Delivery
        </div>
      </div>

      {/* Info Note */}
      <p className="text-[9px] text-center text-muted-foreground/70">
        1 Credit = 1 Keyword (Reddit + Quora both) • Credits never expire
      </p>
    </div>
  )
}
