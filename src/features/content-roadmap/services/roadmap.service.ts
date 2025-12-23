// ============================================
// Content Roadmap Service Layer
// ============================================
// This service handles all data operations.
// Currently uses localStorage, but designed for easy API swap.
// When connecting real API, just replace the implementation
// inside each function - the interface stays the same.
// ============================================

import type { TaskCard, TaskStatus } from "../types"
import { INITIAL_TASKS } from "../__mocks__"

// Storage key for localStorage
const STORAGE_KEY = "blogspy_content_roadmap_tasks"

// Simulate network delay (remove when using real API)
const MOCK_DELAY = 300

// Helper: Simulate async operation
const simulateDelay = <T>(data: T, delay = MOCK_DELAY): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay))
}

// Helper: Get tasks from localStorage
const getStoredTasks = (): TaskCard[] => {
  if (typeof window === "undefined") return INITIAL_TASKS
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    // Initialize with mock data on first load
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS))
    return INITIAL_TASKS
  }
  
  try {
    return JSON.parse(stored)
  } catch {
    return INITIAL_TASKS
  }
}

// Helper: Save tasks to localStorage
const saveStoredTasks = (tasks: TaskCard[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

// ============================================
// API Response Types (Production-Ready)
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================
// Service Functions
// ============================================

/**
 * Fetch all tasks
 * @TODO: Replace with real API call
 * Example: return fetch('/api/roadmap/tasks').then(res => res.json())
 */
export async function fetchTasks(): Promise<ApiResponse<TaskCard[]>> {
  try {
    const tasks = getStoredTasks()
    return simulateDelay({
      success: true,
      data: tasks,
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch tasks",
    }
  }
}

/**
 * Fetch a single task by ID
 * @TODO: Replace with real API call
 */
export async function fetchTaskById(id: string): Promise<ApiResponse<TaskCard>> {
  try {
    const tasks = getStoredTasks()
    const task = tasks.find((t) => t.id === id)
    
    if (!task) {
      return {
        success: false,
        error: "Task not found",
      }
    }
    
    return simulateDelay({
      success: true,
      data: task,
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch task",
    }
  }
}

/**
 * Create a new task
 * @TODO: Replace with real API call
 * Example: return fetch('/api/roadmap/tasks', { method: 'POST', body: JSON.stringify(taskData) })
 */
export async function createTask(taskData: Omit<TaskCard, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<TaskCard>> {
  try {
    const tasks = getStoredTasks()
    
    const newTask: TaskCard = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    const updatedTasks = [newTask, ...tasks]
    saveStoredTasks(updatedTasks)
    
    return simulateDelay({
      success: true,
      data: newTask,
      message: "Task created successfully",
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    }
  }
}

/**
 * Update an existing task
 * @TODO: Replace with real API call
 * Example: return fetch(`/api/roadmap/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
 */
export async function updateTask(id: string, updates: Partial<TaskCard>): Promise<ApiResponse<TaskCard>> {
  try {
    const tasks = getStoredTasks()
    const taskIndex = tasks.findIndex((t) => t.id === id)
    
    if (taskIndex === -1) {
      return {
        success: false,
        error: "Task not found",
      }
    }
    
    const updatedTask: TaskCard = {
      ...tasks[taskIndex],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    }
    
    tasks[taskIndex] = updatedTask
    saveStoredTasks(tasks)
    
    return simulateDelay({
      success: true,
      data: updatedTask,
      message: "Task updated successfully",
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    }
  }
}

/**
 * Delete a task
 * @TODO: Replace with real API call
 * Example: return fetch(`/api/roadmap/tasks/${id}`, { method: 'DELETE' })
 */
export async function deleteTask(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    const tasks = getStoredTasks()
    const taskExists = tasks.some((t) => t.id === id)
    
    if (!taskExists) {
      return {
        success: false,
        error: "Task not found",
      }
    }
    
    const updatedTasks = tasks.filter((t) => t.id !== id)
    saveStoredTasks(updatedTasks)
    
    return simulateDelay({
      success: true,
      data: { id },
      message: "Task deleted successfully",
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    }
  }
}

/**
 * Bulk update task status
 * @TODO: Replace with real API call
 */
export async function bulkUpdateStatus(ids: string[], status: TaskStatus): Promise<ApiResponse<TaskCard[]>> {
  try {
    const tasks = getStoredTasks()
    const updatedTasks = tasks.map((task) =>
      ids.includes(task.id)
        ? { ...task, status, updatedAt: new Date().toISOString() }
        : task
    )
    
    saveStoredTasks(updatedTasks)
    
    return simulateDelay({
      success: true,
      data: updatedTasks.filter((t) => ids.includes(t.id)),
      message: `${ids.length} tasks updated`,
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update tasks",
    }
  }
}

/**
 * Bulk delete tasks
 * @TODO: Replace with real API call
 */
export async function bulkDeleteTasks(ids: string[]): Promise<ApiResponse<{ deletedCount: number }>> {
  try {
    const tasks = getStoredTasks()
    const updatedTasks = tasks.filter((t) => !ids.includes(t.id))
    
    saveStoredTasks(updatedTasks)
    
    return simulateDelay({
      success: true,
      data: { deletedCount: ids.length },
      message: `${ids.length} tasks deleted`,
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete tasks",
    }
  }
}

/**
 * Auto-prioritize all tasks
 * @TODO: Replace with real API call (or keep client-side)
 */
export async function autoPrioritizeTasks(): Promise<ApiResponse<TaskCard[]>> {
  try {
    const tasks = getStoredTasks()
    
    const calculatePriority = (task: TaskCard): number => {
      // Priority formula: Higher volume + Lower KD = Higher priority
      const volumeScore = Math.min(task.volume / 100, 50)
      const kdScore = Math.max(0, 50 - task.kd / 2)
      
      // Bonus for tasks with due dates coming up
      let urgencyBonus = 0
      if (task.dueDate) {
        const daysUntilDue = Math.ceil(
          (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        if (daysUntilDue < 0) urgencyBonus = 20 // Overdue
        else if (daysUntilDue <= 3) urgencyBonus = 15
        else if (daysUntilDue <= 7) urgencyBonus = 10
      }
      
      return Math.min(99, Math.max(50, Math.round(volumeScore + kdScore + urgencyBonus)))
    }
    
    const updatedTasks = tasks.map((task) => ({
      ...task,
      priorityScore: calculatePriority(task),
      updatedAt: new Date().toISOString(),
    }))
    
    saveStoredTasks(updatedTasks)
    
    return simulateDelay({
      success: true,
      data: updatedTasks,
      message: "Tasks prioritized successfully",
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to prioritize tasks",
    }
  }
}

/**
 * Move task to top of its column
 * @TODO: Replace with real API call
 */
export async function moveTaskToTop(id: string): Promise<ApiResponse<TaskCard>> {
  try {
    const tasks = getStoredTasks()
    const task = tasks.find((t) => t.id === id)
    
    if (!task) {
      return {
        success: false,
        error: "Task not found",
      }
    }
    
    // Find max priority in same status column
    const maxPriority = Math.max(
      ...tasks.filter((t) => t.status === task.status).map((t) => t.priorityScore),
      0
    )
    
    const updatedTask: TaskCard = {
      ...task,
      priorityScore: Math.min(99, maxPriority + 1),
      updatedAt: new Date().toISOString(),
    }
    
    const updatedTasks = tasks.map((t) => (t.id === id ? updatedTask : t))
    saveStoredTasks(updatedTasks)
    
    return simulateDelay({
      success: true,
      data: updatedTask,
      message: "Task moved to top",
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to move task",
    }
  }
}

/**
 * Reset to initial mock data (for testing)
 */
export async function resetToMockData(): Promise<ApiResponse<TaskCard[]>> {
  try {
    saveStoredTasks(INITIAL_TASKS)
    
    return simulateDelay({
      success: true,
      data: INITIAL_TASKS,
      message: "Data reset to initial state",
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset data",
    }
  }
}

/**
 * Export tasks (returns data for CSV generation)
 */
export async function exportTasks(taskIds?: string[]): Promise<ApiResponse<TaskCard[]>> {
  try {
    const tasks = getStoredTasks()
    const exportData = taskIds 
      ? tasks.filter((t) => taskIds.includes(t.id))
      : tasks
    
    return {
      success: true,
      data: exportData,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export tasks",
    }
  }
}
