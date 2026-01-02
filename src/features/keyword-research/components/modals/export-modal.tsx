"use client"

// ============================================
// EXPORT MODAL - Export keywords to CSV/JSON
// ============================================

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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileJson, FileSpreadsheet } from "lucide-react"
import type { Keyword } from "../../types"

type ExportFormat = "csv" | "json"

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  keywords: Keyword[]
  selectedCount?: number
  onExport: (format: ExportFormat, selectedOnly: boolean) => void
}

export function ExportModal({
  open,
  onOpenChange,
  keywords,
  selectedCount = 0,
  onExport,
}: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("csv")
  const [selectedOnly, setSelectedOnly] = useState(false)

  const handleExport = () => {
    onExport(format, selectedOnly)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Keywords</DialogTitle>
          <DialogDescription>
            Export {selectedOnly ? selectedCount : keywords.length} keywords to a file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
              className="grid grid-cols-2 gap-2"
            >
              <Label
                htmlFor="csv"
                className="flex items-center gap-2 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/50 [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="csv" id="csv" />
                <FileSpreadsheet className="h-4 w-4" />
                <span>CSV</span>
              </Label>
              <Label
                htmlFor="json"
                className="flex items-center gap-2 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/50 [&:has([data-state=checked])]:border-primary"
              >
                <RadioGroupItem value="json" id="json" />
                <FileJson className="h-4 w-4" />
                <span>JSON</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Selected only option */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="selected-only"
                checked={selectedOnly}
                onCheckedChange={(checked) => setSelectedOnly(checked as boolean)}
              />
              <Label htmlFor="selected-only" className="text-sm">
                Export selected only ({selectedCount} keywords)
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
