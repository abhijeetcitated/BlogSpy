import {
  AlertTriangle,
  Bot,
  FileText,
  LayoutDashboard,
  LineChart,
  Map,
  Network,
  PenTool,
  Plus,
  Search,
  Settings,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  Youtube,
  type LucideIcon,
} from "lucide-react"

export type CommandMenuGroup = "navigation" | "actions"

export type CommandIconName =
  | "LayoutDashboard"
  | "TrendingUp"
  | "Search"
  | "Plus"
  | "Tag"
  | "LineChart"
  | "Target"
  | "PenTool"
  | "FileText"
  | "Sparkles"
  | "Network"
  | "Map"
  | "AlertTriangle"
  | "Youtube"
  | "Bot"
  | "Settings"

export interface CommandMenuItem {
  title: string
  href?: string
  action?: "create-project" | "add-keyword"
  icon: CommandIconName
  keywords: string[]
  group: CommandMenuGroup
}

export const commandConfig: CommandMenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    keywords: ["dashboard", "home", "overview"],
    group: "navigation",
  },
  {
    title: "Rank Tracker",
    href: "/dashboard/tracking/rank-tracker",
    icon: "TrendingUp",
    keywords: ["rank", "tracker", "positions"],
    group: "navigation",
  },
  {
    title: "Keyword Explorer",
    href: "/dashboard/research/keyword-magic",
    icon: "Search",
    keywords: ["keyword", "explorer", "magic"],
    group: "navigation",
  },
  {
    title: "Gap Analysis",
    href: "/dashboard/research/gap-analysis",
    icon: "Target",
    keywords: ["gap", "competitor"],
    group: "navigation",
  },
  {
    title: "Trend Spotter",
    href: "/dashboard/research/trends",
    icon: "LineChart",
    keywords: ["trend", "spotter"],
    group: "navigation",
  },
  {
    title: "AI Writer",
    href: "/dashboard/creation/ai-writer",
    icon: "PenTool",
    keywords: ["ai", "writer", "content"],
    group: "navigation",
  },
  {
    title: "On-Page Checker",
    href: "/dashboard/creation/on-page",
    icon: "FileText",
    keywords: ["on-page", "seo", "checker"],
    group: "navigation",
  },
  {
    title: "Snippet Stealer",
    href: "/dashboard/creation/snippet-stealer",
    icon: "Sparkles",
    keywords: ["snippet", "stealer"],
    group: "navigation",
  },
  {
    title: "Topic Clusters",
    href: "/dashboard/strategy/topic-clusters",
    icon: "Network",
    keywords: ["topic", "clusters"],
    group: "navigation",
  },
  {
    title: "Content Roadmap",
    href: "/dashboard/strategy/roadmap",
    icon: "Map",
    keywords: ["roadmap", "content"],
    group: "navigation",
  },
  {
    title: "Video Hijack",
    href: "/dashboard/research/video-hijack",
    icon: "Youtube",
    keywords: ["video", "hijack"],
    group: "navigation",
  },
  {
    title: "AI Visibility",
    href: "/dashboard/tracking/ai-visibility",
    icon: "Bot",
    keywords: ["ai", "visibility"],
    group: "navigation",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "Settings",
    keywords: ["settings", "account"],
    group: "navigation",
  },
  {
    title: "Create Project",
    action: "create-project",
    icon: "Plus",
    keywords: ["create", "project", "new"],
    group: "actions",
  },
  {
    title: "Add Keyword",
    action: "add-keyword",
    icon: "Tag",
    keywords: ["add", "keyword", "tag"],
    group: "actions",
  },
]

export const commandIcons: Record<CommandIconName, LucideIcon> = {
  LayoutDashboard,
  TrendingUp,
  Search,
  Plus,
  Tag,
  LineChart,
  Target,
  PenTool,
  FileText,
  Sparkles,
  Network,
  Map,
  AlertTriangle,
  Youtube,
  Bot,
  Settings,
}
