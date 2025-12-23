// =============================================================================
// USE SLASH COMMANDS HOOK
// =============================================================================
// Comprehensive hook for managing slash commands in TipTap editor
// Handles menu state, keyboard navigation, command execution, and AI integration
// =============================================================================

'use client';

import { useState, useCallback, useRef, useMemo } from 'react';

import type {
  SlashCommand,
  SlashMenuState,
  CommandCategory,
  MenuPosition,
  CommandContext,
  CommandResult,
} from '@/src/features/ai-writer/types/tools/slash-commands.types';

import {
  DEFAULT_SLASH_COMMANDS,
} from '@/src/features/ai-writer/types/tools/slash-commands.types';

import {
  filterCommands,
} from '@/src/features/ai-writer/utils/tools/slash-commands';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface UseSlashCommandsOptions {
  /** Custom commands to use (defaults to DEFAULT_SLASH_COMMANDS) */
  commands?: SlashCommand[];
  
  /** Enable premium commands */
  isPremium?: boolean;
  
  /** Current SEO keyword for context */
  keyword?: string;
  
  /** Target audience for content */
  targetAudience?: string;
  
  /** Content type being written */
  contentType?: 'blog-post' | 'product-description' | 'landing-page' | 'email' | 'social-media';
  
  /** Callback when AI request is needed */
  onAIRequest?: (prompt: string, command: SlashCommand) => Promise<string>;
  
  /** Callback when command is executed */
  onCommandExecute?: (command: SlashCommand, result: CommandResult) => void;
  
  /** Callback when menu opens */
  onMenuOpen?: () => void;
  
  /** Callback when menu closes */
  onMenuClose?: () => void;
}

export interface UseSlashCommandsReturn {
  // State
  menuState: SlashMenuState;
  isLoading: boolean;
  error: string | null;
  
  // Menu Controls
  openMenu: (position: MenuPosition) => void;
  closeMenu: () => void;
  updateQuery: (query: string) => void;
  setActiveCategory: (category: CommandCategory | 'all') => void;
  
  // Navigation
  navigateUp: () => void;
  navigateDown: () => void;
  
  // Selection
  selectCommand: (command: SlashCommand) => void;
  selectCurrentCommand: () => void;
  
  // Getters
  getFilteredCommands: () => SlashCommand[];
  getSelectedCommand: () => SlashCommand | null;
  isMenuOpen: () => boolean;
  getCurrentQuery: () => string;
  
  // Command Execution
  executeCommand: (command: SlashCommand, context: CommandContext) => Promise<CommandResult>;
  
  // Extension Integration
  getExtensionOptions: () => {
    onOpenMenu: (position: MenuPosition, query: string) => void;
    onCloseMenu: () => void;
    onUpdateQuery: (query: string) => void;
    onNavigate: (direction: 'up' | 'down') => void;
    onSelectCurrent: () => void;
    isMenuOpen: () => boolean;
    getCurrentQuery: () => string;
  };
}

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const createInitialState = (commands: SlashCommand[]): SlashMenuState => ({
  isOpen: false,
  query: '',
  selectedIndex: 0,
  position: { top: 0, left: 0, anchor: 'bottom' },
  filteredCommands: commands,
  activeCategory: 'all',
});

// -----------------------------------------------------------------------------
// Hook Implementation
// -----------------------------------------------------------------------------

export function useSlashCommands(options: UseSlashCommandsOptions = {}): UseSlashCommandsReturn {
  const {
    commands: customCommands,
    isPremium = false,
    keyword = '',
    targetAudience = 'general readers',
    contentType = 'blog-post',
    onAIRequest,
    onCommandExecute,
    onMenuOpen,
    onMenuClose,
  } = options;
  
  // Filter commands based on premium status
  const availableCommands = useMemo(() => {
    let cmds = customCommands || DEFAULT_SLASH_COMMANDS;
    if (!isPremium) {
      cmds = cmds.filter(cmd => !cmd.premium);
    }
    return cmds;
  }, [customCommands, isPremium]);
  
  // State
  const [menuState, setMenuState] = useState<SlashMenuState>(
    createInitialState(availableCommands)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for callbacks
  const slashPositionRef = useRef<number | null>(null);
  
  // ---------------------------------------------------------------------------
  // Menu Controls
  // ---------------------------------------------------------------------------
  
  const openMenu = useCallback((position: MenuPosition) => {
    setMenuState(prev => ({
      ...prev,
      isOpen: true,
      query: '',
      selectedIndex: 0,
      position,
      filteredCommands: availableCommands,
      activeCategory: 'all',
    }));
    setError(null);
    onMenuOpen?.();
  }, [availableCommands, onMenuOpen]);
  
  const closeMenu = useCallback(() => {
    setMenuState(prev => ({
      ...prev,
      isOpen: false,
      query: '',
      selectedIndex: 0,
    }));
    slashPositionRef.current = null;
    onMenuClose?.();
  }, [onMenuClose]);
  
  const updateQuery = useCallback((query: string) => {
    setMenuState(prev => {
      const filtered = filterCommands(availableCommands, query, prev.activeCategory);
      return {
        ...prev,
        query,
        filteredCommands: filtered,
        selectedIndex: 0, // Reset selection when query changes
      };
    });
  }, [availableCommands]);
  
  const setActiveCategory = useCallback((category: CommandCategory | 'all') => {
    setMenuState(prev => {
      const filtered = filterCommands(availableCommands, prev.query, category);
      return {
        ...prev,
        activeCategory: category,
        filteredCommands: filtered,
        selectedIndex: 0,
      };
    });
  }, [availableCommands]);
  
  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  
  const navigateUp = useCallback(() => {
    setMenuState(prev => {
      const count = prev.filteredCommands.length;
      if (count === 0) return prev;
      
      const newIndex = prev.selectedIndex <= 0 ? count - 1 : prev.selectedIndex - 1;
      return { ...prev, selectedIndex: newIndex };
    });
  }, []);
  
  const navigateDown = useCallback(() => {
    setMenuState(prev => {
      const count = prev.filteredCommands.length;
      if (count === 0) return prev;
      
      const newIndex = prev.selectedIndex >= count - 1 ? 0 : prev.selectedIndex + 1;
      return { ...prev, selectedIndex: newIndex };
    });
  }, []);
  
  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------
  
  const getSelectedCommand = useCallback((): SlashCommand | null => {
    const { filteredCommands, selectedIndex } = menuState;
    return filteredCommands[selectedIndex] || null;
  }, [menuState]);
  
  const selectCommand = useCallback((command: SlashCommand) => {
    closeMenu();
    // Command execution will be handled externally
  }, [closeMenu]);
  
  const selectCurrentCommand = useCallback(() => {
    const command = getSelectedCommand();
    if (command) {
      selectCommand(command);
    }
  }, [getSelectedCommand, selectCommand]);
  
  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------
  
  const getFilteredCommands = useCallback(() => {
    return menuState.filteredCommands;
  }, [menuState.filteredCommands]);
  
  const isMenuOpen = useCallback(() => {
    return menuState.isOpen;
  }, [menuState.isOpen]);
  
  const getCurrentQuery = useCallback(() => {
    return menuState.query;
  }, [menuState.query]);
  
  // ---------------------------------------------------------------------------
  // Command Execution
  // ---------------------------------------------------------------------------
  
  const executeCommand = useCallback(async (
    command: SlashCommand,
    context: CommandContext
  ): Promise<CommandResult> => {
    setIsLoading(true);
    setError(null);
    
    const startTime = Date.now();
    
    try {
      const result: CommandResult = {
        success: true,
        content: '',
        metadata: {
          commandId: command.id,
          executionTime: 0,
        },
      };
      
      // Handle different command action types
      const actionType = command.action.type;
      
      switch (actionType) {
        case 'insert-block':
          result.content = ''; // Block insertion is handled by editor
          result.metadata!.blockType = command.action.blockType;
          break;
          
        case 'insert-text':
          result.content = command.action.text;
          break;
          
        case 'ai-generate':
        case 'ai-transform':
          if (!onAIRequest) {
            throw new Error('AI request handler not configured');
          }
          
          // Build the appropriate prompt
          let prompt: string;
          if (actionType === 'ai-transform') {
            prompt = `${command.action.transformation}: ${context.selectedText || context.documentContent.slice(-500)}`;
          } else {
            const template = command.action.prompt;
            prompt = template.userPrompt || `Generate content: ${command.description}`;
          }
          
          // Make AI request
          const aiResult = await onAIRequest(prompt, command);
          result.content = aiResult;
          result.metadata!.tokensUsed = Math.ceil(aiResult.length / 4); // Rough estimate
          break;
          
        case 'open-modal':
          result.metadata!.modalType = command.action.modalType;
          break;
          
        case 'custom':
          result.metadata!.handler = command.action.handler;
          break;
          
        default:
          // Type exhaustive check
          const _exhaustive: never = command.action;
          throw new Error(`Unknown command action type`);
      }
      
      result.metadata!.executionTime = Date.now() - startTime;
      
      // Notify callback
      onCommandExecute?.(command, result);
      
      setIsLoading(false);
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Command execution failed';
      setError(errorMessage);
      setIsLoading(false);
      
      const result: CommandResult = {
        success: false,
        error: errorMessage,
        metadata: {
          commandId: command.id,
          executionTime: Date.now() - startTime,
        },
      };
      
      onCommandExecute?.(command, result);
      return result;
    }
  }, [onAIRequest, onCommandExecute, targetAudience]);
  
  // ---------------------------------------------------------------------------
  // Extension Integration Options
  // ---------------------------------------------------------------------------
  
  const getExtensionOptions = useCallback(() => ({
    onOpenMenu: (position: MenuPosition, query: string) => {
      openMenu(position);
      if (query) updateQuery(query);
    },
    onCloseMenu: closeMenu,
    onUpdateQuery: updateQuery,
    onNavigate: (direction: 'up' | 'down') => {
      if (direction === 'up') navigateUp();
      else navigateDown();
    },
    onSelectCurrent: selectCurrentCommand,
    isMenuOpen,
    getCurrentQuery,
  }), [openMenu, closeMenu, updateQuery, navigateUp, navigateDown, selectCurrentCommand, isMenuOpen, getCurrentQuery]);
  
  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------
  
  return {
    // State
    menuState,
    isLoading,
    error,
    
    // Menu Controls
    openMenu,
    closeMenu,
    updateQuery,
    setActiveCategory,
    
    // Navigation
    navigateUp,
    navigateDown,
    
    // Selection
    selectCommand,
    selectCurrentCommand,
    
    // Getters
    getFilteredCommands,
    getSelectedCommand,
    isMenuOpen,
    getCurrentQuery,
    
    // Command Execution
    executeCommand,
    
    // Extension Integration
    getExtensionOptions,
  };
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default useSlashCommands;

