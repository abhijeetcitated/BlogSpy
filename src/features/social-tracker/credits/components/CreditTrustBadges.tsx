/**
 * Credit Trust Badges Component
 * Trust indicators and first purchase bonus
 */

"use client"

import { memo } from "react"
import { ShieldCheck, Infinity, Users, Gift } from "lucide-react"
import { BONUS_CONFIG } from "../config/pricing.config"

interface CreditTrustBadgesProps {
  isFirstPurchase: boolean
}

export const CreditTrustBadges = memo(function CreditTrustBadges({
  isFirstPurchase,
}: CreditTrustBadgesProps) {
  return (
    <>
      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span className="text-[10px] text-muted-foreground text-center">Secure Payment</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
          <Infinity className="h-4 w-4 text-blue-500" />
          <span className="text-[10px] text-muted-foreground text-center">Never Expires</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
          <Users className="h-4 w-4 text-purple-500" />
          <span className="text-[10px] text-muted-foreground text-center">All Platforms</span>
        </div>
      </div>

      {/* Bonus Info */}
      {isFirstPurchase && BONUS_CONFIG.firstPurchaseBonus.enabled && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 text-xs">
          <Gift className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-muted-foreground">
            <span className="font-medium text-amber-500">First Purchase Bonus:</span>{" "}
            Get {BONUS_CONFIG.firstPurchaseBonus.bonusPercent}% extra credits (up to {BONUS_CONFIG.firstPurchaseBonus.maxBonus})!
          </span>
        </div>
      )}
    </>
  )
})
