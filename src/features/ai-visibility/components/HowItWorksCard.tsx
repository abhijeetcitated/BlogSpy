"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Lightbulb, 
  X, 
  Zap, 
  Search, 
  Shield, 
  CheckCircle2,
  Info,
  Sparkles,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// STORAGE KEY
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const DISMISS_KEY = "blogspy_how_it_works_dismissed"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CREDIT ACTIONS DATA
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const CREDIT_ACTIONS = [
  {
    icon: Search,
    title: "Track Keyword",
    credits: 1,
    description: "Check 1 query on 1 AI platform",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: Sparkles,
    title: "Full Scan",
    credits: 5,
    description: "Check all 6 AI platforms at once",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: Shield,
    title: "Tech Audit",
    credits: 0,
    description: "robots.txt, llms.txt, Schema check",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    isFree: true,
  },
  {
    icon: CheckCircle2,
    title: "Verify Fact",
    credits: 1,
    description: "Check if AI info is accurate",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface HowItWorksCardProps {
  className?: string
}

export function HowItWorksCard({ className = "" }: HowItWorksCardProps) {
  // Initialize from localStorage (run only on client)
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(DISMISS_KEY) === "true"
    }
    return false
  })

  // Handle dismiss
  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem(DISMISS_KEY, "true")
  }

  // Handle show again (for testing)
  const handleShowAgain = () => {
    setIsDismissed(false)
    localStorage.removeItem(DISMISS_KEY)
  }

  // Don't render if dismissed
  if (isDismissed) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShowAgain}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        <Info className="h-3 w-3 mr-1" />
        How credits work?
      </Button>
    )
  }

  return (
    <Card className={`bg-card border-border relative overflow-hidden ${className}`}>
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-500 via-violet-500 to-amber-500" />
      
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-4 sm:pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
            How AI Visibility Works
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Track your brand mentions across ChatGPT, Claude, Perplexity & Google AI Overviews
        </p>
      </CardHeader>
      
      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        {/* Credit Actions Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {CREDIT_ACTIONS.map((action) => (
            <div 
              key={action.title}
              className={`p-2.5 sm:p-3 rounded-lg border border-border/50 ${action.bgColor} hover:border-border transition-colors`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className={`p-1.5 rounded-md bg-background/50`}>
                  <action.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-medium text-foreground">
                      {action.title}
                    </span>
                    {action.isFree ? (
                      <Badge className="text-[9px] sm:text-[10px] px-1.5 py-0 h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        FREE
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-4 text-amber-400 border-amber-400/30">
                        <Zap className="h-2 w-2 mr-0.5" />
                        {action.credits}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with credit info */}
        <div className="mt-3 sm:mt-4 pt-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Credits reset monthly with your plan</span>
          </div>
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 text-xs text-primary"
            onClick={handleDismiss}
          >
            Got it, don&apos;t show again
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default HowItWorksCard
