// ============================================
// CONTENT ROADMAP - Utility Functions
// ============================================

import type { TaskCard, TaskStatus, StatusBadgeConfig, TaskFilters, TaskTag } from "../types"
import { STATUS_STYLES, STATUS_LABELS } from "../constants"

/**
 * Get priority color classes based on score
 */
export function getPriorityColor(score: number): string {
  if (score >= 90) return "bg-red-500/20 text-red-400 border-red-500/30"
  if (score >= 75) return "bg-amber-500/20 text-amber-400 border-amber-500/30"
  return "bg-slate-500/20 text-slate-400 border-slate-500/30"
}

/**
 * Get KD text color based on difficulty
 */
export function getKdColor(kd: number): string {
  if (kd <= 30) return "text-emerald-400"
  if (kd <= 50) return "text-amber-400"
  return "text-red-400"
}

/**
 * Get KD dot color based on difficulty
 */
export function getKdDotColor(kd: number): string {
  if (kd <= 30) return "bg-emerald-500"
  if (kd <= 50) return "bg-amber-500"
  return "bg-red-500"
}

/**
 * Get status badge config
 */
export function getStatusBadge(status: TaskStatus): StatusBadgeConfig {
  return {
    style: STATUS_STYLES[status],
    label: STATUS_LABELS[status],
  }
}

/**
 * Filter tasks by search query (simple)
 */
export function filterTasks(tasks: TaskCard[], query: string): TaskCard[] {
  if (!query.trim()) return tasks
  const searchTerm = query.toLowerCase()
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.keyword.toLowerCase().includes(searchTerm) ||
      task.assignee.toLowerCase().includes(searchTerm)
  )
}

/**
 * Apply advanced filters to tasks
 */
export function applyAdvancedFilters(tasks: TaskCard[], filters: TaskFilters): TaskCard[] {
  let result = [...tasks]

  // Search filter
  if (filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase()
    result = result.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.keyword.toLowerCase().includes(searchTerm) ||
        task.assignee.toLowerCase().includes(searchTerm)
    )
  }

  // Status filter
  if (filters.status !== "all") {
    result = result.filter((task) => task.status === filters.status)
  }

  // Assignee filter
  if (filters.assignee) {
    result = result.filter((task) => task.assignee === filters.assignee)
  }

  // Tag filter
  if (filters.tag !== "all") {
    result = result.filter((task) => task.tags?.includes(filters.tag as TaskTag))
  }

  // Date range filter
  if (filters.dateRange !== "all") {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    result = result.filter((task) => {
      if (!task.dueDate) return filters.dateRange === "all"
      
      const dueDate = new Date(task.dueDate)
      dueDate.setHours(0, 0, 0, 0)

      switch (filters.dateRange) {
        case "today":
          return dueDate.getTime() === today.getTime()
        case "week": {
          const weekEnd = new Date(today)
          weekEnd.setDate(weekEnd.getDate() + 7)
          return dueDate >= today && dueDate <= weekEnd
        }
        case "month": {
          const monthEnd = new Date(today)
          monthEnd.setMonth(monthEnd.getMonth() + 1)
          return dueDate >= today && dueDate <= monthEnd
        }
        case "overdue":
          return dueDate < today && task.status !== "published"
        default:
          return true
      }
    })
  }

  return result
}

/**
 * Count active filters
 */
export function countActiveFilters(filters: TaskFilters): number {
  let count = 0
  if (filters.status !== "all") count++
  if (filters.assignee) count++
  if (filters.tag !== "all") count++
  if (filters.dateRange !== "all") count++
  return count
}

/**
 * Get tasks by status, sorted by priority
 */
export function getTasksByStatus(tasks: TaskCard[], status: TaskStatus): TaskCard[] {
  return tasks
    .filter((t) => t.status === status)
    .sort((a, b) => b.priorityScore - a.priorityScore)
}

/**
 * Calculate total traffic potential
 */
export function calculateTotalPotential(tasks: TaskCard[]): string {
  const total = tasks.reduce((sum, t) => sum + t.volume, 0)
  return total >= 1000 ? `${Math.round(total / 1000)}k` : total.toString()
}

/**
 * Calculate auto-prioritized score based on volume/KD ratio (improved)
 */
export function calculateAutoPriority(task: TaskCard): number {
  // Improved formula: considers volume, KD, and due date urgency
  const baseScore = task.kd > 0 ? (task.volume / task.kd) * 2 : task.volume
  
  // Bonus for urgency
  let urgencyBonus = 0
  if (task.dueDate) {
    const daysUntilDue = Math.ceil(
      (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysUntilDue <= 0) urgencyBonus = 20 // Overdue
    else if (daysUntilDue <= 3) urgencyBonus = 15
    else if (daysUntilDue <= 7) urgencyBonus = 10
  }

  const finalScore = Math.min(99, Math.max(50, Math.round(baseScore / 50) + urgencyBonus))
  return finalScore
}

/**
 * Get count of tasks by status
 */
export function getStatusCount(tasks: TaskCard[], statuses: TaskStatus[]): number {
  return tasks.filter((t) => statuses.includes(t.status)).length
}

/**
 * Export tasks to CSV format
 */
export function exportTasksToCSV(tasks: TaskCard[]): string {
  const headers = [
    "Title",
    "Keyword",
    "Status",
    "Priority",
    "Volume",
    "KD",
    "Assignee",
    "Due Date",
    "Tags",
    "Progress",
    "Word Count",
    "Target Words",
    "Created",
    "Updated",
  ]

  const rows = tasks.map((task) => [
    `"${task.title.replace(/"/g, '""')}"`,
    `"${task.keyword.replace(/"/g, '""')}"`,
    task.status,
    task.priorityScore,
    task.volume,
    task.kd,
    task.assignee,
    task.dueDate || "",
    `"${task.tags?.join(", ") || ""}"`,
    task.progress || 0,
    task.wordCount || "",
    task.targetWordCount || "",
    task.createdAt || "",
    task.updatedAt || "",
  ])

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Get overdue task count
 */
export function getOverdueCount(tasks: TaskCard[]): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return tasks.filter((task) => {
    if (!task.dueDate || task.status === "published") return false
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  }).length
}
