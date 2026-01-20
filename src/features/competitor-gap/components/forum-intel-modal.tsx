// ============================================
// COMPETITOR GAP - Forum Intel Modal
// ============================================

"use client"

import type { ForumIntelPost, SortField, SortDirection } from "../types"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ForumIntelTable } from "./forum-intel-table"

interface ForumIntelModalProps {
  isOpen: boolean
  onClose: () => void
  keyword: string | null
  data: ForumIntelPost[]
  isLoading: boolean
  selectedRows: Set<string>
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onSelectAll: (checked: boolean) => void
  onSelectRow: (id: string, checked: boolean) => void
}

export function ForumIntelModal({
  isOpen,
  onClose,
  keyword,
  data,
  isLoading,
  selectedRows,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectRow,
}: ForumIntelModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Community Insights for: {keyword ?? "keyword"}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Loading forum intel...
          </div>
        ) : (
          <ForumIntelTable
            data={data}
            selectedRows={selectedRows}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
            onSelectAll={onSelectAll}
            onSelectRow={onSelectRow}
          />
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
