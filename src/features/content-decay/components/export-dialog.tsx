"use client"

// ============================================
// CONTENT DECAY - Export Dialog Component
// ============================================
// Export articles to CSV or JSON format

import { useState, useCallback } from "react"
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Check,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { DecayArticle } from "../types"

type ExportFormat = "csv" | "json"
type ExportScope = "all" | "filtered" | "selected"

interface ExportField {
  key: keyof DecayArticle | "decayReasonDisplay"
  label: string
  default: boolean
}

const EXPORT_FIELDS: ExportField[] = [
  { key: "title", label: "Title", default: true },
  { key: "url", label: "URL", default: true },
  { key: "currentRank", label: "Current Rank", default: true },
  { key: "previousRank", label: "Previous Rank", default: true },
  { key: "trafficLoss", label: "Traffic Loss", default: true },
  { key: "decayRate", label: "Decay Rate", default: true },
  { key: "decayReasonDisplay", label: "Decay Reason", default: true },
  { key: "lastUpdated", label: "Last Updated", default: false },
]

interface ExportDialogProps {
  allArticles: DecayArticle[]
  filteredArticles: DecayArticle[]
  selectedIds: Set<string>
  className?: string
}

export function ExportDialog({
  allArticles,
  filteredArticles,
  selectedIds,
  className,
}: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>("csv")
  const [scope, setScope] = useState<ExportScope>("filtered")
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(EXPORT_FIELDS.filter(f => f.default).map(f => f.key))
  )
  const [copied, setCopied] = useState(false)

  const selectedArticles = allArticles.filter(a => selectedIds.has(a.id))
  
  const getArticlesToExport = useCallback(() => {
    switch (scope) {
      case "all": return allArticles
      case "filtered": return filteredArticles
      case "selected": return selectedArticles
      default: return filteredArticles
    }
  }, [scope, allArticles, filteredArticles, selectedArticles])

  const toggleField = useCallback((fieldKey: string) => {
    setSelectedFields(prev => {
      const next = new Set(prev)
      if (next.has(fieldKey)) {
        next.delete(fieldKey)
      } else {
        next.add(fieldKey)
      }
      return next
    })
  }, [])

  const getDecayReasonDisplay = (reason: DecayArticle["decayReason"]) => {
    const map: Record<string, string> = {
      Competitor: "Competitor Outrank",
      Outdated: "Outdated Content",
      "Missing Keywords": "Missing Keywords",
      "Schema Issues": "Schema Issues",
      "Slow Load": "Slow Load",
    }
    return map[reason] || reason
  }

  const generateCSV = useCallback(() => {
    const articles = getArticlesToExport()
    const fields = EXPORT_FIELDS.filter(f => selectedFields.has(f.key))
    
    // Header row
    const header = fields.map(f => f.label).join(",")
    
    // Data rows
    const rows = articles.map(article => {
      return fields.map(field => {
        let value: string | number
        if (field.key === "decayReasonDisplay") {
          value = getDecayReasonDisplay(article.decayReason)
        } else {
          value = article[field.key as keyof DecayArticle] as string | number
        }
        // Escape quotes and wrap in quotes if contains comma
        const strValue = String(value)
        if (strValue.includes(",") || strValue.includes('"')) {
          return `"${strValue.replace(/"/g, '""')}"`
        }
        return strValue
      }).join(",")
    })
    
    return [header, ...rows].join("\n")
  }, [getArticlesToExport, selectedFields])

  const generateJSON = useCallback(() => {
    const articles = getArticlesToExport()
    const fields = EXPORT_FIELDS.filter(f => selectedFields.has(f.key))
    
    const data = articles.map(article => {
      const obj: Record<string, string | number> = {}
      fields.forEach(field => {
        if (field.key === "decayReasonDisplay") {
          obj[field.key] = getDecayReasonDisplay(article.decayReason)
        } else {
          obj[field.key] = article[field.key as keyof DecayArticle] as string | number
        }
      })
      return obj
    })
    
    return JSON.stringify(data, null, 2)
  }, [getArticlesToExport, selectedFields])

  const handleExport = useCallback(() => {
    const content = format === "csv" ? generateCSV() : generateJSON()
    const mimeType = format === "csv" ? "text/csv" : "application/json"
    const extension = format === "csv" ? "csv" : "json"
    const filename = `content-decay-export-${new Date().toISOString().split("T")[0]}.${extension}`
    
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setOpen(false)
  }, [format, generateCSV, generateJSON])

  const handleCopyToClipboard = useCallback(async () => {
    const content = format === "csv" ? generateCSV() : generateJSON()
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [format, generateCSV, generateJSON])

  const articleCount = getArticlesToExport().length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-1.5 sm:gap-2 h-7 sm:h-8 text-xs sm:text-sm", className)}
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            Export Articles
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Export decay data to CSV or JSON format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          {/* Format Selection */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm font-medium">Format</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={format === "csv" ? "default" : "outline"}
                size="sm"
                onClick={() => setFormat("csv")}
                className="gap-1.5 sm:gap-2 h-7 sm:h-8 text-xs sm:text-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                CSV
              </Button>
              <Button
                type="button"
                variant={format === "json" ? "default" : "outline"}
                size="sm"
                onClick={() => setFormat("json")}
                className="gap-1.5 sm:gap-2 h-7 sm:h-8 text-xs sm:text-sm"
              >
                <FileJson className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                JSON
              </Button>
            </div>
          </div>

          {/* Scope Selection */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm font-medium">Articles to Export</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <Button
                type="button"
                variant={scope === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setScope("all")}
                className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
              >
                All ({allArticles.length})
              </Button>
              <Button
                type="button"
                variant={scope === "filtered" ? "default" : "outline"}
                size="sm"
                onClick={() => setScope("filtered")}
                className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
              >
                Filtered ({filteredArticles.length})
              </Button>
              <Button
                type="button"
                variant={scope === "selected" ? "default" : "outline"}
                size="sm"
                onClick={() => setScope("selected")}
                disabled={selectedIds.size === 0}
                className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
              >
                Selected ({selectedIds.size})
              </Button>
            </div>
          </div>

          {/* Fields Selection */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm font-medium">Fields to Include</Label>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg bg-muted/30 border border-border/50">
              {EXPORT_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center space-x-1.5 sm:space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.has(field.key)}
                    onCheckedChange={() => toggleField(field.key)}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />
                  <Label 
                    htmlFor={field.key} 
                    className="text-[10px] sm:text-sm cursor-pointer"
                  >
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Count */}
          <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-[10px] sm:text-sm text-muted-foreground">
              Ready to export
            </span>
            <span className="text-[10px] sm:text-sm font-medium text-primary">
              {articleCount} articles × {selectedFields.size} fields
            </span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCopyToClipboard}
            className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
          <Button
            onClick={handleExport}
            disabled={articleCount === 0 || selectedFields.size === 0}
            className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Download {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
