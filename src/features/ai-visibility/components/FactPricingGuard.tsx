"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlatformIcons, AI_PLATFORMS } from "../constants"

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface DefenseLogEntry {
  id: string
  platform: string
  type: string
  status: "error" | "accurate" | "outdated"
  message: string
  detail: string
  timestamp: string
}

export interface FactPricingGuardProps {
  entries?: DefenseLogEntry[]
  isDemoMode?: boolean
  onRunCheck?: () => void
  isChecking?: boolean
  lastCheckedAt?: string | null
}

// Sample data for demo mode
const SAMPLE_DEFENSE_LOG: DefenseLogEntry[] = [
  {
    id: "1",
    platform: "chatgpt",
    type: "pricing",
    status: "error",
    message: "Pricing Error ($0 detected)",
    detail: "AI showing free tier when your cheapest plan is $29/mo",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    platform: "perplexity",
    type: "fact",
    status: "accurate",
    message: "Accurate Info",
    detail: "Correct company description and features",
    timestamp: "4 hours ago",
  },
  {
    id: "3",
    platform: "gemini",
    type: "feature",
    status: "outdated",
    message: "Outdated Feature List",
    detail: "Missing 3 new features launched last month",
    timestamp: "6 hours ago",
  },
  {
    id: "4",
    platform: "claude",
    type: "fact",
    status: "accurate",
    message: "Accurate Info",
    detail: "Correct founding date and team size",
    timestamp: "8 hours ago",
  },
]

export function FactPricingGuard({
  entries,
  isDemoMode = false,
  onRunCheck,
  isChecking = false,
  lastCheckedAt,
}: FactPricingGuardProps) {
  // Use real entries or demo data
  const displayEntries = entries && entries.length > 0
    ? entries
    : isDemoMode
      ? SAMPLE_DEFENSE_LOG
      : []

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "error":
        return {
          icon: AlertTriangle,
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          label: "Error",
        }
      case "accurate":
        return {
          icon: CheckCircle2,
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
          label: "Verified",
        }
      case "outdated":
        return {
          icon: XCircle,
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          label: "Outdated",
        }
      default:
        return {
          icon: CheckCircle2,
          color: "text-muted-foreground",
          bgColor: "bg-muted/10",
          borderColor: "border-muted-foreground/30",
          label: "Unknown",
        }
    }
  }

  const errorCount = displayEntries.filter(l => l.status === "error").length
  const outdatedCount = displayEntries.filter(l => l.status === "outdated").length

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="truncate">Fact & Pricing Guard</span>
          </CardTitle>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {errorCount > 0 && (
              <Badge variant="outline" className="text-red-400 border-red-400/30 text-[9px] sm:text-xs px-1.5 sm:px-2 h-5 sm:h-auto">
                {errorCount} Error{errorCount > 1 ? 's' : ''}
              </Badge>
            )}
            {outdatedCount > 0 && (
              <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-[9px] sm:text-xs px-1.5 sm:px-2 h-5 sm:h-auto">
                {outdatedCount} Outdated
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs" onClick={onRunCheck} disabled={isChecking}>
              <RefreshCw className={`h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 ${isChecking ? "animate-spin" : ""}`} />
              <span className="hidden xs:inline">{isChecking ? "Checking…" : "Verify All"}</span>
              <span className="xs:hidden">{isChecking ? "…" : "Verify"}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        {displayEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Info className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No fact checks yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Run a scan first to check AI accuracy about your brand
            </p>
          </div>
        ) : (
        <div className="space-y-2">
          {displayEntries.map((log) => {
            const platform = AI_PLATFORMS[log.platform]
            const statusConfig = getStatusConfig(log.status)
            const StatusIcon = statusConfig.icon
            const IconRenderer = PlatformIcons[log.platform]

            return (
              <div
                key={log.id}
                className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border ${statusConfig.borderColor} ${statusConfig.bgColor}`}
              >
                {/* Status Icon */}
                <StatusIcon className={`h-3.5 w-3.5 sm:h-5 sm:w-5 ${statusConfig.color} shrink-0 mt-0.5`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {/* Platform */}
                    <span className={`${platform.color} [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4`}>
                      {IconRenderer && IconRenderer()}
                    </span>
                    <span className={`text-[11px] sm:text-sm font-medium ${platform.color}`}>
                      {platform.name}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground hidden xs:inline">•</span>
                    <span className={`text-[10px] sm:text-sm font-medium ${statusConfig.color}`}>
                      {log.message}
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {log.detail}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-[9px] sm:text-xs text-muted-foreground shrink-0 hidden sm:block">
                  {log.timestamp}
                </span>
              </div>
            )
          })}
        </div>
        )}

        {/* Footer */}
        {displayEntries.length > 0 && (
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border flex-wrap">
          <p className="text-[9px] sm:text-xs text-muted-foreground">
            Last scan: {lastCheckedAt || (isDemoMode ? "2 hours ago" : "Never")}
          </p>
          <Button variant="outline" size="sm" className="h-6 sm:h-7 text-[10px] sm:text-xs px-2 sm:px-3">
            View Report
          </Button>
        </div>
        )}
      </CardContent>
    </Card>
  )
}
