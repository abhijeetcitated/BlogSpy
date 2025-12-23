// ============================================
// RANK TRACKER - Bulk Delete Modal
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

interface BulkDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
  onConfirm: () => Promise<void | boolean>
  isDeleting?: boolean
  // Legacy props for backwards compatibility
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function BulkDeleteModal({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
  isDeleting = false,
  // Legacy props
  open,
  onOpenChange,
}: BulkDeleteModalProps) {
  // Support both new and legacy props
  const isModalOpen = isOpen ?? open ?? false
  const handleClose = () => {
    onClose?.()
    onOpenChange?.(false)
  }

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={(openState) => !openState && handleClose()}>
      <DialogContent 
        className="bg-card border-border text-foreground max-w-sm"
        aria-label={`Delete ${selectedCount} keywords confirmation`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            Delete {selectedCount} Keywords
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Are you sure you want to delete {selectedCount} selected keywords? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
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
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                Delete All
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
