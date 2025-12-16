"use client"

import { CreditCard } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MOCK_PLAN } from "../constants"
import { getCreditsPercentage, getCreditsRemaining, formatBillingCycle } from "../utils/settings-utils"

export function BillingTab() {
  const percentage = getCreditsPercentage(MOCK_PLAN)
  const remaining = getCreditsRemaining(MOCK_PLAN)

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">Current Plan</CardTitle>
          <CardDescription className="text-slate-400">Your subscription and billing details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-100 text-lg">{MOCK_PLAN.name}</p>
                <p className="text-slate-400">
                  ${MOCK_PLAN.price}/month • {formatBillingCycle(MOCK_PLAN.billingCycle)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
              Manage Subscription
            </Button>
          </div>

          {/* Usage Meter */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Credits Usage</span>
              <span className="text-slate-400 text-sm">Renews in {MOCK_PLAN.renewsInDays} days</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  {MOCK_PLAN.creditsUsed.toLocaleString()} of {MOCK_PLAN.creditsTotal.toLocaleString()} credits used
                </span>
                <span className="text-emerald-400 font-medium">{percentage}%</span>
              </div>
              <div className="relative">
                <Progress value={percentage} className="h-3 bg-slate-800" />
                <div
                  className="absolute inset-0 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  style={{ width: `${percentage}%`, opacity: 0.2 }}
                />
              </div>
              <p className="text-xs text-slate-500">{remaining} credits remaining this billing cycle</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Callout */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-amber-300 text-lg">Need more credits?</p>
              <p className="text-slate-400">
                Upgrade to Agency Plan for <span className="text-amber-400 font-semibold">5,000 credits</span> per month
              </p>
            </div>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
              Upgrade to Agency
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
