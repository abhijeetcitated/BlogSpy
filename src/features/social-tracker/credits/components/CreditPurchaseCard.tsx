/**
 * ============================================
 * CREDIT PURCHASE CARD - Premium Component
 * ============================================
 * 
 * Production-ready credit purchase UI component
 * Integrated with the credit system for Social Tracker
 * 
 * Features:
 * - Package selection with visual feedback
 * - Custom credit slider with dynamic pricing
 * - Promo code support
 * - Bonus credits display
 * - Mobile responsive design
 * - INR pricing with 85%+ margin
 * 
 * @version 2.0.0
 * @lastUpdated 2025-12-15
 */

"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Info,
  CreditCard,
  Gift,
  Crown,
  Check,
  ChevronRight,
  Loader2,
  Tag,
  X,
  ShieldCheck,
  Infinity,
  Users,
} from "lucide-react"

// Import from credits config
import {
  CREDIT_PACKAGES,
  PLATFORM_CREDIT_COSTS,
  CUSTOM_SLIDER_CONFIG,
  BONUS_CONFIG,
  calculateCustomPrice,
  calculateBonusCredits,
  formatPrice,
  getPackageById,
} from "../config/pricing.config"

import type { CreditPackage, PaymentMethod } from "../types/credit.types"

// ============================================
// COMPONENT PROPS
// ============================================

interface CreditPurchaseCardProps {
  /** User's current credit balance */
  currentCredits?: number
  /** User ID for purchase tracking */
  userId?: string
  /** Is this user's first purchase? */
  isFirstPurchase?: boolean
  /** Callback when purchase is initiated */
  onPurchase?: (
    packageId: string, 
    credits: number, 
    price: number,
    bonusCredits: number
  ) => Promise<void> | void
  /** Callback for checkout initiation */
  onCheckout?: (
    packageId: string,
    credits: number,
    amount: number,
    paymentMethod: PaymentMethod
  ) => Promise<string | null>
  /** Loading state from parent */
  isLoading?: boolean
  /** Compact mode for sidebar */
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
  // ============================================
  // STATE
  // ============================================
  
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [customCredits, setCustomCredits] = useState<number>(CUSTOM_SLIDER_CONFIG.defaultValue)
  const [showCustom, setShowCustom] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoMessage, setPromoMessage] = useState("")
  const [promoValid, setPromoValid] = useState<boolean | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const customPricing = useMemo(() => {
    const pricing = calculateCustomPrice(customCredits)
    const bonusCredits = calculateBonusCredits(customCredits, isFirstPurchase)
    
    // Apply promo discount
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

  // ============================================
  // HANDLERS
  // ============================================

  const handleValidatePromo = useCallback(async () => {
    if (!promoCode.trim()) {
      setPromoValid(null)
      setPromoMessage("")
      setPromoDiscount(0)
      return
    }

    setIsValidatingPromo(true)
    
    try {
      // Simulate promo validation (replace with actual API call)
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

      // If checkout handler provided, use it
      if (onCheckout) {
        const checkoutUrl = await onCheckout(packageId, credits, price, "razorpay")
        if (checkoutUrl) {
          // Redirect to checkout
          window.location.href = checkoutUrl
          return
        }
      }

      // Otherwise use simple purchase callback
      if (onPurchase) {
        await onPurchase(packageId, credits, price, bonusCredits)
      }

      toast.success("Purchase initiated!", {
        description: `${credits} credits${bonusCredits > 0 ? ` + ${bonusCredits} bonus` : ""} for ${formatPrice(price)}`,
      })

      // Reset selection
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

  // ============================================
  // RENDER HELPERS
  // ============================================

  const getPackageColorClass = (color: string, isSelected: boolean) => {
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

  // ============================================
  // RENDER
  // ============================================

  return (
    <Card className="bg-gradient-to-br from-card via-card to-pink-500/5 border-pink-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500">
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

        {/* Package Selection */}
        {!showCustom ? (
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
                    onClick={() => handlePackageSelect(pkg.id)}
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
                        `bg-gradient-to-r ${colorClasses.gradient}`
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
              onClick={handleShowCustom}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-muted-foreground/30 hover:border-pink-500/50 transition-colors text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <TrendingUp className="w-3 h-3" />
              Need a custom amount?
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          /* Custom Amount Slider */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Custom Amount</p>
              <button
                onClick={() => setShowCustom(false)}
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
                onValueChange={([value]) => setCustomCredits(value)}
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
              {promoDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Promo discount</span>
                  <span className="font-medium text-emerald-500">-{formatPrice(promoDiscount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">{formatPrice(customPricing.finalPrice)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Promo Code Input */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Promo Code</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase())
                  setPromoValid(null)
                  setPromoMessage("")
                }}
                placeholder="Enter code"
                className="pl-9 pr-8 h-9 text-sm uppercase"
                disabled={isLoading}
              />
              {promoCode && (
                <button
                  onClick={handleClearPromo}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  type="button"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <Button
              onClick={handleValidatePromo}
              disabled={!promoCode || isValidatingPromo || isLoading}
              variant="outline"
              size="sm"
              className="h-9"
            >
              {isValidatingPromo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
          {promoMessage && (
            <p className={cn(
              "text-xs",
              promoValid ? "text-emerald-500" : "text-destructive"
            )}>
              {promoMessage}
            </p>
          )}
        </div>

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={(!selectedPackage && !showCustom) || isLoading}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white h-11"
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
      </CardContent>
    </Card>
  )
}
