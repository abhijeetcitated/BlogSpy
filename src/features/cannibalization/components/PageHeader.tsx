"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  RefreshCw,
  Download,
  Loader2,
  Globe,
  Layers,
  Plus,
  Sparkles,
} from "lucide-react"

interface PageHeaderProps {
  isScanning: boolean
  onRescan: () => void
  onNewScan?: () => void
  onExport?: () => void
  onBulkActions?: () => void
  currentDomain?: string
}

export function PageHeader({
  isScanning,
  onRescan,
  onNewScan,
  onExport,
  onBulkActions,
  currentDomain,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Title Section */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            {/* Premium Icon */}
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-linear-to-br from-emerald-500/20 via-cyan-500/20 to-emerald-500/10 dark:from-emerald-500/30 dark:via-cyan-500/20 dark:to-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20 dark:ring-emerald-500/30">
                <Sparkles className="h-4.5 w-4.5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
              Cannibalization Detector
            </h1>
          </div>
          {currentDomain && (
            <Badge className="bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 dark:border-cyan-500/30 font-medium">
              <Globe className="h-3 w-3 mr-1.5" />
              {currentDomain}
            </Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Find and fix pages competing for the same keywords
        </p>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-2 sm:gap-2 flex-wrap">
        {/* New Scan Button - Primary Action */}
        <Button
          onClick={onNewScan}
          size="sm"
          className={cn(
            "bg-linear-to-r from-emerald-600 to-emerald-500",
            "hover:from-emerald-500 hover:to-emerald-400",
            "text-white shadow-lg shadow-emerald-500/20",
            "dark:shadow-emerald-500/10",
            "transition-all duration-200 hover:scale-[1.02]"
          )}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Scan
        </Button>

        {/* Rescan Button */}
        <Button
          onClick={onRescan}
          disabled={isScanning}
          size="sm"
          variant="outline"
          className="border-border hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {isScanning ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1.5" />
          )}
          <span className="hidden xs:inline">{isScanning ? "Scanning..." : "Rescan"}</span>
          <span className="xs:hidden">{isScanning ? "..." : ""}</span>
        </Button>

        {/* Spacer for mobile - pushes Bulk & Export to end */}
        <div className="flex-1 sm:hidden" />

        {/* Bulk Actions Button */}
        <Button
          onClick={onBulkActions}
          size="sm"
          variant="outline"
          className="border-border hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Layers className="h-4 w-4 mr-1.5" />
          Bulk Actions
        </Button>

        {/* Export Button */}
        <Button
          onClick={onExport}
          size="sm"
          variant="outline"
          className="border-border hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Download className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </div>
  )
}
