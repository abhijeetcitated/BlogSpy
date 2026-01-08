// ============================================
// DATE UTILITIES - Freshness & Time Ago Formatters
// ============================================
// Used for showing keyword data freshness in the table
// ============================================

/**
 * Returns a Tailwind color class based on how old the data is
 * @param dateString - ISO date string or Date
 * @returns Tailwind text color class
 */
export function getFreshnessColor(dateString: string | Date | null | undefined): string {
  if (!dateString) {
    return "text-muted-foreground" // No date = gray
  }

  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffHours / 24

  // Fresh: < 24 hours
  if (diffHours < 24) {
    return "text-emerald-500"
  }

  // Recent: < 7 days
  if (diffDays < 7) {
    return "text-muted-foreground"
  }

  // Stale: < 30 days
  if (diffDays < 30) {
    return "text-amber-500"
  }

  // Very stale: > 30 days
  return "text-orange-500"
}

/**
 * Returns a human-readable "time ago" string
 * @param dateString - ISO date string or Date
 * @returns Human-readable string like "2h ago", "5d ago", "Just now"
 */
export function timeAgo(dateString: string | Date | null | undefined): string {
  if (!dateString) {
    return "Never"
  }

  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  // Just now: < 1 minute
  if (diffSeconds < 60) {
    return "Just now"
  }

  // Minutes ago
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }

  // Hours ago
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }

  // Days ago
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }

  // Weeks ago
  if (diffWeeks < 4) {
    return `${diffWeeks}w ago`
  }

  // Months ago
  if (diffMonths < 12) {
    return `${diffMonths}mo ago`
  }

  // Years ago
  const diffYears = Math.floor(diffDays / 365)
  return `${diffYears}y ago`
}

/**
 * Get freshness badge text based on data age
 */
export function getFreshnessBadge(dateString: string | Date | null | undefined): {
  label: string
  variant: "fresh" | "recent" | "stale" | "outdated"
} {
  if (!dateString) {
    return { label: "No data", variant: "outdated" }
  }

  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffHours / 24

  if (diffHours < 24) {
    return { label: "Fresh", variant: "fresh" }
  }

  if (diffDays < 7) {
    return { label: "Recent", variant: "recent" }
  }

  if (diffDays < 30) {
    return { label: "Stale", variant: "stale" }
  }

  return { label: "Outdated", variant: "outdated" }
}
