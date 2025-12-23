"use client"

// ============================================
// CONTENT ROADMAP - State Management Hook
// ============================================
// Handles: All UI state, data state, computed values
// ============================================

import { useState, useMemo } from "react"
import type { TaskCard, TaskStatus, ViewMode, TaskFilters } from "../types"
import { applyAdvancedFilters, calculateTotalPotential } from "../utils"
import { useRoadmapTasks } from "./use-roadmap"

// Default filters
const DEFAULT_FILTERS: TaskFilters = {
  status: "all",
  assignee: "",
  tag: "all",
  dateRange: "all",
  search: "",
}

export function useContentRoadmapState() {
  // ================== DATA & MUTATIONS ==================
  const {
    tasks,
    isLoading,
    isRefetching,
    error,
    refetch,
    optimisticUpdate,
    setTasks,
  } = useRoadmapTasks()

  // ================== UI STATE ==================
  const [viewMode, setViewMode] = useState<ViewMode>("board")
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS)
  const [draggingTask, setDraggingTask] = useState<TaskCard | null>(null)

  // Modal State
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [editingTask, setEditingTask] = useState<TaskCard | null>(null)
  const [prefilledDate, setPrefilledDate] = useState<string>("")

  // Selection State (for bulk actions)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Toast State
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // ================== COMPUTED VALUES ==================
  const filteredTasks = useMemo(
    () => applyAdvancedFilters(tasks, filters),
    [tasks, filters]
  )

  const totalPotential = useMemo(() => calculateTotalPotential(tasks), [tasks])

  // ================== STATE SETTERS ==================
  const updateViewMode = (mode: ViewMode) => setViewMode(mode)
  
  const updateFilters = (newFilters: TaskFilters | ((prev: TaskFilters) => TaskFilters)) => {
    setFilters(newFilters)
  }

  const updateDraggingTask = (task: TaskCard | null) => setDraggingTask(task)

  const updateModalState = (
    show: boolean,
    mode: "add" | "edit" = "add",
    task: TaskCard | null = null,
    date: string = ""
  ) => {
    setShowTaskModal(show)
    setModalMode(mode)
    setEditingTask(task)
    setPrefilledDate(date)
  }

  const updateSelectedIds = (updater: (prev: Set<string>) => Set<string>) => {
    setSelectedIds(updater)
  }

  const updateToast = (show: boolean, message: string = "") => {
    setShowToast(show)
    setToastMessage(message)
    if (show && message) {
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const clearSelection = () => setSelectedIds(new Set())

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  // ================== HELPER FUNCTIONS ==================
  const showNotification = (message: string) => {
    updateToast(true, message)
  }

  const selectTask = (id: string, selected: boolean) => {
    updateSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const selectAllTasks = () => {
    updateSelectedIds(() => new Set(filteredTasks.map((t) => t.id)))
  }

  const deselectAllTasks = () => {
    updateSelectedIds(() => new Set())
  }

  // ================== MODAL HELPERS ==================
  const openAddModal = (date?: string) => {
    updateModalState(true, "add", null, date || "")
  }

  const openEditModal = (task: TaskCard) => {
    updateModalState(true, "edit", task)
  }

  const closeModal = () => {
    updateModalState(false)
  }

  // ================== RETURN STATE & ACTIONS ==================
  return {
    // Data State
    tasks,
    isLoading,
    isRefetching,
    error,
    filteredTasks,
    totalPotential,

    // UI State
    viewMode,
    filters,
    draggingTask,
    showTaskModal,
    modalMode,
    editingTask,
    prefilledDate,
    selectedIds,
    showToast,
    toastMessage,

    // Data Actions
    refetch,
    optimisticUpdate,
    setTasks,

    // UI Actions
    updateViewMode,
    updateFilters,
    updateDraggingTask,
    updateSelectedIds,
    clearSelection,
    resetFilters,
    showNotification,
    selectTask,
    selectAllTasks,
    deselectAllTasks,

    // Modal Actions
    openAddModal,
    openEditModal,
    closeModal,

    // Toast Actions
    updateToast,

    // Computed helpers
    hasSelectedTasks: selectedIds.size > 0,
    selectedCount: selectedIds.size,
    hasFilters: filters.search || filters.status !== "all" || filters.assignee || filters.tag !== "all" || filters.dateRange !== "all",
    isEmpty: tasks.length === 0,
    isFiltered: filteredTasks.length !== tasks.length,
  }
}