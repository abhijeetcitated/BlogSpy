// ============================================
// RANK TRACKER - Add Keywords Modal Component
// ============================================

"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface AddKeywordsModalProps {
  isOpen: boolean
  onClose: () => void
  keywordsInput: string
  urlInput: string
  onKeywordsChange: (value: string) => void
  onUrlChange: (value: string) => void
  onSubmit: () => void
}

/**
 * Modal for adding new keywords to track
 */
export function AddKeywordsModal({
  isOpen,
  onClose,
  keywordsInput,
  urlInput,
  onKeywordsChange,
  onUrlChange,
  onSubmit,
}: AddKeywordsModalProps) {
  const handleSubmit = () => {
    onSubmit()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-violet-500" />
            Add Keywords to Track
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add keywords you want to monitor. Enter one keyword per line.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Keywords Input */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Keywords</label>
            <Textarea
              placeholder="Enter keywords, one per line...
best seo tools 2024
keyword research guide
how to rank on google"
              value={keywordsInput}
              onChange={(e) => onKeywordsChange(e.target.value)}
              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/60 min-h-32"
            />
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Target URL (optional)
            </label>
            <Input
              placeholder="https://example.com/page"
              value={urlInput}
              onChange={(e) => onUrlChange(e.target.value)}
              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            Add Keywords
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
