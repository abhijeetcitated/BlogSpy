// ============================================
// CONTENT ROADMAP - Computed Values Utility
// ============================================
// Handles: All computed values, calculations, derived state
// ============================================

import type { TaskCard, TaskStatus, TaskFilters } from "../types"
import { 
  applyAdvancedFilters, 
  countActiveFilters,
  getTasksByStatus,
  calculateTotalPotential,
  getStatusCount,
  getOverdueCount,
} from "../utils"

export interface ComputedRoadmapValues {
  // Filtered data
  filteredTasks: TaskCard[]
  
  // Counts
  plannedCount: number
  inProgressCount: number
  completedCount: number
  overdueCount: number
  totalCount: number
  selectedCount: number
  
  // Metrics
  totalPotential: number
  activeFilterCount: number
  
  // Status breakdowns
  backlogTasks: TaskCard[]
  readyTasks: TaskCard[]
  progressTasks: TaskCard[]
  publishedTasks: TaskCard[]
  
  // Flags
  hasFilters: boolean
  hasSelection: boolean
  isEmpty: boolean
  isFiltered: boolean
  allSelected: boolean
}

export function computeRoadmapValues(
  tasks: TaskCard[],
  filters: TaskFilters,
  selectedIds: Set<string>
): ComputedRoadmapValues {
  // Filter tasks
  const filteredTasks = applyAdvancedFilters(tasks, filters)
  
  // Basic counts
  const totalCount = tasks.length
  const selectedCount = selectedIds.size
  const plannedCount = getStatusCount(tasks, ["backlog", "ready"])
  const inProgressCount = getStatusCount(tasks, ["progress"])
  const completedCount = getStatusCount(tasks, ["published"])
  const overdueCount = getOverdueCount(tasks)
  
  // Metrics
  const totalPotential = calculateTotalPotential(tasks)
  const activeFilterCount = countActiveFilters(filters)
  
  // Status breakdowns
  const backlogTasks = getTasksByStatus(filteredTasks, "backlog")
  const readyTasks = getTasksByStatus(filteredTasks, "ready")
  const progressTasks = getTasksByStatus(filteredTasks, "progress")
  const publishedTasks = getTasksByStatus(filteredTasks, "published")
  
  // Flags
  const hasFilters = activeFilterCount > 0
  const hasSelection = selectedCount > 0
  const isEmpty = totalCount === 0
  const isFiltered = filteredTasks.length !== totalCount
  const allSelected = selectedCount === filteredTasks.length && filteredTasks.length > 0
  
  return {
    // Filtered data
    filteredTasks,
    
    // Counts
    plannedCount,
    inProgressCount,
    completedCount,
    overdueCount,
    totalCount,
    selectedCount,
    
    // Metrics
    totalPotential,
    activeFilterCount,
    
    // Status breakdowns
    backlogTasks,
    readyTasks,
    progressTasks,
    publishedTasks,
    
    // Flags
    hasFilters,
    hasSelection,
    isEmpty,
    isFiltered,
    allSelected,
  }
}