"use client"

// ============================================
// CONTENT ROADMAP - Event Handlers Hook
// ============================================
// Handles: All event handlers, CRUD operations, user interactions
// ============================================

import { useCallback } from "react"
import type { TaskCard, TaskStatus } from "../types"
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useBulkUpdateStatus,
  useBulkDelete,
  useAutoPrioritize,
  useMoveToTop,
  useResetData,
} from "./use-roadmap"
import { getStatusBadge, exportTasksToCSV, downloadCSV } from "../utils"

interface UseContentRoadmapHandlersProps {
  // State
  modalMode: "add" | "edit"
  prefilledDate: string
  editingTask: TaskCard | null
  selectedIds: Set<string>
  filteredTasks: TaskCard[]
  
  // Actions
  optimisticUpdate: (updater: (tasks: TaskCard[]) => TaskCard[]) => void
  refetch: () => void
  showNotification: (message: string) => void
  clearSelection: () => void
  openAddModal: (date?: string) => void
  openEditModal: (task: TaskCard) => void
  closeModal: () => void
  updateSelectedIds: (updater: (prev: Set<string>) => Set<string>) => void
}

export function useContentRoadmapHandlers(props: UseContentRoadmapHandlersProps) {
  const {
    modalMode,
    prefilledDate,
    editingTask,
    selectedIds,
    filteredTasks,
    optimisticUpdate,
    refetch,
    showNotification,
    clearSelection,
    openAddModal,
    openEditModal,
    closeModal,
    updateSelectedIds,
  } = props

  // ================== MUTATIONS ==================
  const createTask = useCreateTask((newTask) => {
    optimisticUpdate((prev) => [newTask, ...prev])
  })

  const updateTask = useUpdateTask((updated) => {
    optimisticUpdate((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    )
  })

  const deleteTask = useDeleteTask((id) => {
    optimisticUpdate((prev) => prev.filter((t) => t.id !== id))
    updateSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  })

  const bulkUpdateStatus = useBulkUpdateStatus(() => {
    refetch()
    clearSelection()
  })

  const bulkDelete = useBulkDelete(() => {
    refetch()
    clearSelection()
  })

  const autoPrioritize = useAutoPrioritize((updatedTasks) => {
    optimisticUpdate(() => updatedTasks)
  })

  const moveToTop = useMoveToTop((updated) => {
    optimisticUpdate((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    )
  })

  const resetData = useResetData(() => {
    refetch()
  })

  // ================== TASK CRUD HANDLERS ==================
  const handleAddTask = useCallback(() => {
    openAddModal()
  }, [openAddModal])

  const handleAddTaskWithDate = useCallback((date: string) => {
    openAddModal(date)
  }, [openAddModal])

  const handleEditTask = useCallback((task: TaskCard) => {
    openEditModal(task)
  }, [openEditModal])

  const handleSaveTask = useCallback(
    async (taskData: Partial<TaskCard>) => {
      if (modalMode === "add") {
        // Create new task
        const newTaskData: Omit<TaskCard, "id" | "createdAt" | "updatedAt"> = {
          title: taskData.title || "",
          keyword: taskData.keyword || "",
          volume: taskData.volume || 0,
          volumeDisplay: taskData.volumeDisplay || "0",
          kd: taskData.kd || 30,
          priorityScore: taskData.priorityScore || 70,
          assignee: taskData.assignee || "ME",
          status: taskData.status || "backlog",
          dueDate: prefilledDate || taskData.dueDate,
          tags: taskData.tags || [],
          comments: [],
          progress: 0,
          targetWordCount: taskData.targetWordCount || 2000,
          wordCount: taskData.wordCount,
          notes: taskData.notes,
        }

        const result = await createTask.mutate(newTaskData)
        if (result.success) {
          showNotification("✨ Task added successfully!")
          closeModal()
        } else {
          showNotification(`❌ ${result.error || "Failed to create task"}`)
        }
      } else if (editingTask) {
        // Update existing task
        const result = await updateTask.mutate(editingTask.id, {
          ...taskData,
          updatedAt: new Date().toISOString(),
        })
        if (result.success) {
          showNotification("✅ Task updated!")
          closeModal()
        } else {
          showNotification(`❌ ${result.error || "Failed to update task"}`)
        }
      }
    },
    [modalMode, prefilledDate, editingTask, createTask, updateTask, showNotification, closeModal]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      // Optimistic update
      optimisticUpdate((prev) => prev.filter((t) => t.id !== id))

      const result = await deleteTask.mutate(id)
      if (result.success) {
        showNotification("🗑️ Task deleted")
      } else {
        // Revert on error
        refetch()
        showNotification(`❌ ${result.error || "Failed to delete task"}`)
      }
    },
    [deleteTask, optimisticUpdate, refetch, showNotification]
  )

  const handleMoveToTop = useCallback(
    async (id: string) => {
      const result = await moveToTop.mutate(id)
      if (result.success) {
        showNotification("⬆️ Task moved to top")
      } else {
        showNotification(`❌ ${result.error || "Failed to move task"}`)
      }
    },
    [moveToTop, showNotification]
  )

  const handleStatusChange = useCallback(
    async (id: string, newStatus: TaskStatus) => {
      // Optimistic update
      optimisticUpdate((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      )

      const result = await updateTask.mutate(id, { status: newStatus })
      if (!result.success) {
        refetch()
        showNotification(`❌ ${result.error || "Failed to update status"}`)
      }
    },
    [updateTask, optimisticUpdate, refetch, showNotification]
  )

  const handleAutoPrioritize = useCallback(async () => {
    const result = await autoPrioritize.mutate()
    if (result.success) {
      showNotification("⚡ Roadmap Optimized!")
    } else {
      showNotification(`❌ ${result.error || "Failed to optimize"}`)
    }
  }, [autoPrioritize, showNotification])

  // ================== BULK ACTIONS ==================
  const handleSelectTask = useCallback((id: string, selected: boolean) => {
    updateSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) next.add(id)
      else next.delete(id)
      return next
    })
  }, [updateSelectedIds])

  const handleSelectAll = useCallback(() => {
    updateSelectedIds(() => new Set(filteredTasks.map((t) => t.id)))
  }, [filteredTasks, updateSelectedIds])

  const handleDeselectAll = useCallback(() => {
    clearSelection()
  }, [clearSelection])

  const handleBulkMove = useCallback(
    async (status: TaskStatus) => {
      const ids = Array.from(selectedIds)

      // Optimistic update
      optimisticUpdate((prev) =>
        prev.map((t) => (selectedIds.has(t.id) ? { ...t, status } : t))
      )

      const result = await bulkUpdateStatus.mutate(ids, status)
      if (result.success) {
        showNotification(
          `📦 Moved ${ids.length} tasks to ${getStatusBadge(status).label}`
        )
      } else {
        refetch()
        showNotification(`❌ ${result.error || "Failed to move tasks"}`)
      }
    },
    [selectedIds, bulkUpdateStatus, optimisticUpdate, refetch, showNotification]
  )

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds)
    const count = ids.length

    // Optimistic update
    optimisticUpdate((prev) => prev.filter((t) => !selectedIds.has(t.id)))

    const result = await bulkDelete.mutate(ids)
    if (result.success) {
      showNotification(`🗑️ Deleted ${count} tasks`)
    } else {
      refetch()
      showNotification(`❌ ${result.error || "Failed to delete tasks"}`)
    }
  }, [selectedIds, bulkDelete, optimisticUpdate, refetch, showNotification])

  // ================== EXPORT ==================
  const handleExportCSV = useCallback(() => {
    const csv = exportTasksToCSV(filteredTasks)
    downloadCSV(csv, `content-roadmap-${new Date().toISOString().split("T")[0]}.csv`)
    showNotification("📥 CSV exported!")
  }, [filteredTasks, showNotification])

  // ================== RESET DATA (Dev Tool) ==================
  const handleResetData = useCallback(async () => {
    const result = await resetData.mutate()
    if (result.success) {
      showNotification("🔄 Data reset to initial state")
    } else {
      showNotification(`❌ ${result.error || "Failed to reset data"}`)
    }
  }, [resetData, showNotification])

  // ================== RETURN HANDLERS ==================
  return {
    // Task CRUD
    handleAddTask,
    handleAddTaskWithDate,
    handleEditTask,
    handleSaveTask,
    handleDelete,
    handleMoveToTop,
    handleStatusChange,
    handleAutoPrioritize,

    // Selection
    handleSelectTask,
    handleSelectAll,
    handleDeselectAll,

    // Bulk Actions
    handleBulkMove,
    handleBulkDelete,

    // Export
    handleExportCSV,

    // Dev Tools
    handleResetData,

    // Loading states
    createTaskLoading: createTask.isLoading,
    updateTaskLoading: updateTask.isLoading,
    deleteTaskLoading: deleteTask.isLoading,
    autoPrioritizeLoading: autoPrioritize.isLoading,
    resetDataLoading: resetData.isLoading,
  }
}