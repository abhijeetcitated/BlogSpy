"use client"

import { useState } from "react"
import { Sparkles, RefreshCw, Copy, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { getRandomSuggestion } from "../utils/checker-utils"
import type { CurrentIssue } from "../types"

interface AIFixModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentIssue: CurrentIssue | null
  onCopySuccess: () => void
}

export function AIFixModal({ open, onOpenChange, currentIssue, onCopySuccess }: AIFixModalProps) {
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate initial suggestion when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && currentIssue) {
      setAiSuggestion(getRandomSuggestion(currentIssue.title))
      setCopied(false)
    }
    onOpenChange(newOpen)
  }

  const handleRegenerate = () => {
    if (!currentIssue) return
    setIsGenerating(true)
    setCopied(false)
    setTimeout(() => {
      setAiSuggestion(getRandomSuggestion(currentIssue.title))
      setIsGenerating(false)
    }, 800)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(aiSuggestion)
    setCopied(true)
    onCopySuccess()
    setTimeout(() => setCopied(false), 2000)
  }

  if (!currentIssue) return null

  const isError = currentIssue.type === "error"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg bg-card border-border mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Sparkles className={cn("h-4 w-4 sm:h-5 sm:w-5", isError ? "text-red-400" : "text-amber-400")} />
            AI Fix Suggestion
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {currentIssue.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <div
            className={cn(
              "p-2 sm:p-3 rounded-lg border text-xs sm:text-sm",
              isError
                ? "bg-red-500/5 border-red-500/20 text-red-300"
                : "bg-amber-500/5 border-amber-500/20 text-amber-300"
            )}
          >
            <p className="font-medium mb-1 text-xs sm:text-sm">Issue:</p>
            <p className="text-muted-foreground text-[10px] sm:text-xs">{currentIssue.description}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-foreground">Suggested Fix:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground touch-manipulation min-h-[36px] px-2 sm:px-3"
              >
                <RefreshCw className={cn("h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 mr-1", isGenerating && "animate-spin")} />
                <span className="hidden xs:inline">Regenerate</span>
              </Button>
            </div>
            <Textarea
              value={aiSuggestion}
              onChange={(e) => setAiSuggestion(e.target.value)}
              className="bg-muted/50 border-border min-h-25 font-mono text-sm"
              placeholder="AI suggestion will appear here..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCopy}
              className="bg-linear-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Fix
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
