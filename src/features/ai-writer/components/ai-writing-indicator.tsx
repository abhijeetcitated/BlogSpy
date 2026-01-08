// ============================================
// AI WRITER - AI Writing Indicator Component
// ============================================

"use client"

import { Loader2 } from "lucide-react"

interface AIWritingIndicatorProps {
  isVisible: boolean
}

export function AIWritingIndicator({ isVisible }: AIWritingIndicatorProps) {
  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border border-emerald-500/30 rounded-xl shadow-xl">
        <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
        <span className="text-sm text-foreground">AI is writing...</span>
        <div className="flex gap-1">
          <span
            className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  )
}
