// ============================================
// COMMAND CENTER - Main Dashboard Component
// ============================================
// Refactored: Extracted data, BentoGrid, AgenticSuggestions
// ============================================

"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
  BentoGrid,
  AgenticSuggestions,
  quickActions,
  recentActivity,
  agenticSuggestions,
} from "./components"
import { getGreetingData, type GreetingData } from "../utils"
import { useCommandPaletteContext, getModifierKey } from "@/src/features/command-palette"

export function CommandCenter() {
  // Command palette context
  const { open: openCommandPalette } = useCommandPaletteContext()
  
  // State for greeting (to avoid hydration mismatch)
  const [greetingData, setGreetingData] = useState<GreetingData | null>(null)
  const [modifierKey, setModifierKey] = useState("⌘")

  useEffect(() => {
    // Get greeting data on client side (uses user's local timezone)
    setGreetingData(getGreetingData())
    // Detect platform for shortcut display
    setModifierKey(getModifierKey())
  }, [])

  // Fallback for SSR
  const displayGreeting = greetingData?.greeting || "Welcome!"
  const displayMessage = greetingData?.message || "Ready to dominate the SERPs?"
  const displayDate = greetingData?.date || new Date().toLocaleDateString()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            {displayGreeting} {displayMessage}
          </h1>
        </div>
        <Badge variant="secondary" className="bg-secondary/50 text-muted-foreground font-normal shrink-0">
          {displayDate}
        </Badge>
      </div>

      {/* Search Card - Now opens Command Palette */}
      <button
        type="button"
        onClick={openCommandPalette}
        className="w-full text-left"
      >
        <Card className="bg-gradient-to-br from-card via-card to-emerald-950/10 border-border/50 backdrop-blur-sm relative overflow-hidden group cursor-pointer hover:border-emerald-500/30 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-4 sm:p-6 md:p-8 relative">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                <div 
                  className="h-12 sm:h-14 md:h-16 pl-10 sm:pl-14 pr-4 sm:pr-20 md:pr-24 text-sm sm:text-base md:text-lg bg-background/80 border border-border hover:border-emerald-500/30 transition-all rounded-lg sm:rounded-xl flex items-center text-muted-foreground/50"
                >
                  <span className="hidden sm:inline">Search for a keyword, domain, or press {modifierKey}K...</span>
                  <span className="sm:hidden">Tap to search...</span>
                </div>
                <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <kbd className="hidden sm:inline-flex h-7 items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-xs text-muted-foreground">
                    <span className="text-xs">{modifierKey}</span>K
                  </kbd>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </button>

      {/* Bento Grid */}
      <BentoGrid quickActions={quickActions} recentActivity={recentActivity} />

      {/* Agentic AI Suggestions Section */}
      <AgenticSuggestions suggestions={agenticSuggestions} />
    </div>
  )
}
