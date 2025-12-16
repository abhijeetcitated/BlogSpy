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
        "p-3 rounded-lg border transition-all",
        isError
          ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
          : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
      )}
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-foreground">{issue.title}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title="Copy issue details"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
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
                    "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                    isError
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                  )}
                >
                  <Sparkles className="h-3 w-3" />
                  Fix with AI
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{issue.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-muted/50 rounded text-muted-foreground">
              {issue.element}
            </span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded",
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
    <div className="p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground mb-1">{issue.title}</p>
          <p className="text-xs text-muted-foreground">{issue.description}</p>
        </div>
      </div>
    </div>
  )
}

export function IssuesPanel({ issues, onFixWithAI }: IssuesPanelProps) {
  const [activeTab, setActiveTab] = useState<IssueTabType>("errors")

  return (
    <div className="col-span-5 border-r border-border bg-card/30 overflow-y-auto">
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as IssueTabType)} className="w-full">
          <TabsList className="grid grid-cols-3 bg-muted/50 p-1 h-auto">
            <TabsTrigger
              value="errors"
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-xs py-1.5"
            >
              <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
              Errors ({issues.errors.length})
            </TabsTrigger>
            <TabsTrigger
              value="warnings"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-xs py-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Warnings ({issues.warnings.length})
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
