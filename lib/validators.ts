// ============================================
// VALIDATORS
// ============================================
// Input validation utilities
// ============================================

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if a string is a valid domain
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i
  return domainRegex.test(domain)
}

/**
 * Check if a string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if a keyword is valid (not empty, reasonable length)
 */
export function isValidKeyword(keyword: string): boolean {
  const trimmed = keyword.trim()
  return trimmed.length >= 1 && trimmed.length <= 200
}

/**
 * Validate keyword volume range
 */
export function isValidVolumeRange(min: number, max: number): boolean {
  return min >= 0 && max >= min && max <= 100000000
}

/**
 * Validate KD range (0-100)
 */
export function isValidKDRange(min: number, max: number): boolean {
  return min >= 0 && max >= min && max <= 100
}

/**
 * Sanitize keyword input (remove special chars, normalize spaces)
 */
export function sanitizeKeyword(keyword: string): string {
  return keyword
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, "") // Remove potential HTML
    .replace(/\s+/g, " ") // Normalize spaces
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string): string {
  let sanitized = url.trim()
  
  // Add protocol if missing
  if (!/^https?:\/\//i.test(sanitized)) {
    sanitized = "https://" + sanitized
  }
  
  // Remove trailing slash
  sanitized = sanitized.replace(/\/+$/, "")
  
  return sanitized
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(sanitizeUrl(url))
    return urlObj.hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}

/**
 * Validate bulk keywords (array of keywords)
 */
export function validateBulkKeywords(keywords: string[]): {
  valid: string[]
  invalid: string[]
} {
  const valid: string[] = []
  const invalid: string[] = []
  
  for (const keyword of keywords) {
    if (isValidKeyword(keyword)) {
      valid.push(sanitizeKeyword(keyword))
    } else {
      invalid.push(keyword)
    }
  }
  
  return { valid, invalid }
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) score++
  else feedback.push("At least 8 characters")
  
  if (password.length >= 12) score++
  
  if (/[a-z]/.test(password)) score++
  else feedback.push("Add lowercase letters")
  
  if (/[A-Z]/.test(password)) score++
  else feedback.push("Add uppercase letters")
  
  if (/[0-9]/.test(password)) score++
  else feedback.push("Add numbers")
  
  if (/[^a-zA-Z0-9]/.test(password)) score++
  else feedback.push("Add special characters")
  
  return { score, feedback }
}
