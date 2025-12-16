// ============================================
// COMMAND PALETTE - Main Component
// ============================================
// VS Code / Notion style command palette
// ============================================

"use client"

import { useEffect, useRef } from "react"
import { Search, Clock, ArrowRight, Command, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { Command as CommandType, SearchResult } from "../types"
import { allCommands, commandGroups } from "../data"
import { formatShortcut } from "../utils"

interface CommandPaletteProps {
  isOpen: boolean
  query: string
  selectedIndex: number
  results: SearchResult[]
  recentCommands: CommandType[]
  platform: "mac" | "windows" | "linux"
  onClose: () => void
  onQueryChange: (query: string) => void
  onExecute: (command: CommandType) => void
  onSelectIndex: (index: number) => void
  onSearchKeyword: (keyword: string) => void
}

export function CommandPalette({
  isOpen,
  query,
  selectedIndex,
  results,
  recentCommands,
  platform,
  onClose,
  onQueryChange,
  onExecute,
  onSelectIndex,
  onSearchKeyword,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])
  
  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      selectedEl?.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex])
  
  if (!isOpen) return null
  
  const modifierKey = platform === "mac" ? "⌘" : "Ctrl"
  
  // Determine what to show
  const hasQuery = query.trim().length > 0
  const showResults = hasQuery && results.length > 0
  const showNoResults = hasQuery && results.length === 0
  const showRecent = !hasQuery && recentCommands.length > 0
  const showDefault = !hasQuery && recentCommands.length === 0
  
  // Get flat list for keyboard navigation
  const flatList: CommandType[] = hasQuery 
    ? results.map(r => r.command)
    : showRecent 
      ? recentCommands 
      : commandGroups.flatMap(g => g.commands).slice(0, 8)
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />
      
      {/* Palette Modal */}
      <div className="fixed left-1/2 top-[10%] -translate-x-1/2 z-[101] w-full max-w-2xl px-4">
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search Header */}
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search commands or keywords..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm sm:text-base"
            />
            <kbd className="hidden sm:flex items-center gap-1 h-6 px-2 rounded bg-muted text-xs text-muted-foreground font-mono">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              ✕
            </button>
          </div>
          
          {/* Results List */}
          <div 
            ref={listRef}
            className="max-h-[400px] overflow-y-auto py-2"
          >
            {/* Search Results */}
            {showResults && (
              <div className="px-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Results
                </div>
                {results.map((result, index) => (
                  <CommandItem
                    key={result.command.id}
                    command={result.command}
                    isSelected={selectedIndex === index}
                    index={index}
                    onSelect={() => onExecute(result.command)}
                    onHover={() => onSelectIndex(index)}
                  />
                ))}
              </div>
            )}
            
            {/* No Results - Show search for keyword option */}
            {showNoResults && (
              <div className="px-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Search Keyword
                </div>
                <button
                  onClick={() => onSearchKeyword(query)}
                  onMouseEnter={() => onSelectIndex(0)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    selectedIndex === 0
                      ? "bg-emerald-500/10 text-foreground" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                    selectedIndex === 0 ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"
                  )}>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">
                      Research keyword: &quot;{query}&quot;
                    </div>
                    <p className="text-xs text-muted-foreground">
                      See volume, difficulty, trends & suggestions
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500 text-[10px] px-1.5 py-0">
                    Enter
                  </Badge>
                  {selectedIndex === 0 && (
                    <ArrowRight className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                </button>
              </div>
            )}
            
            {/* Recent Commands */}
            {showRecent && (
              <div className="px-2">
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Clock className="h-3 w-3" />
                  Recent
                </div>
                {recentCommands.map((command, index) => (
                  <CommandItem
                    key={command.id}
                    command={command}
                    isSelected={selectedIndex === index}
                    index={index}
                    onSelect={() => onExecute(command)}
                    onHover={() => onSelectIndex(index)}
                  />
                ))}
              </div>
            )}
            
            {/* Default Groups */}
            {showDefault && (
              <>
                {commandGroups.map((group, groupIndex) => {
                  const startIndex = commandGroups
                    .slice(0, groupIndex)
                    .reduce((acc, g) => acc + Math.min(g.commands.length, 4), 0)
                  
                  return (
                    <div key={group.category} className="px-2">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {group.label}
                      </div>
                      {group.commands.slice(0, 4).map((command, cmdIndex) => {
                        const flatIndex = startIndex + cmdIndex
                        return (
                          <CommandItem
                            key={command.id}
                            command={command}
                            isSelected={selectedIndex === flatIndex}
                            index={flatIndex}
                            onSelect={() => onExecute(command)}
                            onHover={() => onSelectIndex(flatIndex)}
                          />
                        )
                      })}
                    </div>
                  )
                })}
              </>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="h-5 px-1.5 rounded bg-muted font-mono">↑</kbd>
                <kbd className="h-5 px-1.5 rounded bg-muted font-mono">↓</kbd>
                <span className="ml-1">Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="h-5 px-1.5 rounded bg-muted font-mono">↵</kbd>
                <span className="ml-1">Select</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              <span>BlogSpy</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================
// Command Item Component
// ============================================

interface CommandItemProps {
  command: CommandType
  isSelected: boolean
  index: number
  onSelect: () => void
  onHover: () => void
}

function CommandItem({ command, isSelected, index, onSelect, onHover }: CommandItemProps) {
  const Icon = command.icon
  
  return (
    <button
      data-index={index}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
        isSelected 
          ? "bg-emerald-500/10 text-foreground" 
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
        isSelected ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{command.title}</span>
          {command.badge && (
            <Badge 
              variant="secondary" 
              className={cn(
                "text-[10px] px-1.5 py-0",
                command.badge === "New" && "bg-emerald-500/20 text-emerald-500",
                command.badge === "Beta" && "bg-cyan-500/20 text-cyan-500"
              )}
            >
              {command.badge}
            </Badge>
          )}
        </div>
        {command.description && (
          <p className="text-xs text-muted-foreground truncate">
            {command.description}
          </p>
        )}
      </div>
      
      {command.shortcut && (
        <kbd className="hidden sm:flex items-center gap-1 h-6 px-2 rounded bg-muted text-xs text-muted-foreground font-mono shrink-0">
          {formatShortcut(command.shortcut)}
        </kbd>
      )}
      
      {isSelected && (
        <ArrowRight className="h-4 w-4 text-emerald-500 shrink-0" />
      )}
    </button>
  )
}
