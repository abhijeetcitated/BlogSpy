"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, Sparkles, ArrowRight, X } from "lucide-react"
import Link from "next/link"

interface DemoWrapperProps {
  children: React.ReactNode
  featureName: string
  featureDescription: string
  dashboardPath: string
}

export function DemoWrapper({ 
  children, 
  featureName, 
  featureDescription,
  dashboardPath 
}: DemoWrapperProps) {
  const [showBanner, setShowBanner] = useState(true)

  return (
    <div className="relative">
      {/* Top Demo Banner */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-emerald-600 to-teal-600 text-white py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                You&apos;re viewing a limited demo of {featureName}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/register">
                <Button size="sm" variant="secondary" className="bg-white text-emerald-700 hover:bg-gray-100">
                  Sign Up Free
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
              <button 
                onClick={() => setShowBanner(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content with blur overlay for locked features */}
      <div className={showBanner ? "pt-10" : ""}>
        {children}
      </div>

      {/* Bottom CTA Card */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <Card className="bg-slate-900/95 backdrop-blur border-slate-700 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">
                  Unlock Full {featureName}
                </h4>
                <p className="text-slate-400 text-xs mt-1">
                  {featureDescription}
                </p>
                <div className="flex gap-2 mt-3">
                  <Link href="/register" className="flex-1">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm h-8">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="border-slate-600 text-slate-300 text-sm h-8">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Blur overlay for premium features in demo
 */
export function DemoBlurOverlay({ 
  children,
  message = "Sign up to unlock this feature"
}: { 
  children: React.ReactNode
  message?: string 
}) {
  return (
    <div className="relative group">
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-center">
          <Lock className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-white text-sm font-medium">{message}</p>
          <Link href="/register">
            <Button size="sm" className="mt-2 bg-emerald-600 hover:bg-emerald-700">
              Unlock Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Limited data indicator
 */
export function DemoLimitBadge({ current, max }: { current: number; max: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
      <span>Demo: {current}/{max} results</span>
      <Link href="/register" className="underline hover:text-amber-300">
        Get unlimited
      </Link>
    </div>
  )
}
