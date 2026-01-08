"use client"

/**
 * ============================================
 * GLOBAL ERROR PAGE
 * ============================================
 * 
 * Catches errors in the app router and displays a user-friendly UI.
 * This file is required by Next.js for proper error handling.
 * 
 * @version 1.0.0
 */

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Global error:", error)
    }

    // TODO: Send to error tracking service (Sentry, etc.)
    // reportError(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-lg w-full bg-card border border-border rounded-xl p-8 text-center shadow-lg">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Something went wrong!
            </h1>

            {/* Description */}
            <p className="text-muted-foreground mb-6">
              We apologize for the inconvenience. An unexpected error has occurred.
              Our team has been notified and is working on a fix.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === "development" && error && (
              <div className="mb-6 p-4 bg-muted rounded-lg text-left overflow-auto max-h-48">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-semibold">Debug Info</span>
                </div>
                <p className="text-sm font-mono text-destructive break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => reset()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>

              <Button
                onClick={() => (window.location.href = "/dashboard")}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Button>
            </div>

            {/* Support link */}
            <p className="mt-6 text-sm text-muted-foreground">
              If this problem persists, please{" "}
              <a
                href="/contact"
                className="text-primary hover:underline"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
