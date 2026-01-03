// =============================================================================
// SLASH COMMAND UTILITIES - Command Processing and Execution
// =============================================================================
// Industry-standard slash commands like Notion, Linear, Craft
// Production-ready command filtering, matching, and execution
// =============================================================================

import type {
  SlashCommand,
  CommandCategory,
  CommandContext,
  CommandResult,
  AIGenerationRequest,
  AITransformation,
  SlashMenuState,
  MenuPosition
} from '@/src/features/ai-writer/types/tools/slash-commands.types';

import {
  DEFAULT_SLASH_COMMANDS,
  TRANSFORMATION_PROMPTS,
  AI_PROMPT_TEMPLATES,
  DEFAULT_MENU_STATE
} from '@/src/features/ai-writer/types/tools/slash-commands.types';

// -----------------------------------------------------------------------------
// Command Filtering
// -----------------------------------------------------------------------------

/**
 * Filter commands based on search query
 */
export function filterCommands(
  commands: SlashCommand[],
  query: string,
  category: CommandCategory | 'all' = 'all'
): SlashCommand[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  // First filter by category
  let filtered = category === 'all'
    ? commands
    : commands.filter(cmd => cmd.category === category);
  
  // If no query, return all in category
  if (!normalizedQuery) {
    return filtered;
  }
  
  // Score and filter by query match
  const scored = filtered.map(cmd => ({
    command: cmd,
    score: calculateCommandScore(cmd, normalizedQuery)
  }));
  
  // Filter out non-matches and sort by score
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.command);
}

/**
 * Calculate match score for a command
 */
function calculateCommandScore(command: SlashCommand, query: string): number {
  let score = 0;
  
  // Exact name match (highest priority)
  if (command.name.toLowerCase() === query) {
    score += 100;
  }
  // Name starts with query
  else if (command.name.toLowerCase().startsWith(query)) {
    score += 80;
  }
  // Name contains query
  else if (command.name.toLowerCase().includes(query)) {
    score += 60;
  }
  
  // Keyword matches
  for (const keyword of command.keywords) {
    if (keyword === query) {
      score += 50;
    } else if (keyword.startsWith(query)) {
      score += 30;
    } else if (keyword.includes(query)) {
      score += 20;
    }
  }
  
  // Description match (lower priority)
  if (command.description.toLowerCase().includes(query)) {
    score += 10;
  }
  
  // ID match
  if (command.id.toLowerCase().includes(query)) {
    score += 5;
  }
  
  return score;
}

/**
 * Group commands by category
 */
export function groupCommandsByCategory(
  commands: SlashCommand[]
): Map<CommandCategory, SlashCommand[]> {
  const groups = new Map<CommandCategory, SlashCommand[]>();
  
  for (const command of commands) {
    const existing = groups.get(command.category) || [];
    groups.set(command.category, [...existing, command]);
  }
  
  return groups;
}

/**
 * Get commands that require selection
 */
export function getSelectionCommands(commands: SlashCommand[]): SlashCommand[] {
  return commands.filter(cmd => cmd.aiConfig?.requiresSelection);
}

/**
 * Get commands available without selection
 */
export function getNoSelectionCommands(commands: SlashCommand[]): SlashCommand[] {
  return commands.filter(cmd => !cmd.aiConfig?.requiresSelection);
}

// -----------------------------------------------------------------------------
// Menu State Management
// -----------------------------------------------------------------------------

/**
 * Calculate menu position based on cursor
 */
export function calculateMenuPosition(
  cursorRect: DOMRect,
  menuHeight: number = 300,
  menuWidth: number = 320
): MenuPosition {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  // Calculate ideal position below cursor
  let top = cursorRect.bottom + 8;
  let left = cursorRect.left;
  let anchor: 'top' | 'bottom' = 'bottom';
  
  // If not enough space below, show above
  if (top + menuHeight > viewportHeight - 20) {
    top = cursorRect.top - menuHeight - 8;
    anchor = 'top';
  }
  
  // Ensure menu doesn't go off right edge
  if (left + menuWidth > viewportWidth - 20) {
    left = viewportWidth - menuWidth - 20;
  }
  
  // Ensure menu doesn't go off left edge
  if (left < 20) {
    left = 20;
  }
  
  return { top, left, anchor };
}

/**
 * Create initial menu state
 */
export function createMenuState(
  position: MenuPosition,
  commands: SlashCommand[]
): SlashMenuState {
  return {
    isOpen: true,
    query: '',
    selectedIndex: 0,
    position,
    filteredCommands: commands,
    activeCategory: 'all'
  };
}

/**
 * Update menu state with query
 */
export function updateMenuQuery(
  state: SlashMenuState,
  query: string,
  allCommands: SlashCommand[]
): SlashMenuState {
  const filteredCommands = filterCommands(allCommands, query, state.activeCategory);
  
  return {
    ...state,
    query,
    filteredCommands,
    selectedIndex: 0 // Reset selection when query changes
  };
}

/**
 * Navigate selection up
 */
export function navigateUp(state: SlashMenuState): SlashMenuState {
  if (state.filteredCommands.length === 0) return state;
  
  const newIndex = state.selectedIndex <= 0
    ? state.filteredCommands.length - 1
    : state.selectedIndex - 1;
  
  return { ...state, selectedIndex: newIndex };
}

/**
 * Navigate selection down
 */
export function navigateDown(state: SlashMenuState): SlashMenuState {
  if (state.filteredCommands.length === 0) return state;
  
  const newIndex = state.selectedIndex >= state.filteredCommands.length - 1
    ? 0
    : state.selectedIndex + 1;
  
  return { ...state, selectedIndex: newIndex };
}

/**
 * Get currently selected command
 */
export function getSelectedCommand(state: SlashMenuState): SlashCommand | null {
  if (state.filteredCommands.length === 0) return null;
  return state.filteredCommands[state.selectedIndex] || null;
}

// -----------------------------------------------------------------------------
// Command Execution
// -----------------------------------------------------------------------------

/**
 * Build command context from editor state
 */
export function buildCommandContext(
  selectedText: string,
  documentContent: string,
  cursorPosition: number,
  keyword: string = '',
  competitors: string[] = []
): CommandContext {
  // Extract current heading
  const headingMatch = documentContent
    .substring(0, cursorPosition)
    .match(/<h[1-6][^>]*>([^<]*)<\/h[1-6]>/gi);
  const currentHeading = headingMatch 
    ? headingMatch[headingMatch.length - 1]?.replace(/<[^>]+>/g, '')
    : null;
  
  // Extract previous paragraph
  const paragraphMatch = documentContent
    .substring(0, cursorPosition)
    .match(/<p[^>]*>([^<]*)<\/p>/gi);
  const previousParagraph = paragraphMatch
    ? paragraphMatch[paragraphMatch.length - 1]?.replace(/<[^>]+>/g, '')
    : null;
  
  return {
    selectedText,
    cursorPosition,
    documentContent,
    currentHeading,
    previousParagraph,
    keyword,
    competitors
  };
}

/**
 * Execute a slash command
 */
export async function executeCommand(
  command: SlashCommand,
  context: CommandContext,
  customInput?: string
): Promise<CommandResult> {
  try {
    switch (command.action.type) {
      case 'insert-text':
        return {
          success: true,
          content: command.action.text
        };
      
      case 'insert-block':
        return {
          success: true,
          content: generateBlockHTML(command.action.blockType),
          metadata: { blockType: command.action.blockType }
        };
      
      case 'ai-generate':
        // This would call the AI service in production
        return {
          success: true,
          content: `<!-- AI-generated content for ${command.id} -->\n<p>AI content will be generated here.</p>`,
          metadata: { promptId: command.action.prompt.id }
        };
      
      case 'ai-transform':
        // This would call the AI service in production
        return {
          success: true,
          content: `<!-- AI-transformed content using ${command.action.transformation} -->`,
          metadata: { transformation: command.action.transformation }
        };
      
      case 'open-modal':
        return {
          success: true,
          metadata: { modalType: command.action.modalType }
        };
      
      case 'custom':
        return {
          success: true,
          metadata: { handler: command.action.handler }
        };
      
      default:
        return {
          success: false,
          error: 'Unknown command action type'
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Command execution failed'
    };
  }
}

/**
 * Generate HTML for block types
 */
export function generateBlockHTML(blockType: string): string {
  switch (blockType) {
    case 'heading-1':
      return '<h1></h1>';
    case 'heading-2':
      return '<h2></h2>';
    case 'heading-3':
      return '<h3></h3>';
    case 'paragraph':
      return '<p></p>';
    case 'bullet-list':
      return '<ul><li></li></ul>';
    case 'numbered-list':
      return '<ol><li></li></ol>';
    case 'task-list':
      return '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"></li></ul>';
    case 'blockquote':
      return '<blockquote><p></p></blockquote>';
    case 'code-block':
      return '<pre><code></code></pre>';
    case 'divider':
      return '<hr />';
    case 'table':
      return `<table>
        <tbody>
          <tr><td></td><td></td><td></td></tr>
          <tr><td></td><td></td><td></td></tr>
          <tr><td></td><td></td><td></td></tr>
        </tbody>
      </table>`;
    case 'callout':
      return '<div class="callout" data-type="info"><p></p></div>';
    case 'toggle':
      return '<details><summary>Click to expand</summary><p></p></details>';
    case 'faq':
      return `<div class="faq-item">
        <h3 class="faq-question">Question?</h3>
        <p class="faq-answer">Answer here.</p>
      </div>`;
    case 'toc':
      return '<nav class="table-of-contents" data-type="toc"></nav>';
    default:
      return '<p></p>';
  }
}

// -----------------------------------------------------------------------------
// AI Prompt Building
// -----------------------------------------------------------------------------

/**
 * Build AI prompt from template and context
 */
export function buildAIPrompt(
  templateId: string,
  context: CommandContext,
  customVariables: Record<string, string> = {}
): { system: string; user: string } | null {
  const template = AI_PROMPT_TEMPLATES[templateId];
  if (!template) return null;
  
  // Build variables
  const variables: Record<string, string> = {
    topic: customVariables.topic || context.currentHeading || 'the current topic',
    context: context.previousParagraph || context.selectedText || '',
    keyword: context.keyword || '',
    selection: context.selectedText || '',
    ...customVariables
  };
  
  // Replace variables in prompts
  let systemPrompt = template.systemPrompt;
  let userPrompt = template.userPrompt;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    systemPrompt = systemPrompt.replaceAll(placeholder, value);
    userPrompt = userPrompt.replaceAll(placeholder, value);
  }
  
  return { system: systemPrompt, user: userPrompt };
}

/**
 * Build transformation prompt
 */
export function buildTransformationPrompt(
  transformation: AITransformation,
  selectedText: string,
  context: CommandContext
): { system: string; user: string } {
  const systemPrompt = `You are an expert content editor. Transform the given text according to the instructions. Maintain the original meaning and context. Output only the transformed text without explanations.`;
  
  const instruction = TRANSFORMATION_PROMPTS[transformation] || '';
  
  const userPrompt = `${instruction}

Text to transform:
"""
${selectedText}
"""

Context (for reference):
- Current section: ${context.currentHeading || 'N/A'}
- Target keyword: ${context.keyword || 'N/A'}

Output the transformed text only.`;
  
  return { system: systemPrompt, user: userPrompt };
}

// -----------------------------------------------------------------------------
// Keyboard Handling
// -----------------------------------------------------------------------------

/**
 * Check if a keyboard event should trigger slash menu
 */
export function shouldTriggerMenu(event: KeyboardEvent, text: string): boolean {
  // Check if "/" is typed at the start of a line or after whitespace
  if (event.key !== '/') return false;
  
  // Get character before cursor
  const charBefore = text.slice(-1);
  
  // Trigger if at start or after whitespace/newline
  return text.length === 0 || /[\s\n]/.test(charBefore);
}

/**
 * Handle keyboard navigation in menu
 */
export function handleMenuKeyboard(
  event: KeyboardEvent,
  state: SlashMenuState
): { newState: SlashMenuState | null; action: 'select' | 'close' | 'navigate' | 'none' } {
  switch (event.key) {
    case 'ArrowUp':
      return { newState: navigateUp(state), action: 'navigate' };
    
    case 'ArrowDown':
      return { newState: navigateDown(state), action: 'navigate' };
    
    case 'Enter':
    case 'Tab':
      return { newState: null, action: 'select' };
    
    case 'Escape':
      return { newState: { ...DEFAULT_MENU_STATE }, action: 'close' };
    
    default:
      return { newState: null, action: 'none' };
  }
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export {
  DEFAULT_SLASH_COMMANDS,
  DEFAULT_MENU_STATE,
  AI_PROMPT_TEMPLATES,
  TRANSFORMATION_PROMPTS
} from '@/src/features/ai-writer/types/tools/slash-commands.types';

