/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ TECH AUDIT WIDGET - AI Readiness Checker Component
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Interactive widget to scan websites for AI Agent crawlability.
 * Checks robots.txt, llms.txt, and Schema.org markup.
 * 
 * Features:
 * - Domain input with validation
 * - Real-time audit with loading state
 * - Visual results with pass/fail indicators
 * - AI Readiness Score badge
 * 
 * @example
 * ```tsx
 * import { TechAuditWidget } from "@/features/ai-visibility/components"
 * 
 * export default function Page() {
 *   return <TechAuditWidget />
 * }
 * ```
 */

"use client"

import { useState, useTransition } from "react"
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Search, 
  Shield, 
  FileText, 
  Code2,
  AlertCircle,
  ExternalLink,
  Bot,
  RotateCcw
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { runTechAudit } from "../actions/run-audit"
import type { TechAuditResult, BotAccessStatus, SchemaValidation } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Status indicator for individual check items.
 */
function StatusIndicator({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {passed ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span className={passed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
        {label}
      </span>
    </div>
  )
}

/**
 * Score badge with color coding based on score value.
 * Hero Metric style for maximum visual impact.
 */
function ScoreBadge({ score }: { score: number }) {
  let colorClass = ""
  
  if (score >= 80) {
    colorClass = "text-green-500"
  } else if (score >= 50) {
    colorClass = "text-yellow-500"
  } else {
    colorClass = "text-red-500"
  }

  return (
    <div className="text-center">
      <span className={`text-5xl font-extrabold tracking-tight ${colorClass}`}>
        {score}%
      </span>
      <p className="text-xs text-muted-foreground mt-1">AI Ready</p>
    </div>
  )
}

/**
 * Individual bot access row.
 */
function BotAccessRow({ bot }: { bot: BotAccessStatus }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-help">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{bot.botName}</span>
              <span className="text-xs text-muted-foreground">({bot.platform})</span>
            </div>
            {bot.isAllowed ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                Allowed
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                Blocked
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[300px]">
          <p className="text-sm">{bot.reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// RESULT SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * robots.txt results section.
 */
function RobotsTxtSection({ bots }: { bots: BotAccessStatus[] }) {
  const allowedCount = bots.filter(b => b.isAllowed).length
  const allAllowed = allowedCount === bots.length
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-blue-500" />
        <h4 className="font-semibold">robots.txt Check</h4>
        <Badge variant="secondary" className="ml-auto">
          {allowedCount}/{bots.length} Allowed
        </Badge>
      </div>
      
      <div className="rounded-lg border bg-card">
        {bots.map((bot, index) => (
          <div key={bot.botId}>
            <BotAccessRow bot={bot} />
            {index < bots.length - 1 && <Separator />}
          </div>
        ))}
      </div>
      
      {!allAllowed && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some AI bots are blocked. This may reduce your visibility in AI search results.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

/**
 * llms.txt results section.
 */
function LlmsTxtSection({ llms }: { llms: { exists: boolean; content: string | null; location?: string | null } }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-purple-500" />
        <h4 className="font-semibold">llms.txt (2026 Standard)</h4>
        {llms.exists ? (
          <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400">
            Found
          </Badge>
        ) : (
          <Badge variant="outline" className="ml-auto bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400">
            Not Found
          </Badge>
        )}
      </div>
      
      <div className="rounded-lg border bg-card p-4">
        {llms.exists ? (
          <div className="space-y-2">
            <StatusIndicator passed={true} label={`Found at ${llms.location || "/llms.txt"}`} />
            {llms.content && (
              <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-x-auto max-h-32">
                {llms.content.slice(0, 500)}
                {llms.content.length > 500 && "..."}
              </pre>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <StatusIndicator passed={false} label="No llms.txt found" />
            <p className="text-sm text-muted-foreground mt-2">
              Consider adding an llms.txt file to give AI systems instructions about your content.
              <a 
                href="https://llmstxt.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 ml-1 text-primary hover:underline"
              >
                Learn more <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Schema.org results section.
 */
function SchemaSection({ schema }: { schema: SchemaValidation }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Code2 className="h-5 w-5 text-orange-500" />
        <h4 className="font-semibold">Schema.org Markup</h4>
        {schema.hasSchema ? (
          <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400">
            {schema.schemas.length} Found
          </Badge>
        ) : (
          <Badge variant="outline" className="ml-auto bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400">
            Not Found
          </Badge>
        )}
      </div>
      
      <div className="rounded-lg border bg-card p-4">
        {schema.hasSchema ? (
          <div className="space-y-3">
            <StatusIndicator passed={true} label="JSON-LD structured data found" />
            <div className="flex flex-wrap gap-2">
              {schema.schemas.map((type) => (
                <Badge key={type} variant="secondary" className="font-mono text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <StatusIndicator passed={false} label="No JSON-LD structured data found" />
            <p className="text-sm text-muted-foreground mt-2">
              Add Schema.org markup to help AI systems understand your content better.
              <a 
                href="https://schema.org/docs/gs.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 ml-1 text-primary hover:underline"
              >
                Learn more <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        )}
        
        {schema.errors.length > 0 && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {schema.errors.join(", ")}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface TechAuditWidgetProps {
  /** Default domain to pre-fill */
  defaultDomain?: string
  /** Custom class name */
  className?: string
  /** Callback when audit completes */
  onAuditComplete?: (result: TechAuditResult) => void
}

export function TechAuditWidget({ 
  defaultDomain = "", 
  className = "",
  onAuditComplete 
}: TechAuditWidgetProps) {
  const [domain, setDomain] = useState(defaultDomain)
  const [result, setResult] = useState<TechAuditResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  /**
   * Handles form submission and triggers audit.
   */
  const handleAudit = () => {
    if (!domain.trim()) {
      setError("Please enter a domain to audit")
      return
    }

    setError(null)
    setResult(null)

    startTransition(async () => {
      const response = await runTechAudit({ domain })
      
      // Handle SafeAction response structure
      if (response?.serverError) {
        setError(response.serverError)
        return
      }
      
      const result = response?.data
      if (result?.success && result?.data) {
        setResult(result.data)
        onAuditComplete?.(result.data)
      } else {
        setError(result?.error || "Audit failed")
      }
    })
  }

  /**
   * Handles Enter key press in input.
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isPending) {
      handleAudit()
    }
  }

  /**
   * Resets the widget to check a new domain.
   */
  const handleReset = () => {
    setDomain("")
    setResult(null)
    setError(null)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          AI Tech Audit
        </CardTitle>
        <CardDescription>
          Check if your website is optimized for AI agents (ChatGPT, Claude, Siri) to crawl and understand.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter domain (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
              disabled={isPending}
            />
          </div>
          <Button 
            onClick={handleAudit} 
            disabled={isPending || !domain.trim()}
            className="min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Run Audit
              </>
            )}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isPending && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <p className="font-medium">Scanning {domain}...</p>
              <p className="text-sm text-muted-foreground">
                Checking robots.txt, llms.txt, and Schema.org markup
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && !isPending && (
          <div className="space-y-6">
            {/* Score Header with Reset Button */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div>
                <p className="text-sm text-muted-foreground">AI Readiness Score</p>
                <p className="text-2xl font-bold">{result.domain}</p>
              </div>
              <div className="flex items-center gap-3">
                <ScoreBadge score={result.overallScore} />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  🔄 Re-scan / Check Competitor
                </Button>
              </div>
            </div>

            <Separator />

            {/* Individual Checks */}
            <div className="space-y-6">
              <RobotsTxtSection bots={result.robotsTxt} />
              <Separator />
              <LlmsTxtSection llms={result.llmsTxt} />
              <Separator />
              <SchemaSection schema={result.schema} />
            </div>

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground text-center pt-4">
              Audited at {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export default TechAuditWidget
