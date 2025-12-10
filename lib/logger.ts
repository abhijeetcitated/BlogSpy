/**
 * Logger Utility
 * ============================================
 * Structured logging for production
 * In production, integrate with log service
 * ============================================
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: Record<string, unknown>
  error?: {
    name: string
    message: string
    stack?: string
  }
}

// ============================================
// LOG LEVEL PRIORITY
// ============================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Minimum log level based on environment
const MIN_LOG_LEVEL: LogLevel = process.env.NODE_ENV === "production" ? "info" : "debug"

// ============================================
// HELPER FUNCTIONS
// ============================================

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL]
}

function formatLogEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === "production") {
    // JSON format for production (better for log aggregation)
    return JSON.stringify(entry)
  }
  
  // Pretty format for development
  const { level, message, timestamp, data, error } = entry
  let output = `[${timestamp}] [${level.toUpperCase()}] ${message}`
  
  if (data && Object.keys(data).length > 0) {
    output += ` | Data: ${JSON.stringify(data)}`
  }
  
  if (error) {
    output += ` | Error: ${error.name}: ${error.message}`
    if (error.stack) {
      output += `\n${error.stack}`
    }
  }
  
  return output
}

function createLogEntry(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>,
  error?: Error
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
    ...(error && {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    }),
  }
}

// ============================================
// LOGGER
// ============================================

export const logger = {
  debug(message: string, data?: Record<string, unknown>) {
    if (!shouldLog("debug")) return
    const entry = createLogEntry("debug", message, data)
    console.debug(formatLogEntry(entry))
  },

  info(message: string, data?: Record<string, unknown>) {
    if (!shouldLog("info")) return
    const entry = createLogEntry("info", message, data)
    console.info(formatLogEntry(entry))
  },

  warn(message: string, data?: Record<string, unknown>) {
    if (!shouldLog("warn")) return
    const entry = createLogEntry("warn", message, data)
    console.warn(formatLogEntry(entry))
  },

  error(message: string, error?: Error, data?: Record<string, unknown>) {
    if (!shouldLog("error")) return
    const entry = createLogEntry("error", message, data, error)
    console.error(formatLogEntry(entry))
  },

  // API request logging
  apiRequest(method: string, path: string, duration: number, status: number) {
    this.info(`API ${method} ${path}`, {
      method,
      path,
      duration: `${duration}ms`,
      status,
    })
  },

  // Database query logging (development only)
  dbQuery(query: string, duration: number) {
    this.debug(`DB Query`, {
      query: query.substring(0, 100),
      duration: `${duration}ms`,
    })
  },

  // User action logging
  userAction(userId: string, action: string, data?: Record<string, unknown>) {
    this.info(`User Action: ${action}`, {
      userId,
      action,
      ...data,
    })
  },
}

// ============================================
// PERFORMANCE LOGGER
// ============================================

export function measurePerformance(label: string) {
  const start = performance.now()
  
  return {
    end() {
      const duration = performance.now() - start
      logger.debug(`Performance: ${label}`, { duration: `${duration.toFixed(2)}ms` })
      return duration
    },
  }
}

// ============================================
// ERROR REPORTER (for Sentry/similar)
// ============================================

export function reportError(error: Error, context?: Record<string, unknown>) {
  logger.error(error.message, error, context)
  
  // In production, send to error tracking service
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(error, { extra: context })
  // }
}
