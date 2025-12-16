"use client"

import { useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Plus, Sparkles } from "lucide-react"
import { PinterestIcon, XIcon, InstagramIcon } from "./SocialPlatformTabs"
import type { SocialPlatform } from "../types"
import { cn } from "@/lib/utils"

interface AddKeywordModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (keyword: string, platforms: SocialPlatform[]) => Promise<boolean>
  isLoading?: boolean
}

const PLATFORMS: { id: SocialPlatform; name: string; icon: React.FC<{ className?: string }>; color: string; credits: number }[] = [
  { id: "pinterest", name: "Pinterest", icon: PinterestIcon, color: "text-red-500", credits: 3 },
  { id: "twitter", name: "X", icon: XIcon, color: "text-foreground", credits: 5 },
  { id: "instagram", name: "Instagram", icon: InstagramIcon, color: "text-pink-500", credits: 3 },
]

export function AddKeywordModal({ isOpen, onClose, onAdd, isLoading = false }: AddKeywordModalProps) {
  const [keyword, setKeyword] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(["pinterest", "twitter", "instagram"])
  const [error, setError] = useState("")

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!keyword.trim()) {
      setError("Please enter a keyword")
      return
    }

    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform")
      return
    }

    const success = await onAdd(keyword.trim(), selectedPlatforms)
    
    if (success) {
      setKeyword("")
      setSelectedPlatforms(["pinterest", "twitter", "instagram"])
      onClose()
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setKeyword("")
      setSelectedPlatforms(["pinterest", "twitter", "instagram"])
      setError("")
      onClose()
    }
  }

  // Calculate credit cost based on real platform pricing
  const creditCost = selectedPlatforms.reduce((total, platformId) => {
    const platform = PLATFORMS.find(p => p.id === platformId)
    return total + (platform?.credits || 0)
  }, 0)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-500/10 dark:bg-slate-400/10">
              <Sparkles className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </div>
            Add Keyword to Track
          </DialogTitle>
          <DialogDescription>
            Enter a keyword to track across social platforms. We&apos;ll monitor rankings and engagement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Keyword Input */}
            <div className="space-y-2">
              <Label htmlFor="keyword">Keyword</Label>
              <Input
                id="keyword"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setError("")
                }}
                placeholder="e.g., seo tips, content marketing"
                disabled={isLoading}
                className="focus:border-slate-500/50 focus:ring-slate-500/20"
              />
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <Label>Track on Platforms</Label>
              <div className="grid gap-2">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon
                  const isSelected = selectedPlatforms.includes(platform.id)
                  
                  return (
                    <label
                      key={platform.id}
                      htmlFor={platform.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                        isSelected 
                          ? "border-pink-500/50 bg-pink-500/5 dark:border-pink-400/50 dark:bg-pink-400/5" 
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <Checkbox
                        id={platform.id}
                        checked={isSelected}
                        disabled={isLoading}
                        onCheckedChange={() => handlePlatformToggle(platform.id)}
                      />
                      <Icon className={cn("h-4 w-4", platform.color)} />
                      <span className="text-sm font-medium text-foreground">{platform.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{platform.credits} credits</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Credit Cost Summary */}
            {selectedPlatforms.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <span className="text-sm text-muted-foreground">Total Cost</span>
                <span className="text-sm font-semibold text-foreground">{creditCost} credits</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !keyword.trim() || selectedPlatforms.length === 0}
              className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-500 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Keyword
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
