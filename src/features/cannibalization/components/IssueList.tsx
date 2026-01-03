"use client"

import { Shield, SearchX, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CannibalizationIssue } from "../types"
import { IssueCard } from "./IssueCard"

interface IssueWithStatus extends CannibalizationIssue {
  status?: "fixed" | "in-progress" | "pending"
}

interface IssueListProps {
  issues: IssueWithStatus[]
  expandedIssues: Set<string>
  onToggleExpand: (issueId: string) => void
  searchQuery: string
  filterSeverity: string
  onFixNow?: (issue: CannibalizationIssue) => void
  onViewPages?: (issue: CannibalizationIssue) => void
  onIgnore?: (issue: CannibalizationIssue) => void
  fixedIssues?: Set<string>
  inProgressIssues?: Set<string>
}

export function IssueList({ 
  issues, 
  expandedIssues, 
  onToggleExpand,
  searchQuery,
  filterSeverity,
  onFixNow,
  onViewPages,
  onIgnore,
  fixedIssues,
  inProgressIssues,
}: IssueListProps) {
  // Empty state with filters applied
  if (issues.length === 0 && (searchQuery || filterSeverity !== "all")) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-12 sm:py-16 text-center",
        "rounded-xl border border-dashed border-border/50",
        "bg-muted/10 dark:bg-muted/5"
      )}>
        <div className={cn(
          "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4",
          "bg-muted/30 dark:bg-muted/20"
        )}>
          <SearchX className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">No Matches Found</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md px-4">
          No issues match your current filters. Try adjusting your search or filter criteria.
        </p>
      </div>
    )
  }

  // Empty state - no issues at all (healthy site)
  if (issues.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-12 sm:py-16 text-center",
        "rounded-xl",
        "bg-linear-to-br from-emerald-500/5 to-cyan-500/5",
        "dark:from-emerald-500/10 dark:to-cyan-500/10",
        "border border-emerald-500/20 dark:border-emerald-500/30"
      )}>
        <div className={cn(
          "relative w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-3 sm:mb-4",
          "bg-linear-to-br from-emerald-500/20 to-cyan-500/20",
          "dark:from-emerald-500/30 dark:to-cyan-500/30"
        )}>
          <Shield className="h-7 w-7 sm:h-10 sm:w-10 text-emerald-500 dark:text-emerald-400" />
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 text-cyan-500 dark:text-cyan-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">No Cannibalization Found!</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md px-4">
          Your site is healthy with no keyword cannibalization detected. Keep up the good work!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {issues.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          isExpanded={expandedIssues.has(issue.id)}
          onToggle={() => onToggleExpand(issue.id)}
          onFixNow={onFixNow ? () => onFixNow(issue) : undefined}
          onViewPages={onViewPages ? () => onViewPages(issue) : undefined}
          onIgnore={onIgnore ? () => onIgnore(issue) : undefined}
          status={issue.status}
          isFixed={fixedIssues?.has(issue.id)}
          isInProgress={inProgressIssues?.has(issue.id)}
        />
      ))}
    </div>
  )
}
