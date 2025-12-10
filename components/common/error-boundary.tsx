"use client"

import React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service (e.g., Sentry)
    console.error("Error caught by boundary:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorDisplay 
          error={this.state.error} 
          onRetry={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

// Error Display Component
interface ErrorDisplayProps {
  error?: Error
  title?: string
  description?: string
  onRetry?: () => void
  showDetails?: boolean
}

export function ErrorDisplay({
  error,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry,
  showDetails = false,
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      
      {showDetails && error && (
        <div className="w-full max-w-md mb-6">
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 text-left">
            <p className="text-xs font-mono text-red-400 break-all">
              {error.message}
            </p>
          </div>
        </div>
      )}

      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="border-slate-700">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}

// API Error Component
interface ApiErrorProps {
  statusCode?: number
  message?: string
  onRetry?: () => void
}

export function ApiError({ statusCode, message, onRetry }: ApiErrorProps) {
  const getErrorInfo = () => {
    switch (statusCode) {
      case 401:
        return {
          title: "Unauthorized",
          description: "Please sign in to access this resource.",
        }
      case 403:
        return {
          title: "Access Denied",
          description: "You don't have permission to access this resource.",
        }
      case 404:
        return {
          title: "Not Found",
          description: "The requested resource could not be found.",
        }
      case 429:
        return {
          title: "Rate Limited",
          description: "Too many requests. Please wait a moment and try again.",
        }
      case 500:
        return {
          title: "Server Error",
          description: "An internal server error occurred. Please try again later.",
        }
      default:
        return {
          title: "Error",
          description: message || "An unexpected error occurred.",
        }
    }
  }

  const { title, description } = getErrorInfo()

  return (
    <ErrorDisplay
      title={title}
      description={description}
      onRetry={onRetry}
    />
  )
}
