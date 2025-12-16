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
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Zap,
  CheckCircle2,
  Circle,
  ArrowRight,
  ExternalLink,
  Copy,
  Loader2,
  Sparkles,
  AlertTriangle,
  Merge,
  CornerDownRight,
  FileX,
  FileEdit,
  Link,
  RefreshCw,
} from "lucide-react"
import type { CannibalizationIssue, CannibalizationAction } from "../types"
import { getActionLabel } from "../utils/cannibalization-utils"

// ============================================
// INTERFACES
// ============================================

interface FixIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issue: CannibalizationIssue | null
  onFixComplete: (issueId: string, status: "fixed" | "in-progress") => void
}

interface FixStep {
  id: string
  title: string
  description: string
  isCompleted: boolean
  code?: string
}

// ============================================
// ACTION ICONS
// ============================================

const ACTION_ICONS: Record<CannibalizationAction, React.ReactNode> = {
  merge: <Merge className="h-4 w-4" />,
  redirect: <CornerDownRight className="h-4 w-4" />,
  differentiate: <FileEdit className="h-4 w-4" />,
  canonical: <Link className="h-4 w-4" />,
  noindex: <FileX className="h-4 w-4" />,
  reoptimize: <RefreshCw className="h-4 w-4" />,
}

// ============================================
// GENERATE FIX STEPS
// ============================================

function generateFixSteps(issue: CannibalizationIssue): FixStep[] {
  const primary = issue.pages[0]
  const secondary = issue.pages[1]

  switch (issue.recommendedAction) {
    case "merge":
      return [
        {
          id: "step-1",
          title: "Analyze content from both pages",
          description: `Compare content from "${primary.title}" and "${secondary.title}" to identify unique sections.`,
          isCompleted: false,
        },
        {
          id: "step-2",
          title: "Create merged content outline",
          description: "Combine the best parts of both articles into a comprehensive outline.",
          isCompleted: false,
        },
        {
          id: "step-3",
          title: "Update primary page",
          description: `Add unique content from secondary page to "${primary.url}"`,
          isCompleted: false,
        },
        {
          id: "step-4",
          title: "Set up 301 redirect",
          description: "Redirect secondary URL to primary URL",
          code: `# Add to .htaccess or nginx config\nRedirect 301 ${secondary.url} ${primary.url}`,
          isCompleted: false,
        },
        {
          id: "step-5",
          title: "Update internal links",
          description: "Find and update all internal links pointing to the secondary URL.",
          isCompleted: false,
        },
        {
          id: "step-6",
          title: "Request indexing",
          description: "Submit updated primary URL to Google Search Console.",
          isCompleted: false,
        },
      ]

    case "redirect":
      return [
        {
          id: "step-1",
          title: "Review secondary page value",
          description: `Check if "${secondary.title}" has any unique content worth preserving.`,
          isCompleted: false,
        },
        {
          id: "step-2",
          title: "Add unique content to primary",
          description: "If secondary has unique sections, add them to primary page first.",
          isCompleted: false,
        },
        {
          id: "step-3",
          title: "Implement 301 redirect",
          description: "Set up permanent redirect from secondary to primary",
          code: `# .htaccess\nRedirect 301 ${secondary.url} ${primary.url}\n\n# nginx\nrewrite ^${secondary.url.replace(/https?:\/\/[^\/]+/, '')}$ ${primary.url} permanent;`,
          isCompleted: false,
        },
        {
          id: "step-4",
          title: "Update internal links",
          description: "Change all internal links from secondary to primary URL.",
          isCompleted: false,
        },
        {
          id: "step-5",
          title: "Monitor in GSC",
          description: "Check Google Search Console for redirect validation.",
          isCompleted: false,
        },
      ]

    case "canonical":
      return [
        {
          id: "step-1",
          title: "Add canonical tag to secondary",
          description: `Add canonical pointing to primary on "${secondary.url}"`,
          code: `<link rel="canonical" href="${primary.url}" />`,
          isCompleted: false,
        },
        {
          id: "step-2",
          title: "Verify implementation",
          description: "Use browser dev tools to confirm canonical tag is present.",
          isCompleted: false,
        },
        {
          id: "step-3",
          title: "Request re-indexing",
          description: "Submit secondary URL in GSC for Google to notice the canonical.",
          isCompleted: false,
        },
      ]

    case "noindex":
      return [
        {
          id: "step-1",
          title: "Add noindex meta tag",
          description: `Add noindex to "${secondary.url}" to remove from search`,
          code: `<meta name="robots" content="noindex, follow" />`,
          isCompleted: false,
        },
        {
          id: "step-2",
          title: "Or add X-Robots-Tag header",
          description: "Alternative server-side implementation",
          code: `# nginx\nadd_header X-Robots-Tag "noindex, follow";\n\n# Apache\nHeader set X-Robots-Tag "noindex, follow"`,
          isCompleted: false,
        },
        {
          id: "step-3",
          title: "Request removal (optional)",
          description: "Use GSC Removals tool for faster de-indexing.",
          isCompleted: false,
        },
      ]

    case "differentiate":
      return [
        {
          id: "step-1",
          title: "Identify unique angles",
          description: "Find different aspects of the topic each page can focus on.",
          isCompleted: false,
        },
        {
          id: "step-2",
          title: "Research new keywords",
          description: `Find long-tail variations for "${secondary.title}" to target.`,
          isCompleted: false,
        },
        {
          id: "step-3",
          title: "Rewrite secondary page",
          description: "Update content to focus on different search intent.",
          isCompleted: false,
        },
        {
          id: "step-4",
          title: "Update title and meta",
          description: "Change title tag, meta description, and H1 for new focus.",
          isCompleted: false,
        },
        {
          id: "step-5",
          title: "Monitor rankings",
          description: "Track both pages to ensure they target different keywords.",
          isCompleted: false,
        },
      ]

    case "reoptimize":
      return [
        {
          id: "step-1",
          title: "Research alternative keywords",
          description: `Find related keywords that "${secondary.title}" can target instead.`,
          isCompleted: false,
        },
        {
          id: "step-2",
          title: "Update page title",
          description: "Change title tag to target new keyword.",
          isCompleted: false,
        },
        {
          id: "step-3",
          title: "Rewrite H1 and headers",
          description: "Update all headings to reflect new keyword focus.",
          isCompleted: false,
        },
        {
          id: "step-4",
          title: "Update content",
          description: "Rewrite content sections to support new target keyword.",
          isCompleted: false,
        },
        {
          id: "step-5",
          title: "Request indexing",
          description: "Submit updated URL to GSC.",
          isCompleted: false,
        },
      ]

    default:
      return []
  }
}

// ============================================
// COMPONENT
// ============================================

export function FixIssueDialog({
  open,
  onOpenChange,
  issue,
  onFixComplete,
}: FixIssueDialogProps) {
  const [steps, setSteps] = useState<FixStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize steps when issue changes
  useState(() => {
    if (issue && open) {
      setSteps(generateFixSteps(issue))
      setCurrentStep(0)
    }
  })

  // Calculate progress
  const completedSteps = steps.filter(s => s.isCompleted).length
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0

  // Toggle step completion
  const toggleStep = useCallback((stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
    ))
  }, [])

  // Copy code to clipboard
  const copyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Code copied to clipboard!")
  }, [])

  // Mark as complete
  const handleMarkComplete = async () => {
    if (!issue) return

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const allComplete = steps.every(s => s.isCompleted)
    onFixComplete(issue.id, allComplete ? "fixed" : "in-progress")
    
    toast.success(
      allComplete 
        ? "Issue marked as fixed!" 
        : "Progress saved - marked as in progress"
    )
    
    setIsSubmitting(false)
    onOpenChange(false)
  }

  if (!issue) return null

  // Initialize steps if needed
  if (steps.length === 0 && open) {
    setSteps(generateFixSteps(issue))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="p-1.5 rounded-lg bg-cyan-500/20">
              {ACTION_ICONS[issue.recommendedAction]}
            </div>
            Fix: {issue.keyword}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Follow these steps to resolve the cannibalization issue
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Issue Summary */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  {getActionLabel(issue.recommendedAction)}
                </Badge>
                <span className="text-xs text-slate-500">
                  {issue.pages.length} pages competing
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-red-400">
                  -{issue.trafficLoss.toLocaleString()} visits/mo
                </p>
                <p className="text-xs text-emerald-400">
                  +{issue.potentialGain.toLocaleString()} potential
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300">{issue.recommendation}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Progress</span>
              <span className="text-white font-medium">
                {completedSteps} / {steps.length} steps
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-800" />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  step.isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-slate-800/50 border-slate-700"
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="mt-0.5"
                  >
                    {step.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-500" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Step {index + 1}</span>
                    </div>
                    <h4 className={cn(
                      "text-sm font-medium mt-1",
                      step.isCompleted ? "text-emerald-400" : "text-white"
                    )}>
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {step.description}
                    </p>

                    {/* Code Block */}
                    {step.code && (
                      <div className="mt-3 relative">
                        <pre className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 overflow-x-auto">
                          <code>{step.code}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 h-6 text-slate-400 hover:text-white"
                          onClick={() => copyCode(step.code!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Checkbox */}
                  <Checkbox
                    checked={step.isCompleted}
                    onCheckedChange={() => toggleStep(step.id)}
                    className="border-slate-600"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pages Reference */}
          <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Affected Pages
            </h4>
            <div className="space-y-2">
              {issue.pages.map((page, index) => (
                <div key={page.url} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    {index === 0 ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Primary</Badge>
                    ) : (
                      <Badge className="bg-slate-500/20 text-slate-400 text-[10px]">Secondary</Badge>
                    )}
                    <span className="text-slate-300 truncate">{page.title}</span>
                  </div>
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-800 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMarkComplete}
            disabled={isSubmitting}
            className={cn(
              completedSteps === steps.length
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-cyan-600 hover:bg-cyan-500",
              "text-white"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : completedSteps === steps.length ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Fixed
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Save Progress
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
