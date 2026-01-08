"use client"

// ============================================
// CREDIT BALANCE - Simple Pill Button
// ============================================
// Shows user's credit balance - styled like Trend Spotter pills
// ============================================

import { useState, useEffect } from "react"
import { Zap, Loader2, Plus, CreditCard, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { getUserCreditsAction } from "../../actions/refresh-keyword"
import { useKeywordStore } from "../../store"

// ============================================
// PRICING PLANS
// ============================================

const CREDIT_PLANS = [
  {
    id: "starter",
    credits: 100,
    price: 5,
    pricePerCredit: 0.05,
    popular: false,
    savings: null,
  },
  {
    id: "growth",
    credits: 500,
    price: 20,
    pricePerCredit: 0.04,
    popular: true,
    savings: "20% OFF",
  },
  {
    id: "pro",
    credits: 1500,
    price: 45,
    pricePerCredit: 0.03,
    popular: false,
    savings: "40% OFF",
  },
  {
    id: "agency",
    credits: 5000,
    price: 100,
    pricePerCredit: 0.02,
    popular: false,
    savings: "60% OFF",
  },
]

// ============================================
// COMPONENT
// ============================================

export function CreditBalance() {
  const credits = useKeywordStore((state) => state.credits)
  const setCredits = useKeywordStore((state) => state.setCredits)
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)

  // Fetch credits on mount
  useEffect(() => {
    async function fetchCredits() {
      if (credits !== null) {
        setIsLoading(false)
        return
      }

      try {
        const result = await getUserCreditsAction({})
        if (result?.data) {
          setCredits(result.data.remaining)
        } else if (result?.serverError?.includes("Authentication")) {
          setCredits(0)
        }
      } catch (error) {
        console.error("[CreditBalance] Failed to fetch credits:", error)
        setCredits(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredits()
  }, [credits, setCredits])

  // Handle purchase
  const handlePurchase = async (planId: string) => {
    setPurchaseLoading(planId)
    
    // TODO: Integrate with Stripe
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    toast.info("Stripe integration coming soon!", {
      description: "Credit purchase will be available in the next update.",
    })
    
    setPurchaseLoading(null)
    setDialogOpen(false)
  }

  // Get color based on credit level
  const getColor = () => {
    if (credits === null) return "text-muted-foreground"
    if (credits <= 10) return "text-red-400"
    if (credits <= 50) return "text-amber-400"
    return "text-emerald-400"
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border",
            "bg-card hover:bg-muted/50 transition-colors",
            "border-border hover:border-amber-500/50"
          )}
        >
          <Zap className={cn("h-3.5 w-3.5", getColor())} />
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : (
            <span className={cn("tabular-nums font-semibold", getColor())}>
              {credits ?? 0}
            </span>
          )}
          <span className="text-muted-foreground">Credits</span>
          <Plus className="h-3 w-3 text-muted-foreground" />
        </button>
      </DialogTrigger>

      {/* Top-Up Dialog */}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Top Up Credits
          </DialogTitle>
          <DialogDescription>
            Credits are used for live keyword refreshes, SERP analysis, and AI features.
          </DialogDescription>
        </DialogHeader>

        {/* Current Balance */}
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/50 border">
          <span className="text-sm text-muted-foreground">Current Balance</span>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-lg font-bold tabular-nums">{credits ?? 0}</span>
            <span className="text-sm text-muted-foreground">credits</span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          {CREDIT_PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handlePurchase(plan.id)}
              disabled={purchaseLoading !== null}
              className={cn(
                "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                "hover:border-primary hover:bg-primary/5",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                plan.popular && "border-amber-500 bg-amber-500/5",
                purchaseLoading === plan.id && "opacity-50 cursor-wait"
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500 text-black rounded-full">
                  Most Popular
                </span>
              )}

              {/* Savings Badge */}
              {plan.savings && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">
                  {plan.savings}
                </span>
              )}

              {/* Credits */}
              <div className="flex items-center gap-1 mb-1">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-xl font-bold">{plan.credits.toLocaleString()}</span>
              </div>

              {/* Price */}
              <span className="text-lg font-semibold text-foreground">
                ${plan.price}
              </span>

              {/* Price per credit */}
              <span className="text-xs text-muted-foreground">
                ${plan.pricePerCredit}/credit
              </span>

              {/* Loading State */}
              {purchaseLoading === plan.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
          <CreditCard className="h-3.5 w-3.5" />
          Secure payment via Stripe
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreditBalance
