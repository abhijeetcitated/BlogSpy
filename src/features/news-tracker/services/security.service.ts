/**
 * ============================================
 * NEWS TRACKER - SECURITY SERVICE
 * ============================================
 * 
 * Security utilities for input validation,
 * sanitization, and protection against common attacks.
 * 
 * @version 1.0.0
 */

// ============================================
// INPUT VALIDATION PATTERNS
// ============================================

const PATTERNS = {
  // Keywords: alphanumeric, spaces, common punctuation
  keyword: /^[\p{L}\p{N}\s\-_'".,!?@#&()]+$/u,
  
  // Email validation
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // UUID validation
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  
  // URL validation
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  
  // Alphanumeric only
  alphanumeric: /^[a-zA-Z0-9]+$/,
  
  // Numeric only
  numeric: /^\d+$/,
}

// ============================================
// DANGEROUS PATTERNS (XSS, SQL Injection, etc.)
// ============================================

const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick=, onload=, etc.
  /data:/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
  /url\s*\(/gi,
  /<\s*object[\s\S]*?>/gi,
  /<\s*embed[\s\S]*?>/gi,
  /<\s*link[\s\S]*?>/gi,
  /<!--[\s\S]*?-->/g,
  /union\s+select/gi,
  /insert\s+into/gi,
  /delete\s+from/gi,
  /drop\s+table/gi,
  /update\s+\w+\s+set/gi,
  /--\s*$/gm,
  /;\s*$/gm,
  /'\s*or\s+'1'\s*=\s*'1/gi,
  /'\s*or\s+1\s*=\s*1/gi,
]

// ============================================
// SECURITY SERVICE CLASS
// ============================================

class SecurityService {
  // ============================================
  // SANITIZATION METHODS
  // ============================================

  /**
   * Sanitize any input string
   */
  sanitizeInput(input: string): string {
    if (!input || typeof input !== "string") {
      return ""
    }

    let sanitized = input.trim()

    // Remove dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, "")
    }

    // Encode HTML entities
    sanitized = this.encodeHTMLEntities(sanitized)

    // Limit length
    sanitized = sanitized.slice(0, 500)

    return sanitized
  }

  /**
   * Sanitize keyword specifically
   */
  sanitizeKeyword(keyword: string): string {
    if (!keyword || typeof keyword !== "string") {
      return ""
    }

    let sanitized = keyword.trim().toLowerCase()

    // Remove dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, "")
    }

    // Remove multiple spaces
    sanitized = sanitized.replace(/\s+/g, " ")

    // Limit length (typical keyword max)
    sanitized = sanitized.slice(0, 150)

    return sanitized
  }

  /**
   * Encode HTML entities
   */
  encodeHTMLEntities(str: string): string {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
      "`": "&#x60;",
      "=": "&#x3D;",
    }

    return str.replace(/[&<>"'`=/]/g, char => entities[char] || char)
  }

  /**
   * Decode HTML entities
   */
  decodeHTMLEntities(str: string): string {
    const entities: Record<string, string> = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#x27;": "'",
      "&#x2F;": "/",
      "&#x60;": "`",
      "&#x3D;": "=",
    }

    return str.replace(/&(?:amp|lt|gt|quot|#x27|#x2F|#x60|#x3D);/g, entity => entities[entity] || entity)
  }

  // ============================================
  // VALIDATION METHODS
  // ============================================

  /**
   * Validate keyword format
   */
  validateKeyword(keyword: string): boolean {
    if (!keyword || typeof keyword !== "string") {
      return false
    }

    const sanitized = keyword.trim()

    // Check length
    if (sanitized.length < 2 || sanitized.length > 150) {
      return false
    }

    // Check for dangerous content
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        return false
      }
    }

    // Check allowed characters
    return PATTERNS.keyword.test(sanitized)
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    if (!email || typeof email !== "string") {
      return false
    }
    return PATTERNS.email.test(email.trim())
  }

  /**
   * Validate UUID format
   */
  validateUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== "string") {
      return false
    }
    return PATTERNS.uuid.test(uuid.trim())
  }

  /**
   * Validate URL format
   */
  validateURL(url: string): boolean {
    if (!url || typeof url !== "string") {
      return false
    }
    return PATTERNS.url.test(url.trim())
  }

  /**
   * Validate batch of keywords
   */
  validateKeywordBatch(keywords: string[]): { valid: string[]; invalid: string[] } {
    const valid: string[] = []
    const invalid: string[] = []

    for (const keyword of keywords) {
      const sanitized = this.sanitizeKeyword(keyword)
      if (this.validateKeyword(sanitized)) {
        valid.push(sanitized)
      } else {
        invalid.push(keyword)
      }
    }

    return { valid, invalid }
  }

  // ============================================
  // PROTECTION METHODS
  // ============================================

  /**
   * Check for XSS attack patterns
   */
  containsXSS(input: string): boolean {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /expression\(/i,
    ]

    return xssPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Check for SQL injection patterns
   */
  containsSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /union\s+select/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /drop\s+table/i,
      /update\s+\w+\s+set/i,
      /'\s*or\s+'1'\s*=\s*'1/i,
      /'\s*or\s+1\s*=\s*1/i,
      /--\s*$/,
    ]

    return sqlPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Generate secure random string
   */
  generateSecureId(length: number = 16): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    
    // Use crypto if available (Node.js/browser)
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const array = new Uint32Array(length)
      crypto.getRandomValues(array)
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length]
      }
    } else {
      // Fallback to Math.random (less secure)
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)]
      }
    }
    
    return result
  }

  /**
   * Hash sensitive data (simple hash for non-crypto purposes)
   */
  simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Mask sensitive data for logging
   */
  maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars * 2) {
      return "***"
    }
    
    const start = data.slice(0, visibleChars)
    const end = data.slice(-visibleChars)
    const masked = "*".repeat(Math.min(data.length - visibleChars * 2, 8))
    
    return `${start}${masked}${end}`
  }

  /**
   * Validate request origin (CORS check helper)
   */
  isAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
    if (!origin) return false
    
    return allowedOrigins.some(allowed => {
      if (allowed === "*") return true
      if (allowed.startsWith("*.")) {
        // Wildcard subdomain
        const domain = allowed.slice(2)
        return origin.endsWith(domain) || origin === `https://${domain}` || origin === `http://${domain}`
      }
      return origin === allowed
    })
  }
}

// Export singleton instance
export const securityService = new SecurityService()

// Export class for testing
export { SecurityService }
