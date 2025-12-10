// ============================================
// COMMON COMPONENTS - BARREL EXPORT
// ============================================
// Shared/common UI components
// ============================================

// Loading Spinner Component
export function LoadingSpinner({ 
  size = "md",
  className = "" 
}: { 
  size?: "sm" | "md" | "lg"
  className?: string 
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-muted border-t-primary`}
      />
    </div>
  )
}

// Full Page Loading
export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}

// Empty State Component
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center p-8">
      {icon && (
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        )}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// Page Header Component
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// Error Display Component
export function ErrorDisplay({
  title = "Something went wrong",
  message,
  retry,
}: {
  title?: string
  message?: string
  retry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center p-8">
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <svg
          className="h-8 w-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {message && (
          <p className="text-sm text-muted-foreground max-w-md">{message}</p>
        )}
      </div>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

// Stats Card Component
export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
}: {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: React.ReactNode
}) {
  const changeColors = {
    positive: "text-emerald-400",
    negative: "text-red-400",
    neutral: "text-muted-foreground",
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        {icon}
      </div>
      <div className="mt-2">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        {change && (
          <span className={`ml-2 text-sm ${changeColors[changeType]}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  )
}
