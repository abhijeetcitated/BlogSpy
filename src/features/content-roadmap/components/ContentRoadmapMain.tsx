"use client"

// ============================================
// CONTENT ROADMAP - Main UI Component
// ============================================
// Handles: Layout, Component Composition, View Rendering
// ============================================

import { useMemo } from "react"
import {
  Plus,
  Download,
  Calendar,
  LayoutGrid,
  List,
  Search,
  Zap,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Feature imports
import type { TaskCard, TaskStatus, ViewMode, TaskFilters } from "../types"
import { COLUMNS } from "../constants"
import {
  applyAdvancedFilters,
  countActiveFilters,
  getTasksByStatus,
  getStatusCount,
  getOverdueCount,
} from "../utils"
import {
  ToastNotification,
  KanbanColumn,
  ListView,
  TaskModal,
  CalendarView,
  AdvancedFilters,
  BulkActions,
  RoadmapLoadingSkeleton,
  ErrorState,
  EmptyState,
} from "../components"

interface ContentRoadmapMainProps {
  // Data
  tasks: TaskCard[]
  isLoading: boolean
  isRefetching: boolean
  error: string | null
  
  // UI State
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  filters: TaskFilters
  setFilters: (filters: TaskFilters | ((prev: TaskFilters) => TaskFilters)) => void
  draggingTask: TaskCard | null
  
  // Modal State
  showTaskModal: boolean
  setShowTaskModal: (show: boolean) => void
  modalMode: "add" | "edit"
  editingTask: TaskCard | null
  
  // Selection State
  selectedIds: Set<string>
  
  // Toast State
  showToast: boolean
  toastMessage: string
  
  // Handlers
  onAddTask: () => void
  onAddTaskWithDate: (date: string) => void
  onEditTask: (task: TaskCard) => void
  onSaveTask: (taskData: Partial<TaskCard>) => void
  onDelete: (id: string) => void
  onMoveToTop: (id: string) => void
  onStatusChange: (id: string, newStatus: TaskStatus) => void
  onAutoPrioritize: () => void
  onSelectTask: (id: string, selected: boolean) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onBulkMove: (status: TaskStatus) => void
  onBulkDelete: () => void
  onExportCSV: () => void
  onResetData: () => void
  onDragStart: (e: React.DragEvent, task: TaskCard) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, targetStatus: TaskStatus) => void
  // Touch handlers for mobile drag & drop
  onTouchStart?: (e: React.TouchEvent, task: TaskCard) => void
  onTouchMove?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onRefetch: () => void
  
  // Loading states
  createTaskLoading: boolean
  autoPrioritizeLoading: boolean
  resetDataLoading: boolean
}

const DEFAULT_FILTERS: TaskFilters = {
  status: "all",
  assignee: "",
  tag: "all",
  dateRange: "all",
  search: "",
}

export function ContentRoadmapMain(props: ContentRoadmapMainProps) {
  const {
    tasks,
    isLoading,
    isRefetching,
    error,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    draggingTask,
    showTaskModal,
    setShowTaskModal,
    modalMode,
    editingTask,
    selectedIds,
    showToast,
    toastMessage,
    onAddTask,
    onAddTaskWithDate,
    onEditTask,
    onSaveTask,
    onDelete,
    onMoveToTop,
    onStatusChange,
    onAutoPrioritize,
    onSelectTask,
    onSelectAll,
    onDeselectAll,
    onBulkMove,
    onBulkDelete,
    onExportCSV,
    onResetData,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onRefetch,
    createTaskLoading,
    autoPrioritizeLoading,
    resetDataLoading,
  } = props

  // ================== COMPUTED VALUES ==================
  const filteredTasks = useMemo(
    () => applyAdvancedFilters(tasks, filters),
    [tasks, filters]
  )

  const plannedCount = getStatusCount(tasks, ["backlog", "ready"])
  const inProgressCount = getStatusCount(tasks, ["progress"])
  const overdueCount = getOverdueCount(tasks)
  const activeFilterCount = countActiveFilters(filters)

  // ================== LOADING STATE ==================
  if (isLoading) {
    return <RoadmapLoadingSkeleton />
  }

  // ================== ERROR STATE ==================
  if (error) {
    return (
      <main className="flex-1 flex flex-col overflow-hidden bg-background -m-3 sm:-m-4 md:-m-6 p-3 sm:p-4 md:p-6">
        <ErrorState error={error} onRetry={onRefetch} />
      </main>
    )
  }

  // ================== RENDER ==================
  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background -m-3 sm:-m-4 md:-m-6">
      {/* ================== STICKY HEADER ================== */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        {/* Row 1: Title + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 mb-3 sm:mb-4">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Content Roadmap
            </h1>
            {isRefetching && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-3 w-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="hidden xs:inline">Syncing...</span>
              </div>
            )}
          </div>

          {/* Right: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
            {/* Reset Data Button (Dev Tool) */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onResetData}
              disabled={resetDataLoading}
              className="h-8 sm:h-9 px-2.5 sm:px-3 gap-1.5 text-muted-foreground hover:text-foreground"
              title="Refresh data"
            >
              <RotateCcw className={cn("h-4 w-4", resetDataLoading && "animate-spin")} />
              Refresh
            </Button>

            <Button
              size="sm"
              onClick={onAutoPrioritize}
              disabled={autoPrioritizeLoading}
              className="h-8 sm:h-9 px-2.5 sm:px-3 md:px-4 gap-1.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-medium text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:scale-[1.02] disabled:opacity-50"
              title="Auto-prioritize tasks"
            >
              <Zap className={cn("h-4 w-4", autoPrioritizeLoading && "animate-pulse")} />
              {autoPrioritizeLoading ? "Optimizing..." : "Optimize"}
            </Button>
            <Button
              size="sm"
              onClick={onAddTask}
              disabled={createTaskLoading}
              className="h-8 sm:h-9 px-2.5 sm:px-3 md:px-4 gap-1.5 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02] disabled:opacity-50"
              title="Add new content"
            >
              <Plus className="h-4 w-4" />
              Add Content
            </Button>
          </div>
        </div>

        {/* Row 2: Search + View Toggle + Filters + Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Search */}
          <div className="relative shrink-0 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="pl-10 h-9 w-full sm:w-56 bg-muted border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* Center: View Toggle */}
          <div className="flex justify-center sm:justify-start">
            <div className="flex items-center bg-muted rounded-lg p-1 border border-border overflow-x-auto">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 sm:h-8 px-2.5 sm:px-4 gap-1.5 sm:gap-2 rounded-md text-xs sm:text-sm font-medium transition-all shrink-0",
                viewMode === "board"
                  ? "bg-accent text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setViewMode("board")}
            >
              <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Board</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 sm:h-8 px-2.5 sm:px-4 gap-1.5 sm:gap-2 rounded-md text-xs sm:text-sm font-medium transition-all shrink-0",
                viewMode === "list"
                  ? "bg-accent text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">List</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 sm:h-8 px-2.5 sm:px-4 gap-1.5 sm:gap-2 rounded-md text-xs sm:text-sm font-medium transition-all shrink-0",
                viewMode === "calendar"
                  ? "bg-accent text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Calendar</span>
            </Button>
            </div>
          </div>

          {/* Right: Filters + Export */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <BulkActions
                selectedCount={selectedIds.size}
                onSelectAll={onSelectAll}
                onDeselectAll={onDeselectAll}
                onBulkMove={onBulkMove}
                onBulkDelete={onBulkDelete}
                totalCount={filteredTasks.length}
                allSelected={
                  selectedIds.size === filteredTasks.length &&
                  filteredTasks.length > 0
                }
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
              onClick={onExportCSV}
              className="h-8 sm:h-9 px-2.5 sm:px-4 gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border rounded-lg transition-all"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>

            {/* Mini Stats - Hidden on mobile/tablet, visible on desktop */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border text-xs">
              <span className="text-muted-foreground">
                {plannedCount} tasks
              </span>
              <span className="text-border">•</span>
              <span className="text-amber-500 dark:text-amber-400">
                {inProgressCount} active
              </span>
              {overdueCount > 0 && (
                <>
                  <span className="text-border">•</span>
                  <span className="text-red-500 dark:text-red-400">
                    {overdueCount} overdue
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Stats - Only visible on mobile/tablet, centered */}
        <div className="flex lg:hidden justify-center mt-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border text-xs">
            <span className="text-muted-foreground">
              {plannedCount} tasks
            </span>
            <span className="text-border">•</span>
            <span className="text-amber-500 dark:text-amber-400">
              {inProgressCount} active
            </span>
            {overdueCount > 0 && (
              <>
                <span className="text-border">•</span>
                <span className="text-red-500 dark:text-red-400">
                  {overdueCount} overdue
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================== MAIN CONTENT ================== */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
        {tasks.length === 0 ? (
          <EmptyState
            title="No content planned yet"
            description="Start building your content roadmap by adding your first task"
            actionLabel="Add First Task"
            onAction={onAddTask}
          />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title="No matching tasks"
            description="Try adjusting your filters or search query"
            actionLabel="Clear Filters"
            onAction={() => setFilters(DEFAULT_FILTERS)}
          />
        ) : viewMode === "board" ? (
          <div 
            data-kanban-scroll
            className="flex gap-3 sm:gap-5 h-full pb-4 overflow-x-auto"
          >
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                items={getTasksByStatus(filteredTasks, column.id)}
                onDelete={onDelete}
                onMoveToTop={onMoveToTop}
                onStatusChange={onStatusChange}
                onEdit={onEditTask}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                draggingTask={draggingTask}
                selectedIds={selectedIds}
                onSelectTask={onSelectTask}
                showSelection={selectedIds.size > 0}
              />
            ))}
          </div>
        ) : viewMode === "list" ? (
          <ListView
            items={filteredTasks.sort((a, b) => b.priorityScore - a.priorityScore)}
            onDelete={onDelete}
            onMoveToTop={onMoveToTop}
            onStatusChange={onStatusChange}
            onEdit={onEditTask}
            selectedIds={selectedIds}
            onSelectTask={onSelectTask}
          />
        ) : (
          <CalendarView
            tasks={filteredTasks}
            onTaskClick={onEditTask}
            onAddTask={onAddTaskWithDate}
          />
        )}
      </div>

      {/* ================== MODALS & NOTIFICATIONS ================== */}
      <TaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={onSaveTask}
        editTask={editingTask}
        mode={modalMode}
      />

      <ToastNotification show={showToast} message={toastMessage} />
    </main>
  )
}