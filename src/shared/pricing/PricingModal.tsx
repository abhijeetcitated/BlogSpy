"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Check, Zap, Building2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

const plans = [
  {
    name: "Free",
    description: "For individuals getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 100,
    icon: Zap,
    features: [
      "100 AI credits/month",
      "Basic keyword research",
      "5 tracked keywords",
      "Weekly rank updates",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For serious content creators",
    monthlyPrice: 29,
    yearlyPrice: 290,
    credits: 1000,
    icon: Sparkles,
    features: [
      "1,000 AI credits/month",
      "Advanced keyword explorer",
      "Unlimited tracked keywords",
      "Daily rank updates",
      "Topic cluster strategy",
      "AI content writer",
      "Competitor gap analysis",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Agency",
    description: "For teams and agencies",
    monthlyPrice: 99,
    yearlyPrice: 990,
    credits: 5000,
    icon: Building2,
    features: [
      "5,000 AI credits/month",
      "Everything in Pro",
      "5 team members",
      "White-label reports",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "Priority support & SLA",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export function PricingModal() {
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(false)

  const handleClose = () => {
    router.back()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blur Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={handleClose} />

      {/* Modal Container */}
      <div className="relative flex items-center justify-center min-h-screen p-6 md:p-10">
        <div className="relative w-full max-w-5xl max-h-[90vh] bg-background rounded-2xl border border-border shadow-2xl overflow-hidden">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Scrollable Content */}
          <div className="p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Choose Your Plan</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Scale your SEO strategy with the right plan for your needs. All plans include a 14-day free trial.
              </p>

              {/* Monthly/Yearly Toggle */}
              <div className="flex items-center justify-center gap-3 mt-5">
                <span className={`text-sm ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
                <Switch
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  className="data-[state=checked]:bg-emerald-500"
                />
                <span className={`text-sm ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>Yearly</span>
                <span className="ml-2 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                  Save 17%
                </span>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const Icon = plan.icon
                const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
                const period = isYearly ? "/year" : "/month"

                return (
                  <div
                    key={plan.name}
                    className={`relative rounded-xl p-5 flex flex-col border ${
                      plan.highlighted 
                        ? "bg-card border-emerald-500/50" 
                        : "bg-card/50 border-border"
                    }`}
                  >
                    {/* Most Popular Badge */}
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 rounded-full bg-linear-to-r from-emerald-500 to-cyan-500 text-white text-xs font-semibold whitespace-nowrap">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="mb-4">
                      <div
                        className={`inline-flex p-2 rounded-lg mb-3 ${
                          plan.highlighted ? "bg-emerald-500/20" : "bg-muted"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${plan.highlighted ? "text-emerald-400" : "text-muted-foreground"}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-0.5">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">${price}</span>
                        <span className="text-muted-foreground text-sm">{period}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.credits.toLocaleString()} credits/month</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-5 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check
                            className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                              plan.highlighted ? "text-emerald-400" : "text-muted-foreground"
                            }`}
                          />
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      size="sm"
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                )
              })}
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              All plans include SSL encryption, 99.9% uptime SLA, and GDPR compliance.
              <br />
              Questions? <button className="text-emerald-400 hover:text-emerald-300">Contact our sales team</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
