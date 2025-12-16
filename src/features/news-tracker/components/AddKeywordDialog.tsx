"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Plus,
  Loader2,
  AlertCircle,
  Coins,
  Sparkles,
  X,
  Info,
} from "lucide-react"
import type { NewsPlatform } from "../types"

// ============================================
// INTERFACES
// ============================================

interface AddKeywordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activePlatform: NewsPlatform
  availableCredits: number
  onAddKeywords: (keywords: string[], platform: NewsPlatform) => Promise<boolean>
  isTracking?: boolean
}

// ============================================
// CONSTANTS
// ============================================

const CREDIT_COSTS: Record<NewsPlatform, number> = {
  "google-news": 1,
  "google-discover": 2,
}

const MAX_KEYWORDS_BATCH = 20

// ============================================
// COMPONENT
// ============================================

export function AddKeywordDialog({
  open,
  onOpenChange,
  activePlatform,
  availableCredits,
  onAddKeywords,
  isTracking = false,
}: AddKeywordDialogProps) {
  // State
  const [inputMode, setInputMode] = useState<"single" | "bulk">("single")
  const [singleKeyword, setSingleKeyword] = useState("")
  const [bulkKeywords, setBulkKeywords] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<NewsPlatform>(activePlatform)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Parse keywords from input
  const parsedKeywords = useCallback((): string[] => {
    if (inputMode === "single") {
      const kw = singleKeyword.trim()
      return kw ? [kw] : []
    }

    // Bulk mode - split by newline, comma, or semicolon
    return bulkKeywords
      .split(/[\n,;]+/)
      .map(kw => kw.trim())
      .filter(kw => kw.length >= 2 && kw.length <= 100)
      .slice(0, MAX_KEYWORDS_BATCH)
  }, [inputMode, singleKeyword, bulkKeywords])

  // Calculate credits needed
  const keywordsList = parsedKeywords()
  const creditsNeeded = keywordsList.length * CREDIT_COSTS[selectedPlatform]
  const hasEnoughCredits = availableCredits >= creditsNeeded
  const canSubmit = keywordsList.length > 0 && hasEnoughCredits && !isSubmitting && !isTracking

  // Reset form
  const resetForm = useCallback(() => {
    setSingleKeyword("")
    setBulkKeywords("")
    setInputMode("single")
  }, [])

  // Handle submit
  const handleSubmit = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)

    try {
      const success = await onAddKeywords(keywordsList, selectedPlatform)

      if (success) {
        resetForm()
        onOpenChange(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <Plus className="w-4 h-4 text-blue-500" />
            </div>
            Add Keywords to Track
          </DialogTitle>
          <DialogDescription>
            Track keywords in Google News or Discover. Each keyword costs credits based on platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Platform</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={selectedPlatform === "google-news" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-1 h-9",
                  selectedPlatform === "google-news" && "bg-blue-500 hover:bg-blue-600"
                )}
                onClick={() => setSelectedPlatform("google-news")}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="none">
                  <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2"/>
                  <rect x="7" y="8" width="10" height="2" rx="1" fill="currentColor"/>
                  <rect x="7" y="11" width="7" height="2" rx="1" fill="currentColor"/>
                  <rect x="7" y="14" width="10" height="2" rx="1" fill="currentColor"/>
                </svg>
                Google News
                <Badge variant="secondary" className="ml-2 text-[10px]">1 credit</Badge>
              </Button>
              <Button
                type="button"
                variant={selectedPlatform === "google-discover" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-1 h-9",
                  selectedPlatform === "google-discover" && "bg-red-500 hover:bg-red-600"
                )}
                onClick={() => setSelectedPlatform("google-discover")}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="none">
                  <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2"/>
                  <path d="M12 6l1.5 3.5 3.5 1.5-3.5 1.5L12 16l-1.5-3.5L7 11l3.5-1.5L12 6z" fill="currentColor"/>
                </svg>
                Google Discover
                <Badge variant="secondary" className="ml-2 text-[10px]">2 credits</Badge>
              </Button>
            </div>
          </div>

          {/* Input Mode Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Keywords</Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant={inputMode === "single" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => setInputMode("single")}
                >
                  Single
                </Button>
                <Button
                  type="button"
                  variant={inputMode === "bulk" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => setInputMode("bulk")}
                >
                  Bulk
                </Button>
              </div>
            </div>

            {inputMode === "single" ? (
              <Input
                placeholder="Enter keyword to track..."
                value={singleKeyword}
                onChange={(e) => setSingleKeyword(e.target.value)}
                className="h-10"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSubmit) {
                    handleSubmit()
                  }
                }}
              />
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter multiple keywords (one per line, or comma-separated)..."
                  value={bulkKeywords}
                  onChange={(e) => setBulkKeywords(e.target.value)}
                  className="min-h-[120px] resize-none"
                  autoFocus
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="w-3 h-3" />
                  <span>Max {MAX_KEYWORDS_BATCH} keywords per batch. Min 2 characters per keyword.</span>
                </div>
              </div>
            )}
          </div>

          {/* Keywords Preview */}
          {keywordsList.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Keywords to add ({keywordsList.length})
              </Label>
              <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-2 rounded-lg bg-muted/50">
                {keywordsList.map((kw, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Credit Summary */}
          <div className={cn(
            "p-3 rounded-lg border",
            hasEnoughCredits
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-red-500/5 border-red-500/20"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className={cn(
                  "w-4 h-4",
                  hasEnoughCredits ? "text-emerald-500" : "text-red-500"
                )} />
                <span className="text-sm font-medium">Credit Summary</span>
              </div>
              <Badge variant={hasEnoughCredits ? "secondary" : "destructive"} className="text-xs">
                {hasEnoughCredits ? "Sufficient" : "Insufficient"}
              </Badge>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Available</span>
                <p className="font-medium">{availableCredits}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Required</span>
                <p className={cn(
                  "font-medium",
                  !hasEnoughCredits && "text-red-500"
                )}>{creditsNeeded}</p>
              </div>
              <div>
                <span className="text-muted-foreground">After</span>
                <p className="font-medium">{Math.max(0, availableCredits - creditsNeeded)}</p>
              </div>
            </div>
            {!hasEnoughCredits && (
              <div className="mt-2 flex items-center gap-2 text-xs text-red-500">
                <AlertCircle className="w-3 h-3" />
                <span>Need {creditsNeeded - availableCredits} more credits</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Add {keywordsList.length} Keyword{keywordsList.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
