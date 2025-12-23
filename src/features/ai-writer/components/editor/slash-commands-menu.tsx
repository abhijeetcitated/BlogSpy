// =============================================================================
// SLASH COMMANDS MENU COMPONENT - Notion-style Command Palette
// =============================================================================
// Industry-standard slash commands UI like Notion, Linear, Craft
// Beautiful dropdown menu with categories, search, and keyboard navigation
// =============================================================================

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Wand2,
  Type,
  Layers,
  Plus,
  Image,
  Search,
  ArrowRight,
  FileText,
  BookOpen,
  Flag,
  List,
  HelpCircle,
  ListOrdered,
  Maximize2,
  Minimize2,
  Feather,
  RefreshCw,
  Check,
  Wind,
  Briefcase,
  Smile,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Minus,
  Table,
  Info,
  Video,
  Target,
  BarChart,
  Crown,
} from 'lucide-react';

import type {
  SlashCommand,
  SlashMenuState,
  CommandCategory,
  MenuPosition,
} from '@/src/features/ai-writer/types/tools/slash-commands.types';

import {
  COMMAND_CATEGORIES,
  DEFAULT_SLASH_COMMANDS,
} from '@/src/features/ai-writer/types/tools/slash-commands.types';

import {
  filterCommands,
  groupCommandsByCategory,
} from '@/src/features/ai-writer/utils/tools/slash-commands';

// -----------------------------------------------------------------------------
// Icon Mapping
// -----------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Wand2,
  Type,
  Layers,
  Plus,
  Image,
  Search,
  ArrowRight,
  FileText,
  BookOpen,
  Flag,
  List,
  HelpCircle,
  ListOrdered,
  Maximize2,
  Minimize2,
  Feather,
  RefreshCw,
  Check,
  Wind,
  Briefcase,
  Smile,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Minus,
  Table,
  Info,
  Video,
  Target,
  BarChart,
};

function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
  return ICON_MAP[iconName] || FileText;
}

// -----------------------------------------------------------------------------
// Props Interface
// -----------------------------------------------------------------------------

interface SlashCommandsMenuProps {
  isOpen: boolean;
  position: MenuPosition;
  query: string;
  selectedIndex: number;
  hasSelection: boolean;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
  onNavigate: (direction: 'up' | 'down') => void;
  commands?: SlashCommand[];
  className?: string;
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function SlashCommandsMenu({
  isOpen,
  position,
  query,
  selectedIndex,
  hasSelection,
  onSelect,
  onClose,
  onNavigate,
  commands = DEFAULT_SLASH_COMMANDS,
  className = ''
}: SlashCommandsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<CommandCategory | 'all'>('all');
  
  // Filter commands based on query and selection state
  const filteredCommands = useMemo(() => {
    let cmds = commands;
    
    // If no selection, hide commands that require selection
    if (!hasSelection) {
      cmds = cmds.filter(cmd => !cmd.aiConfig?.requiresSelection);
    }
    
    return filterCommands(cmds, query, activeCategory);
  }, [commands, query, activeCategory, hasSelection]);
  
  // Group commands by category for display
  const groupedCommands = useMemo(() => {
    if (query) {
      // When searching, show flat list
      return null;
    }
    return groupCommandsByCategory(filteredCommands);
  }, [filteredCommands, query]);
  
  // Reset category when query changes
  useEffect(() => {
    if (query) {
      setActiveCategory('all');
    }
  }, [query]);
  
  // Scroll selected item into view
  useEffect(() => {
    if (menuRef.current && filteredCommands.length > 0) {
      const selectedElement = menuRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex, filteredCommands.length]);
  
  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const menuContent = (
    <div
      ref={menuRef}
      className={`
        fixed z-50 w-80 max-h-96 rounded-lg border bg-popover shadow-lg
        animate-in fade-in-0 zoom-in-95
        ${className}
      `}
      style={{
        top: position.top,
        left: position.left,
        transformOrigin: position.anchor === 'bottom' ? 'top left' : 'bottom left'
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Type to filter commands</span>
          {query && (
            <Badge variant="secondary" className="ml-auto text-[10px]">
              {filteredCommands.length} results
            </Badge>
          )}
        </div>
      </div>
      
      {/* Category Tabs (when not searching) */}
      {!query && (
        <div className="flex items-center gap-1 px-2 py-1.5 border-b overflow-x-auto scrollbar-none">
          <CategoryTab
            label="All"
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          />
          {Object.entries(COMMAND_CATEGORIES).map(([key, { label }]) => (
            <CategoryTab
              key={key}
              label={label}
              active={activeCategory === key}
              onClick={() => setActiveCategory(key as CommandCategory)}
            />
          ))}
        </div>
      )}
      
      {/* Commands List */}
      <ScrollArea className="max-h-64">
        <div className="p-1">
          {filteredCommands.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              No commands found for "{query}"
            </div>
          ) : groupedCommands && !query ? (
            // Grouped display
            Array.from(groupedCommands.entries()).map(([category, cmds]) => (
              <CommandGroup
                key={category}
                category={category}
                commands={cmds}
                selectedIndex={selectedIndex}
                allCommands={filteredCommands}
                onSelect={onSelect}
              />
            ))
          ) : (
            // Flat search results
            filteredCommands.map((command, index) => (
              <CommandItem
                key={command.id}
                command={command}
                isSelected={index === selectedIndex}
                index={index}
                onClick={() => onSelect(command)}
              />
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Footer */}
      <div className="px-3 py-2 border-t bg-muted/30">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 rounded bg-muted">â†‘â†“</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 rounded bg-muted">â†µ</kbd> select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 rounded bg-muted">esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render in portal to avoid z-index issues
  return createPortal(menuContent, document.body);
}

// -----------------------------------------------------------------------------
// Category Tab Component
// -----------------------------------------------------------------------------

interface CategoryTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function CategoryTab({ label, active, onClick }: CategoryTabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors
        ${active 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }
      `}
    >
      {label}
    </button>
  );
}

// -----------------------------------------------------------------------------
// Command Group Component
// -----------------------------------------------------------------------------

interface CommandGroupProps {
  category: CommandCategory;
  commands: SlashCommand[];
  selectedIndex: number;
  allCommands: SlashCommand[];
  onSelect: (command: SlashCommand) => void;
}

function CommandGroup({ category, commands, selectedIndex, allCommands, onSelect }: CommandGroupProps) {
  const categoryInfo = COMMAND_CATEGORIES[category];
  const CategoryIcon = getIcon(categoryInfo?.icon || 'FileText');
  
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        <CategoryIcon className="h-3 w-3" />
        {categoryInfo?.label || category}
      </div>
      <div className="space-y-0.5">
        {commands.map(command => {
          const globalIndex = allCommands.findIndex(c => c.id === command.id);
          return (
            <CommandItem
              key={command.id}
              command={command}
              isSelected={globalIndex === selectedIndex}
              index={globalIndex}
              onClick={() => onSelect(command)}
            />
          );
        })}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Command Item Component
// -----------------------------------------------------------------------------

interface CommandItemProps {
  command: SlashCommand;
  isSelected: boolean;
  index: number;
  onClick: () => void;
}

function CommandItem({ command, isSelected, index, onClick }: CommandItemProps) {
  const Icon = getIcon(command.icon);
  
  return (
    <button
      data-index={index}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors
        ${isSelected 
          ? 'bg-accent text-accent-foreground' 
          : 'hover:bg-muted'
        }
      `}
    >
      <div className={`
        flex items-center justify-center w-8 h-8 rounded-md
        ${isSelected ? 'bg-primary/10' : 'bg-muted'}
      `}>
        <Icon className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{command.name}</span>
          {command.premium && (
            <Crown className="h-3 w-3 text-yellow-500" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {command.description}
        </p>
      </div>
      
      {command.shortcut && (
        <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">
          {command.shortcut.replace('Mod', 'âŒ˜')}
        </kbd>
      )}
    </button>
  );
}

// -----------------------------------------------------------------------------
// Hook for Slash Commands
// -----------------------------------------------------------------------------

interface UseSlashCommandsOptions {
  enabled?: boolean;
  commands?: SlashCommand[];
  onExecute?: (command: SlashCommand) => void;
}

export function useSlashCommands({
  enabled = true,
  commands = DEFAULT_SLASH_COMMANDS,
  onExecute
}: UseSlashCommandsOptions = {}) {
  const [menuState, setMenuState] = useState<SlashMenuState>({
    isOpen: false,
    query: '',
    selectedIndex: 0,
    position: { top: 0, left: 0, anchor: 'bottom' },
    filteredCommands: commands,
    activeCategory: 'all'
  });
  
  const openMenu = useCallback((position: MenuPosition) => {
    setMenuState(prev => ({
      ...prev,
      isOpen: true,
      query: '',
      selectedIndex: 0,
      position,
      filteredCommands: commands
    }));
  }, [commands]);
  
  const closeMenu = useCallback(() => {
    setMenuState(prev => ({
      ...prev,
      isOpen: false,
      query: '',
      selectedIndex: 0
    }));
  }, []);
  
  const updateQuery = useCallback((query: string) => {
    const filtered = filterCommands(commands, query, menuState.activeCategory);
    setMenuState(prev => ({
      ...prev,
      query,
      filteredCommands: filtered,
      selectedIndex: 0
    }));
  }, [commands, menuState.activeCategory]);
  
  const navigate = useCallback((direction: 'up' | 'down') => {
    setMenuState(prev => {
      const count = prev.filteredCommands.length;
      if (count === 0) return prev;
      
      let newIndex = prev.selectedIndex;
      if (direction === 'up') {
        newIndex = prev.selectedIndex <= 0 ? count - 1 : prev.selectedIndex - 1;
      } else {
        newIndex = prev.selectedIndex >= count - 1 ? 0 : prev.selectedIndex + 1;
      }
      
      return { ...prev, selectedIndex: newIndex };
    });
  }, []);
  
  const selectCurrent = useCallback(() => {
    const command = menuState.filteredCommands[menuState.selectedIndex];
    if (command) {
      closeMenu();
      onExecute?.(command);
    }
  }, [menuState, closeMenu, onExecute]);
  
  const selectCommand = useCallback((command: SlashCommand) => {
    closeMenu();
    onExecute?.(command);
  }, [closeMenu, onExecute]);
  
  return {
    menuState,
    openMenu,
    closeMenu,
    updateQuery,
    navigate,
    selectCurrent,
    selectCommand
  };
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default SlashCommandsMenu;

