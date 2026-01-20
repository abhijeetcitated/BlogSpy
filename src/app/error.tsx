"use client"

/**
 * ============================================
 * ERROR PAGE (App Router)
 * ============================================
 * 
 * Handles errors within the app layout.
 * Provides user-friendly error UI with recovery options.
 * 
 * @version 1.0.0
 */

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home, ChevronLeft } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("Page error:", error)
    }
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Oops! Something went wrong
        </h2>

        {/* Description */}
        <p className="text-muted-foreground mb-6 text-sm">
          We encountered an error while loading this page. 
          Please try again or go back to the dashboard.
        </p>

        {/* Error ID for support */}
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Go Back
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => reset()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>

          <Button
            size="sm"
            onClick={() => (window.location.href = "/dashboard")}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
