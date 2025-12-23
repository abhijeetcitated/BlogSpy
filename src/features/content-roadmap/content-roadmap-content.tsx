"use client"

// ============================================
// CONTENT ROADMAP - Main Orchestrator (Refactored)
// ============================================
// Clean orchestrator that uses split components for better maintainability
// ============================================

import { useContentRoadmapState } from "./hooks/useContentRoadmapState"
import { useContentRoadmapHandlers } from "./hooks/useContentRoadmapHandlers"
import { useContentRoadmapDragDrop } from "./hooks/useContentRoadmapDragDrop"
import { ContentRoadmapMain } from "./components/ContentRoadmapMain"

export function ContentRoadmapContent() {
  // ================== STATE MANAGEMENT ==================
  const state = useContentRoadmapState()

  // ================== EVENT HANDLERS ==================
  const handlers = useContentRoadmapHandlers({
    modalMode: state.modalMode,
    prefilledDate: state.prefilledDate,
    editingTask: state.editingTask,
    selectedIds: state.selectedIds,
    filteredTasks: state.filteredTasks,
    optimisticUpdate: state.optimisticUpdate,
    refetch: state.refetch,
    showNotification: state.showNotification,
    clearSelection: state.clearSelection,
    openAddModal: state.openAddModal,
    openEditModal: state.openEditModal,
    closeModal: state.closeModal,
    updateSelectedIds: state.updateSelectedIds,
  })

  // ================== DRAG & DROP ==================
  const dragDrop = useContentRoadmapDragDrop({
    draggingTask: state.draggingTask,
    updateDraggingTask: state.updateDraggingTask,
    optimisticUpdate: state.optimisticUpdate,
    refetch: state.refetch,
    showNotification: state.showNotification,
  })

  // ================== RENDER ==================
  return (
    <ContentRoadmapMain
      // Data
      tasks={state.tasks}
      isLoading={state.isLoading}
      isRefetching={state.isRefetching}
      error={state.error}
      
      // UI State
      viewMode={state.viewMode}
      setViewMode={state.updateViewMode}
      filters={state.filters}
      setFilters={state.updateFilters}
      draggingTask={state.draggingTask}
      
      // Modal State
      showTaskModal={state.showTaskModal}
      setShowTaskModal={(show) => show ? state.openAddModal() : state.closeModal()}
      modalMode={state.modalMode}
      editingTask={state.editingTask}
      
      // Selection State
      selectedIds={state.selectedIds}
      
      // Toast State
      showToast={state.showToast}
      toastMessage={state.toastMessage}
      
      // Handlers
      onAddTask={handlers.handleAddTask}
      onAddTaskWithDate={handlers.handleAddTaskWithDate}
      onEditTask={handlers.handleEditTask}
      onSaveTask={handlers.handleSaveTask}
      onDelete={handlers.handleDelete}
      onMoveToTop={handlers.handleMoveToTop}
      onStatusChange={handlers.handleStatusChange}
      onAutoPrioritize={handlers.handleAutoPrioritize}
      onSelectTask={handlers.handleSelectTask}
      onSelectAll={handlers.handleSelectAll}
      onDeselectAll={handlers.handleDeselectAll}
      onBulkMove={handlers.handleBulkMove}
      onBulkDelete={handlers.handleBulkDelete}
      onExportCSV={handlers.handleExportCSV}
      onResetData={handlers.handleResetData}
      onDragStart={dragDrop.handleDragStart}
      onDragEnd={dragDrop.handleDragEnd}
      onDragOver={dragDrop.handleDragOver}
      onDrop={dragDrop.handleDrop}
      onTouchStart={dragDrop.handleTouchStart}
      onTouchMove={dragDrop.handleTouchMove}
      onTouchEnd={dragDrop.handleTouchEnd}
      onRefetch={state.refetch}
      
      // Loading states
      createTaskLoading={handlers.createTaskLoading}
      autoPrioritizeLoading={handlers.autoPrioritizeLoading}
      resetDataLoading={handlers.resetDataLoading}
    />
  )
}
