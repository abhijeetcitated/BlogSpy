// ============================================
// CONTENT ROADMAP - Feature Barrel Export
// ============================================

// Main component
export { ContentRoadmapContent } from "./content-roadmap-content"

// Types
export type {
  ViewMode,
  TaskStatus,
  TaskTag,
  TaskCard,
  TaskComment,
  ColumnConfig,
  StatusBadgeConfig,
  TaskFilters,
} from "./types"

export { TAG_COLORS, TAG_LABELS, ASSIGNEES } from "./types"

// Constants
export { COLUMNS, STATUS_STYLES, STATUS_LABELS } from "./constants"

// Utils
export {
  getPriorityColor,
  getKdColor,
  getKdDotColor,
  getStatusBadge,
  filterTasks,
  applyAdvancedFilters,
  countActiveFilters,
  getTasksByStatus,
  calculateTotalPotential,
  calculateAutoPriority,
  getStatusCount,
  getOverdueCount,
  exportTasksToCSV,
  downloadCSV,
} from "./utils"

// Components
export {
  ToastNotification,
  SmartTaskCard,
  KanbanColumn,
  ListView,
  RoadmapHeader,
  TaskModal,
  CalendarView,
  AdvancedFilters,
  BulkActions,
  TaskCardSkeleton,
  KanbanColumnSkeleton,
  BoardViewSkeleton,
  ListViewSkeleton,
  CalendarViewSkeleton,
  RoadmapLoadingSkeleton,
  ErrorState,
  EmptyState,
} from "./components"

// Hooks
export {
  useRoadmapTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useBulkUpdateStatus,
  useBulkDelete,
  useAutoPrioritize,
  useMoveToTop,
  useResetData,
} from "./hooks"

// Services
export * from "./services"
