"use client"

import { useState, useMemo } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Loader2,
  Filter,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  FileDown,
  Settings2,
} from "lucide-react"
import type { CannibalizationIssue, CannibalizationSeverity } from "../types"
import { getActionLabel, getSeverityLabel } from "../utils/cannibalization-utils"

// ============================================
// INTERFACES
// ============================================

interface ExportReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issues: CannibalizationIssue[]
  totalIssues: number
  totalTrafficLoss: number
}

type ExportFormat = "csv" | "pdf" | "json"

interface ExportOptions {
  format: ExportFormat
  includeSeverity: CannibalizationSeverity[]
  includeRecommendations: boolean
  includeTrafficData: boolean
  includePageDetails: boolean
  fileName: string
}

// ============================================
// CSV GENERATOR
// ============================================

function generateCSV(issues: CannibalizationIssue[], options: ExportOptions): string {
  const headers = [
    "Keyword",
    "Severity",
    "Type",
    "Traffic Loss",
    "Potential Gain",
    options.includeRecommendations && "Recommended Action",
    options.includeRecommendations && "Recommendation",
    options.includePageDetails && "Page 1 URL",
    options.includePageDetails && "Page 1 Position",
    options.includePageDetails && "Page 1 Traffic",
    options.includePageDetails && "Page 2 URL",
    options.includePageDetails && "Page 2 Position",
    options.includePageDetails && "Page 2 Traffic",
  ].filter(Boolean)

  const rows = issues.map(issue => {
    const row = [
      issue.keyword,
      getSeverityLabel(issue.severity),
      issue.type,
      issue.trafficLoss,
      issue.potentialGain,
    ]

    if (options.includeRecommendations) {
      row.push(getActionLabel(issue.recommendedAction), issue.recommendation)
    }

    if (options.includePageDetails) {
      const [page1, page2] = issue.pages
      row.push(
        page1?.url || "",
        page1?.currentRank || "",
        page1?.traffic || "",
        page2?.url || "",
        page2?.currentRank || "",
        page2?.traffic || ""
      )
    }

    return row.join(",")
  })

  return [headers.join(","), ...rows].join("\n")
}

// ============================================
// JSON GENERATOR
// ============================================

function generateJSON(issues: CannibalizationIssue[], options: ExportOptions): string {
  const exportData = issues.map(issue => {
    const data: Record<string, unknown> = {
      keyword: issue.keyword,
      severity: issue.severity,
      type: issue.type,
      trafficLoss: issue.trafficLoss,
      potentialGain: issue.potentialGain,
    }

    if (options.includeRecommendations) {
      data.recommendedAction = issue.recommendedAction
      data.recommendation = issue.recommendation
    }

    if (options.includePageDetails) {
      data.pages = issue.pages.map(p => ({
        url: p.url,
        title: p.title,
        position: p.currentRank,
        traffic: p.traffic,
      }))
    }

    return data
  })

  return JSON.stringify({
    exportDate: new Date().toISOString(),
    totalIssues: issues.length,
    totalTrafficLoss: issues.reduce((sum, i) => sum + i.trafficLoss, 0),
    issues: exportData,
  }, null, 2)
}

// ============================================
// COMPONENT
// ============================================

export function ExportReportDialog({
  open,
  onOpenChange,
  issues,
  totalIssues,
  totalTrafficLoss,
}: ExportReportDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    format: "csv",
    includeSeverity: ["critical", "high", "medium", "low"],
    includeRecommendations: true,
    includeTrafficData: true,
    includePageDetails: true,
    fileName: `cannibalization-report-${new Date().toISOString().split("T")[0]}`,
  })

  // Filter issues based on selected severities
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => options.includeSeverity.includes(issue.severity))
  }, [issues, options.includeSeverity])

  // Handle export
  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))

      let content: string
      let mimeType: string
      let extension: string

      switch (options.format) {
        case "csv":
          content = generateCSV(filteredIssues, options)
          mimeType = "text/csv"
          extension = "csv"
          break
        case "json":
          content = generateJSON(filteredIssues, options)
          mimeType = "application/json"
          extension = "json"
          break
        case "pdf":
          // For PDF, we'll generate a simple text version (in real app, use a PDF library)
          toast.info("PDF export coming soon! Downloading CSV instead.")
          content = generateCSV(filteredIssues, options)
          mimeType = "text/csv"
          extension = "csv"
          break
        default:
          content = generateCSV(filteredIssues, options)
          mimeType = "text/csv"
          extension = "csv"
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${options.fileName}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Report exported successfully! (${filteredIssues.length} issues)`)
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to export report")
    } finally {
      setIsExporting(false)
    }
  }

  // Toggle severity filter
  const toggleSeverity = (severity: CannibalizationSeverity) => {
    setOptions(prev => ({
      ...prev,
      includeSeverity: prev.includeSeverity.includes(severity)
        ? prev.includeSeverity.filter(s => s !== severity)
        : [...prev.includeSeverity, severity],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader className="pb-4 border-b border-border/50">
          <DialogTitle className="flex items-center gap-3 text-foreground">
            {/* Premium Icon */}
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-emerald-500/10 dark:from-emerald-500/30 dark:via-teal-500/20 dark:to-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20 dark:ring-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <FileDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div>
              <span className="text-lg font-semibold">Export Report</span>
              <p className="text-sm font-normal text-muted-foreground">
                Configure your export settings
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Export Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/10 border border-border/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <FileText className="h-4 w-4 text-foreground/60" />
                  <p className="text-2xl font-bold text-foreground tabular-nums">{filteredIssues.length}</p>
                </div>
                <p className="text-xs text-muted-foreground">Issues</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                    -{filteredIssues.reduce((sum, i) => sum + i.trafficLoss, 0).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Traffic Loss</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{filteredIssues.reduce((sum, i) => sum + i.potentialGain, 0).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Potential</p>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Export Format</Label>
            <Select
              value={options.format}
              onValueChange={(value: ExportFormat) => 
                setOptions(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger className="bg-muted/50 border-border text-foreground">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="csv" className="text-foreground focus:bg-accent">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                    CSV (Excel compatible)
                  </div>
                </SelectItem>
                <SelectItem value="json" className="text-foreground focus:bg-accent">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4 text-cyan-500" />
                    JSON
                  </div>
                </SelectItem>
                <SelectItem value="pdf" className="text-foreground focus:bg-accent">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-500" />
                    PDF (Coming Soon)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Name */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">File Name</Label>
            <Input
              value={options.fileName}
              onChange={(e) => setOptions(prev => ({ ...prev, fileName: e.target.value }))}
              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-emerald-500/20"
              placeholder="Enter file name..."
            />
          </div>

          <Separator className="bg-border/50" />

          {/* Severity Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-foreground font-medium">Include Severity Levels</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["critical", "high", "medium", "low"] as CannibalizationSeverity[]).map((severity) => (
                <button
                  key={severity}
                  onClick={() => toggleSeverity(severity)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    options.includeSeverity.includes(severity)
                      ? severity === "critical"
                        ? "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 ring-1 ring-red-500/10"
                        : severity === "high"
                          ? "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 ring-1 ring-amber-500/10"
                          : severity === "medium"
                            ? "bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 ring-1 ring-yellow-500/10"
                            : "bg-muted text-muted-foreground border border-border ring-1 ring-border/50"
                      : "bg-muted/50 text-muted-foreground border border-border/50 hover:bg-muted hover:border-border"
                  )}
                >
                  {options.includeSeverity.includes(severity) && (
                    <CheckCircle2 className="h-3 w-3 inline-block mr-1.5" />
                  )}
                  {getSeverityLabel(severity)}
                </button>
              ))}
            </div>
          </div>

          {/* Data Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <Label className="text-foreground font-medium">Include Data</Label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="recommendations"
                  checked={options.includeRecommendations}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, includeRecommendations: !!checked }))
                  }
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <label htmlFor="recommendations" className="text-sm text-foreground cursor-pointer">
                  Recommendations & Actions
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="pageDetails"
                  checked={options.includePageDetails}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, includePageDetails: !!checked }))
                  }
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <label htmlFor="pageDetails" className="text-sm text-foreground cursor-pointer">
                  Page URLs & Metrics
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-4 flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border hover:bg-accent w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || filteredIssues.length === 0}
            className={cn(
              "bg-gradient-to-r from-emerald-600 to-emerald-500",
              "hover:from-emerald-500 hover:to-emerald-400",
              "text-white shadow-lg shadow-emerald-500/20",
              "transition-all w-full sm:w-auto"
            )}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {filteredIssues.length} Issues
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
