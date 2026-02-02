"use client"

import { useEffect, useMemo, useState } from "react"
import { CreditCard, ExternalLink, Loader2, Sparkles, Zap } from "lucide-react"
import { formatDistanceToNowStrict } from "date-fns"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useProfile } from "@/hooks/use-user"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui-store"
import { createCheckoutAction } from "@/features/billing/actions/billing-actions"

const PLAN_LABELS = {
  FREE: { name: "Free Plan", price: 0, credits: 100 },
  PRO: { name: "Pro Plan", price: 29, credits: 1000 },
  ENTERPRISE: { name: "Agency Plan", price: 99, credits: 5000 },
}

const TOP_UP_PACKAGES = [
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
] as const

export function BillingTab() {
  const router = useRouter()
  const openPricingModal = useUIStore((state) => state.openPricingModal)
  const { plan, isLoading: profileLoading } = useProfile()
  const { executeAsync } = useAction(createCheckoutAction)
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [creditsLoading, setCreditsLoading] = useState(true)
  const [creditsState, setCreditsState] = useState<{
    total: number
    used: number
    remaining: number
    updatedAt: Date | null
  }>({
    total: 0,
    used: 0,
    remaining: 0,
    updatedAt: null,
  })

  const isLoading = profileLoading || creditsLoading
  const percentage = useMemo(() => {
    if (creditsState.total === 0) return 0
    return Math.round((creditsState.remaining / creditsState.total) * 100)
  }, [creditsState.remaining, creditsState.total])
  const remaining = creditsState.remaining
  const total = creditsState.total
  const lastUpdated = useMemo(() => {
    if (!creditsState.updatedAt) return "—"
    return formatDistanceToNowStrict(creditsState.updatedAt, { addSuffix: true })
  }, [creditsState.updatedAt])

  const currentPlan = PLAN_LABELS[plan as keyof typeof PLAN_LABELS] || PLAN_LABELS.FREE

  const getTopUpVariantId = (creditsCount: number) => {
    if (creditsCount === 100) return process.env.NEXT_PUBLIC_LS_TOPUP_100_ID
    if (creditsCount === 500) return process.env.NEXT_PUBLIC_LS_TOPUP_500_ID
    if (creditsCount === 1500) return process.env.NEXT_PUBLIC_LS_TOPUP_1500_ID
    if (creditsCount === 5000) return process.env.NEXT_PUBLIC_LS_TOPUP_5000_ID
    return undefined
  }

  const handlePurchase = async (planId: string) => {
    const packagePlan = TOP_UP_PACKAGES.find((entry) => entry.id === planId)
    if (!packagePlan) {
      toast.error("Invalid credit package selected.")
      return
    }

    const variantId = getTopUpVariantId(packagePlan.credits)
    if (!variantId) {
      toast.error("Payment setup missing for this package.")
      return
    }

    setPurchaseLoading(planId)

    try {
      const result = await executeAsync({
        variantId,
        credits: packagePlan.credits,
        purchaseType: "topup",
        redirectUrl: window.location.href,
      })

      const serverError =
        typeof result?.serverError === "string" ? result.serverError : undefined
      if (serverError) {
        toast.error(serverError)
        return
      }

      const url = result?.data?.url
      if (!url) {
        toast.error("Failed to start checkout.")
        return
      }
      window.location.href = url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start checkout.")
    } finally {
      setPurchaseLoading(null)
      setTopUpOpen(false)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setCreditsLoading(false)
      return
    }

    const supabase = getSupabaseBrowserClient()
    let isActive = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    const loadCredits = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        const user = data?.user
        if (!user || !isActive) {
          setCreditsLoading(false)
          return
        }

        const { data: creditsRow, error } = await supabase
          .from("bill_credits")
          .select("credits_total, credits_used, updated_at")
          .eq("user_id", user.id)
          .maybeSingle()

        if (error) {
          throw error
        }

        const totalCredits = creditsRow?.credits_total ?? 0
        const usedCredits = creditsRow?.credits_used ?? 0
        const remainingCredits = Math.max(totalCredits - usedCredits, 0)

        if (isActive) {
          setCreditsState({
            total: totalCredits,
            used: usedCredits,
            remaining: remainingCredits,
            updatedAt: creditsRow?.updated_at ? new Date(creditsRow.updated_at) : null,
          })
        }
      } catch (error) {
        console.error("[BillingTab] Failed to load credits:", error)
      } finally {
        if (isActive) {
          setCreditsLoading(false)
        }
      }
    }

    const subscribeToCredits = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user || !isActive) return

      channel = supabase
        .channel("public:bill_credits")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "bill_credits",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as {
              credits_total?: number
              credits_used?: number
              updated_at?: string
            }
            if (isActive) {
              setCreditsState((prev) => {
                const totalCredits = updated.credits_total ?? prev.total
                const usedCredits = updated.credits_used ?? prev.used
                const remainingCredits = Math.max(totalCredits - usedCredits, 0)

                return {
                  total: totalCredits,
                  used: usedCredits,
                  remaining: remainingCredits,
                  updatedAt: updated.updated_at ? new Date(updated.updated_at) : new Date(),
                }
              })
            }
          }
        )
        .subscribe()
    }

    loadCredits()
    subscribeToCredits()

    return () => {
      isActive = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const handleManageSubscription = async () => {
    router.push("/dashboard/billing")
  }

  const handleUpgrade = async () => {
    openPricingModal()
    router.push("/pricing")
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Current Plan</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your active subscription tier
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">{currentPlan.name}</p>
              <p className="text-muted-foreground text-sm">
                {currentPlan.price > 0 ? `$${currentPlan.price}/month` : "Free forever"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleManageSubscription}
            className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
          >
            Manage Subscription
          </Button>
        </CardContent>
      </Card>

      {/* Credit Health */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Credit Health</CardTitle>
          <CardDescription className="text-muted-foreground">
            Track remaining credits and renewal window
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-amber-500" />
              {remaining.toLocaleString()} of {total.toLocaleString()} credits remaining
            </div>
            <span className="text-xs text-muted-foreground">Updated {lastUpdated}</span>
          </div>
          <Progress
            value={percentage}
            className="h-3 bg-amber-500/20 [&_[data-slot=progress-indicator]]:bg-[#FFD700]"
          />
          <p className="text-xs text-muted-foreground">
            Credits sync automatically after each purchase or top-up.
          </p>
        </CardContent>
      </Card>

      {/* Upgrade / Top Up */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Upgrade & Top-Up</CardTitle>
          <CardDescription className="text-muted-foreground">
            Keep your research pipeline funded with secure billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            {plan === "FREE" && (
              <Button
                onClick={handleUpgrade}
                className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}

            <Button
              onClick={() => setTopUpOpen(true)}
              className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
            >
              <Zap className="h-4 w-4 mr-2 text-black" />
              Top-Up Credits
            </Button>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-2">
            Need your invoices?
            <button
              type="button"
              onClick={handleManageSubscription}
              className="inline-flex items-center gap-1 text-[#FFD700] hover:text-[#FFC400]"
            >
              View Invoices & Billing History
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
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

          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/50 border">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-lg font-bold tabular-nums">{remaining.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">credits</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            {TOP_UP_PACKAGES.map((packagePlan) => (
              <button
                key={packagePlan.id}
                onClick={() => handlePurchase(packagePlan.id)}
                disabled={purchaseLoading !== null}
                className={cn(
                  "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                  "hover:border-primary hover:bg-primary/5",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  packagePlan.popular && "border-amber-500 bg-amber-500/5",
                  purchaseLoading === packagePlan.id && "opacity-50 cursor-wait"
                )}
              >
                {packagePlan.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500 text-black rounded-full">
                    Most Popular
                  </span>
                )}

                {packagePlan.savings && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">
                    {packagePlan.savings}
                  </span>
                )}

                <div className="flex items-center gap-1 mb-1">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-xl font-bold">
                    {packagePlan.credits.toLocaleString()}
                  </span>
                </div>

                <span className="text-lg font-semibold text-foreground">
                  ${packagePlan.price}
                </span>

                <span className="text-xs text-muted-foreground">
                  ${packagePlan.pricePerCredit}/credit
                </span>

                {purchaseLoading === packagePlan.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" />
            Secure billing portal
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
