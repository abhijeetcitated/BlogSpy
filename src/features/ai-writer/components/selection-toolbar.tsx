// ============================================
// AI WRITER - Selection Toolbar Component
// ============================================

"use client"

import { Button } from "@/components/ui/button"
import { Expand, RotateCcw, Minimize2, Loader2 } from "lucide-react"
import type { AIAction } from "../types"

interface SelectionToolbarProps {
  isVisible: boolean
  isAIGenerating: boolean
  aiAction: AIAction
  onExpand: () => void
  onRewrite: () => void
  onShorten: () => void
}

export function SelectionToolbar({
  isVisible,
  isAIGenerating,
  aiAction,
  onExpand,
  onRewrite,
  onShorten,
}: SelectionToolbarProps) {
  if (!isVisible) return null

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
      <Button
        size="sm"
        variant="ghost"
        onClick={onExpand}
        disabled={isAIGenerating}
        className="h-8 px-3 gap-1.5 text-xs hover:bg-slate-700 hover:text-emerald-400"
      >
        {aiAction === "expand" && isAIGenerating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Expand className="h-3.5 w-3.5" />
        )}
        Expand
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onRewrite}
        disabled={isAIGenerating}
        className="h-8 px-3 gap-1.5 text-xs hover:bg-slate-700 hover:text-cyan-400"
      >
        {aiAction === "rewrite" && isAIGenerating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RotateCcw className="h-3.5 w-3.5" />
        )}
        Rewrite
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onShorten}
        disabled={isAIGenerating}
        className="h-8 px-3 gap-1.5 text-xs hover:bg-slate-700 hover:text-amber-400"
      >
        {aiAction === "shorten" && isAIGenerating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Minimize2 className="h-3.5 w-3.5" />
        )}
        Shorter
      </Button>
    </div>
  )
}
