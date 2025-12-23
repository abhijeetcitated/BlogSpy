// =============================================================================
// AI SLASH COMMANDS TYPES - Editor Slash Command System
// =============================================================================
// Industry-standard slash commands like Notion, Linear, Craft
// Type / in editor to access AI-powered content generation commands
// =============================================================================

// -----------------------------------------------------------------------------
// Command Types
// -----------------------------------------------------------------------------

/**
 * Command category for grouping
 */
export type CommandCategory = 
  | 'ai-generate'
  | 'ai-improve'
  | 'ai-format'
  | 'structure'
  | 'insert'
  | 'media'
  | 'seo';

/**
 * Individual slash command definition
 */
export interface SlashCommand {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: CommandCategory;
  keywords: string[]; // Search keywords
  shortcut?: string; // Optional keyboard shortcut
  premium?: boolean; // Premium feature flag
  
  // Command behavior
  action: CommandAction;
  
  // AI configuration (if applicable)
  aiConfig?: AICommandConfig;
}

/**
 * Command action type
 */
export type CommandAction = 
  | { type: 'insert-text'; text: string }
  | { type: 'insert-block'; blockType: BlockType }
  | { type: 'ai-generate'; prompt: AIPromptTemplate }
  | { type: 'ai-transform'; transformation: AITransformation }
  | { type: 'open-modal'; modalType: string }
  | { type: 'custom'; handler: string };

/**
 * Block types that can be inserted
 */
export type BlockType = 
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'paragraph'
  | 'bullet-list'
  | 'numbered-list'
  | 'task-list'
  | 'blockquote'
  | 'code-block'
  | 'divider'
  | 'table'
  | 'image'
  | 'video'
  | 'callout'
  | 'toggle'
  | 'faq'
  | 'toc';

/**
 * AI prompt template for generation
 */
export interface AIPromptTemplate {
  id: string;
  systemPrompt: string;
  userPrompt: string;
  variables: string[]; // Variables to be filled in
  maxTokens?: number;
  temperature?: number;
  format?: 'text' | 'html' | 'markdown';
}

/**
 * AI transformation types
 */
export type AITransformation = 
  | 'expand'
  | 'shorten'
  | 'simplify'
  | 'elaborate'
  | 'rewrite'
  | 'fix-grammar'
  | 'improve-flow'
  | 'make-formal'
  | 'make-casual'
  | 'add-examples'
  | 'add-statistics'
  | 'add-citations'
  | 'translate'
  | 'summarize'
  | 'bullet-points'
  | 'continue';

/**
 * AI command configuration
 */
export interface AICommandConfig {
  requiresSelection?: boolean;
  requiresContext?: boolean;
  streamResponse?: boolean;
  showPreview?: boolean;
}

// -----------------------------------------------------------------------------
// Menu State Types
// -----------------------------------------------------------------------------

/**
 * Slash command menu state
 */
export interface SlashMenuState {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  position: MenuPosition;
  filteredCommands: SlashCommand[];
  activeCategory: CommandCategory | 'all';
}

/**
 * Menu position on screen
 */
export interface MenuPosition {
  top: number;
  left: number;
  anchor: 'top' | 'bottom';
}

/**
 * Command execution context
 */
export interface CommandContext {
  selectedText: string;
  cursorPosition: number;
  documentContent: string;
  currentHeading: string | null;
  previousParagraph: string | null;
  keyword: string;
  competitors: string[];
}

/**
 * Command execution result
 */
export interface CommandResult {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: Record<string, any>;
}

// -----------------------------------------------------------------------------
// AI Generation Types
// -----------------------------------------------------------------------------

/**
 * AI generation request
 */
export interface AIGenerationRequest {
  command: SlashCommand;
  context: CommandContext;
  customInput?: string;
}

/**
 * AI generation response
 */
export interface AIGenerationResponse {
  content: string;
  tokens: number;
  model: string;
  cached: boolean;
}

/**
 * Streaming callback
 */
export type StreamCallback = (chunk: string, done: boolean) => void;

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const COMMAND_CATEGORIES: Record<CommandCategory, { label: string; icon: string }> = {
  'ai-generate': { label: 'AI Generate', icon: 'Sparkles' },
  'ai-improve': { label: 'AI Improve', icon: 'Wand2' },
  'ai-format': { label: 'AI Format', icon: 'Type' },
  'structure': { label: 'Structure', icon: 'Layers' },
  'insert': { label: 'Insert', icon: 'Plus' },
  'media': { label: 'Media', icon: 'Image' },
  'seo': { label: 'SEO', icon: 'Search' }
};

export const DEFAULT_MENU_STATE: SlashMenuState = {
  isOpen: false,
  query: '',
  selectedIndex: 0,
  position: { top: 0, left: 0, anchor: 'bottom' },
  filteredCommands: [],
  activeCategory: 'all'
};

// -----------------------------------------------------------------------------
// Default Slash Commands
// -----------------------------------------------------------------------------

export const DEFAULT_SLASH_COMMANDS: SlashCommand[] = [
  // AI Generate Commands
  {
    id: 'ai-continue',
    name: 'Continue writing',
    description: 'Let AI continue writing from where you left off',
    icon: 'ArrowRight',
    category: 'ai-generate',
    keywords: ['continue', 'write', 'more', 'extend', 'next'],
    action: { type: 'ai-transform', transformation: 'continue' },
    aiConfig: { requiresContext: true, streamResponse: true }
  },
  {
    id: 'ai-paragraph',
    name: 'Write paragraph',
    description: 'Generate a paragraph about a topic',
    icon: 'FileText',
    category: 'ai-generate',
    keywords: ['paragraph', 'write', 'text', 'content'],
    action: { type: 'ai-generate', prompt: { id: 'paragraph', systemPrompt: '', userPrompt: '', variables: ['topic'] } },
    aiConfig: { streamResponse: true }
  },
  {
    id: 'ai-intro',
    name: 'Write introduction',
    description: 'Generate an engaging introduction',
    icon: 'BookOpen',
    category: 'ai-generate',
    keywords: ['intro', 'introduction', 'opening', 'start'],
    action: { type: 'ai-generate', prompt: { id: 'intro', systemPrompt: '', userPrompt: '', variables: ['topic'] } },
    aiConfig: { streamResponse: true }
  },
  {
    id: 'ai-conclusion',
    name: 'Write conclusion',
    description: 'Generate a compelling conclusion',
    icon: 'Flag',
    category: 'ai-generate',
    keywords: ['conclusion', 'ending', 'summary', 'wrap'],
    action: { type: 'ai-generate', prompt: { id: 'conclusion', systemPrompt: '', userPrompt: '', variables: ['topic'] } },
    aiConfig: { streamResponse: true }
  },
  {
    id: 'ai-outline',
    name: 'Generate outline',
    description: 'Create an article outline with headings',
    icon: 'List',
    category: 'ai-generate',
    keywords: ['outline', 'structure', 'headings', 'plan'],
    action: { type: 'ai-generate', prompt: { id: 'outline', systemPrompt: '', userPrompt: '', variables: ['topic'] } },
    aiConfig: { streamResponse: true }
  },
  {
    id: 'ai-faq',
    name: 'Generate FAQ',
    description: 'Create FAQ section with Q&A',
    icon: 'HelpCircle',
    category: 'ai-generate',
    keywords: ['faq', 'questions', 'answers', 'qa'],
    action: { type: 'ai-generate', prompt: { id: 'faq', systemPrompt: '', userPrompt: '', variables: ['topic'] } },
    aiConfig: { streamResponse: true }
  },
  {
    id: 'ai-listicle',
    name: 'Generate list',
    description: 'Create a numbered or bullet list',
    icon: 'ListOrdered',
    category: 'ai-generate',
    keywords: ['list', 'listicle', 'tips', 'points'],
    action: { type: 'ai-generate', prompt: { id: 'list', systemPrompt: '', userPrompt: '', variables: ['topic'] } },
    aiConfig: { streamResponse: true }
  },
  
  // AI Improve Commands
  {
    id: 'ai-expand',
    name: 'Expand',
    description: 'Make selected text longer and more detailed',
    icon: 'Maximize2',
    category: 'ai-improve',
    keywords: ['expand', 'longer', 'more', 'detail', 'elaborate'],
    action: { type: 'ai-transform', transformation: 'expand' },
    aiConfig: { requiresSelection: true, streamResponse: true, showPreview: true }
  },
  {
    id: 'ai-shorten',
    name: 'Shorten',
    description: 'Make selected text more concise',
    icon: 'Minimize2',
    category: 'ai-improve',
    keywords: ['shorten', 'shorter', 'concise', 'brief', 'compress'],
    action: { type: 'ai-transform', transformation: 'shorten' },
    aiConfig: { requiresSelection: true, streamResponse: true, showPreview: true }
  },
  {
    id: 'ai-simplify',
    name: 'Simplify',
    description: 'Simplify complex text for easier reading',
    icon: 'Feather',
    category: 'ai-improve',
    keywords: ['simplify', 'simple', 'easy', 'basic', 'plain'],
    action: { type: 'ai-transform', transformation: 'simplify' },
    aiConfig: { requiresSelection: true, streamResponse: true, showPreview: true }
  },
  {
    id: 'ai-rewrite',
    name: 'Rewrite',
    description: 'Rewrite selected text differently',
    icon: 'RefreshCw',
    category: 'ai-improve',
    keywords: ['rewrite', 'rephrase', 'different', 'alternative'],
    action: { type: 'ai-transform', transformation: 'rewrite' },
    aiConfig: { requiresSelection: true, streamResponse: true, showPreview: true }
  },
  {
    id: 'ai-grammar',
    name: 'Fix grammar',
    description: 'Fix grammar and spelling errors',
    icon: 'Check',
    category: 'ai-improve',
    keywords: ['grammar', 'spelling', 'fix', 'correct', 'proofread'],
    action: { type: 'ai-transform', transformation: 'fix-grammar' },
    aiConfig: { requiresSelection: true, showPreview: true }
  },
  {
    id: 'ai-improve-flow',
    name: 'Improve flow',
    description: 'Improve readability and flow',
    icon: 'Wind',
    category: 'ai-improve',
    keywords: ['flow', 'readability', 'smooth', 'improve'],
    action: { type: 'ai-transform', transformation: 'improve-flow' },
    aiConfig: { requiresSelection: true, streamResponse: true, showPreview: true }
  },
  
  // AI Format Commands
  {
    id: 'ai-formal',
    name: 'Make formal',
    description: 'Convert to formal/professional tone',
    icon: 'Briefcase',
    category: 'ai-format',
    keywords: ['formal', 'professional', 'business', 'serious'],
    action: { type: 'ai-transform', transformation: 'make-formal' },
    aiConfig: { requiresSelection: true, showPreview: true }
  },
  {
    id: 'ai-casual',
    name: 'Make casual',
    description: 'Convert to casual/friendly tone',
    icon: 'Smile',
    category: 'ai-format',
    keywords: ['casual', 'friendly', 'informal', 'conversational'],
    action: { type: 'ai-transform', transformation: 'make-casual' },
    aiConfig: { requiresSelection: true, showPreview: true }
  },
  {
    id: 'ai-bullets',
    name: 'Convert to bullets',
    description: 'Convert text to bullet points',
    icon: 'List',
    category: 'ai-format',
    keywords: ['bullets', 'bullet points', 'list', 'convert'],
    action: { type: 'ai-transform', transformation: 'bullet-points' },
    aiConfig: { requiresSelection: true }
  },
  {
    id: 'ai-summarize',
    name: 'Summarize',
    description: 'Create a brief summary',
    icon: 'FileText',
    category: 'ai-format',
    keywords: ['summarize', 'summary', 'brief', 'tldr'],
    action: { type: 'ai-transform', transformation: 'summarize' },
    aiConfig: { requiresSelection: true, showPreview: true }
  },
  
  // Structure Commands
  {
    id: 'heading-1',
    name: 'Heading 1',
    description: 'Large section heading',
    icon: 'Heading1',
    category: 'structure',
    keywords: ['h1', 'heading', 'title', 'large'],
    shortcut: 'Mod+Alt+1',
    action: { type: 'insert-block', blockType: 'heading-1' }
  },
  {
    id: 'heading-2',
    name: 'Heading 2',
    description: 'Medium section heading',
    icon: 'Heading2',
    category: 'structure',
    keywords: ['h2', 'heading', 'section', 'medium'],
    shortcut: 'Mod+Alt+2',
    action: { type: 'insert-block', blockType: 'heading-2' }
  },
  {
    id: 'heading-3',
    name: 'Heading 3',
    description: 'Small section heading',
    icon: 'Heading3',
    category: 'structure',
    keywords: ['h3', 'heading', 'subsection', 'small'],
    shortcut: 'Mod+Alt+3',
    action: { type: 'insert-block', blockType: 'heading-3' }
  },
  {
    id: 'bullet-list',
    name: 'Bullet list',
    description: 'Create a bullet list',
    icon: 'List',
    category: 'structure',
    keywords: ['bullet', 'list', 'unordered'],
    action: { type: 'insert-block', blockType: 'bullet-list' }
  },
  {
    id: 'numbered-list',
    name: 'Numbered list',
    description: 'Create a numbered list',
    icon: 'ListOrdered',
    category: 'structure',
    keywords: ['numbered', 'list', 'ordered'],
    action: { type: 'insert-block', blockType: 'numbered-list' }
  },
  {
    id: 'quote',
    name: 'Quote',
    description: 'Add a blockquote',
    icon: 'Quote',
    category: 'structure',
    keywords: ['quote', 'blockquote', 'citation'],
    action: { type: 'insert-block', blockType: 'blockquote' }
  },
  {
    id: 'code',
    name: 'Code block',
    description: 'Add a code block',
    icon: 'Code',
    category: 'structure',
    keywords: ['code', 'snippet', 'programming'],
    action: { type: 'insert-block', blockType: 'code-block' }
  },
  {
    id: 'divider',
    name: 'Divider',
    description: 'Add a horizontal divider',
    icon: 'Minus',
    category: 'structure',
    keywords: ['divider', 'hr', 'line', 'separator'],
    action: { type: 'insert-block', blockType: 'divider' }
  },
  {
    id: 'table',
    name: 'Table',
    description: 'Add a table',
    icon: 'Table',
    category: 'structure',
    keywords: ['table', 'grid', 'data'],
    action: { type: 'insert-block', blockType: 'table' }
  },
  {
    id: 'callout',
    name: 'Callout',
    description: 'Add an info callout box',
    icon: 'Info',
    category: 'structure',
    keywords: ['callout', 'info', 'note', 'tip', 'warning'],
    action: { type: 'insert-block', blockType: 'callout' }
  },
  
  // Insert Commands
  {
    id: 'toc',
    name: 'Table of contents',
    description: 'Insert table of contents',
    icon: 'BookOpen',
    category: 'insert',
    keywords: ['toc', 'table of contents', 'navigation'],
    action: { type: 'insert-block', blockType: 'toc' }
  },
  
  // Media Commands
  {
    id: 'image',
    name: 'Image',
    description: 'Insert an image',
    icon: 'Image',
    category: 'media',
    keywords: ['image', 'picture', 'photo', 'img'],
    action: { type: 'open-modal', modalType: 'image-upload' }
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Embed a video',
    icon: 'Video',
    category: 'media',
    keywords: ['video', 'youtube', 'embed'],
    action: { type: 'open-modal', modalType: 'video-embed' }
  },
  
  // SEO Commands
  {
    id: 'seo-add-keyword',
    name: 'Add keyword',
    description: 'Naturally add target keyword',
    icon: 'Target',
    category: 'seo',
    keywords: ['keyword', 'seo', 'optimize'],
    action: { type: 'ai-transform', transformation: 'expand' },
    aiConfig: { requiresSelection: true },
    premium: true
  },
  {
    id: 'seo-add-stats',
    name: 'Add statistics',
    description: 'Add relevant statistics and data',
    icon: 'BarChart',
    category: 'seo',
    keywords: ['statistics', 'stats', 'data', 'numbers'],
    action: { type: 'ai-transform', transformation: 'add-statistics' },
    aiConfig: { requiresSelection: true, streamResponse: true },
    premium: true
  },
  {
    id: 'seo-add-citations',
    name: 'Add citations',
    description: 'Add authoritative source citations',
    icon: 'Quote',
    category: 'seo',
    keywords: ['citations', 'sources', 'references', 'cite'],
    action: { type: 'ai-transform', transformation: 'add-citations' },
    aiConfig: { requiresSelection: true, streamResponse: true },
    premium: true
  }
];

// -----------------------------------------------------------------------------
// AI Prompt Templates
// -----------------------------------------------------------------------------

export const AI_PROMPT_TEMPLATES: Record<string, AIPromptTemplate> = {
  paragraph: {
    id: 'paragraph',
    systemPrompt: `You are an expert content writer. Write engaging, informative paragraphs that are well-researched and SEO-friendly. Use clear, concise language and maintain a natural flow.`,
    userPrompt: `Write a detailed paragraph about: {{topic}}
    
Context from the article:
{{context}}

Target keyword: {{keyword}}

Requirements:
- Write 3-5 sentences
- Be informative and engaging
- Use natural language
- Include relevant details`,
    variables: ['topic', 'context', 'keyword'],
    maxTokens: 300,
    temperature: 0.7,
    format: 'html'
  },
  
  intro: {
    id: 'intro',
    systemPrompt: `You are an expert content writer specializing in engaging introductions. Create hooks that capture reader attention and clearly establish the article's value proposition.`,
    userPrompt: `Write an engaging introduction for an article about: {{topic}}

Target keyword: {{keyword}}

Requirements:
- Start with a hook (question, statistic, or bold statement)
- Establish the problem or opportunity
- Preview what the reader will learn
- Keep it to 2-3 paragraphs
- Be engaging and value-focused`,
    variables: ['topic', 'keyword'],
    maxTokens: 400,
    temperature: 0.8,
    format: 'html'
  },
  
  conclusion: {
    id: 'conclusion',
    systemPrompt: `You are an expert content writer. Create compelling conclusions that summarize key points and provide clear next steps or calls to action.`,
    userPrompt: `Write a conclusion for an article about: {{topic}}

Article summary so far:
{{context}}

Requirements:
- Summarize key takeaways
- Reinforce the main message
- Include a call to action
- Keep it to 1-2 paragraphs
- End on a strong note`,
    variables: ['topic', 'context'],
    maxTokens: 300,
    temperature: 0.7,
    format: 'html'
  },
  
  outline: {
    id: 'outline',
    systemPrompt: `You are an SEO content strategist. Create comprehensive article outlines that cover topics thoroughly and are optimized for search intent.`,
    userPrompt: `Create an article outline for: {{topic}}

Target keyword: {{keyword}}

Requirements:
- Include H2 and H3 headings
- Cover all important subtopics
- Consider search intent
- Include FAQ section
- Suggest approximate word counts per section`,
    variables: ['topic', 'keyword'],
    maxTokens: 600,
    temperature: 0.6,
    format: 'markdown'
  },
  
  faq: {
    id: 'faq',
    systemPrompt: `You are an expert at creating FAQ sections. Generate relevant questions and comprehensive answers that match common user queries.`,
    userPrompt: `Create a FAQ section for: {{topic}}

Target keyword: {{keyword}}

Requirements:
- Generate 5-7 relevant questions
- Questions should match "People Also Ask" style
- Answers should be 2-4 sentences each
- Format as proper FAQ markup
- Cover common concerns and questions`,
    variables: ['topic', 'keyword'],
    maxTokens: 800,
    temperature: 0.7,
    format: 'html'
  },
  
  list: {
    id: 'list',
    systemPrompt: `You are a content writer specializing in listicles. Create informative, well-organized lists that provide value to readers.`,
    userPrompt: `Create a list of {{topic}}

Requirements:
- Generate 7-10 items
- Each item should have a title and brief description
- Be specific and actionable
- Include relevant examples
- Format as numbered list`,
    variables: ['topic'],
    maxTokens: 600,
    temperature: 0.7,
    format: 'html'
  }
};

// -----------------------------------------------------------------------------
// Transformation Prompts
// -----------------------------------------------------------------------------

export const TRANSFORMATION_PROMPTS: Record<AITransformation, string> = {
  expand: `Expand this text to be more detailed and comprehensive. Add relevant examples, explanations, and supporting details. Maintain the original meaning and tone. Double the length approximately.`,
  
  shorten: `Shorten this text while keeping the key message and important information. Remove redundancy and unnecessary words. Aim for 50% of the original length.`,
  
  simplify: `Simplify this text to make it easier to understand. Use simpler words, shorter sentences, and clearer explanations. Target a 6th-grade reading level.`,
  
  elaborate: `Elaborate on this text by adding more depth, context, and supporting information. Include relevant examples and explanations.`,
  
  rewrite: `Rewrite this text in a different way while maintaining the same meaning. Use different sentence structures and word choices. Make it fresh and engaging.`,
  
  'fix-grammar': `Fix all grammar, spelling, and punctuation errors in this text. Also improve sentence structure where needed. Maintain the original meaning and tone.`,
  
  'improve-flow': `Improve the flow and readability of this text. Add transitions, vary sentence structure, and ensure ideas connect smoothly. Keep the original meaning.`,
  
  'make-formal': `Convert this text to a more formal, professional tone. Use proper business language, avoid contractions, and maintain a professional voice.`,
  
  'make-casual': `Convert this text to a more casual, conversational tone. Use friendly language, contractions where appropriate, and a personable voice.`,
  
  'add-examples': `Add relevant examples and illustrations to this text. Include specific cases, scenarios, or data points that support the main ideas.`,
  
  'add-statistics': `Add relevant statistics, data points, and research findings to support this text. Include source attributions where possible.`,
  
  'add-citations': `Add authoritative source citations to support the claims in this text. Include links to reputable sources where relevant.`,
  
  translate: `Translate this text while maintaining the original meaning, tone, and style as closely as possible.`,
  
  summarize: `Summarize this text in 2-3 sentences, capturing the key points and main message.`,
  
  'bullet-points': `Convert this text into a clear bullet point list. Each bullet should capture one key idea or piece of information.`,
  
  continue: `Continue writing from where this text ends. Maintain the same style, tone, and topic. Add 2-3 new paragraphs that naturally follow.`
};
