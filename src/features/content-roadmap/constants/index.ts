// ============================================
// CONTENT ROADMAP - Constants
// ============================================

import { Lightbulb, PenLine, Flame, CheckCircle2 } from "lucide-react"
import type { ColumnConfig, TaskStatus, StatusBadgeConfig } from "../types"

export const COLUMNS: ColumnConfig[] = [
  {
    id: "backlog" as TaskStatus,
    title: "Ideas / Backlog",
    icon: Lightbulb,
    color: "text-slate-400",
    borderColor: "border-border",
    bgColor: "bg-slate-800/30",
  },
  {
    id: "ready" as TaskStatus,
    title: "Ready to Write",
    icon: PenLine,
    color: "text-blue-400",
    borderColor: "border-blue-900/50",
    bgColor: "bg-blue-950/20",
  },
  {
    id: "progress" as TaskStatus,
    title: "In Progress",
    icon: Flame,
    color: "text-amber-400",
    borderColor: "border-amber-900/50",
    bgColor: "bg-amber-950/20",
  },
  {
    id: "published" as TaskStatus,
    title: "Published",
    icon: CheckCircle2,
    color: "text-emerald-400",
    borderColor: "border-emerald-900/50",
    bgColor: "bg-emerald-950/20",
  },
]

export const STATUS_STYLES: Record<TaskStatus, string> = {
  backlog: "bg-slate-700 text-slate-300",
  ready: "bg-blue-900/50 text-blue-300",
  progress: "bg-amber-900/50 text-amber-300",
  published: "bg-emerald-900/50 text-emerald-300",
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  ready: "Ready",
  progress: "In Progress",
  published: "Published",
}
