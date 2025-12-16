// ============================================
// COMMAND PALETTE - useCommandPalette Hook
// ============================================
// Global keyboard shortcuts & state management
// ============================================

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { Command, SearchResult } from "../types"
import { allCommands } from "../data"
import {
  searchCommands,
  getRecentCommands,
  saveRecentCommand,
  getPlatform,
} from "../utils"

interface UseCommandPaletteReturn {
  // State
  isOpen: boolean
  query: string
  selectedIndex: number
  results: SearchResult[]
  recentCommands: Command[]
  platform: "mac" | "windows" | "linux"
  
  // Actions
  open: () => void
  close: () => void
  toggle: () => void
  setQuery: (query: string) => void
  setSelectedIndex: (index: number) => void
  selectNext: () => void
  selectPrevious: () => void
  executeSelected: () => void
  executeCommand: (command: Command) => void
  searchKeyword: (keyword: string) => void
}

export function useCommandPalette(): UseCommandPaletteReturn {
  const router = useRouter()
  
  // State
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [platform, setPlatform] = useState<"mac" | "windows" | "linux">("windows")
  
  // Detect platform on mount
  useEffect(() => {
    setPlatform(getPlatform())
  }, [])
  
  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return []
    return searchCommands(allCommands, query, 8)
  }, [query])
  
  // Recent commands
  const recentCommands = useMemo(() => {
    const recentIds = getRecentCommands()
    return recentIds
      .map(id => allCommands.find(cmd => cmd.id === id))
      .filter((cmd): cmd is Command => cmd !== undefined)
  }, [isOpen]) // Refresh when palette opens
  
  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery("")
      setSelectedIndex(0)
    }
  }, [isOpen])
  
  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])
  
  // Actions
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  
  const selectNext = useCallback(() => {
    const maxIndex = query ? results.length - 1 : recentCommands.length - 1
    setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : 0))
  }, [query, results.length, recentCommands.length])
  
  const selectPrevious = useCallback(() => {
    const maxIndex = query ? results.length - 1 : recentCommands.length - 1
    setSelectedIndex(prev => (prev > 0 ? prev - 1 : maxIndex))
  }, [query, results.length, recentCommands.length])
  
  const executeCommand = useCallback((command: Command) => {
    // Save to recent
    saveRecentCommand(command.id)
    
    // Close palette
    close()
    
    // Execute action or navigate
    if (command.action) {
      command.action()
    } else if (command.href) {
      router.push(command.href)
    }
  }, [close, router])
  
  // Search for a keyword - navigate to keyword overview
  const searchKeyword = useCallback((keyword: string) => {
    close()
    router.push(`/dashboard/research/overview/${encodeURIComponent(keyword.trim())}`)
  }, [close, router])
  
  const executeSelected = useCallback(() => {
    const currentList = query ? results.map(r => r.command) : recentCommands
    const selected = currentList[selectedIndex]
    
    if (selected) {
      executeCommand(selected)
    } else if (query.trim() && results.length === 0) {
      // No results but has query - search as keyword
      searchKeyword(query)
    }
  }, [query, results, recentCommands, selectedIndex, executeCommand, searchKeyword])
  
  // Global keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        toggle()
        return
      }
      
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        e.preventDefault()
        close()
        return
      }
      
      // Only handle these if palette is open
      if (!isOpen) return
      
      // Arrow up/down to navigate
      if (e.key === "ArrowDown") {
        e.preventDefault()
        selectNext()
        return
      }
      
      if (e.key === "ArrowUp") {
        e.preventDefault()
        selectPrevious()
        return
      }
      
      // Enter to execute
      if (e.key === "Enter") {
        e.preventDefault()
        executeSelected()
        return
      }
    }
    
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, toggle, close, selectNext, selectPrevious, executeSelected])
  
  return {
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
    selectNext,
    selectPrevious,
    executeSelected,
    executeCommand,
    searchKeyword,
  }
}
