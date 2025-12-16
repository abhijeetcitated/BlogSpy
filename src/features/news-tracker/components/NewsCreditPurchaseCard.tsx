/**
 * ============================================
 * NEWS CREDIT PURCHASE CARD
 * ============================================
 * 
 * Premium credit purchase UI for News & Discover Tracker
 * Google News + Google Discover tracking with research-backed pricing
 * 
 * ============================================
 * API COST RESEARCH (DEEP DIVE):
 * ============================================
 * 
 * PROVIDER 1: DataForSEO (RECOMMENDED - CHEAPEST)
 * ├─ Standard Queue: $0.0006/search = ₹0.05/keyword
 * ├─ Priority Queue: $0.0012/search = ₹0.10/keyword
 * ├─ Live Mode: $0.002/search = ₹0.17/keyword
 * ├─ Minimum Deposit: $50
 * └─ Free Trial: Available
 * 
 * PROVIDER 2: SerpAPI (MONTHLY PLANS)
 * ├─ Free: 250 searches @ $0
 * ├─ Developer: 5,000 @ $75/mo = ₹1.25/keyword
 * ├─ Production: 15,000 @ $150/mo = ₹0.83/keyword
 * └─ Big Data: 30,000 @ $275/mo = ₹0.77/keyword
 * 
 * PROVIDER 3: Bright Data (ENTERPRISE)
 * ├─ PAYG: $1.50/1K = ₹0.125/keyword
 * ├─ 380K: $499/mo = ₹0.11/keyword
 * └─ 900K: $999/mo = ₹0.09/keyword
 * 
 * ============================================
 * SELECTED: DataForSEO Standard Queue
 * Cost per keyword: ₹0.05
 * ============================================
 * 
 * PRICING STRATEGY:
 * - 1 Credit = 1 Keyword Check (News OR Discover)
 * - Both platforms = 2 Credits
 * - Sell at ₹2-5 per credit
 * - Profit Margin: 4000-10000%
 * 
 * @version 2.0.0
 * @lastUpdated 2025-01-xx
 * @research DataForSEO, SerpAPI, Bright Data
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
  TrendingUp,
} from "lucide-react"
import type { NewsPlatform } from "../types"

// ============================================
// PRICING CONFIGURATION (Research-Backed)
// ============================================

// API Costs (Real Research Data - January 2025)
const API_COSTS = {
  "google-news": {
    name: "Google News",
    costPerKeyword: 0.05, // ₹0.05 (DataForSEO Standard Queue: $0.0006)
    apiSource: "DataForSEO",
    color: "#4285F4",
    pricing: {
      standard: 0.05,  // ₹0.05/keyword
      priority: 0.10,  // ₹0.10/keyword
      live: 0.17,      // ₹0.17/keyword
    }
  },
  "google-discover": {
    name: "Google Discover",
    costPerKeyword: 0.05, // ₹0.05 (DataForSEO - same endpoint)
    apiSource: "DataForSEO",
    color: "#EA4335",
    note: "No official API - uses SERP scraping",
  },
}

// Our actual cost per credit: ₹0.05 (DataForSEO Standard)
const ACTUAL_COST_PER_CREDIT = 0.05

// Credit Packages with RESEARCH-BACKED pricing (Market Competitive - 93-97% Margin)
const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 199,          // ₹199 (was ₹499)
    pricePerCredit: 1.99,
    popular: false,
    savings: 0,
    actualCost: 5, // ₹0.05 × 100 = ₹5
    profitMargin: 97.5, // ((199-5)/199)*100 = 97.5%
    badge: null,
    features: ["100 keyword tracks", "News + Discover", "7-day history", "Email alerts"],
  },
  {
    id: "pro",
    name: "Pro",
    credits: 300,
    price: 399,          // ₹399 (was ₹999)
    pricePerCredit: 1.33,
    popular: true,
    savings: 33,
    actualCost: 15, // ₹0.05 × 300 = ₹15
    profitMargin: 96.2, // ((399-15)/399)*100 = 96.2%
    badge: "BEST VALUE",
    features: ["300 keyword tracks", "News + Discover", "30-day history", "Priority refresh", "Slack integration"],
  },
  {
    id: "business",
    name: "Business",
    credits: 750,
    price: 799,          // ₹799 (was ₹1999)
    pricePerCredit: 1.07,
    popular: false,
    savings: 46,
    actualCost: 37.50, // ₹0.05 × 750 = ₹37.50
    profitMargin: 95.3, // ((799-37.50)/799)*100 = 95.3%
    badge: "TEAMS",
    features: ["750 keyword tracks", "News + Discover", "90-day history", "Export CSV/PDF", "Team (3 users)"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 2000,
    price: 1499,         // ₹1499 (was ₹3999)
    pricePerCredit: 0.75,
    popular: false,
    savings: 62,
    actualCost: 100, // ₹0.05 × 2000 = ₹100
    profitMargin: 93.3, // ((1499-100)/1499)*100 = 93.3%
    badge: "ENTERPRISE",
    features: ["2000 keyword tracks", "News + Discover", "1-year history", "Full API access", "Unlimited team"],
  },
]

// Google News Icon
const GoogleNewsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="10" fill="#4285F4"/>
    <rect x="7" y="8" width="10" height="2" rx="1" fill="white"/>
    <rect x="7" y="11" width="7" height="2" rx="1" fill="white"/>
    <rect x="7" y="14" width="10" height="2" rx="1" fill="white"/>
  </svg>
)

// Google Discover Icon
const GoogleDiscoverIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="10" fill="#EA4335"/>
    <path d="M12 6l1.5 3.5 3.5 1.5-3.5 1.5L12 16l-1.5-3.5L7 11l3.5-1.5L12 6z" fill="white"/>
  </svg>
)

interface NewsCreditPurchaseCardProps {
  activePlatform?: NewsPlatform
}

export function NewsCreditPurchaseCard({ activePlatform = "google-news" }: NewsCreditPurchaseCardProps) {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1].id) // Pro default
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customCredits, setCustomCredits] = useState([100])

  // Custom pricing calculation (Research-backed tiered pricing)
  const customPrice = useMemo(() => {
    const credits = customCredits[0]
    // Tiered pricing: more credits = lower per-credit cost
    // Minimum margin: 2000% profit on all tiers
    if (credits <= 100) return Math.round(credits * 5)      // ₹5/credit (cost: ₹0.05) = 9900% margin
    if (credits <= 300) return Math.round(credits * 3.5)    // ₹3.50/credit = 6900% margin
    if (credits <= 750) return Math.round(credits * 2.75)   // ₹2.75/credit = 5400% margin
    return Math.round(credits * 2)                          // ₹2/credit = 3900% margin
  }, [customCredits])

  const handlePurchase = useCallback(async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const pkg = showCustom 
      ? { name: "Custom", credits: customCredits[0], price: customPrice }
      : CREDIT_PACKAGES.find(p => p.id === selectedPackage)
    
    toast.success(`🎉 ${pkg?.credits} credits purchased!`, {
      description: `Your News & Discover tracking is now active`,
      duration: 4000,
    })
    
    setIsProcessing(false)
  }, [selectedPackage, showCustom, customCredits, customPrice])

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-linear-to-br from-blue-500/20 to-red-500/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          </div>
          Purchase Credits
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 px-3 sm:px-4 pb-3 sm:pb-4">
        {/* Package Selection */}
        <div className="space-y-1.5">
          {CREDIT_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => {
                setSelectedPackage(pkg.id)
                setShowCustom(false)
              }}
              className={cn(
                "w-full p-2 rounded-lg border transition-all flex items-center justify-between",
                selectedPackage === pkg.id && !showCustom
                  ? "border-blue-500/50 bg-blue-500/10"
                  : "border-border hover:border-blue-500/30 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2">
                {/* Checkbox */}
                <div className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0",
                  selectedPackage === pkg.id && !showCustom
                    ? "bg-blue-500 border-blue-500"
                    : "border-muted-foreground/50"
                )}>
                  {selectedPackage === pkg.id && !showCustom && (
                    <Check className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground">{pkg.name}</span>
                    {pkg.popular && (
                      <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[8px] px-1 py-0">
                        BEST
                      </Badge>
                    )}
                    {pkg.savings > 0 && (
                      <span className="text-[8px] text-emerald-500">-{pkg.savings}%</span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{pkg.credits} credits</span>
                </div>
              </div>
              
              <span className="text-xs font-bold text-foreground">₹{pkg.price.toLocaleString()}</span>
            </button>
          ))}
          
          {/* Custom Amount Toggle */}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={cn(
              "w-full p-2 rounded-lg border transition-all flex items-center justify-between",
              showCustom
                ? "border-purple-500/50 bg-purple-500/10"
                : "border-border hover:border-purple-500/30 hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0",
                showCustom
                  ? "bg-purple-500 border-purple-500"
                  : "border-muted-foreground/50"
              )}>
                {showCustom && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className="text-xs font-medium text-foreground">Custom</span>
            </div>
            <Zap className="w-3.5 h-3.5 text-purple-500" />
          </button>
        </div>

        {/* Custom Slider */}
        {showCustom && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Credits</span>
              <span className="font-bold text-foreground">{customCredits[0]}</span>
            </div>
            <Slider
              value={customCredits}
              onValueChange={setCustomCredits}
              min={25}
              max={1000}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>25</span>
              <span>1000</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">Total Price</span>
              <span className="text-sm font-bold text-foreground">₹{customPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={isProcessing}
          className="w-full h-9 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Crown className="w-3.5 h-3.5 mr-1.5" />
              Purchase Now
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </>
          )}
        </Button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Secure
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            Instant
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
