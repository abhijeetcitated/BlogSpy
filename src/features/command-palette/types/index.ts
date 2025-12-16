// ============================================
// COMMAND PALETTE - Type Definitions
// ============================================

import type { LucideIcon } from "lucide-react"

// Command categories
export type CommandCategory = 
  | "navigation"    // Go to pages
  | "action"        // Do something
  | "search"        // Search keywords/domains
  | "recent"        // Recent searches
  | "quick"         // Quick actions

// Single command item
export interface Command {
  id: string
  title: string
  description?: string
  icon: LucideIcon
  category: CommandCategory
  keywords: string[]          // For fuzzy search matching
  shortcut?: string           // Keyboard shortcut display
  href?: string               // Navigate to URL
  action?: () => void         // Execute action
  badge?: string              // Optional badge (e.g., "New", "Beta")
  disabled?: boolean
}

// Command group for display
export interface CommandGroup {
  category: CommandCategory
  label: string
  commands: Command[]
}

// Search result with score
export interface SearchResult {
  command: Command
  score: number               // Fuzzy match score
  matches: string[]           // Matched keywords
}

// Command palette state
export interface CommandPaletteState {
  isOpen: boolean
  query: string
  selectedIndex: number
  recentCommands: Command[]
}

// Platform detection
export type Platform = "mac" | "windows" | "linux"
