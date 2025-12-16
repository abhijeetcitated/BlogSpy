"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  Zap,
  Clock,
  Link2,
  FileText,
  ExternalLink,
} from "lucide-react"
import type { CannibalizationIssue } from "../types"
import { SeverityBadge } from "./SeverityBadge"
import { 
  getSeverityBgColor, 
  getActionLabel, 
  generateFixSuggestion 
} from "../utils/cannibalization-utils"

interface IssueCardProps {
  issue: CannibalizationIssue
  isExpanded: boolean
  onToggle: () => void
  onFixNow?: () => void
  onViewPages?: () => void
  onIgnore?: () => void
  status?: "fixed" | "in-progress" | "pending"
  isFixed?: boolean
  isInProgress?: boolean
}

export function IssueCard({
  issue,
  isExpanded,
  onToggle,
  onFixNow,
  onViewPages,
  onIgnore,
  status,
  isFixed,
  isInProgress,
}: IssueCardProps) {
  const fixSuggestion = generateFixSuggestion(issue)
  const resolved = isFixed || status === "fixed"
  const inProgress = isInProgress || status === "in-progress"
  
  // Get card styles based on status
  const getCardStyles = () => {
    if (resolved) {
      return "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/30"
    }
    if (inProgress) {
      return "bg-cyan-500/5 dark:bg-cyan-500/10 border-cyan-500/20 dark:border-cyan-500/30"
    }
    // Default severity-based styling
    switch (issue.severity) {
      case "critical":
        return "bg-red-500/5 dark:bg-red-500/10 border-red-500/20 dark:border-red-500/30"
      case "high":
        return "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 dark:border-amber-500/30"
      case "medium":
        return "bg-yellow-500/5 dark:bg-yellow-500/10 border-yellow-500/20 dark:border-yellow-500/30"
      default:
        return "bg-card/50 border-border/50"
    }
  }
  
  return (
    <div className={cn(
      "rounded-xl border transition-all duration-200",
      getCardStyles(),
      isExpanded && "ring-1 ring-primary/20 dark:ring-primary/30"
    )}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-3 sm:p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Status or Severity Badge */}
          {resolved ? (
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/30 shrink-0">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 dark:text-emerald-400" />
            </div>
          ) : inProgress ? (
            <div className="p-1.5 sm:p-2 rounded-lg bg-cyan-500/20 dark:bg-cyan-500/30 shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-500 dark:text-cyan-400" />
            </div>
          ) : (
            <SeverityBadge severity={issue.severity} />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn(
                "text-sm sm:text-base font-semibold truncate",
                resolved ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
              )}>
                {issue.keyword}
              </h3>
              {resolved && (
                <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] border-emerald-500/30">
                  Fixed
                </Badge>
              )}
              {inProgress && (
                <Badge className="bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] border-cyan-500/30">
                  In Progress
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {issue.pages.length} pages competing
              </span>
              <span className="mx-1.5">•</span>
              <span className="tabular-nums">{issue.searchVolume.toLocaleString()} monthly searches</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right hidden xs:block">
            <p className={cn(
              "text-xs sm:text-sm font-medium tabular-nums",
              resolved ? "text-muted-foreground line-through" : "text-red-500 dark:text-red-400"
            )}>
              -{issue.trafficLoss.toLocaleString()} visits/mo
            </p>
            <p className={cn(
              "text-[11px] sm:text-xs tabular-nums",
              "text-emerald-600 dark:text-emerald-400"
            )}>
              {resolved ? "Recovered!" : `+${issue.potentialGain.toLocaleString()} potential`}
            </p>
          </div>
          
          <ChevronDown className={cn(
            "h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform shrink-0",
            isExpanded && "rotate-180"
          )} />
        </div>
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4 border-t border-border/50">
          {/* Competing Pages */}
          <div className="mt-3 sm:mt-4">
            <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Competing Pages
            </h4>
            <div className="space-y-2">
              {issue.pages.map((page) => (
                <div
                  key={page.url}
                  className={cn(
                    "p-2.5 sm:p-3 rounded-lg border transition-all",
                    page.isPrimary 
                      ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/30" 
                      : "bg-muted/30 dark:bg-muted/20 border-border/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {page.isPrimary && (
                          <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] border-emerald-500/30">
                            Primary
                          </Badge>
                        )}
                        <span className="text-xs sm:text-sm text-muted-foreground tabular-nums">
                          Rank #{page.currentRank || "50+"}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-medium text-foreground mt-1 truncate">
                        {page.title}
                      </p>
                      <a 
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-muted-foreground hover:text-primary truncate flex items-center gap-1 mt-0.5 group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="truncate">{page.url}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </a>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className="text-sm sm:text-base font-medium text-foreground tabular-nums">
                        {page.traffic.toLocaleString()}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">visits/mo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                    <span className="tabular-nums">{page.wordCount.toLocaleString()} words</span>
                    <span className="tabular-nums">{page.backlinks} backlinks</span>
                    <span className="tabular-nums">PA: {page.pageAuthority}</span>
                    <span>Updated: {new Date(page.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recommendation */}
          <div className={cn(
            "p-3 sm:p-4 rounded-xl border",
            resolved 
              ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/30"
              : "bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 dark:from-cyan-500/10 dark:to-emerald-500/10 border-cyan-500/20 dark:border-cyan-500/30"
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-1.5 sm:p-2 rounded-lg shrink-0",
                resolved ? "bg-emerald-500/20 dark:bg-emerald-500/30" : "bg-cyan-500/20 dark:bg-cyan-500/30"
              )}>
                {resolved ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <Sparkles className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="text-sm sm:text-base font-semibold text-foreground">
                    {resolved ? "Issue Resolved" : `Recommended: ${getActionLabel(issue.recommendedAction)}`}
                  </h4>
                  {!resolved && (
                    <>
                      <Badge variant="outline" className="text-[11px] sm:text-xs border-border/50">
                        {fixSuggestion.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-[11px] sm:text-xs border-border/50">
                        ~{fixSuggestion.estimatedTime}
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {resolved 
                    ? "This cannibalization issue has been fixed. Traffic should recover within 2-4 weeks."
                    : issue.recommendation
                  }
                </p>
                
                {!resolved && (
                  <div className="space-y-1.5">
                    {fixSuggestion.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {!resolved && (
              <>
                <Button
                  size="sm"
                  className={cn(
                    "bg-gradient-to-r from-emerald-600 to-emerald-500",
                    "hover:from-emerald-500 hover:to-emerald-400",
                    "text-white shadow-lg shadow-emerald-500/20",
                    "transition-all duration-200"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onFixNow?.()
                  }}
                >
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  Fix Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border hover:bg-accent"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewPages?.()
                  }}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  <span className="hidden sm:inline">View Pages</span>
                  <span className="sm:hidden">View</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    onIgnore?.()
                  }}
                >
                  <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                  Ignore
                </Button>
              </>
            )}
            {resolved && (
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewPages?.()
                }}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                View Details
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
