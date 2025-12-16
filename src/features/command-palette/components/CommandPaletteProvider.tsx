// ============================================
// COMMAND PALETTE - Provider Component
// ============================================
// Global provider to use command palette anywhere
// ============================================

"use client"

import { createContext, useContext, type ReactNode } from "react"
import { CommandPalette } from "./CommandPalette"
import { useCommandPalette } from "../hooks"
import type { Command } from "../types"

// Context type
interface CommandPaletteContextType {
  open: () => void
  close: () => void
  toggle: () => void
  executeCommand: (command: Command) => void
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null)

// Hook to use command palette
export function useCommandPaletteContext() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error("useCommandPaletteContext must be used within CommandPaletteProvider")
  }
  return context
}

// Provider component
interface CommandPaletteProviderProps {
  children: ReactNode
}

export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const {
    isOpen,
    query,
    selectedIndex,
    results,
    recentCommands,
    platform,
    open,
    close,
    toggle,
    setQuery,
    setSelectedIndex,
    executeCommand,
    searchKeyword,
  } = useCommandPalette()
  
  return (
    <CommandPaletteContext.Provider value={{ open, close, toggle, executeCommand }}>
      {children}
      <CommandPalette
        isOpen={isOpen}
        query={query}
        selectedIndex={selectedIndex}
        results={results}
        recentCommands={recentCommands}
        platform={platform}
        onClose={close}
        onQueryChange={setQuery}
        onExecute={executeCommand}
        onSelectIndex={setSelectedIndex}
        onSearchKeyword={searchKeyword}
      />
    </CommandPaletteContext.Provider>
  )
}
