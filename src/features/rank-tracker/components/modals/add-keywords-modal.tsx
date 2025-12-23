// ============================================
// RANK TRACKER - Add Keywords Modal
// ============================================

"use client"

import { useState, useCallback } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface AddKeywordsModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal is closed */
  onClose: () => void
  /** Callback to add keywords - receives raw text, returns success boolean */
  onAdd: (keywordsText: string) => Promise<boolean>
  /** Whether keywords are being added */
  isAdding?: boolean
  /** Legacy props for backwards compatibility */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddKeywordsModal({
  isOpen,
  onClose,
  onAdd,
  isAdding: externalIsAdding,
  // Legacy props
  open,
  onOpenChange,
}: AddKeywordsModalProps) {
  const [newKeywords, setNewKeywords] = useState("")
  const [internalIsAdding, setInternalIsAdding] = useState(false)
  
  // Support both new and legacy props
  const isModalOpen = isOpen ?? open ?? false
  const handleClose = onClose ?? (() => onOpenChange?.(false))
  const isAddingState = externalIsAdding ?? internalIsAdding

  const handleAddKeywords = useCallback(async () => {
    if (!newKeywords.trim()) return

    setInternalIsAdding(true)
    try {
      const success = await onAdd(newKeywords)
      if (success) {
        setNewKeywords("")
      }
    } finally {
      setInternalIsAdding(false)
    }
  }, [newKeywords, onAdd])

  const handleModalClose = useCallback(() => {
    if (!isAddingState) {
      setNewKeywords("")
      handleClose()
    }
  }, [isAddingState, handleClose])

  return (
    <Dialog open={isModalOpen} onOpenChange={(v) => !v && handleModalClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            Add Keywords
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add keywords to track their rankings (one per line)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Enter keywords, one per line...&#10;&#10;Example:&#10;best seo software&#10;keyword research tool&#10;rank tracker"
            value={newKeywords}
            onChange={(e) => setNewKeywords(e.target.value)}
            className="h-40 bg-muted border-border text-foreground placeholder:text-muted-foreground/50"
            disabled={isAddingState}
            aria-label="Keywords to add"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleModalClose}
            disabled={isAddingState}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddKeywords}
            disabled={isAddingState || !newKeywords.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isAddingState ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Keywords
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
