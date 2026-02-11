// ============================================
// COMMAND CENTER - Static Data & Constants
// ============================================

import {
  TrendingUp,
  Search,
  Youtube,
  Bot,
  Target,
  ArrowUp,
  ArrowDown,
  FileText,
  CheckCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

// ============================================
// TYPES
// ============================================

export interface QuickAction {
  title: string
  icon: LucideIcon
  color: string
  iconColor: string
  href: string
}

export interface RecentSearch {
  keyword: string
  time: string
}

// Activity types for diverse recent activity
export type ActivityType = "search" | "rank_up" | "rank_down" | "published" | "alert_fixed" | "keyword_found"

export interface RecentActivity {
  id: number
  type: ActivityType
  icon: LucideIcon
  iconColor: string
  title: string
  subtitle?: string
  time: string
  href: string
}

export interface AgenticSuggestion {
  id: number
  type: string
  priority: "high" | "medium" | "low"
  iconKey:
    | "file_edit"
    | "sparkles"
    | "eye"
    | "target"
    | "lightbulb"
    | "activity"
    | "alert_triangle"
  iconColor: string
  bgColor: string
  borderColor: string
  title: string
  description: string
  evidence: string
  ctaLabel: string
  ctaHref: string
  impact: string
  impactColor: string
  freshness: string
  effort?: string
}

type DemoSuggestionInput = {
  projectName: string
}

// ============================================
// QUICK ACTIONS
// ============================================

export const quickActions: QuickAction[] = [
  {
    title: "Check Rank",
    icon: TrendingUp,
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
    href: "/dashboard/tracking/rank-tracker"
  },
  { 
    title: "Find Keywords", 
    icon: Search, 
    color: "from-orange-500/20 to-amber-500/20", 
    iconColor: "text-orange-400",
    href: "/dashboard/research/keyword-research"
  },
  { 
    title: "Video Hijack", 
    icon: Youtube, 
    color: "from-red-500/20 to-pink-500/20", 
    iconColor: "text-red-400",
    href: "/dashboard/research/video-hijack"
  },
  { 
    title: "AI Visibility", 
    icon: Bot, 
    color: "from-purple-500/20 to-violet-500/20", 
    iconColor: "text-purple-400",
    href: "/dashboard/tracking/ai-visibility"
  },
  { 
    title: "Gap Analysis", 
    icon: Target, 
    color: "from-cyan-500/20 to-teal-500/20", 
    iconColor: "text-cyan-400",
    href: "/dashboard/research/gap-analysis"
  },
]

// ============================================
// RECENT ACTIVITY (Diverse)
// ============================================

export const recentSearches: RecentSearch[] = [
  { keyword: "best seo tools 2025", time: "2 hours ago" },
  { keyword: "nextjs templates", time: "5 hours ago" },
  { keyword: "ai content writing", time: "Yesterday" },
]

export const recentActivity: RecentActivity[] = [
  {
    id: 1,
    type: "rank_up",
    icon: ArrowUp,
    iconColor: "text-emerald-400",
    title: "Ranked #1 for 'best ai tools'",
    subtitle: "#3 → #1",
    time: "2 hours ago",
    href: "/dashboard/tracking/rank-tracker?keyword=best-ai-tools",
  },
  {
    id: 2,
    type: "published",
    icon: FileText,
    iconColor: "text-blue-400",
    title: "Published: AI Writing Guide 2025",
    subtitle: "2,450 words",
    time: "5 hours ago",
    href: "/dashboard/creation/ai-writer",
  },
  {
    id: 3,
    type: "alert_fixed",
    icon: CheckCircle,
    iconColor: "text-green-400",
    title: "Fixed: SEO Tools article updated",
    subtitle: "Decay alert resolved",
    time: "Yesterday",
    href: "/dashboard/tracking/decay",
  },
  {
    id: 4,
    type: "rank_down",
    icon: ArrowDown,
    iconColor: "text-red-400",
    title: "Dropped to #8 for 'crm software'",
    subtitle: "#4 → #8",
    time: "Yesterday",
    href: "/dashboard/tracking/rank-tracker?keyword=crm-software",
  },
  {
    id: 5,
    type: "keyword_found",
    icon: Sparkles,
    iconColor: "text-purple-400",
    title: "New opportunity: 'claude vs gpt'",
    subtitle: "12.5K searches, KD 23",
    time: "2 days ago",
    href: "/dashboard/research/overview/claude-vs-gpt",
  },
]

// ============================================
// AGENTIC AI SUGGESTIONS
// ============================================
// Static data removed — suggestions are now generated dynamically
// by src/features/dashboard/services/suggestion-engine.ts
// and fetched via src/features/dashboard/actions/fetch-ai-suggestions.ts

export function getDemoAgenticSuggestions({ projectName }: DemoSuggestionInput): AgenticSuggestion[] {
  return [
    {
      id: 1,
      type: "rank_drop",
      priority: "high",
      iconKey: "file_edit",
      iconColor: "text-amber-400",
      bgColor: "from-amber-500/10 to-orange-500/10",
      borderColor: "border-amber-500/20 hover:border-amber-500/40",
      title: `Update '${projectName} pricing' article`,
      description: "This page dropped from #4 to #9. Add fresh proof points and pricing comparison updates.",
      evidence: "Position dropped #4 -> #9 in last 7 days",
      ctaLabel: "Auto-Draft Update",
      ctaHref: "/dashboard/research/keyword-magic?keyword=pricing",
      impact: "+38% recovery potential",
      impactColor: "text-emerald-400",
      freshness: "2h ago",
      effort: "~35 min content update",
    },
    {
      id: 2,
      type: "ai_overview_gap",
      priority: "high",
      iconKey: "sparkles",
      iconColor: "text-emerald-400",
      bgColor: "from-emerald-500/10 to-teal-500/10",
      borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
      title: `AI citation gap for '${projectName} alternatives'`,
      description: "You rank top-5 but are not cited in AI Overview. Add concise entities and proof snippets.",
      evidence: "Rank #3 | No AI overview citation seen",
      ctaLabel: "Check AI Visibility",
      ctaHref: "/dashboard/ai-visibility",
      impact: "Potential AI visibility boost",
      impactColor: "text-emerald-400",
      freshness: "Just now",
      effort: "~10 min AI scan",
    },
    {
      id: 3,
      type: "snippet_opportunity",
      priority: "medium",
      iconKey: "eye",
      iconColor: "text-purple-400",
      bgColor: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20 hover:border-purple-500/40",
      title: "Featured snippet opportunity",
      description: "A paragraph snippet is currently ranking. Convert section into list format to steal Position 0.",
      evidence: "Current position #2 | Snippet range keyword",
      ctaLabel: "View Snippet Strategy",
      ctaHref: "/dashboard/research/keyword-magic",
      impact: "Position 0 opportunity",
      impactColor: "text-purple-400",
      freshness: "Today",
      effort: "~20 min format optimization",
    },
    {
      id: 4,
      type: "trend_spike",
      priority: "medium",
      iconKey: "lightbulb",
      iconColor: "text-yellow-400",
      bgColor: "from-yellow-500/10 to-amber-500/10",
      borderColor: "border-yellow-500/20 hover:border-yellow-500/40",
      title: "Trend spike detected",
      description: "Search demand is accelerating for this cluster. Publish before SERP competition thickens.",
      evidence: "Growth +185% in tracked trend list",
      ctaLabel: "Write Now",
      ctaHref: "/dashboard/research/trends",
      impact: "First mover advantage",
      impactColor: "text-yellow-400",
      freshness: "Trend detected",
      effort: "~1.5 hrs new content",
    },
  ]
}
