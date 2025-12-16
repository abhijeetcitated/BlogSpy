// AI Visibility Tracker Constants

import React from "react"
import { AIPlatformConfig, CitationType } from "../types"

// Premium SVG Icons for AI Platforms
export const PlatformIcons: Record<string, () => React.JSX.Element> = {
  chatgpt: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4066-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="currentColor"/>
    </svg>
  ),
  claude: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M17.3 3H6.7C4.7 3 3 4.7 3 6.7v10.6C3 19.3 4.7 21 6.7 21h10.6c2 0 3.7-1.7 3.7-3.7V6.7C21 4.7 19.3 3 17.3 3z" fill="currentColor" fillOpacity="0.15"/>
      <path d="M16.8 10.5c0-.3-.1-.5-.3-.7l-3.3-3.3c-.2-.2-.5-.3-.7-.3s-.5.1-.7.3l-3.3 3.3c-.2.2-.3.4-.3.7s.1.5.3.7c.2.2.4.3.7.3s.5-.1.7-.3l1.6-1.6v6.1c0 .6.4 1 1 1s1-.4 1-1v-6.1l1.6 1.6c.2.2.4.3.7.3s.5-.1.7-.3c.2-.2.3-.4.3-.7z" fill="currentColor"/>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 5.5v4M9.5 8l2.5-2.5L14.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  perplexity: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 15v2M8.5 17.5c1 1 2.2 1.5 3.5 1.5s2.5-.5 3.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 6l3 2 3-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  gemini: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" fillOpacity="0.1"/>
      <path d="M12 2v10l8.66-5c-1.5-3-4.5-5-8.66-5z" fill="currentColor" fillOpacity="0.6"/>
      <path d="M12 12v10c4.16 0 7.66-3 8.66-5L12 12z" fill="currentColor" fillOpacity="0.4"/>
      <path d="M12 12L3.34 7c-1 2-1.34 3.5-1.34 5s.34 3 1.34 5L12 12z" fill="currentColor" fillOpacity="0.2"/>
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>
  ),
  copilot: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.8"/>
      <rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.6"/>
      <rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.6"/>
      <rect x="13" y="13" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.4"/>
      <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  "you-com": () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle cx="12" cy="8" r="4" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 3v2M7.5 4.5l1 1.5M16.5 4.5l-1 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

// AI Platform configurations
export const AI_PLATFORMS: Record<string, AIPlatformConfig> = {
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    logo: "chatgpt",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    marketShare: 45,
    citationStyle: "Inline references",
    description: "OpenAI's flagship conversational AI",
  },
  claude: {
    id: "claude",
    name: "Claude",
    logo: "claude",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    marketShare: 15,
    citationStyle: "Source attribution",
    description: "Anthropic's AI assistant",
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
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    logo: "gemini",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    marketShare: 18,
    citationStyle: "Web citations",
    description: "Google's multimodal AI",
  },
  copilot: {
    id: "copilot",
    name: "Copilot",
    logo: "copilot",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    marketShare: 8,
    citationStyle: "Bing-style citations",
    description: "Microsoft's AI companion",
  },
  "you-com": {
    id: "you-com",
    name: "You.com",
    logo: "you-com",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    marketShare: 2,
    citationStyle: "Source cards",
    description: "AI search with sources",
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

// Sample AI citations data
export const SAMPLE_CITATIONS = [
  {
    id: "c1",
    platform: "perplexity" as const,
    query: "best web hosting for bloggers 2024",
    citedUrl: "/best-web-hosting",
    citedTitle: "10 Best Web Hosting for Bloggers in 2024",
    citationType: "source-link" as CitationType,
    context: "According to [Your Blog], Bluehost remains the top choice for beginner bloggers due to its WordPress integration...",
    position: 1,
    timestamp: "2024-12-10T14:30:00Z",
    sentiment: "positive" as const,
    competitors: ["wpbeginner.com", "bloggingwizard.com"],
  },
  {
    id: "c2",
    platform: "chatgpt" as const,
    query: "how to start a blog and make money",
    citedUrl: "/start-blog-guide",
    citedTitle: "Complete Guide to Starting a Blog in 2024",
    citationType: "paraphrase" as CitationType,
    context: "Many successful bloggers recommend starting with a clear niche. As experts suggest, focusing on a specific topic helps build authority...",
    position: 2,
    timestamp: "2024-12-09T10:15:00Z",
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
    timestamp: "2024-12-08T16:45:00Z",
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
    timestamp: "2024-12-07T09:20:00Z",
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
    timestamp: "2024-12-06T11:00:00Z",
    sentiment: "positive" as const,
    competitors: ["ahrefs.com", "moz.com"],
  },
  {
    id: "c6",
    platform: "copilot" as const,
    query: "wordpress vs ghost blogging platform",
    citedUrl: "/wordpress-vs-ghost",
    citedTitle: "WordPress vs Ghost: Which is Better?",
    citationType: "paraphrase" as CitationType,
    context: "WordPress powers over 40% of websites, while Ghost is gaining popularity for its minimalist approach...",
    position: 2,
    timestamp: "2024-12-05T14:30:00Z",
    sentiment: "neutral" as const,
    competitors: ["wpengine.com", "ghost.org"],
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
    timestamp: "2024-12-04T08:15:00Z",
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
    timestamp: "2024-12-03T17:45:00Z",
    sentiment: "neutral" as const,
    competitors: ["neilpatel.com", "incomeschool.com"],
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
