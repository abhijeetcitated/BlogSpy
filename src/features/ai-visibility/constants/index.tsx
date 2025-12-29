// AI Visibility Tracker Constants

import React from "react"
import Image from "next/image"
import { AIPlatformConfig, CitationType } from "../types"

// AI Platform Icon paths (using SVG files from public folder)
const ICON_BASE_PATH = "/assets/icons/ai-platforms"

// Real SVG Icons for AI Platforms (Using external SVG files)
export const PlatformIcons: Record<string, () => React.JSX.Element> = {
  "google-aio": () => (
    <Image 
      src={`${ICON_BASE_PATH}/google-aio.svg`} 
      alt="Google AI Overviews" 
      width={20} 
      height={20}
      className="w-5 h-5"
    />
  ),
  chatgpt: () => (
    <Image 
      src={`${ICON_BASE_PATH}/chatgpt.svg`} 
      alt="ChatGPT" 
      width={20} 
      height={20}
      className="w-5 h-5 dark:invert"
    />
  ),
  perplexity: () => (
    <Image 
      src={`${ICON_BASE_PATH}/perplexity.svg`} 
      alt="Perplexity" 
      width={20} 
      height={20}
      className="w-5 h-5 dark:invert"
    />
  ),
  searchgpt: () => (
    <Image 
      src={`${ICON_BASE_PATH}/searchgpt.svg`} 
      alt="SearchGPT" 
      width={20} 
      height={20}
      className="w-5 h-5 dark:invert"
    />
  ),
  claude: () => (
    <Image 
      src={`${ICON_BASE_PATH}/claude.svg`} 
      alt="Claude" 
      width={20} 
      height={20}
      className="w-5 h-5"
    />
  ),
  gemini: () => (
    <Image 
      src={`${ICON_BASE_PATH}/gemini.svg`} 
      alt="Gemini" 
      width={20} 
      height={20}
      className="w-5 h-5"
    />
  ),
  "apple-siri": () => (
    <Image 
      src={`${ICON_BASE_PATH}/apple-siri.svg`} 
      alt="Apple Siri" 
      width={20} 
      height={20}
      className="w-5 h-5"
    />
  ),
}

// AI Platform configurations (Updated: New order with Google AIO, SearchGPT, Apple Siri)
export const AI_PLATFORMS: Record<string, AIPlatformConfig> = {
  "google-aio": {
    id: "google-aio",
    name: "Google AI Overviews",
    logo: "google-aio",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    marketShare: 35,
    citationStyle: "AI Overview snippets",
    description: "Google Search AI-powered summaries",
    apiSource: "serper",
  },
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    logo: "chatgpt",
    color: "text-foreground",
    bgColor: "bg-muted/10",
    marketShare: 30,
    citationStyle: "Inline references",
    description: "OpenAI's flagship conversational AI",
    apiSource: "openrouter",
  },
  perplexity: {
    id: "perplexity",
    name: "Perplexity",
    logo: "perplexity",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    marketShare: 12,
    citationStyle: "Direct source links",
    description: "AI-powered search engine",
    apiSource: "openrouter",
  },
  searchgpt: {
    id: "searchgpt",
    name: "ChatGPT Search",
    logo: "searchgpt",
    color: "text-foreground",
    bgColor: "bg-muted/10",
    marketShare: 5,
    citationStyle: "Web search citations",
    description: "OpenAI's search engine",
    apiSource: "openrouter",
    isComingSoon: true,
  },
  claude: {
    id: "claude",
    name: "Claude",
    logo: "claude",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    marketShare: 10,
    citationStyle: "Source attribution",
    description: "Anthropic's AI assistant",
    apiSource: "openrouter",
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    logo: "gemini",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    marketShare: 8,
    citationStyle: "Web citations",
    description: "Google's multimodal AI",
    apiSource: "openrouter",
  },
  "apple-siri": {
    id: "apple-siri",
    name: "Apple Siri",
    logo: "apple-siri",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    marketShare: 4,
    citationStyle: "Voice response",
    description: "Apple's voice assistant (Readiness check)",
    apiSource: "internal",
    isReadinessOnly: true,
  },
}

// Citation type labels
export const CITATION_TYPES: Record<CitationType, {
  label: string
  description: string
  icon: string
  value: number // Impact score
}> = {
  "direct-quote": {
    label: "Direct Quote",
    description: "Your exact words cited",
    icon: "💬",
    value: 100,
  },
  "paraphrase": {
    label: "Paraphrase",
    description: "Your content rephrased",
    icon: "📝",
    value: 80,
  },
  "reference": {
    label: "Reference",
    description: "Mentioned as a source",
    icon: "📌",
    value: 60,
  },
  "recommendation": {
    label: "Recommendation",
    description: "Recommended to users",
    icon: "⭐",
    value: 90,
  },
  "source-link": {
    label: "Source Link",
    description: "Linked as external source",
    icon: "🔗",
    value: 70,
  },
}

// Sample AI citations data (Updated with new platforms and 2025 dates)
export const SAMPLE_CITATIONS = [
  {
    id: "c1",
    platform: "google-aio" as const,
    query: "best web hosting for bloggers 2026",
    citedUrl: "/best-web-hosting",
    citedTitle: "10 Best Web Hosting for Bloggers in 2026",
    citationType: "source-link" as CitationType,
    context: "According to [Your Blog], Bluehost remains the top choice for beginner bloggers due to its WordPress integration...",
    position: 1,
    timestamp: "2025-12-27T14:30:00Z",
    sentiment: "positive" as const,
    competitors: ["wpbeginner.com", "bloggingwizard.com"],
  },
  {
    id: "c2",
    platform: "chatgpt" as const,
    query: "how to start a blog and make money",
    citedUrl: "/start-blog-guide",
    citedTitle: "Complete Guide to Starting a Blog in 2026",
    citationType: "paraphrase" as CitationType,
    context: "Many successful bloggers recommend starting with a clear niche. As experts suggest, focusing on a specific topic helps build authority...",
    position: 2,
    timestamp: "2025-12-26T10:15:00Z",
    sentiment: "positive" as const,
    competitors: ["smartblogger.com", "problogger.com"],
  },
  {
    id: "c3",
    platform: "claude" as const,
    query: "semrush vs ahrefs comparison",
    citedUrl: "/ahrefs-vs-semrush",
    citedTitle: "Ahrefs vs SEMrush: Complete Comparison",
    citationType: "recommendation" as CitationType,
    context: "For a detailed comparison, I'd recommend checking out comprehensive reviews like the one at [Your Blog] which breaks down features...",
    position: 1,
    timestamp: "2025-12-25T16:45:00Z",
    sentiment: "positive" as const,
    competitors: ["backlinko.com", "authorityhacker.com"],
  },
  {
    id: "c4",
    platform: "gemini" as const,
    query: "email marketing tips for beginners",
    citedUrl: "/email-marketing-guide",
    citedTitle: "Email Marketing for Beginners",
    citationType: "reference" as CitationType,
    context: "Building an email list is crucial. Sources like [Your Blog] emphasize starting with a lead magnet...",
    position: 3,
    timestamp: "2025-12-24T09:20:00Z",
    sentiment: "neutral" as const,
    competitors: ["hubspot.com", "mailchimp.com"],
  },
  {
    id: "c5",
    platform: "perplexity" as const,
    query: "best seo tools for small blogs",
    citedUrl: "/best-seo-tools",
    citedTitle: "Top SEO Tools for Bloggers",
    citationType: "direct-quote" as CitationType,
    context: "\"For bloggers on a budget, Mangools offers the best value with its user-friendly interface and affordable pricing\" - [Your Blog]",
    position: 1,
    timestamp: "2025-12-23T11:00:00Z",
    sentiment: "positive" as const,
    competitors: ["ahrefs.com", "moz.com"],
  },
  {
    id: "c7",
    platform: "chatgpt" as const,
    query: "how to write blog posts faster",
    citedUrl: "/write-faster-tips",
    citedTitle: "10 Tips to Write Blog Posts Faster",
    citationType: "recommendation" as CitationType,
    context: "I'd suggest checking out guides on content batching and AI writing assistants. Resources like [Your Blog] have practical tips...",
    position: 1,
    timestamp: "2025-12-21T08:15:00Z",
    sentiment: "positive" as const,
    competitors: ["copyblogger.com"],
  },
  {
    id: "c8",
    platform: "gemini" as const,
    query: "monetize blog with ads vs affiliate",
    citedUrl: "/blog-monetization",
    citedTitle: "Blog Monetization: Ads vs Affiliate Marketing",
    citationType: "reference" as CitationType,
    context: "Affiliate marketing typically offers higher per-conversion earnings. According to blogging resources, a combination works best...",
    position: 2,
    timestamp: "2025-12-20T17:45:00Z",
    sentiment: "neutral" as const,
    competitors: ["neilpatel.com", "incomeschool.com"],
  },
  {
    id: "c9",
    platform: "google-aio" as const,
    query: "best AI writing tools 2026",
    citedUrl: "/ai-writing-tools",
    citedTitle: "Top AI Writing Tools for Content Creators",
    citationType: "direct-quote" as CitationType,
    context: "According to [Your Blog], Jasper AI and Copy.ai lead the market for blog content generation...",
    position: 1,
    timestamp: "2025-12-19T12:00:00Z",
    sentiment: "positive" as const,
    competitors: ["jasper.ai", "copy.ai"],
  },
  {
    id: "c10",
    platform: "perplexity" as const,
    query: "how to optimize for AI search",
    citedUrl: "/ai-seo-guide",
    citedTitle: "AI SEO: Optimizing for AI Search Engines",
    citationType: "source-link" as CitationType,
    context: "For comprehensive guidance on AI SEO, [Your Blog] provides actionable strategies...",
    position: 1,
    timestamp: "2025-12-18T15:30:00Z",
    sentiment: "positive" as const,
    competitors: ["searchenginejournal.com", "moz.com"],
  },
]

// Visibility score thresholds
export const VISIBILITY_TIERS = {
  excellent: { min: 80, label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  good: { min: 60, label: "Good", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  moderate: { min: 40, label: "Moderate", color: "text-amber-400", bg: "bg-amber-500/10" },
  low: { min: 20, label: "Low", color: "text-orange-400", bg: "bg-orange-500/10" },
  minimal: { min: 0, label: "Minimal", color: "text-red-400", bg: "bg-red-500/10" },
}

// Date range options
export const DATE_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
]
