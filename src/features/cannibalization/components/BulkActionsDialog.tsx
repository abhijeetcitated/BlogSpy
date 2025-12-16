"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Layers,
  CheckCircle2,
  Loader2,
  EyeOff,
  ArrowRight,
  Target,
  TrendingUp,
  TrendingDown,
  ListChecks,
} from "lucide-react"
import type { CannibalizationIssue, CannibalizationAction } from "../types"
import { getSeverityLabel, getActionLabel } from "../utils/cannibalization-utils"

// ============================================
// INTERFACES
// ============================================

interface BulkActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issues: CannibalizationIssue[]
  selectedIds: string[]
  onBulkAction: (ids: string[], action: "fix" | "ignore" | "in-progress") => void
}

// ============================================
// COMPONENT
// ============================================

export function BulkActionsDialog({
  open,
  onOpenChange,
  issues,
  selectedIds,
  onBulkAction,
}: BulkActionsDialogProps) {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedIds)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)

  // Get selected issues
  const selectedIssues = issues.filter(i => localSelected.includes(i.id))
  
  // Calculate totals
  const totalTrafficLoss = selectedIssues.reduce((sum, i) => sum + i.trafficLoss, 0)
  const totalPotentialGain = selectedIssues.reduce((sum, i) => sum + i.potentialGain, 0)

  // Group by action
  const groupedByAction = selectedIssues.reduce((acc, issue) => {
    const action = issue.recommendedAction
    if (!acc[action]) acc[action] = []
    acc[action].push(issue)
    return acc
  }, {} as Record<CannibalizationAction, CannibalizationIssue[]>)

  // Toggle issue selection
  const toggleIssue = useCallback((id: string) => {
    setLocalSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }, [])

  // Select all
  const selectAll = () => {
    setLocalSelected(issues.map(i => i.id))
  }

  // Clear all
  const clearAll = () => {
    setLocalSelected([])
  }

  // Handle bulk action
  const handleBulkAction = async (action: "fix" | "ignore" | "in-progress") => {
    if (localSelected.length === 0) {
      toast.error("Please select at least one issue")
      return
    }

    setIsProcessing(true)
    setProcessedCount(0)

    // Simulate processing each issue
    for (let i = 0; i < localSelected.length; i++) {
      await new Promise(r => setTimeout(r, 200))
      setProcessedCount(i + 1)
    }

    onBulkAction(localSelected, action)
    
    const actionText = action === "fix" ? "marked as fixed" : action === "ignore" ? "ignored" : "marked as in progress"
    toast.success(`${localSelected.length} issues ${actionText}`)
    
    setIsProcessing(false)
    setProcessedCount(0)
    onOpenChange(false)
  }

  const progress = isProcessing ? (processedCount / localSelected.length) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-card border-border">
        <DialogHeader className="pb-4 border-b border-border/50">
          <DialogTitle className="flex items-center gap-3 text-foreground">
            {/* Premium Icon */}
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-cyan-500/10 dark:from-cyan-500/30 dark:via-blue-500/20 dark:to-cyan-500/10 flex items-center justify-center ring-1 ring-cyan-500/20 dark:ring-cyan-500/30 shadow-lg shadow-cyan-500/10">
                <Layers className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-cyan-500 ring-2 ring-card" />
            </div>
            <div>
              <span className="text-lg font-semibold">Bulk Actions</span>
              <p className="text-sm font-normal text-muted-foreground">
                Select issues to perform bulk operations
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-4 space-y-4">
          {/* Summary Stats */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/10 border border-border/50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Target className="h-4 w-4 text-cyan-500" />
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">{localSelected.length}</p>
                </div>
                <p className="text-xs text-muted-foreground">Selected</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <ListChecks className="h-4 w-4 text-foreground/60" />
                  <p className="text-2xl font-bold text-foreground tabular-nums">{issues.length}</p>
                </div>
                <p className="text-xs text-muted-foreground">Total Issues</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">-{totalTrafficLoss.toLocaleString()}</p>
                </div>
                <p className="text-xs text-muted-foreground">Traffic Loss</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">+{totalPotentialGain.toLocaleString()}</p>
                </div>
                <p className="text-xs text-muted-foreground">Potential</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="border-border hover:bg-accent hover:text-accent-foreground h-8"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="border-border hover:bg-accent hover:text-accent-foreground h-8"
              >
                Clear
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{localSelected.length}</span> of <span className="font-medium text-foreground">{issues.length}</span> selected
            </span>
          </div>

          {/* Progress Bar (when processing) */}
          {isProcessing && (
            <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/10 border border-cyan-500/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                  Processing issues...
                </span>
                <span className="font-medium text-foreground tabular-nums">{processedCount} / {localSelected.length}</span>
              </div>
              <Progress value={progress} className="h-2 bg-muted" />
            </div>
          )}

          {/* Issues List */}
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => toggleIssue(issue.id)}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all duration-200",
                    localSelected.includes(issue.id)
                      ? "bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/30 dark:border-cyan-500/40 ring-1 ring-cyan-500/20"
                      : "bg-muted/30 dark:bg-muted/20 border-border/50 hover:border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={localSelected.includes(issue.id)}
                      onCheckedChange={() => toggleIssue(issue.id)}
                      className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {issue.keyword}
                        </span>
                        <Badge 
                          className={cn(
                            "text-[10px] font-medium",
                            issue.severity === "critical"
                              ? "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20"
                              : issue.severity === "high"
                                ? "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : issue.severity === "medium"
                                  ? "bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                                  : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {getSeverityLabel(issue.severity)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {issue.pages.length} pages • {getActionLabel(issue.recommendedAction)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 tabular-nums">
                        -{issue.trafficLoss.toLocaleString()}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +{issue.potentialGain.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Action Breakdown */}
          {localSelected.length > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/50">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Recommended Actions Breakdown
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(groupedByAction).map(([action, actionIssues]) => (
                  <Badge
                    key={action}
                    className="bg-muted text-foreground border-border font-medium"
                  >
                    {getActionLabel(action as CannibalizationAction)}: {actionIssues.length}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-4 flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="border-border hover:bg-accent w-full sm:w-auto order-4 sm:order-1"
          >
            Cancel
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-1 sm:order-2">
            <Button
              variant="outline"
              onClick={() => handleBulkAction("ignore")}
              disabled={isProcessing || localSelected.length === 0}
              className="border-yellow-500/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 w-full sm:w-auto"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Ignore
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkAction("in-progress")}
              disabled={isProcessing || localSelected.length === 0}
              className="border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 w-full sm:w-auto"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              In Progress
            </Button>
            <Button
              onClick={() => handleBulkAction("fix")}
              disabled={isProcessing || localSelected.length === 0}
              className={cn(
                "bg-gradient-to-r from-emerald-600 to-emerald-500",
                "hover:from-emerald-500 hover:to-emerald-400",
                "text-white shadow-lg shadow-emerald-500/20",
                "transition-all w-full sm:w-auto"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Fixed
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
