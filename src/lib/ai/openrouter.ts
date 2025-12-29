/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠 OPENROUTER AI CLIENT
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Global AI client using OpenRouter.ai as the gateway to multiple LLMs.
 * Uses OpenAI SDK with custom baseURL pointing to OpenRouter.
 * 
 * Supported Models via OpenRouter:
 * - openai/gpt-4o-mini (default, cheapest)
 * - openai/gpt-4o
 * - anthropic/claude-3-haiku
 * - anthropic/claude-3-sonnet
 * - google/gemini-flash-1.5
 * - perplexity/sonar
 * - meta-llama/llama-3-70b-instruct
 * 
 * @example
 * ```ts
 * import { openrouter, MODELS } from "@/lib/ai/openrouter"
 * 
 * const response = await openrouter.chat.completions.create({
 *   model: MODELS.GPT4O_MINI,
 *   messages: [{ role: "user", content: "Hello!" }],
 * })
 * ```
 */

import OpenAI from "openai"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function getOpenRouterApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error(
      "❌ Missing OPENROUTER_API_KEY environment variable. " +
      "Get your API key from https://openrouter.ai/keys"
    )
  }

  return apiKey
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// AVAILABLE MODELS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Available models through OpenRouter.
 * Prices are approximate as of Dec 2024.
 */
export const MODELS = {
  // OpenAI Models
  GPT4O_MINI: "openai/gpt-4o-mini",           // $0.15/1M input, $0.60/1M output
  GPT4O: "openai/gpt-4o",                     // $5/1M input, $15/1M output
  GPT4_TURBO: "openai/gpt-4-turbo",           // $10/1M input, $30/1M output
  
  // Anthropic Models
  CLAUDE_3_HAIKU: "anthropic/claude-3-haiku", // $0.25/1M input, $1.25/1M output
  CLAUDE_3_SONNET: "anthropic/claude-3-sonnet", // $3/1M input, $15/1M output
  CLAUDE_3_OPUS: "anthropic/claude-3-opus",   // $15/1M input, $75/1M output
  
  // Google Models
  GEMINI_FLASH: "google/gemini-flash-1.5",    // $0.075/1M input, $0.30/1M output
  GEMINI_PRO: "google/gemini-pro-1.5",        // $1.25/1M input, $5/1M output
  
  // Perplexity (Real-time Search)
  PERPLEXITY_SONAR: "perplexity/sonar",       // $1/1M tokens
  
  // Meta Llama (Open Source)
  LLAMA_3_8B: "meta-llama/llama-3-8b-instruct",   // $0.06/1M tokens
  LLAMA_3_70B: "meta-llama/llama-3-70b-instruct", // $0.59/1M tokens
} as const

export type OpenRouterModel = (typeof MODELS)[keyof typeof MODELS]

/**
 * Default model for BlogSpy operations.
 * GPT-4o-mini provides great quality at very low cost.
 */
export const DEFAULT_MODEL: OpenRouterModel = MODELS.GPT4O_MINI

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// OPENROUTER CLIENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * OpenRouter configuration options
 */
interface OpenRouterConfig {
  /** Custom timeout in milliseconds (default: 60000) */
  timeout?: number
  /** Site URL for OpenRouter dashboard (default: https://blogspy.io) */
  siteUrl?: string
  /** Site name for OpenRouter dashboard (default: BlogSpy) */
  siteName?: string
}

/**
 * Creates an OpenRouter client instance.
 * Uses OpenAI SDK with custom baseURL.
 */
function createOpenRouterClient(config: OpenRouterConfig = {}) {
  const {
    timeout = 60000,
    siteUrl = "https://blogspy.io",
    siteName = "BlogSpy",
  } = config

  const apiKey = getOpenRouterApiKey()

  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    timeout,
    defaultHeaders: {
      "HTTP-Referer": siteUrl,
      "X-Title": siteName,
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Singleton pattern for OpenRouter client.
 * Ensures we only create one instance per runtime.
 */
let openrouterInstance: OpenAI | null = null

/**
 * Get or create the OpenRouter client instance.
 */
export function getOpenRouterClient(): OpenAI {
  if (!openrouterInstance) {
    openrouterInstance = createOpenRouterClient()
  }
  return openrouterInstance
}

/**
 * Global OpenRouter client instance.
 * Use this for all AI operations.
 * 
 * @example
 * ```ts
 * import { openrouter } from "@/lib/ai/openrouter"
 * 
 * const response = await openrouter.chat.completions.create({
 *   model: "openai/gpt-4o-mini",
 *   messages: [{ role: "user", content: "Hello!" }],
 * })
 * ```
 */
export const openrouter = getOpenRouterClient()

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export type ChatCompletionMessage = OpenAI.Chat.ChatCompletionMessageParam
export type ChatCompletionResponse = OpenAI.Chat.ChatCompletion
export type ChatCompletionStream = AsyncIterable<OpenAI.Chat.ChatCompletionChunk>

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Simple chat completion helper with defaults.
 */
export async function chat(
  messages: ChatCompletionMessage[],
  options?: {
    model?: OpenRouterModel
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  const { model = DEFAULT_MODEL, temperature = 0.7, maxTokens = 1000 } = options || {}

  const response = await openrouter.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  })

  return response.choices[0]?.message?.content || ""
}
