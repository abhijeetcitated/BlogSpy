// ============================================
// COMMAND PALETTE - Feature Barrel Export
// ============================================

// Types
export type {
  Command,
  CommandCategory,
  CommandGroup,
  SearchResult,
  CommandPaletteState,
  Platform,
} from "./types"

// Data
export {
  allCommands,
  navigationCommands,
  actionCommands,
  utilityCommands,
  commandGroups,
  categoryLabels,
} from "./data"

// Utils
export {
  getPlatform,
  getModifierKey,
  formatShortcut,
  searchCommands,
  getRecentCommands,
  saveRecentCommand,
  clearRecentCommands,
} from "./utils"

// Hooks
export { useCommandPalette } from "./hooks"

// Components
export {
  CommandPalette,
  CommandPaletteProvider,
  useCommandPaletteContext,
} from "./components"
