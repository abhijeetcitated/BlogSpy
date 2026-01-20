"use client"

import { useState } from "react"
import { ErrorBoundary } from "@/components/common/error-boundary"
import { 
  CreditCard, 
  Check, 
  Zap, 
  Crown, 
  Building2,
  Download,
  Calendar,
  AlertCircle,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock user data
const mockUser = {
  plan: "pro",
  credits: 342,
  maxCredits: 500,
  billingCycle: "monthly",
  nextBillingDate: "Jan 15, 2025",
  stripeCustomerId: "cus_xxx",
}

// Plans configuration
const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceYearly: 0,
    description: "For getting started",
    icon: Zap,
    features: [
      "50 keyword searches/month",
      "5 keyword tracking",
      "Basic content analysis",
      "7-day trend data",
      "Email support",
    ],
    limits: { credits: 50 },
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    priceYearly: 470,
    description: "For serious bloggers",
    icon: Crown,
    features: [
      "500 keyword searches/month",
      "100 keyword tracking",
      "Advanced content analysis",
      "30-day trend data",
      "AI content writer",
      "Topic clusters",
      "Priority support",
    ],
    limits: { credits: 500 },
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    priceYearly: 1910,
    description: "For teams & agencies",
    icon: Building2,
    features: [
      "Unlimited keyword searches",
      "Unlimited keyword tracking",
      "Full content analysis suite",
      "Historical trend data",
      "Unlimited AI writer",
      "API access",
      "White-label reports",
      "Dedicated account manager",
    ],
    limits: { credits: 5000 },
    popular: false,
  },
]

// Mock invoices
const mockInvoices = [
  { id: "inv_001", date: "Dec 15, 2024", amount: "$49.00", status: "paid", plan: "Pro" },
  { id: "inv_002", date: "Nov 15, 2024", amount: "$49.00", status: "paid", plan: "Pro" },
  { id: "inv_003", date: "Oct 15, 2024", amount: "$49.00", status: "paid", plan: "Pro" },
  { id: "inv_004", date: "Sep 15, 2024", amount: "$0.00", status: "paid", plan: "Free" },
]

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [isLoading, setIsLoading] = useState(false)

  const currentPlan = plans.find(p => p.id === mockUser.plan) || plans[0]
  const creditsUsed = mockUser.maxCredits - mockUser.credits
  const creditsPercentage = (mockUser.credits / mockUser.maxCredits) * 100

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true)
    // Mock API call - will be replaced with real Stripe checkout
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert(`Upgrade to ${planId} - Stripe checkout will open here`)
    setIsLoading(false)
  }

  const handleManageSubscription = async () => {
    setIsLoading(true)
    // Mock API call - will be replaced with Stripe customer portal
    await new Promise(resolve => setTimeout(resolve, 500))
    alert("Stripe Customer Portal will open here")
    setIsLoading(false)
  }

  return (
    <ErrorBoundary>
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Billing & Subscription</h1>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">Manage your subscription and billing details</p>
      </div>

      {/* Current Plan Overview */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Plan Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-slate-400 text-xs sm:text-sm">Current Plan</CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-white flex items-center gap-2">
              <currentPlan.icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              {currentPlan.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                ${billingCycle === "monthly" ? currentPlan.price : Math.round(currentPlan.priceYearly / 12)}
              </span>
              <span className="text-slate-400 text-sm">/month</span>
            </div>
            {mockUser.plan !== "free" && (
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Next billing: {mockUser.nextBillingDate}
              </p>
            )}
          </CardContent>
          <CardFooter className="p-4 sm:p-6 pt-0">
            <Button 
              variant="outline" 
              className="w-full border-slate-600 hover:bg-slate-700 text-xs sm:text-sm"
              onClick={handleManageSubscription}
              disabled={isLoading || mockUser.plan === "free"}
            >
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Manage Subscription
            </Button>
          </CardFooter>
        </Card>

        {/* Credits Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-slate-400 text-xs sm:text-sm">Credits Usage</CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-white">
              {mockUser.credits} / {mockUser.maxCredits}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <Progress value={creditsPercentage} className="h-2" />
            <p className="text-xs sm:text-sm text-slate-400">
              {creditsUsed} credits used this month
            </p>
            {creditsPercentage < 20 && (
              <div className="flex items-center gap-2 text-amber-400 text-xs sm:text-sm">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Running low on credits
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 sm:p-6 pt-0">
            <Button 
              variant="outline" 
              className="w-full border-slate-600 hover:bg-slate-700 text-xs sm:text-sm"
              onClick={() => handleUpgrade("pro")}
              disabled={isLoading}
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Get More Credits
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Stats Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-slate-400 text-xs sm:text-sm">This Month</CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-white">Usage Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Keyword Searches</span>
              <span className="text-white">127</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Content Analyzed</span>
              <span className="text-white">34</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-400">AI Content Generated</span>
              <span className="text-white">12</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Keywords Tracked</span>
              <span className="text-white">45 / 100</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Available Plans</h2>
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}>
            <TabsList className="bg-slate-800">
              <TabsTrigger value="monthly" className="text-xs sm:text-sm">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="text-xs sm:text-sm">
                Yearly
                <Badge className="ml-1 sm:ml-2 bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs">Save 20%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === mockUser.plan
            const price = billingCycle === "monthly" ? plan.price : Math.round(plan.priceYearly / 12)
            
            return (
              <Card 
                key={plan.id} 
                className={`bg-slate-800/50 border-slate-700 relative ${
                  plan.popular ? "ring-2 ring-emerald-500" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center gap-2">
                    <plan.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${plan.popular ? "text-emerald-400" : "text-slate-400"}`} />
                    <CardTitle className="text-white text-base sm:text-lg">{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold text-white">${price}</span>
                    <span className="text-slate-400 text-sm">/month</span>
                  </div>
                  {billingCycle === "yearly" && plan.price > 0 && (
                    <p className="text-xs sm:text-sm text-emerald-400">
                      ${plan.priceYearly}/year (Save ${plan.price * 12 - plan.priceYearly})
                    </p>
                  )}
                  <ul className="space-y-1.5 sm:space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-4 sm:p-6 pt-0">
                  <Button 
                    className={`w-full text-xs sm:text-sm ${
                      isCurrentPlan 
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                        : plan.popular 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                          : "bg-slate-700 hover:bg-slate-600 text-white"
                    }`}
                    disabled={isCurrentPlan || isLoading}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isCurrentPlan ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Billing History */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white">Billing History</h2>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            {/* Mobile View - Cards */}
            <div className="block sm:hidden divide-y divide-slate-700">
              {mockInvoices.map((invoice) => (
                <div key={invoice.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">{invoice.id}</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{invoice.date}</span>
                    <span>{invoice.plan}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{invoice.amount}</span>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white h-7 px-2">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop View - Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-4 text-slate-400 font-medium text-sm">Invoice</th>
                    <th className="text-left p-4 text-slate-400 font-medium text-sm">Date</th>
                    <th className="text-left p-4 text-slate-400 font-medium text-sm">Plan</th>
                    <th className="text-left p-4 text-slate-400 font-medium text-sm">Amount</th>
                    <th className="text-left p-4 text-slate-400 font-medium text-sm">Status</th>
                    <th className="text-right p-4 text-slate-400 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-700/50 last:border-0">
                      <td className="p-4 text-white text-sm">{invoice.id}</td>
                      <td className="p-4 text-slate-300 text-sm">{invoice.date}</td>
                      <td className="p-4 text-slate-300 text-sm">{invoice.plan}</td>
                      <td className="p-4 text-white text-sm">{invoice.amount}</td>
                      <td className="p-4">
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <Download className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ErrorBoundary>
  )
}
