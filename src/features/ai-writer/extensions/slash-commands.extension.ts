// =============================================================================
// SLASH COMMANDS TIPTAP EXTENSION
// =============================================================================
// Industry-standard TipTap extension for slash commands like Notion
// Detects "/" trigger, manages menu state, and executes commands
// =============================================================================

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import type { SlashCommand, MenuPosition, CommandContext } from '@/src/features/ai-writer/types/tools/slash-commands.types';
import { DEFAULT_SLASH_COMMANDS } from '@/src/features/ai-writer/types/tools/slash-commands.types';

// -----------------------------------------------------------------------------
// Plugin Key
// -----------------------------------------------------------------------------

export const slashCommandsPluginKey = new PluginKey('slashCommands');

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface SlashCommandsOptions {
  commands: SlashCommand[];
  onOpenMenu: (position: MenuPosition, query: string) => void;
  onCloseMenu: () => void;
  onUpdateQuery: (query: string) => void;
  onNavigate: (direction: 'up' | 'down') => void;
  onSelectCurrent: () => void;
  isMenuOpen: () => boolean;
  getCurrentQuery: () => string;
}

export interface SlashCommandsStorage {
  slashPosition: number | null;
  isTypingSlash: boolean;
}

// -----------------------------------------------------------------------------
// Extension
// -----------------------------------------------------------------------------

export const SlashCommandsExtension = Extension.create<SlashCommandsOptions, SlashCommandsStorage>({
  name: 'slashCommands',
  
  addOptions() {
    return {
      commands: DEFAULT_SLASH_COMMANDS,
      onOpenMenu: () => {},
      onCloseMenu: () => {},
      onUpdateQuery: () => {},
      onNavigate: () => {},
      onSelectCurrent: () => {},
      isMenuOpen: () => false,
      getCurrentQuery: () => ''
    };
  },
  
  addStorage() {
    return {
      slashPosition: null,
      isTypingSlash: false
    };
  },
  
  addKeyboardShortcuts() {
    return {
      // Handle escape to close menu
      'Escape': () => {
        if (this.options.isMenuOpen()) {
          this.options.onCloseMenu();
          return true;
        }
        return false;
      },
      
      // Handle arrow up for navigation
      'ArrowUp': () => {
        if (this.options.isMenuOpen()) {
          this.options.onNavigate('up');
          return true;
        }
        return false;
      },
      
      // Handle arrow down for navigation
      'ArrowDown': () => {
        if (this.options.isMenuOpen()) {
          this.options.onNavigate('down');
          return true;
        }
        return false;
      },
      
      // Handle enter to select
      'Enter': () => {
        if (this.options.isMenuOpen()) {
          this.options.onSelectCurrent();
          return true;
        }
        return false;
      },
      
      // Handle tab to select (alternative)
      'Tab': () => {
        if (this.options.isMenuOpen()) {
          this.options.onSelectCurrent();
          return true;
        }
        return false;
      },
      
      // Handle backspace to potentially close menu
      'Backspace': () => {
        if (this.options.isMenuOpen()) {
          const query = this.options.getCurrentQuery();
          if (query.length === 0) {
            // Delete the slash character and close menu
            const { from } = this.editor.state.selection;
            const tr = this.editor.state.tr.delete(from - 1, from);
            this.editor.view.dispatch(tr);
            this.options.onCloseMenu();
            this.storage.slashPosition = null;
            return true;
          }
        }
        return false;
      }
    };
  },
  
  addProseMirrorPlugins() {
    const extension = this;
    
    return [
      new Plugin({
        key: slashCommandsPluginKey,
        
        // Optional: Add decoration for slash command input
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, _oldState) {
            if (!extension.options.isMenuOpen() || extension.storage.slashPosition === null) {
              return DecorationSet.empty;
            }
            
            // Add decoration to highlight slash command input
            const from = extension.storage.slashPosition;
            const to = tr.selection.from;
            
            if (from >= to) {
              return DecorationSet.empty;
            }
            
            const decoration = Decoration.inline(from, to, {
              class: 'slash-command-input'
            });
            
            return DecorationSet.create(tr.doc, [decoration]);
          }
        },
        
        props: {
          // Handle text input
          handleTextInput(view, from, _to, text) {
            // Check if typing "/"
            if (text === '/') {
              // Get caret position for menu
              const coords = view.coordsAtPos(from);
              const position: MenuPosition = {
                top: coords.bottom + 4,
                left: coords.left,
                anchor: 'bottom'
              };
              
              // Store slash position
              extension.storage.slashPosition = from;
              extension.storage.isTypingSlash = true;
              
              // Open menu with empty query
              setTimeout(() => {
                extension.options.onOpenMenu(position, '');
              }, 10);
              
              return false; // Let the "/" be inserted
            }
            
            // If menu is open and typing after slash, update query
            if (extension.options.isMenuOpen() && extension.storage.slashPosition !== null) {
              const slashPos = extension.storage.slashPosition;
              const { state } = view;
              const currentPos = state.selection.from;
              
              // Calculate query from content between slash and cursor + new char
              const contentAfterSlash = state.doc.textBetween(slashPos + 1, currentPos, '\n');
              const newQuery = contentAfterSlash + text;
              
              // Check if we should close menu (space, etc.)
              if (text === ' ' || text === '\n') {
                extension.options.onCloseMenu();
                extension.storage.slashPosition = null;
                return false;
              }
              
              setTimeout(() => {
                extension.options.onUpdateQuery(newQuery);
              }, 10);
            }
            
            return false;
          },
          
          // Handle key events for query backspace
          handleKeyDown(_view, event) {
            if (extension.options.isMenuOpen()) {
              // Handle backspace to update query
              if (event.key === 'Backspace') {
                const query = extension.options.getCurrentQuery();
                
                if (query.length > 0) {
                  // Update query with one less character
                  const newQuery = query.slice(0, -1);
                  setTimeout(() => {
                    extension.options.onUpdateQuery(newQuery);
                  }, 50);
                }
                // Actual backspace deletion handled by keyboard shortcut when query empty
              }
            }
            
            return false;
          },
          
          // Decorations getter
          decorations(state) {
            return this.getState(state);
          }
        }
      })
    ];
  }
});

// -----------------------------------------------------------------------------
// Helper: Remove Slash Command Text
// -----------------------------------------------------------------------------

export function removeSlashCommandText(editor: any) {
  // This needs access to the extension storage
  // Called when a command is selected to clean up the "/" and query
}

// -----------------------------------------------------------------------------
// Command Executor Helper
// -----------------------------------------------------------------------------

export interface CommandExecutorOptions {
  editor: any; // TipTap editor instance
  command: SlashCommand;
  slashPosition: number;
  onAIRequest?: (prompt: string, command: SlashCommand) => Promise<string>;
}

export async function executeSlashCommand({
  editor,
  command,
  slashPosition,
  onAIRequest
}: CommandExecutorOptions): Promise<void> {
  // Get current selection and cursor position
  const { from: cursorPos } = editor.state.selection;
  
  // Delete the slash command text (from "/" to cursor)
  editor.chain()
    .focus()
    .deleteRange({ from: slashPosition, to: cursorPos })
    .run();
  
  // Build command context
  const context: CommandContext = {
    selectedText: '',
    cursorPosition: cursorPos,
    documentContent: editor.state.doc.textContent,
    currentHeading: null,
    previousParagraph: null,
    keyword: '',
    competitors: []
  };
  
  // Execute based on command action type
  const actionType = command.action.type;
  
  switch (actionType) {
    case 'insert-block':
      executeBlockInsert(editor, command.action.blockType);
      break;
      
    case 'ai-generate':
    case 'ai-transform':
      if (onAIRequest) {
        await executeAICommand(editor, command, context, onAIRequest);
      }
      break;
      
    case 'insert-text':
      editor.chain().focus().insertContent(command.action.text).run();
      break;
      
    case 'open-modal':
      // Modal handling would be done externally
      console.log('Open modal:', command.action.modalType);
      break;
      
    case 'custom':
      // Custom handler would be called externally
      console.log('Custom handler:', command.action.handler);
      break;
      
    default:
      console.warn('Unknown command action type');
  }
}

function executeBlockInsert(editor: any, blockType: string) {
  switch (blockType) {
    case 'heading-1':
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      break;
    case 'heading-2':
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      break;
    case 'heading-3':
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      break;
    case 'bullet-list':
      editor.chain().focus().toggleBulletList().run();
      break;
    case 'numbered-list':
      editor.chain().focus().toggleOrderedList().run();
      break;
    case 'blockquote':
      editor.chain().focus().toggleBlockquote().run();
      break;
    case 'code-block':
      editor.chain().focus().toggleCodeBlock().run();
      break;
    case 'divider':
      editor.chain().focus().setHorizontalRule().run();
      break;
    case 'table':
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      break;
    case 'callout':
      // Insert a styled div for callout
      editor.chain().focus().insertContent({
        type: 'paragraph',
        content: [{ type: 'text', text: 'ðŸ’¡ ' }]
      }).run();
      break;
    default:
      // Default to paragraph
      editor.chain().focus().setParagraph().run();
  }
}

async function executeAICommand(
  editor: any,
  command: SlashCommand,
  context: CommandContext,
  onAIRequest: (prompt: string, command: SlashCommand) => Promise<string>
) {
  const { selection } = editor.state;
  const selectedText = editor.state.doc.textBetween(selection.from, selection.to, '\n');
  
  // Build prompt based on command action
  let prompt = `${command.description}`;
  
  if (command.action.type === 'ai-generate' && command.action.prompt) {
    const template = command.action.prompt;
    prompt = template.userPrompt || `Generate content: ${command.description}`;
  } else if (command.action.type === 'ai-transform') {
    prompt = `${command.action.transformation}: ${selectedText || context.documentContent.slice(-500)}`;
  }
  
  try {
    const result = await onAIRequest(prompt, command);
    
    if (command.action.type === 'ai-transform') {
      // Replace selection with result
      if (selection.from !== selection.to) {
        editor.chain()
          .focus()
          .deleteRange({ from: selection.from, to: selection.to })
          .insertContent(result)
          .run();
      } else {
        editor.chain().focus().insertContent(result).run();
      }
    } else {
      // Insert result at cursor
      editor.chain().focus().insertContent(result).run();
    }
  } catch (error) {
    console.error('AI command execution failed:', error);
  }
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default SlashCommandsExtension;

