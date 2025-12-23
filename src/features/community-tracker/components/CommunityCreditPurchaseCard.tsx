/**
 * Community Credit Purchase Card (Refactored)
 * Main container using split components
 */

"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown } from "lucide-react"
import { toast } from "sonner"
import { PricingPackages } from "./credit-purchase/PricingPackages"
import { CustomCreditSlider } from "./credit-purchase/CustomCreditSlider"
import { PurchaseButton } from "./credit-purchase/PurchaseButton"
import { CREDIT_PACKAGES, CUSTOM_SLIDER, calculateCustomPrice } from "./credit-purchase/pricing-utils"

interface CommunityCreditPurchaseCardProps {
  currentCredits?: number
  onPurchase?: (packageId: string, credits: number, price: number) => void
  isLoading?: boolean
  compact?: boolean
}

export function CommunityCreditPurchaseCard({
  currentCredits = 0,
  onPurchase,
  isLoading = false,
  compact = false,
}: CommunityCreditPurchaseCardProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [customCredits, setCustomCredits] = useState(CUSTOM_SLIDER.default)
  const [showCustom, setShowCustom] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const customPrice = useMemo(() => calculateCustomPrice(customCredits), [customCredits])
  const selectedPkg = useMemo(() => CREDIT_PACKAGES.find(p => p.id === selectedPackage), [selectedPackage])

  const handlePurchase = useCallback(async () => {
    if (!selectedPackage && !showCustom) {
      toast.error("Please select a package")
      return
    }

    setIsPurchasing(true)

    try {
      const packageId = showCustom ? "custom" : selectedPackage!
      const credits = showCustom ? customCredits : selectedPkg!.credits
      const price = showCustom ? customPrice : selectedPkg!.price

      if (onPurchase) {
        onPurchase(packageId, credits, price)
      }
    } catch (error) {
      toast.error("Failed to initiate purchase")
    } finally {
      setIsPurchasing(false)
    }
  }, [selectedPackage, showCustom, customCredits, customPrice, selectedPkg, onPurchase])

  const loading = isLoading || isPurchasing

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-3 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-linear-to-br from-orange-500/20 to-red-500/20">
              <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
            </div>
            Get Credits
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] sm:text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            {currentCredits} available
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 pt-0">
        {/* Platform Cost Info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <div className="w-5 h-5 text-orange-500">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Reddit</p>
              <p className="text-xs font-semibold text-foreground">1 credit</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
            <div className="w-5 h-5 text-red-600 font-bold text-sm flex items-center justify-center">Q</div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Quora</p>
              <p className="text-xs font-semibold text-foreground">1 credit</p>
            </div>
          </div>
        </div>

        {/* Package Selection */}
        <PricingPackages
          selectedPackage={selectedPackage}
          onSelectPackage={(id) => {
            setSelectedPackage(id)
            setShowCustom(false)
          }}
          isLoading={loading}
          compact={compact}
        />

        {/* Custom Slider */}
        <CustomCreditSlider
          isActive={showCustom}
          onActivate={() => {
            setShowCustom(true)
            setSelectedPackage(null)
          }}
          credits={customCredits}
          onCreditsChange={setCustomCredits}
          isLoading={loading}
          compact={compact}
        />

        {/* Purchase Button */}
        <PurchaseButton
          onClick={handlePurchase}
          disabled={loading || (!selectedPackage && !showCustom)}
          isLoading={loading}
        />
      </CardContent>
    </Card>
  )
}
