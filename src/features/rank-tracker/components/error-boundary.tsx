// ============================================
// RANK TRACKER - Error Boundary Component
// ============================================

"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary for Rank Tracker feature
 * @description Catches errors and provides retry/recovery options
 */
export class RankTrackerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error("[RankTracker Error]:", error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div 
          className="min-h-[400px] flex items-center justify-center p-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Something went wrong
            </h2>
            
            <p className="text-muted-foreground mb-6">
              We encountered an error while loading the Rank Tracker. 
              Please try again or return to the dashboard.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Error details
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={this.handleRetry}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              
              <Button asChild className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                <Link href="/dashboard">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
