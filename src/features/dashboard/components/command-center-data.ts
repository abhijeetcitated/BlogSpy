// ============================================
// COMMAND CENTER - Static Data & Constants
// ============================================

import {
  PenTool,
  TrendingUp,
  Search,
  Network,
  FileEdit,
  Sparkles,
  Eye,
  Target,
  Lightbulb,
  Monitor,
  Activity,
  Brain,
  Youtube,
  Bot,
  ArrowUp,
  ArrowDown,
  FileText,
  CheckCircle,
  AlertTriangle,
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
  icon: LucideIcon
  iconColor: string
  bgColor: string
  borderColor: string
  title: string
  description: string
  action: string
  actionHref: string
  impact: string
  impactColor: string
  timeAgo: string
}

// ============================================
// QUICK ACTIONS
// ============================================

export const quickActions: QuickAction[] = [
  { 
    title: "Write Article", 
    icon: PenTool, 
    color: "from-blue-500/20 to-cyan-500/20", 
    iconColor: "text-blue-400",
    href: "/dashboard/creation/ai-writer"
  },
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
    href: "/dashboard/research/keyword-magic"
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
    href: "/dashboard/ai-visibility"
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

export const agenticSuggestions: AgenticSuggestion[] = [
  {
    id: 1,
    type: "content_update",
    priority: "high",
    icon: FileEdit,
    iconColor: "text-amber-400",
    bgColor: "from-amber-500/10 to-orange-500/10",
    borderColor: "border-amber-500/20 hover:border-amber-500/40",
    title: "Update '10 Best SEO Tools' article",
    description: "This article dropped from #3 to #8. Add a '2025 Update' section with new tools to recover ranking.",
    action: "Auto-Draft Update",
    actionHref: "/dashboard/creation/ai-writer?action=update&article=best-seo-tools",
    impact: "+45% traffic potential",
    impactColor: "text-emerald-400",
    timeAgo: "Detected 2 hours ago"
  },
  {
    id: 2,
    type: "geo_opportunity",
    priority: "high",
    icon: Sparkles,
    iconColor: "text-cyan-400",
    bgColor: "from-cyan-500/10 to-emerald-500/10",
    borderColor: "border-cyan-500/20 hover:border-cyan-500/40",
    title: "🎯 GEO Score 87: 'best project management tools'",
    description: "AI Overview cites a 2-year-old Reddit thread. High opportunity to get cited with fresh, comprehensive content.",
    action: "Capture AI Citation",
    actionHref: "/dashboard/creation/ai-writer?keyword=best-project-management-tools&geo=87",
    impact: "GEO Score: 87/100",
    impactColor: "text-cyan-400",
    timeAgo: "High GEO opportunity"
  },
  {
    id: 3,
    type: "snippet_opportunity",
    priority: "high",
    icon: Eye,
    iconColor: "text-purple-400",
    bgColor: "from-purple-500/10 to-pink-500/10",
    borderColor: "border-purple-500/20 hover:border-purple-500/40",
    title: "Steal Featured Snippet for 'how to do keyword research'",
    description: "Current snippet is a paragraph (52 words). Reformat your content to a numbered list to steal it.",
    action: "View Snippet Strategy",
    actionHref: "/dashboard/creation/snippet-stealer?keyword=how-to-do-keyword-research",
    impact: "Position 0 opportunity",
    impactColor: "text-purple-400",
    timeAgo: "New opportunity"
  },
  {
    id: 4,
    type: "weak_spot",
    priority: "medium",
    icon: Target,
    iconColor: "text-cyan-400",
    bgColor: "from-cyan-500/10 to-blue-500/10",
    borderColor: "border-cyan-500/20 hover:border-cyan-500/40",
    title: "Easy Win: 'AI writing tools comparison' has Reddit at #2",
    description: "A Reddit thread is ranking #2. Write a comprehensive comparison post to outrank this weak competitor.",
    action: "Create Article",
    actionHref: "/dashboard/creation/ai-writer?keyword=ai-writing-tools-comparison",
    impact: "12,500 monthly searches",
    impactColor: "text-cyan-400",
    timeAgo: "Weak spot detected"
  },
  {
    id: 5,
    type: "ai_overview",
    priority: "medium",
    icon: Sparkles,
    iconColor: "text-emerald-400",
    bgColor: "from-emerald-500/10 to-teal-500/10",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
    title: "Missing from AI Overview for 'best crm software'",
    description: "You rank #4 but aren't cited in the AI Overview. Add these entities: 'implementation time', 'pricing tiers', 'integrations'.",
    action: "Optimize Content",
    actionHref: "/dashboard/creation/on-page?url=best-crm-software",
    impact: "AI visibility boost",
    impactColor: "text-emerald-400",
    timeAgo: "AI analysis complete"
  },
  {
    id: 6,
    type: "trend_alert",
    priority: "low",
    icon: Lightbulb,
    iconColor: "text-yellow-400",
    bgColor: "from-yellow-500/10 to-amber-500/10",
    borderColor: "border-yellow-500/20 hover:border-yellow-500/40",
    title: "Trending: 'Claude 4 vs GPT-5' searches up 340%",
    description: "This topic will peak in 14 days. Publish now to capture early traffic before competition increases.",
    action: "Write Now",
    actionHref: "/dashboard/creation/ai-writer?keyword=claude-4-vs-gpt-5",
    impact: "First mover advantage",
    impactColor: "text-yellow-400",
    timeAgo: "Trend detected today"
  },
  {
    id: 7,
    type: "pixel_rank",
    priority: "medium",
    icon: Monitor,
    iconColor: "text-purple-400",
    bgColor: "from-purple-500/10 to-indigo-500/10",
    borderColor: "border-purple-500/20 hover:border-purple-500/40",
    title: "📍 Hidden Below Fold: 'best ai tools'",
    description: "You rank #3 but users can't see you without scrolling! AI boxes and videos push your result down. Get a featured snippet to appear higher.",
    action: "Fix Visibility",
    actionHref: "/dashboard/tracking/rank-tracker?keyword=best-ai-tools",
    impact: "2x more clicks possible",
    impactColor: "text-purple-400",
    timeAgo: "Visibility issue detected"
  },
  {
    id: 8,
    type: "rtv_alert",
    priority: "high",
    icon: Activity,
    iconColor: "text-orange-400",
    bgColor: "from-orange-500/10 to-red-500/10",
    borderColor: "border-orange-500/20 hover:border-orange-500/40",
    title: "⚠️ Low Click Rate: 'best crm software'",
    description: "This keyword shows 25K searches but you'll only get ~8K clicks. AI and Featured Snippets are stealing 65% of traffic. Target those features!",
    action: "See Why",
    actionHref: "/dashboard/research/overview/best-crm-software",
    impact: "65% traffic being lost",
    impactColor: "text-red-400",
    timeAgo: "Click analysis"
  },
  {
    id: 9,
    type: "ai_citation",
    priority: "high",
    icon: Brain,
    iconColor: "text-purple-400",
    bgColor: "from-purple-500/10 to-pink-500/10",
    borderColor: "border-purple-500/20 hover:border-purple-500/40",
    title: "🧠 AI Citation: Reddit at #2 in 'best email marketing tools'",
    description: "AI Overview cites a 14-month old Reddit thread. Opportunity score: 85%. Add these entities: 'deliverability rates', 'A/B testing', 'automation workflows'.",
    action: "Capture Citation",
    actionHref: "/dashboard/creation/ai-writer?keyword=best-email-marketing-tools&aio=true",
    impact: "85% opportunity",
    impactColor: "text-purple-400",
    timeAgo: "Citation analysis"
  }
]
