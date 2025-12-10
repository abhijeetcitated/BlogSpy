// ============================================
// FORMATTERS
// ============================================
// Number, date, and string formatting utilities
// ============================================

/**
 * Format a number with compact notation (1K, 1M, etc.)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K"
  }
  return num.toString()
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num)
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`
}

/**
 * Format position change
 */
export function formatPositionChange(change: number): string {
  if (change > 0) return `+${change}`
  if (change < 0) return change.toString()
  return "—"
}

/**
 * Format date to relative time (2 hours ago, 3 days ago, etc.)
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string, format: "short" | "medium" | "long" = "medium"): string {
  const d = new Date(date)
  
  if (format === "short") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
  
  if (format === "long") {
    return d.toLocaleDateString("en-US", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    })
  }
  
  return d.toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  })
}

/**
 * Format keyword difficulty to label
 */
export function formatKDLabel(kd: number): string {
  if (kd < 30) return "Easy"
  if (kd < 50) return "Medium"
  if (kd < 70) return "Hard"
  return "Very Hard"
}

/**
 * Format intent code to full label
 */
export function formatIntentLabel(intent: string): string {
  const labels: Record<string, string> = {
    I: "Informational",
    C: "Commercial",
    T: "Transactional",
    N: "Navigational",
  }
  return labels[intent] || intent
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + "..."
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
