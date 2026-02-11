"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface OnboardingChecklistProps {
  /** Has at least one config/project */
  hasConfig: boolean
  /** Has at least one scan */
  hasScan: boolean
  /** Has at least one tracked keyword */
  hasKeyword: boolean
  /** All steps done — allow dismiss */
  onDismiss?: () => void
  /** Action: open Add Config modal */
  onAddConfig?: () => void
  /** Action: focus scan input */
  onStartScan?: () => void
  /** Action: open Add Keyword modal */
  onAddKeyword?: () => void
  /** Is demo mode */
  isDemoMode?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function OnboardingChecklist({
  hasConfig,
  onAddConfig,
  isDemoMode = false,
}: OnboardingChecklistProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Only show when config is missing. Hide in demo mode.
  if (hasConfig || isDemoMode) return null

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/40 backdrop-blur-xl bg-card/70 shadow-xl shadow-black/5 dark:shadow-black/25 overflow-hidden transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.98]"
      )}
    >
      {/* Subtle glow behind */}
      <div className="absolute inset-0 bg-linear-to-b from-primary/4 to-transparent pointer-events-none" />

      <div className="relative p-5 sm:p-6 flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
          <Settings2 className="h-5 w-5 text-primary" />
        </div>

        {/* Copy */}
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-[15px] font-semibold text-foreground tracking-tight">
            Set up your project
          </h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Add your brand keywords and competitors so we can track how AI platforms mention you.
          </p>
        </div>

        {/* CTA */}
        {onAddConfig && (
          <Button
            onClick={onAddConfig}
            size="sm"
            className="h-9 px-5 text-[13px] font-medium"
          >
            <Settings2 className="h-3.5 w-3.5 mr-1.5" />
            Configure Project
          </Button>
        )}
      </div>
    </div>
  )
}
