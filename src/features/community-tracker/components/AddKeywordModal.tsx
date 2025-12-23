/**
 * Add Keyword Modal Component
 * Modal dialog for adding new keywords to track
 */

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
import { Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CommunityPlatform } from "../types"

// Custom Community Icon
function CommunityIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

interface AddKeywordModalProps {
  isOpen: boolean
  onClose: () => void
  newKeyword: string
  onKeywordChange: (value: string) => void
  selectedPlatforms: CommunityPlatform[]
  onPlatformToggle: (platform: CommunityPlatform) => void
  onAddKeyword: () => void
  isAdding: boolean
}

export function AddKeywordModal({
  isOpen,
  onClose,
  newKeyword,
  onKeywordChange,
  selectedPlatforms,
  onPlatformToggle,
  onAddKeyword,
  isAdding,
}: AddKeywordModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <CommunityIcon className="h-4 w-4 text-orange-500" />
            </div>
            Add Keyword to Track
          </DialogTitle>
          <DialogDescription>
            Enter a keyword to track across community platforms. We&apos;ll monitor rankings and mentions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Keyword Input */}
          <div className="space-y-2">
            <Label htmlFor="keyword">Keyword</Label>
            <Input
              id="keyword"
              value={newKeyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="e.g., best seo tools, rank tracking"
              disabled={isAdding}
            />
          </div>

          {/* Platform Selection */}
          <div className="space-y-3">
            <Label>Track on Platforms</Label>
            <div className="grid gap-2">
              {/* Reddit */}
              <label
                htmlFor="reddit"
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                  selectedPlatforms.includes("reddit")
                    ? "border-orange-500/50 bg-orange-500/5"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <Checkbox
                  id="reddit"
                  checked={selectedPlatforms.includes("reddit")}
                  disabled={isAdding}
                  onCheckedChange={() => onPlatformToggle("reddit")}
                />
                <div className="w-5 h-5 text-orange-500">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-foreground">Reddit</span>
                <span className="ml-auto text-xs text-muted-foreground">1 credit</span>
              </label>

              {/* Quora */}
              <label
                htmlFor="quora"
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                  selectedPlatforms.includes("quora")
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <Checkbox
                  id="quora"
                  checked={selectedPlatforms.includes("quora")}
                  disabled={isAdding}
                  onCheckedChange={() => onPlatformToggle("quora")}
                />
                <div className="w-5 h-5 text-red-500">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.738 18.394c-.723-1.474-1.566-2.984-3.016-2.984-.467 0-.936.12-1.273.36l-.478-.815c.623-.538 1.562-.894 2.783-.894 2.005 0 3.256 1.147 4.26 2.855.398-1.052.609-2.362.609-3.904 0-4.796-1.803-7.93-5.595-7.93-3.787 0-5.678 3.134-5.678 7.93 0 4.804 1.896 7.813 5.678 7.813.793 0 1.514-.113 2.156-.335l-.446-2.096zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-foreground">Quora</span>
                <span className="ml-auto text-xs text-muted-foreground">1 credit</span>
              </label>
            </div>
          </div>

          {/* Credit Cost Summary */}
          {selectedPlatforms.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <span className="text-sm text-muted-foreground">Total Cost</span>
              <span className="text-sm font-semibold text-foreground">{selectedPlatforms.length} credits</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            onClick={onAddKeyword}
            disabled={isAdding || !newKeyword.trim() || selectedPlatforms.length === 0}
            className="bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          >
            {isAdding ? (
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
      </DialogContent>
    </Dialog>
  )
}
