/**
 * Credit Purchase Card - Main Component (Refactored)
 * Uses split sub-components for better maintainability
 */

"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Sparkles, 
  Zap, 
  Info,
  CreditCard,
  Crown,
  Loader2,
} from "lucide-react"

import { CreditPackageList } from "./CreditPackageList"
import { CreditCustomSlider } from "./CreditCustomSlider"
import { CreditPromoInput } from "./CreditPromoInput"
import { CreditTrustBadges } from "./CreditTrustBadges"

import {
  PLATFORM_CREDIT_COSTS,
  CUSTOM_SLIDER_CONFIG,
  calculateCustomPrice,
  calculateBonusCredits,
  formatPrice,
  getPackageById,
} from "../config/pricing.config"

import type { PaymentMethod } from "../types/credit.types"

// ============================================
// TYPES
// ============================================

interface CreditPurchaseCardProps {
  currentCredits?: number
  userId?: string
  isFirstPurchase?: boolean
  onPurchase?: (
    packageId: string, 
    credits: number, 
    price: number,
    bonusCredits: number
  ) => Promise<void> | void
  onCheckout?: (
    packageId: string,
    credits: number,
    amount: number,
    paymentMethod: PaymentMethod
  ) => Promise<string | null>
  isLoading?: boolean
  compact?: boolean
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CreditPurchaseCard({ 
  currentCredits = 0,
  userId,
  isFirstPurchase = true,
  onPurchase,
  onCheckout,
  isLoading: externalLoading = false,
  compact = false,
}: CreditPurchaseCardProps) {
  // State
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [customCredits, setCustomCredits] = useState<number>(CUSTOM_SLIDER_CONFIG.defaultValue)
  const [showCustom, setShowCustom] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoMessage, setPromoMessage] = useState("")
  const [promoValid, setPromoValid] = useState<boolean | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)

  // Computed Values
  const customPricing = useMemo(() => {
    const pricing = calculateCustomPrice(customCredits)
    const bonusCredits = calculateBonusCredits(customCredits, isFirstPurchase)
    const finalPrice = Math.max(0, pricing.totalPrice - promoDiscount)
    
    return {
      ...pricing,
      bonusCredits,
      finalPrice,
      promoDiscount,
    }
  }, [customCredits, isFirstPurchase, promoDiscount])

  const selectedPackageDetails = useMemo(() => {
    if (!selectedPackage) return null
    
    const pkg = getPackageById(selectedPackage)
    if (!pkg) return null

    const bonusCredits = calculateBonusCredits(pkg.credits, isFirstPurchase)
    const finalPrice = Math.max(0, pkg.price - promoDiscount)

    return {
      ...pkg,
      bonusCredits,
      finalPrice,
      totalCredits: pkg.credits + bonusCredits,
    }
  }, [selectedPackage, isFirstPurchase, promoDiscount])

  const isLoading = externalLoading || isPurchasing

  // Handlers
  const handleValidatePromo = useCallback(async () => {
    if (!promoCode.trim()) {
      setPromoValid(null)
      setPromoMessage("")
      setPromoDiscount(0)
      return
    }

    setIsValidatingPromo(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const code = promoCode.toUpperCase()
      
      if (code === "LAUNCH50") {
        const amount = selectedPackageDetails?.price || customPricing.totalPrice
        const discount = Math.min(amount * 0.5, 2500)
        setPromoDiscount(discount)
        setPromoValid(true)
        setPromoMessage(`50% off applied! You save ${formatPrice(discount)}`)
      } else if (code === "WELCOME25") {
        setPromoDiscount(0)
        setPromoValid(true)
        setPromoMessage("25 bonus credits will be added!")
      } else {
        setPromoValid(false)
        setPromoMessage("Invalid promo code")
        setPromoDiscount(0)
      }
    } catch {
      setPromoValid(false)
      setPromoMessage("Failed to validate promo code")
    } finally {
      setIsValidatingPromo(false)
    }
  }, [promoCode, selectedPackageDetails, customPricing.totalPrice])

  const handleClearPromo = useCallback(() => {
    setPromoCode("")
    setPromoValid(null)
    setPromoMessage("")
    setPromoDiscount(0)
  }, [])

  const handlePurchase = useCallback(async () => {
    if (!selectedPackage && !showCustom) {
      toast.error("Please select a package")
      return
    }

    setIsPurchasing(true)

    try {
      let packageId: string
      let credits: number
      let price: number
      let bonusCredits: number

      if (selectedPackage && selectedPackageDetails) {
        packageId = selectedPackage
        credits = selectedPackageDetails.credits
        price = selectedPackageDetails.finalPrice
        bonusCredits = selectedPackageDetails.bonusCredits
      } else {
        packageId = "custom"
        credits = customCredits
        price = customPricing.finalPrice
        bonusCredits = customPricing.bonusCredits
      }

      if (onCheckout) {
        const checkoutUrl = await onCheckout(packageId, credits, price, "razorpay")
        if (checkoutUrl) {
          window.location.href = checkoutUrl
          return
        }
      }

      if (onPurchase) {
        await onPurchase(packageId, credits, price, bonusCredits)
      }

      toast.success("Purchase initiated!", {
        description: `${credits} credits${bonusCredits > 0 ? ` + ${bonusCredits} bonus` : ""} for ${formatPrice(price)}`,
      })

      setSelectedPackage(null)
      setShowCustom(false)
      handleClearPromo()

    } catch (error) {
      toast.error("Purchase failed", {
        description: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setIsPurchasing(false)
    }
  }, [
    selectedPackage, 
    selectedPackageDetails, 
    showCustom, 
    customCredits, 
    customPricing, 
    onPurchase, 
    onCheckout,
    handleClearPromo,
  ])

  const handlePackageSelect = useCallback((packageId: string) => {
    setSelectedPackage(packageId)
    setShowCustom(false)
  }, [])

  const handleShowCustom = useCallback(() => {
    setShowCustom(true)
    setSelectedPackage(null)
  }, [])

  const handlePromoChange = useCallback((code: string) => {
    setPromoCode(code)
    setPromoValid(null)
    setPromoMessage("")
  }, [])

  // Render
  return (
    <Card className="bg-linear-to-br from-card via-card to-pink-500/5 border-pink-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-linear-to-br from-pink-500 to-rose-500">
              <Crown className="h-4 w-4 text-white" />
            </div>
            Premium Credits
          </CardTitle>
          <Badge className="bg-amber-500/20 text-amber-500 text-[10px]">
            <Sparkles className="w-3 h-3 mr-1" />
            Social Tracker
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-pink-500" />
            <span className="text-sm text-muted-foreground">Your Balance</span>
          </div>
          <span className="text-lg font-bold text-foreground">{currentCredits.toLocaleString("en-IN")} credits</span>
        </div>

        {/* Info Banner */}
        {!compact && (
          <div className="flex gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-blue-500 mb-1">Premium Feature</p>
              <p>Social Tracker uses premium credits. Credits never expire and work across all platforms.</p>
            </div>
          </div>
        )}

        {/* Credit Usage Info */}
        {!compact && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Credit Usage per Keyword</p>
            <div className="grid gap-1.5 text-xs">
              {Object.values(PLATFORM_CREDIT_COSTS).slice(0, 3).map((platform) => (
                <div key={platform.platformId} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{platform.platformName}</span>
                  <span className="font-medium text-foreground">{platform.creditsPerKeyword} credits</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Package Selection / Custom Slider */}
        {!showCustom ? (
          <CreditPackageList
            selectedPackage={selectedPackage}
            isFirstPurchase={isFirstPurchase}
            isLoading={isLoading}
            onPackageSelect={handlePackageSelect}
            onShowCustom={handleShowCustom}
          />
        ) : (
          <CreditCustomSlider
            customCredits={customCredits}
            customPricing={customPricing}
            isLoading={isLoading}
            onCreditsChange={setCustomCredits}
            onShowPackages={() => setShowCustom(false)}
          />
        )}

        {/* Promo Code Input */}
        <CreditPromoInput
          promoCode={promoCode}
          promoValid={promoValid}
          promoMessage={promoMessage}
          isValidating={isValidatingPromo}
          isLoading={isLoading}
          onPromoChange={handlePromoChange}
          onValidate={handleValidatePromo}
          onClear={handleClearPromo}
        />

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={(!selectedPackage && !showCustom) || isLoading}
          className="w-full bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white h-11"
        >
          {isPurchasing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {selectedPackageDetails 
                ? `Buy ${selectedPackageDetails.credits.toLocaleString("en-IN")}${selectedPackageDetails.bonusCredits > 0 ? ` + ${selectedPackageDetails.bonusCredits}` : ""} Credits - ${formatPrice(selectedPackageDetails.finalPrice)}`
                : showCustom 
                  ? `Buy ${customCredits.toLocaleString("en-IN")}${customPricing.bonusCredits > 0 ? ` + ${customPricing.bonusCredits}` : ""} Credits - ${formatPrice(customPricing.finalPrice)}`
                  : "Select a Package"
              }
            </>
          )}
        </Button>

        {/* Trust Badges */}
        <CreditTrustBadges isFirstPurchase={isFirstPurchase} />
      </CardContent>
    </Card>
  )
}
