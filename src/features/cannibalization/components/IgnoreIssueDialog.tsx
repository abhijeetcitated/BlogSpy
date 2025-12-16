"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { EyeOff, AlertTriangle } from "lucide-react"
import type { CannibalizationIssue } from "../types"
import { getSeverityLabel } from "../utils/cannibalization-utils"

// ============================================
// INTERFACES
// ============================================

interface IgnoreIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issue: CannibalizationIssue | null
  onIgnore: (issueId: string) => void
}

// ============================================
// COMPONENT
// ============================================

export function IgnoreIssueDialog({
  open,
  onOpenChange,
  issue,
  onIgnore,
}: IgnoreIssueDialogProps) {
  if (!issue) return null

  const handleIgnore = () => {
    onIgnore(issue.id)
    toast.success(`"${issue.keyword}" ignored. You can restore it from settings.`)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-900 border-slate-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-white">
            <EyeOff className="h-5 w-5 text-yellow-400" />
            Ignore This Issue?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-slate-400">
                Are you sure you want to ignore the cannibalization issue for:
              </p>
              
              {/* Issue Details */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold text-white">
                    {issue.keyword}
                  </span>
                  <Badge 
                    className={
                      issue.severity === "critical"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : issue.severity === "high"
                          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          : issue.severity === "medium"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                    }
                  >
                    {getSeverityLabel(issue.severity)}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">
                  {issue.pages.length} competing pages • 
                  <span className="text-red-400"> -{issue.trafficLoss.toLocaleString()} traffic/mo</span>
                </p>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-400">
                    This issue will be hidden from your dashboard.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    You can restore ignored issues from Settings → Ignored Issues
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleIgnore}
            className="bg-yellow-600 hover:bg-yellow-500 text-white"
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Ignore Issue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
