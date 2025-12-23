"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, AlertCircle, CheckCircle2, Sparkles, Copy, Check, Code2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { Issue, PassedIssue, IssuesData, CurrentIssue, IssueTabType } from "../types"

interface IssuesPanelProps {
  issues: IssuesData
  onFixWithAI: (issue: CurrentIssue) => void
}

function IssueCard({ 
  issue, 
  type, 
  onFixWithAI 
}: { 
  issue: Issue
  type: "error" | "warning"
  onFixWithAI: (issue: CurrentIssue) => void 
}) {
  const [copied, setCopied] = useState(false)
  const isError = type === "error"

  const handleCopy = async () => {
    const text = `${issue.title}\n${issue.description}\nElement: ${issue.element}\nImpact: ${issue.impact}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div
      className={cn(
        "p-2 sm:p-3 rounded-lg border transition-all touch-manipulation",
        isError
          ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40 active:border-red-500/50"
          : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40 active:border-amber-500/50"
      )}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {isError ? (
          <AlertCircle className="h-4 w-4 sm:h-4 sm:w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle className="h-4 w-4 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
            <p className="text-xs sm:text-sm font-medium text-foreground">{issue.title}</p>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleCopy}
                className="p-1.5 sm:p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted transition-colors touch-manipulation min-h-[36px] sm:min-h-0 min-w-[36px] sm:min-w-0 flex items-center justify-center"
                title="Copy issue details"
              >
                {copied ? (
                  <Check className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                )}
              </button>
              {/* Show Schema Generator link for schema-related issues */}
              {issue.title.toLowerCase().includes("schema") ? (
                <Link
                  href="/dashboard/creation/schema-generator"
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                    "bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
                  )}
                >
                  <Code2 className="h-3 w-3" />
                  Add Schema
                </Link>
              ) : (
                <button
                  onClick={() => onFixWithAI({ ...issue, type })}
                  className={cn(
                    "flex items-center gap-1 px-2 sm:px-2 py-1.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium transition-colors touch-manipulation min-h-[36px] sm:min-h-0",
                    isError
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 active:bg-red-500/30"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 active:bg-amber-500/30"
                  )}
                >
                  <Sparkles className="h-3 w-3 sm:h-3 sm:w-3" />
                  <span className="hidden xs:inline">Fix with AI</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 line-clamp-2">{issue.description}</p>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-muted/50 rounded text-muted-foreground truncate max-w-[200px]">
              {issue.element}
            </span>
            <span
              className={cn(
                "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap",
                issue.impact === "High"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : issue.impact === "Medium"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              )}
            >
              {issue.impact} Impact
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PassedIssueCard({ issue }: { issue: PassedIssue }) {
  return (
    <div className="p-2 sm:p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/30 transition-colors">
      <div className="flex items-start gap-2 sm:gap-3">
        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-foreground mb-1">{issue.title}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{issue.description}</p>
        </div>
      </div>
    </div>
  )
}

export function IssuesPanel({ issues, onFixWithAI }: IssuesPanelProps) {
  const [activeTab, setActiveTab] = useState<IssueTabType>("errors")

  return (
    <div className="col-span-5 border-r border-border bg-card/30 overflow-y-auto">
      <div className="p-2 sm:p-3 md:p-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as IssueTabType)} className="w-full">
          <TabsList className="grid grid-cols-3 bg-muted/50 p-0.5 sm:p-1 h-auto gap-0.5 sm:gap-1">
            <TabsTrigger
              value="errors"
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-[10px] sm:text-xs py-2 sm:py-1.5 touch-manipulation min-h-[44px] sm:min-h-0 flex items-center justify-center"
            >
              <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
              <span className="hidden xs:inline">Errors</span> ({issues.errors.length})
            </TabsTrigger>
            <TabsTrigger
              value="warnings"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-[10px] sm:text-xs py-2 sm:py-1.5 touch-manipulation min-h-[44px] sm:min-h-0 flex items-center justify-center"
            >
              <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
              <span className="hidden xs:inline">Warnings</span> ({issues.warnings.length})
            </TabsTrigger>
            <TabsTrigger
              value="passed"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-xs py-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Passed ({issues.passed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="errors" className="mt-4 space-y-3">
            {issues.errors.map((issue, index) => (
              <IssueCard key={index} issue={issue} type="error" onFixWithAI={onFixWithAI} />
            ))}
          </TabsContent>

          <TabsContent value="warnings" className="mt-4 space-y-3">
            {issues.warnings.map((issue, index) => (
              <IssueCard key={index} issue={issue} type="warning" onFixWithAI={onFixWithAI} />
            ))}
          </TabsContent>

          <TabsContent value="passed" className="mt-4 space-y-3">
            {issues.passed.map((issue, index) => (
              <PassedIssueCard key={index} issue={issue} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
