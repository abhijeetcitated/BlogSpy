"use client"

// ============================================
// CONTENT ROADMAP - Main Component (Enhanced)
// ============================================
// All features integrated:
// - Add/Edit Task Modal
// - Calendar View
// - Advanced Filters
// - Bulk Actions
// - Export CSV
// - Due Dates, Tags, Progress
// ============================================

import { useState, useCallback, useMemo } from "react"
import {
  Plus,
  Download,
  Calendar,
  LayoutGrid,
  List,
  Search,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Feature imports
import type { TaskCard, TaskStatus, ViewMode, TaskFilters } from "./types"
import { COLUMNS } from "./constants"
import { INITIAL_TASKS } from "./__mocks__"
import {
  filterTasks,
  applyAdvancedFilters,
  countActiveFilters,
  getTasksByStatus,
  calculateTotalPotential,
  calculateAutoPriority,
  getStatusCount,
  getOverdueCount,
  getStatusBadge,
  exportTasksToCSV,
  downloadCSV,
} from "./utils"
import {
  ToastNotification,
  KanbanColumn,
  ListView,
  TaskModal,
  CalendarView,
  AdvancedFilters,
  BulkActions,
} from "./components"

// Default filters
const DEFAULT_FILTERS: TaskFilters = {
  status: "all",
  assignee: "",
  tag: "all",
  dateRange: "all",
  search: "",
}

export function ContentRoadmapContent() {
  // Core State
  const [viewMode, setViewMode] = useState<ViewMode>("board")
  const [tasks, setTasks] = useState<TaskCard[]>(INITIAL_TASKS)
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

  // Computed values
  const filteredTasks = useMemo(
    () => applyAdvancedFilters(tasks, filters),
    [tasks, filters]
  )

  const plannedCount = getStatusCount(tasks, ["backlog", "ready"])
  const inProgressCount = getStatusCount(tasks, ["progress"])
  const overdueCount = getOverdueCount(tasks)
  const totalPotential = useMemo(() => calculateTotalPotential(tasks), [tasks])
  const activeFilterCount = countActiveFilters(filters)

  // Toast helper
  const showNotification = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  // ================== TASK CRUD ==================
  
  const handleAddTask = useCallback(() => {
    setModalMode("add")
    setEditingTask(null)
    setPrefilledDate("")
    setShowTaskModal(true)
  }, [])

  const handleAddTaskWithDate = useCallback((date: string) => {
    setModalMode("add")
    setEditingTask(null)
    setPrefilledDate(date)
    setShowTaskModal(true)
  }, [])

  const handleEditTask = useCallback((task: TaskCard) => {
    setModalMode("edit")
    setEditingTask(task)
    setShowTaskModal(true)
  }, [])

  const handleSaveTask = useCallback((taskData: Partial<TaskCard>) => {
    if (modalMode === "add") {
      // Add new task
      const newTask: TaskCard = {
        id: taskData.id || `task-${Date.now()}`,
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setTasks((prev) => [newTask, ...prev])
      showNotification("✨ Task added successfully!")
    } else {
      // Update existing task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskData.id ? { ...t, ...taskData } : t
        )
      )
      showNotification("✅ Task updated!")
    }
  }, [modalMode, prefilledDate, showNotification])

  const handleDelete = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    showNotification("🗑️ Task deleted")
  }, [showNotification])

  const handleMoveToTop = useCallback((id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id)
      if (!task) return prev
      const maxPriority = Math.max(
        ...prev.filter((t) => t.status === task.status).map((t) => t.priorityScore)
      )
      return prev.map((t) => (t.id === id ? { ...t, priorityScore: maxPriority + 1 } : t))
    })
    showNotification("⬆️ Task moved to top")
  }, [showNotification])

  const handleStatusChange = useCallback((id: string, newStatus: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
  }, [])

  const handleAutoPrioritize = useCallback(() => {
    setTasks((prev) =>
      prev.map((task) => ({ ...task, priorityScore: calculateAutoPriority(task) }))
    )
    showNotification("⚡ Roadmap Optimized!")
  }, [showNotification])

  // ================== BULK ACTIONS ==================
  
  const handleSelectTask = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredTasks.map((t) => t.id)))
  }, [filteredTasks])

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleBulkMove = useCallback((status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (selectedIds.has(t.id) ? { ...t, status } : t))
    )
    showNotification(`📦 Moved ${selectedIds.size} tasks to ${getStatusBadge(status).label}`)
    setSelectedIds(new Set())
  }, [selectedIds, showNotification])

  const handleBulkDelete = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !selectedIds.has(t.id)))
    showNotification(`🗑️ Deleted ${selectedIds.size} tasks`)
    setSelectedIds(new Set())
  }, [selectedIds, showNotification])

  // ================== EXPORT ==================
  
  const handleExportCSV = useCallback(() => {
    const csv = exportTasksToCSV(filteredTasks)
    downloadCSV(csv, `content-roadmap-${new Date().toISOString().split("T")[0]}.csv`)
    showNotification("📥 CSV exported!")
  }, [filteredTasks, showNotification])

  // ================== DRAG & DROP ==================
  
  const handleDragStart = useCallback((e: React.DragEvent, task: TaskCard) => {
    setDraggingTask(task)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", task.id)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingTask(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStatus: TaskStatus) => {
      e.preventDefault()
      const taskId = e.dataTransfer.getData("text/plain")
      if (taskId && draggingTask) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
        )
        showNotification(`📋 Moved to ${getStatusBadge(targetStatus).label}`)
      }
      setDraggingTask(null)
    },
    [draggingTask, showNotification]
  )

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* ================== STICKY HEADER ================== */}
      <div className="sticky top-0 z-20 bg-slate-900 border-b border-slate-800 px-6 py-4">
        {/* Row 1: Title + Actions */}
        <div className="flex items-center justify-between gap-6 mb-4">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <LayoutGrid className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Content Roadmap</h1>
          </div>

          {/* Right: Primary Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAutoPrioritize}
              className="h-9 px-4 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-medium text-sm shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:scale-[1.02]"
            >
              <Zap className="h-4 w-4" />
              Optimize
            </Button>
            <Button
              size="sm"
              onClick={handleAddTask}
              className="h-9 px-4 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium text-sm shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              Add Content
            </Button>
          </div>
        </div>

        {/* Row 2: Search + View Toggle + Filters + Stats */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Search */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search content..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="pl-10 h-9 w-56 bg-slate-800/60 border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* Center: View Toggle */}
          <div className="flex items-center bg-slate-800/60 rounded-lg p-1 border border-slate-700/50">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-4 gap-2 rounded-md text-sm font-medium transition-all",
                viewMode === "board" 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              onClick={() => setViewMode("board")}
            >
              <LayoutGrid className="h-4 w-4" />
              Board
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-4 gap-2 rounded-md text-sm font-medium transition-all",
                viewMode === "list" 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-4 gap-2 rounded-md text-sm font-medium transition-all",
                viewMode === "calendar" 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </Button>
          </div>

          {/* Right: Filters + Export + Stats */}
          <div className="flex items-center gap-3">
            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <BulkActions
                selectedCount={selectedIds.size}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onBulkMove={handleBulkMove}
                onBulkDelete={handleBulkDelete}
                totalCount={filteredTasks.length}
                allSelected={selectedIds.size === filteredTasks.length && filteredTasks.length > 0}
              />
            )}

            <AdvancedFilters
              filters={filters}
              onFiltersChange={setFilters}
              activeFilterCount={activeFilterCount}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-9 px-4 gap-2 text-sm font-medium border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 rounded-lg transition-all"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            {/* Mini Stats */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 rounded-lg border border-slate-700/30">
              <span className="text-xs text-slate-400">{plannedCount} tasks</span>
              <span className="text-slate-700">•</span>
              <span className="text-xs text-amber-400">{inProgressCount} active</span>
              {overdueCount > 0 && (
                <>
                  <span className="text-slate-700">•</span>
                  <span className="text-xs text-red-400">{overdueCount} overdue</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================== MAIN CONTENT ================== */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === "board" ? (
          <div className="flex gap-5 h-full pb-4">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                items={getTasksByStatus(filteredTasks, column.id)}
                onDelete={handleDelete}
                onMoveToTop={handleMoveToTop}
                onStatusChange={handleStatusChange}
                onEdit={handleEditTask}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                draggingTask={draggingTask}
                selectedIds={selectedIds}
                onSelectTask={handleSelectTask}
                showSelection={selectedIds.size > 0}
              />
            ))}
          </div>
        ) : viewMode === "list" ? (
          <ListView
            items={filteredTasks.sort((a, b) => b.priorityScore - a.priorityScore)}
            onDelete={handleDelete}
            onMoveToTop={handleMoveToTop}
            onStatusChange={handleStatusChange}
            onEdit={handleEditTask}
            selectedIds={selectedIds}
            onSelectTask={handleSelectTask}
          />
        ) : (
          <CalendarView
            tasks={filteredTasks}
            onTaskClick={handleEditTask}
            onAddTask={handleAddTaskWithDate}
          />
        )}
      </div>

      {/* ================== MODALS & NOTIFICATIONS ================== */}
      <TaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleSaveTask}
        editTask={editingTask}
        mode={modalMode}
      />
      
      <ToastNotification show={showToast} message={toastMessage} />
    </main>
  )
}
