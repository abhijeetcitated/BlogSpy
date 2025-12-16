/**
 * ============================================
 * COMMUNITY CREDIT PURCHASE CARD
 * ============================================
 * 
 * Premium credit purchase UI for Community Tracker
 * Reddit + Quora tracking with optimized pricing
 * 
 * API Costs (Real):
 * - Reddit: $0.002/item via Apify (₹0.17)
 * - Quora: $0.002/request via Crawlbase (₹0.17)
 * - Per Keyword Total: ~₹10 ($0.12)
 * 
 * Pricing Strategy:
 * - Sell at ₹30-50 per credit
 * - Margin: 67-80%
 * 
 * @version 1.0.0
 * @lastUpdated 2025-12-15
 */

"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { 
  Sparkles, 
  Zap, 
  Crown,
  Check,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Percent,
  TrendingUp,
  MessageSquare,
} from "lucide-react"

// ============================================
// PRICING CONFIGURATION
// ============================================

// API Costs (Real Data)
const API_COSTS = {
  reddit: {
    name: "Reddit",
    costPerKeyword: 10, // ₹10 (includes posts + comments fetch)
    apiSource: "Apify",
    color: "#FF4500",
  },
  quora: {
    name: "Quora",
    costPerKeyword: 8, // ₹8 (includes questions + answers)
    apiSource: "Crawlbase",
    color: "#B92B27",
  },
}

// Credit Packages with INR pricing
const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 30,
    price: 1499,
    pricePerCredit: 50,
    popular: false,
    savings: 0,
    features: ["30 keyword tracks", "Reddit + Quora", "7-day data"],
  },
  {
    id: "pro",
    name: "Pro",
    credits: 100,
    price: 3999,
    pricePerCredit: 40,
    popular: true,
    savings: 20,
    features: ["100 keyword tracks", "Reddit + Quora", "30-day data", "Priority refresh"],
  },
  {
    id: "business",
    name: "Business",
    credits: 300,
    price: 7999,
    pricePerCredit: 27,
    popular: false,
    savings: 46,
    features: ["300 keyword tracks", "Reddit + Quora", "90-day data", "Priority refresh", "Export reports"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 800,
    price: 14999,
    pricePerCredit: 19,
    popular: false,
    savings: 62,
    features: ["800 keyword tracks", "Reddit + Quora", "Unlimited data", "Priority support", "API access"],
  },
]

// Custom slider configuration
const CUSTOM_SLIDER = {
  min: 10,
  max: 500,
  step: 10,
  default: 50,
  pricePerCredit: 35, // ₹35 per credit for custom
}

// Format price in INR
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

// ============================================
// COMPONENT PROPS
// ============================================

interface CommunityCreditPurchaseCardProps {
  currentCredits?: number
  onPurchase?: (packageId: string, credits: number, price: number) => void
  isLoading?: boolean
  compact?: boolean
}

// ============================================
// MAIN COMPONENT
// ============================================

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

  // Calculate custom price
  const customPrice = useMemo(() => {
    return customCredits * CUSTOM_SLIDER.pricePerCredit
  }, [customCredits])

  // Get selected package details
  const selectedPkg = useMemo(() => {
    return CREDIT_PACKAGES.find(p => p.id === selectedPackage)
  }, [selectedPackage])

  // Handle purchase
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

      toast.success(`Purchasing ${credits} credits for ${formatPrice(price)}`, {
        description: "Redirecting to payment gateway...",
      })
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
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
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
            <div className="w-5 h-5 text-red-600 font-bold text-sm flex items-center justify-center">
              Q
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Quora</p>
              <p className="text-xs font-semibold text-foreground">1 credit</p>
            </div>
          </div>
        </div>

        {/* Package Selection */}
        <div className="space-y-2">
          {CREDIT_PACKAGES.slice(0, compact ? 2 : 4).map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => {
                setSelectedPackage(pkg.id)
                setShowCustom(false)
              }}
              disabled={loading}
              className={cn(
                "w-full p-2 sm:p-2.5 rounded-lg border transition-all text-left relative group",
                selectedPackage === pkg.id && !showCustom
                  ? "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500/50"
                  : "border-border hover:border-orange-500/50 hover:bg-muted/30"
              )}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-px -right-px">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-md rounded-tr-lg">
                    BEST
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Checkbox */}
                <div className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                  selectedPackage === pkg.id && !showCustom
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-muted-foreground/40 bg-transparent"
                )}>
                  {selectedPackage === pkg.id && !showCustom && (
                    <Check className="w-2.5 h-2.5" />
                  )}
                </div>
                
                {/* Plan Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-semibold text-foreground">{pkg.name}</span>
                    {pkg.savings > 0 && (
                      <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">
                        -{pkg.savings}%
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                    {pkg.credits} credits
                  </p>
                </div>
                
                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="text-xs sm:text-sm font-bold text-foreground">{formatPrice(pkg.price)}</p>
                </div>
              </div>

              {/* Features - Show on selection */}
              {selectedPackage === pkg.id && !showCustom && (
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

          {/* Custom Amount Button */}
          {!compact && (
            <button
              onClick={() => {
                setShowCustom(true)
                setSelectedPackage(null)
              }}
              disabled={loading}
              className={cn(
                "w-full p-2 sm:p-2.5 rounded-lg border transition-all text-left",
                showCustom
                  ? "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500/50"
                  : "border-dashed border-muted-foreground/30 hover:border-orange-500/50"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                  showCustom
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-muted-foreground/40 bg-transparent"
                )}>
                  {showCustom && <Check className="w-2.5 h-2.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-foreground">Custom</span>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">Choose your own</p>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Custom Slider */}
        {showCustom && (
          <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{customCredits} Credits</span>
              <span className="text-lg font-bold text-orange-500">{formatPrice(customPrice)}</span>
            </div>
            <Slider
              value={[customCredits]}
              onValueChange={([val]) => setCustomCredits(val)}
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

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={loading || (!selectedPackage && !showCustom)}
          className="w-full h-10 sm:h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/25"
        >
          {loading ? (
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

        {/* Profit Margin Info - Small note */}
        <p className="text-[9px] text-center text-muted-foreground/70">
          1 Credit = 1 Keyword (Reddit + Quora both) • Credits never expire
        </p>
      </CardContent>
    </Card>
  )
}
