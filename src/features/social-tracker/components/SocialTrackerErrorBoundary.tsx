/**
 * Social Tracker Error Boundary
 * Catches errors in the social tracker feature and displays a fallback UI
 */

"use client"

import { Component, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: { componentStack: string } | null
}

export class SocialTrackerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    this.setState({ errorInfo })
    
    // Log error to monitoring service
    console.error("Social Tracker Error:", error, errorInfo)
    
    // TODO: Send to error tracking service like Sentry
    // trackError(error, { component: "SocialTracker", ...errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    window.location.href = "/dashboard"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-card border-destructive/20">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Something went wrong
                </h3>
                <p className="text-sm text-muted-foreground">
                  We encountered an unexpected error in Social Tracker. 
                  Please try refreshing or go back to the dashboard.
                </p>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="text-left p-3 bg-muted rounded-lg">
                  <p className="text-xs font-mono text-destructive mb-2">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
                <Button 
                  onClick={this.handleRetry}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
