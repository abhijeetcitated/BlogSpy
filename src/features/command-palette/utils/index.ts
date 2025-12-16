// ============================================
// COMMAND PALETTE - Utility Functions
// ============================================

import type { Platform, Command, SearchResult } from "../types"

// ============================================
// PLATFORM DETECTION
// ============================================

/**
 * Detect user's operating system
 */
export function getPlatform(): Platform {
  if (typeof window === "undefined") return "windows"
  
  const platform = navigator.platform.toLowerCase()
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (platform.includes("mac") || userAgent.includes("mac")) {
    return "mac"
  }
  if (platform.includes("linux") || userAgent.includes("linux")) {
    return "linux"
  }
  return "windows"
}

/**
 * Get modifier key based on platform (⌘ for Mac, Ctrl for others)
 */
export function getModifierKey(): string {
  return getPlatform() === "mac" ? "⌘" : "Ctrl"
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: string): string {
  const modifier = getModifierKey()
  return shortcut.replace("⌘", modifier).replace("Cmd", modifier)
}

// ============================================
// FUZZY SEARCH
// ============================================

/**
 * Simple fuzzy match score (0-1)
 * Higher score = better match
 */
function fuzzyScore(query: string, target: string): number {
  query = query.toLowerCase()
  target = target.toLowerCase()
  
  // Exact match = highest score
  if (target === query) return 1
  
  // Starts with = very high
  if (target.startsWith(query)) return 0.9
  
  // Contains = high
  if (target.includes(query)) return 0.7
  
  // Fuzzy character match
  let score = 0
  let queryIdx = 0
  
  for (let i = 0; i < target.length && queryIdx < query.length; i++) {
    if (target[i] === query[queryIdx]) {
      score += 1
      queryIdx++
    }
  }
  
  // All query characters found in order
  if (queryIdx === query.length) {
    return (score / target.length) * 0.5
  }
  
  return 0
}

/**
 * Search commands with fuzzy matching
 */
export function searchCommands(
  commands: Command[],
  query: string,
  limit: number = 10
): SearchResult[] {
  if (!query.trim()) return []
  
  const results: SearchResult[] = []
  
  for (const command of commands) {
    let maxScore = 0
    const matches: string[] = []
    
    // Check title
    const titleScore = fuzzyScore(query, command.title)
    if (titleScore > 0) {
      maxScore = Math.max(maxScore, titleScore)
      matches.push("title")
    }
    
    // Check description
    if (command.description) {
      const descScore = fuzzyScore(query, command.description) * 0.8
      if (descScore > 0) {
        maxScore = Math.max(maxScore, descScore)
        matches.push("description")
      }
    }
    
    // Check keywords
    for (const keyword of command.keywords) {
      const keywordScore = fuzzyScore(query, keyword) * 0.9
      if (keywordScore > 0) {
        maxScore = Math.max(maxScore, keywordScore)
        matches.push(keyword)
      }
    }
    
    // Add to results if any match found
    if (maxScore > 0.1) {
      results.push({
        command,
        score: maxScore,
        matches,
      })
    }
  }
  
  // Sort by score (highest first) and limit
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// ============================================
// RECENT COMMANDS STORAGE
// ============================================

const RECENT_COMMANDS_KEY = "blogspy:recent-commands"
const MAX_RECENT = 5

/**
 * Get recent commands from localStorage
 */
export function getRecentCommands(): string[] {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(RECENT_COMMANDS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save command to recent history
 */
export function saveRecentCommand(commandId: string): void {
  if (typeof window === "undefined") return
  
  try {
    const recent = getRecentCommands()
    
    // Remove if already exists
    const filtered = recent.filter(id => id !== commandId)
    
    // Add to front
    filtered.unshift(commandId)
    
    // Limit size
    const limited = filtered.slice(0, MAX_RECENT)
    
    localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(limited))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear recent commands
 */
export function clearRecentCommands(): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.removeItem(RECENT_COMMANDS_KEY)
  } catch {
    // Ignore storage errors
  }
}
