// ============================================
// CONTENT ROADMAP - Type Definitions
// ============================================

export type ViewMode = "board" | "list" | "calendar"
export type TaskStatus = "backlog" | "ready" | "progress" | "published"
export type TaskTag = "blog" | "guide" | "tutorial" | "review" | "comparison" | "listicle" | "news" | "case-study"

export interface TaskComment {
  id: string
  text: string
  author: string
  createdAt: string
}

export interface TaskCard {
  id: string
  title: string
  keyword: string
  volume: number
  volumeDisplay: string
  kd: number
  priorityScore: number
  assignee: string
  status: TaskStatus
  // New fields
  dueDate?: string
  tags: TaskTag[]
  comments: TaskComment[]
  progress: number // 0-100 percentage
  wordCount?: number
  targetWordCount?: number
  notes?: string // Brief, outline, or task notes
  createdAt: string
  updatedAt: string
}

export interface ColumnConfig {
  id: TaskStatus
  title: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  borderColor: string
  bgColor: string
}

export interface StatusBadgeConfig {
  style: string
  label: string
}

export interface TaskFilters {
  status: TaskStatus | "all"
  assignee: string
  tag: TaskTag | "all"
  dateRange: "all" | "today" | "week" | "month" | "overdue"
  search: string
}

// Tag colors configuration
export const TAG_COLORS: Record<TaskTag, { bg: string; text: string; border: string }> = {
  blog: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  guide: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
  tutorial: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  review: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
  comparison: { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500/30" },
  listicle: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
  news: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  "case-study": { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
}

export const TAG_LABELS: Record<TaskTag, string> = {
  blog: "Blog Post",
  guide: "Guide",
  tutorial: "Tutorial",
  review: "Review",
  comparison: "Comparison",
  listicle: "Listicle",
  news: "News",
  "case-study": "Case Study",
}

export const ASSIGNEES = [
  { id: "JD", name: "John Doe", color: "bg-blue-500" },
  { id: "AM", name: "Alice Miller", color: "bg-purple-500" },
  { id: "SK", name: "Sam Kim", color: "bg-emerald-500" },
  { id: "ME", name: "Me", color: "bg-amber-500" },
]
