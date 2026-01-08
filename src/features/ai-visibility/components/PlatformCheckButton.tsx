/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔄 PLATFORM CHECK BUTTON - Check Now / Refresh Button for Platform Cards
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Button component to trigger instant visibility check on a specific AI platform.
 * Used on platform cards (ChatGPT, Claude, Perplexity, Gemini).
 * 
 * @example
 * ```tsx
 * <PlatformCheckButton 
 *   platform="chatgpt"
 *   query="best seo tools"
 *   configId="user-config-id"
 *   onResult={(result) => console.log(result)}
 * />
 * ```
 */

"use client"

import { useState, useTransition } from "react"
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { checkPlatformNow } from "../actions/run-citation"
import type { AIPlatform, VisibilityCheckResult } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface PlatformCheckButtonProps {
  /** AI Platform to check */
  platform: AIPlatform
  /** Query/keyword to check */
  query: string
  /** User's config ID */
  configId: string
  /** Callback when check completes */
  onResult?: (result: VisibilityCheckResult) => void
  /** Callback on error */
  onError?: (error: string) => void
  /** Button size variant */
  size?: "sm" | "default" | "lg" | "icon"
  /** Show text label */
  showLabel?: boolean
  /** Custom class name */
  className?: string
  /** Disabled state */
  disabled?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function PlatformCheckButton({
  platform,
  query,
  configId,
  onResult,
  onError,
  size = "icon",
  showLabel = false,
  className = "",
  disabled = false,
}: PlatformCheckButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [lastResult, setLastResult] = useState<"visible" | "not-visible" | null>(null)

  const handleCheck = () => {
    if (!query || !configId) {
      onError?.("Query and config are required")
      return
    }

    startTransition(async () => {
      const response = await checkPlatformNow({
        platform,
        query,
        configId,
      })

      // Handle SafeAction response structure
      if (response?.serverError) {
        setLastResult(null)
        onError?.(response.serverError)
        return
      }

      const result = response?.data
      if (result?.success && result?.data) {
        setLastResult(result.data.isVisible ? "visible" : "not-visible")
        onResult?.(result.data)
      } else {
        setLastResult(null)
        onError?.(result?.error || "Check failed")
      }
    })
  }

  // Determine icon based on state
  const getIcon = () => {
    if (isPending) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }
    
    if (lastResult === "visible") {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    
    if (lastResult === "not-visible") {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    
    return <RefreshCw className="h-4 w-4" />
  }

  const getTooltip = () => {
    if (isPending) return "Checking..."
    if (lastResult === "visible") return "Visible! Click to refresh"
    if (lastResult === "not-visible") return "Not visible. Click to refresh"
    return "Check now"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            onClick={handleCheck}
            disabled={disabled || isPending}
            className={`${className} ${isPending ? "animate-pulse" : ""}`}
          >
            {getIcon()}
            {showLabel && (
              <span className="ml-2">
                {isPending ? "Checking..." : "Check Now"}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{getTooltip()}</p>
          {lastResult && !isPending && (
            <p className="text-xs text-muted-foreground">1 credit per check</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export default PlatformCheckButton
