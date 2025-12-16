// ============================================
// COMMAND PALETTE - Commands Data
// ============================================
// All available commands for the palette
// ============================================

import {
  // Navigation icons
  LayoutDashboard,
  Search,
  TrendingUp,
  LineChart,
  Target,
  FileText,
  Sparkles,
  Globe,
  Map,
  Network,
  AlertTriangle,
  Trophy,
  
  // Action icons
  PenTool,
  Zap,
  BarChart3,
  Eye,
  Youtube,
  Bot,
  RefreshCw,
  Download,
  Settings,
  HelpCircle,
  Keyboard,
  Moon,
  Sun,
} from "lucide-react"

import type { Command, CommandGroup, CommandCategory } from "../types"

// ============================================
// NAVIGATION COMMANDS - Go to pages
// ============================================

export const navigationCommands: Command[] = [
  // Dashboard
  {
    id: "nav-dashboard",
    title: "Dashboard",
    description: "Go to main dashboard",
    icon: LayoutDashboard,
    category: "navigation",
    keywords: ["home", "main", "overview", "dashboard"],
    shortcut: "G D",
    href: "/dashboard",
  },
  
  // Research Section
  {
    id: "nav-keyword-magic",
    title: "Keyword Magic Tool",
    description: "Discover keyword opportunities",
    icon: Sparkles,
    category: "navigation",
    keywords: ["keyword", "magic", "discover", "find", "research", "ideas"],
    href: "/dashboard/research/keyword-magic",
  },
  {
    id: "nav-gap-analysis",
    title: "Gap Analysis",
    description: "Find competitor content gaps",
    icon: Target,
    category: "navigation",
    keywords: ["gap", "competitor", "analysis", "compare", "missing"],
    href: "/dashboard/research/gap-analysis",
  },
  {
    id: "nav-trends",
    title: "Trend Spotter",
    description: "Spot trending topics",
    icon: TrendingUp,
    category: "navigation",
    keywords: ["trends", "trending", "viral", "popular", "rising"],
    href: "/dashboard/research/trends",
  },
  
  // Creation Section
  {
    id: "nav-ai-writer",
    title: "AI Writer",
    description: "Write content with AI",
    icon: PenTool,
    category: "navigation",
    keywords: ["write", "ai", "content", "article", "blog", "generate"],
    href: "/dashboard/creation/ai-writer",
  },
  {
    id: "nav-on-page",
    title: "On-Page Checker",
    description: "Optimize your content",
    icon: FileText,
    category: "navigation",
    keywords: ["on-page", "seo", "optimize", "check", "score"],
    href: "/dashboard/creation/on-page",
  },
  {
    id: "nav-snippet-stealer",
    title: "Snippet Stealer",
    description: "Steal featured snippets",
    icon: Trophy,
    category: "navigation",
    keywords: ["snippet", "featured", "steal", "position", "zero"],
    href: "/dashboard/creation/snippet-stealer",
  },
  
  // Strategy Section
  {
    id: "nav-topic-clusters",
    title: "Topic Clusters",
    description: "Build content clusters",
    icon: Network,
    category: "navigation",
    keywords: ["cluster", "topic", "pillar", "hub", "spoke", "structure"],
    href: "/dashboard/strategy/topic-clusters",
  },
  {
    id: "nav-roadmap",
    title: "Content Roadmap",
    description: "Plan your content strategy",
    icon: Map,
    category: "navigation",
    keywords: ["roadmap", "plan", "calendar", "schedule", "strategy"],
    href: "/dashboard/strategy/roadmap",
  },
  
  // Tracking Section
  {
    id: "nav-rank-tracker",
    title: "Rank Tracker",
    description: "Track keyword rankings",
    icon: LineChart,
    category: "navigation",
    keywords: ["rank", "tracker", "position", "serp", "monitor"],
    href: "/dashboard/tracking/rank-tracker",
  },
  {
    id: "nav-decay",
    title: "Content Decay",
    description: "Find declining content",
    icon: AlertTriangle,
    category: "navigation",
    keywords: ["decay", "decline", "falling", "refresh", "update"],
    href: "/dashboard/tracking/decay",
  },
]

// ============================================
// QUICK ACTION COMMANDS - Do something
// ============================================

export const actionCommands: Command[] = [
  {
    id: "action-new-article",
    title: "Write New Article",
    description: "Start writing with AI",
    icon: PenTool,
    category: "action",
    keywords: ["new", "write", "article", "create", "blog", "post"],
    shortcut: "N",
    href: "/dashboard/creation/ai-writer",
  },
  {
    id: "action-check-rank",
    title: "Check Rankings",
    description: "See your current positions",
    icon: BarChart3,
    category: "action",
    keywords: ["check", "rank", "position", "serp"],
    href: "/dashboard/tracking/rank-tracker",
  },
  {
    id: "action-find-keywords",
    title: "Find Keywords",
    description: "Discover new opportunities",
    icon: Search,
    category: "action",
    keywords: ["find", "keyword", "discover", "search"],
    href: "/dashboard/research/keyword-magic",
  },
  {
    id: "action-video-hijack",
    title: "Video Hijack",
    description: "Find video ranking opportunities",
    icon: Youtube,
    category: "action",
    keywords: ["video", "youtube", "hijack", "ranking"],
    badge: "New",
    href: "/dashboard/research/video-hijack",
  },
  {
    id: "action-ai-visibility",
    title: "AI Visibility",
    description: "Check AI mentions of your brand",
    icon: Bot,
    category: "action",
    keywords: ["ai", "visibility", "chatgpt", "claude", "perplexity", "gemini"],
    badge: "Beta",
    href: "/dashboard/tracking/ai-visibility",
  },
  {
    id: "action-refresh-data",
    title: "Refresh Data",
    description: "Update all metrics",
    icon: RefreshCw,
    category: "action",
    keywords: ["refresh", "update", "sync", "reload"],
  },
  {
    id: "action-export",
    title: "Export Report",
    description: "Download as CSV/PDF",
    icon: Download,
    category: "action",
    keywords: ["export", "download", "csv", "pdf", "report"],
  },
]

// ============================================
// UTILITY COMMANDS - Settings, Help, etc.
// ============================================

export const utilityCommands: Command[] = [
  {
    id: "util-settings",
    title: "Settings",
    description: "Configure your account",
    icon: Settings,
    category: "action",
    keywords: ["settings", "preferences", "config", "account"],
    shortcut: ",",
    href: "/settings",
  },
  {
    id: "util-help",
    title: "Help & Support",
    description: "Get help or contact support",
    icon: HelpCircle,
    category: "action",
    keywords: ["help", "support", "faq", "contact", "docs"],
    shortcut: "?",
  },
  {
    id: "util-shortcuts",
    title: "Keyboard Shortcuts",
    description: "View all shortcuts",
    icon: Keyboard,
    category: "action",
    keywords: ["keyboard", "shortcuts", "hotkeys", "keys"],
    shortcut: "⌘/",
  },
  {
    id: "util-theme-dark",
    title: "Dark Mode",
    description: "Switch to dark theme",
    icon: Moon,
    category: "action",
    keywords: ["dark", "theme", "night", "mode"],
  },
  {
    id: "util-theme-light",
    title: "Light Mode",
    description: "Switch to light theme",
    icon: Sun,
    category: "action",
    keywords: ["light", "theme", "day", "mode"],
  },
]

// ============================================
// ALL COMMANDS COMBINED
// ============================================

export const allCommands: Command[] = [
  ...navigationCommands,
  ...actionCommands,
  ...utilityCommands,
]

// ============================================
// COMMAND GROUPS FOR DISPLAY
// ============================================

export const commandGroups: CommandGroup[] = [
  {
    category: "action",
    label: "Quick Actions",
    commands: actionCommands.slice(0, 5),
  },
  {
    category: "navigation",
    label: "Go To",
    commands: navigationCommands,
  },
  {
    category: "action",
    label: "Utilities",
    commands: utilityCommands,
  },
]

// ============================================
// CATEGORY LABELS
// ============================================

export const categoryLabels: Record<CommandCategory, string> = {
  navigation: "Go To",
  action: "Actions",
  search: "Search Results",
  recent: "Recent",
  quick: "Quick Actions",
}
