"use client"

import { toast } from "sonner"
import { Sparkles } from "lucide-react"
import React from "react"

import { FEATURE_FLAGS } from "@/config/feature-flags"

type FeatureKey = keyof typeof FEATURE_FLAGS

export function handleFeatureAccess(feature: FeatureKey, onAccess: () => void) {
  const isEnabled = FEATURE_FLAGS[feature]

  if (!isEnabled) {
    if (feature === "AI_WRITER") {
      toast.custom(
        () => (
          <div className="flex items-start gap-4 p-4 w-full max-w-md bg-zinc-950 border border-amber-500/30 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-700" />

            <div className="mt-1 p-2 bg-amber-500/10 rounded-full">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-1">
                AI Writer 2.0 Loading...
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We are upgrading our AI engine for human-like SEO content.
                <span className="block mt-1 text-amber-500 font-medium">
                  Coming in the next update.
                </span>
              </p>
            </div>
          </div>
        ),
        { duration: 4000 }
      )
      return
    }

    toast.info("Feature coming soon")
    return
  }

  onAccess()
}
