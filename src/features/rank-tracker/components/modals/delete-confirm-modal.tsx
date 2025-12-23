// ============================================
// RANK TRACKER - Delete Confirmation Modal
// ============================================

"use client"

import { AlertTriangle, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { RankData } from "../../types"

interface DeleteConfirmModalProps {
  keyword: RankData | null
  onClose: () => void
  onConfirm: (keyword: RankData) => Promise<void | boolean>
  isDeleting: boolean
}

export function DeleteConfirmModal({
  keyword,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  const handleConfirm = async () => {
    if (keyword) {
      await onConfirm(keyword)
    }
  }

  return (
    <Dialog open={!!keyword} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Delete Keyword
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Are you sure you want to delete "{keyword?.keyword}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
