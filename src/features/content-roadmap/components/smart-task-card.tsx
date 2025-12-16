"use client"

// ============================================
// Smart Task Card Component (Enhanced)
// ============================================

import { useState } from "react"
import Link from "next/link"
import {
  Flame,
  GripVertical,
  Play,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowUp,
  Calendar,
  MessageSquare,
  CheckSquare,
  Square,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { TaskCard, TaskStatus } from "../types"
import { TAG_COLORS, TAG_LABELS, ASSIGNEES } from "../types"
import { getPriorityColor, getKdColor } from "../utils"

interface SmartTaskCardProps {
  task: TaskCard
  onDelete: (id: string) => void
  onMoveToTop: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: TaskCard) => void
  isDragging?: boolean
  onDragStart: (e: React.DragEvent, task: TaskCard) => void
  onDragEnd: (e: React.DragEvent) => void
  isSelected?: boolean
  onSelect?: (id: string, selected: boolean) => void
  showSelection?: boolean
}

export function SmartTaskCard({
  task,
  onDelete,
  onMoveToTop,
  onEdit,
  isDragging,
  onDragStart,
  onDragEnd,
  isSelected = false,
  onSelect,
  showSelection = false,
}: SmartTaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "published"
  
  // Get assignee info
  const assigneeInfo = ASSIGNEES.find(a => a.id === task.assignee)

  // Format due date
  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative bg-slate-900/60 border rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg hover:shadow-black/30",
        isDragging && "opacity-50 scale-95",
        isSelected ? "border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30" : "border-slate-700/50 hover:border-slate-600",
        isOverdue && "border-red-500/50 bg-red-500/5"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Checkbox */}
      {(showSelection || isHovered) && onSelect && (
        <div className="absolute -left-2 top-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(task.id, checked as boolean)}
            className="h-4 w-4 border-slate-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
          />
        </div>
      )}

      {/* Priority Score Badge */}
      <div
        className={cn(
          "absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1",
          getPriorityColor(task.priorityScore)
        )}
      >
        {task.priorityScore >= 90 && <Flame className="h-3 w-3" />}
        {task.priorityScore}
      </div>

      {/* 3-Dot Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
              "hover:bg-slate-700/50"
            )}
          >
            <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-slate-900 border border-slate-800 shadow-2xl rounded-lg">
          <DropdownMenuItem 
            className="text-sm cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-3.5 w-3.5 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-sm cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white"
            onClick={() => onMoveToTop(task.id)}
          >
            <ArrowUp className="h-3.5 w-3.5 mr-2" />
            Move to Top
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem
            className="text-sm cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Grip Handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-slate-500" />
      </div>

      {/* Card Content */}
      <div className="pl-4 pr-6">
        {/* Title */}
        <h4 className="text-sm font-medium text-white mb-2 leading-tight line-clamp-2">
          {task.title}
        </h4>

        {/* Keyword Badge */}
        <Badge
          variant="secondary"
          className="mb-2 text-xs font-normal bg-slate-800/80 text-slate-300 hover:bg-slate-700 rounded-md"
        >
          {task.keyword}
        </Badge>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  TAG_COLORS[tag]?.bg,
                  TAG_COLORS[tag]?.text,
                  TAG_COLORS[tag]?.border
                )}
              >
                {TAG_LABELS[tag]}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-slate-800/60 text-slate-400 border-slate-700/50 rounded-md">
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Metrics */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
          <span>
            Vol: <span className="text-white font-medium">{task.volumeDisplay}</span>
          </span>
          <span>
            KD: <span className={cn("font-medium", getKdColor(task.kd))}>{task.kd}%</span>
          </span>
        </div>

        {/* Progress Bar (show for all tasks with progress, except published) */}
        {task.status !== "published" && (task.progress > 0 || task.wordCount) && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Progress</span>
              <span className="text-purple-400 font-medium">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-1.5" />
            {task.wordCount !== undefined && task.targetWordCount && (
              <div className="text-[10px] text-slate-500 mt-0.5">
                {task.wordCount.toLocaleString()} / {task.targetWordCount.toLocaleString()} words
              </div>
            )}
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className={cn(
            "flex items-center gap-1.5 text-xs mb-2",
            isOverdue ? "text-red-400" : "text-slate-400"
          )}>
            {isOverdue ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <Calendar className="h-3.5 w-3.5" />
            )}
            <span>{formatDueDate(task.dueDate)}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {/* Assignee Avatar */}
            <Avatar className="h-5 w-5">
              <AvatarFallback className={cn(
                "text-[9px] font-medium",
                assigneeInfo?.color || "bg-slate-700",
                "text-white"
              )}>
                {task.assignee}
              </AvatarFallback>
            </Avatar>

            {/* Comments Count */}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>

          {/* Write Button */}
          <Button
            size="sm"
            variant="ghost"
            asChild
            className={cn(
              "h-6 px-2 gap-1.5 text-xs transition-all rounded-md",
              isHovered
                ? "opacity-100 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                : "opacity-0"
            )}
          >
            <Link
              href={`/dashboard/creation/ai-writer?topic=${encodeURIComponent(task.title)}&keyword=${encodeURIComponent(task.keyword)}`}
            >
              <Play className="h-3.5 w-3.5" />
              Write
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
