"use client"

// ============================================
// Kanban Column Component (Enhanced)
// ============================================

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TaskCard, TaskStatus, ColumnConfig } from "../types"
import { SmartTaskCard } from "./smart-task-card"

interface KanbanColumnProps {
  column: ColumnConfig
  items: TaskCard[]
  onDelete: (id: string) => void
  onMoveToTop: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: TaskCard) => void
  onDragStart: (e: React.DragEvent, task: TaskCard) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: TaskStatus) => void
  draggingTask: TaskCard | null
  selectedIds?: Set<string>
  onSelectTask?: (id: string, selected: boolean) => void
  showSelection?: boolean
}

export function KanbanColumn({
  column,
  items,
  onDelete,
  onMoveToTop,
  onStatusChange,
  onEdit,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  draggingTask,
  selectedIds = new Set(),
  onSelectTask,
  showSelection = false,
}: KanbanColumnProps) {
  const Icon = column.icon
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
    onDragOver(e)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false)
    onDrop(e, column.id)
  }

  return (
    <div className="flex flex-col flex-1 min-w-[260px] max-w-[320px]">
      {/* Column Header */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-3 rounded-t-xl border-b-2",
          column.bgColor,
          column.borderColor
        )}
      >
        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", column.bgColor)}>
          <Icon className={cn("h-4 w-4", column.color)} />
        </div>
        <span className="text-sm font-semibold text-white tracking-tight">{column.title}</span>
        <Badge
          variant="secondary"
          className={cn(
            "ml-auto h-6 min-w-6 px-2 flex items-center justify-center text-xs font-bold rounded-full",
            column.id === "backlog" && "bg-slate-700/80 text-slate-200",
            column.id === "ready" && "bg-blue-600/30 text-blue-300 border border-blue-500/30",
            column.id === "progress" && "bg-amber-600/30 text-amber-300 border border-amber-500/30",
            column.id === "published" && "bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
          )}
        >
          {items.length}
        </Badge>
      </div>

      {/* Column Content - Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex-1 p-3 space-y-3 rounded-b-xl border border-t-0 min-h-[400px] overflow-y-auto transition-all",
          "border-slate-800/50 bg-slate-900/30",
          isDragOver && "ring-2 ring-purple-500/50 bg-purple-950/20"
        )}
      >
        {items.map((task) => (
          <SmartTaskCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            onMoveToTop={onMoveToTop}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            isDragging={draggingTask?.id === task.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isSelected={selectedIds.has(task.id)}
            onSelect={onSelectTask}
            showSelection={showSelection}
          />
        ))}

        {/* Empty state / Drop hint */}
        {items.length === 0 && (
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-700/50 rounded-xl text-sm text-slate-500 bg-slate-800/20">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  )
}
