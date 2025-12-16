"use client"

// ============================================
// List View Component (Premium Redesign)
// ============================================

import Link from "next/link"
import {
  MoreVertical,
  Pencil,
  Trash2,
  ArrowUp,
  MessageSquare,
  FileText,
  Lightbulb,
  PenTool,
  Flame,
  CheckCircle2,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { TaskCard, TaskStatus } from "../types"
import { TAG_COLORS, TAG_LABELS, ASSIGNEES } from "../types"
import { getKdColor } from "../utils"

// Status config with icons
const STATUS_CONFIG = {
  backlog: { icon: Lightbulb, label: "Backlog", color: "text-slate-400", bg: "bg-slate-500/10" },
  ready: { icon: PenTool, label: "Ready", color: "text-blue-400", bg: "bg-blue-500/10" },
  progress: { icon: Flame, label: "Active", color: "text-amber-400", bg: "bg-amber-500/10" },
  published: { icon: CheckCircle2, label: "Done", color: "text-emerald-400", bg: "bg-emerald-500/10" },
}

interface ListViewProps {
  items: TaskCard[]
  onDelete: (id: string) => void
  onMoveToTop: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: TaskCard) => void
  selectedIds?: Set<string>
  onSelectTask?: (id: string, selected: boolean) => void
}

export function ListView({
  items,
  onDelete,
  onMoveToTop,
  onStatusChange,
  onEdit,
  selectedIds = new Set(),
  onSelectTask,
}: ListViewProps) {
  const isOverdue = (task: TaskCard) => {
    if (!task.dueDate || task.status === "published") return false
    return new Date(task.dueDate) < new Date()
  }

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-800/50">
            <th className="w-12 px-4 py-3">
              {/* Checkbox Header */}
            </th>
            <th className="text-left text-sm font-semibold text-slate-300 px-4 py-3">
              Content
            </th>
            <th className="w-32 text-left text-sm font-semibold text-slate-300 px-4 py-3">
              Status
            </th>
            <th className="w-20 text-right text-sm font-semibold text-slate-300 px-4 py-3">
              Volume
            </th>
            <th className="w-16 text-center text-sm font-semibold text-slate-300 px-4 py-3">
              KD
            </th>
            <th className="w-24 text-center text-sm font-semibold text-slate-300 px-4 py-3">
              Due Date
            </th>
            <th className="w-20 text-right text-sm font-semibold text-slate-300 px-4 py-3">
              Score
            </th>
            <th className="w-28 text-center text-sm font-semibold text-slate-300 px-4 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((task) => {
            const overdue = isOverdue(task)
            const assigneeInfo = ASSIGNEES.find((a) => a.id === task.assignee)
            const statusConfig = STATUS_CONFIG[task.status]
            const StatusIcon = statusConfig.icon
            
            return (
              <tr
                key={task.id}
                className={cn(
                  "border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors group",
                  selectedIds.has(task.id) && "bg-purple-500/10 border-purple-500/30",
                  overdue && "bg-red-500/5"
                )}
              >
                {/* Checkbox */}
                <td className="px-4 py-3">
                  {onSelectTask && (
                    <Checkbox
                      checked={selectedIds.has(task.id)}
                      onCheckedChange={(checked) => onSelectTask(task.id, checked as boolean)}
                      className="h-4 w-4 border-slate-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                  )}
                </td>

                {/* Content (Title + Keyword + Tags) */}
                <td className="px-4 py-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white leading-tight">{task.title}</span>
                      {task.comments && task.comments.length > 0 && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="text-xs">{task.comments.length}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-md">
                        {task.keyword}
                      </Badge>
                      {task.tags?.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-md",
                            TAG_COLORS[tag]?.bg,
                            TAG_COLORS[tag]?.text,
                            TAG_COLORS[tag]?.border
                          )}
                        >
                          {TAG_LABELS[tag]}
                        </Badge>
                      ))}
                      {(task.tags?.length || 0) > 2 && (
                        <span className="text-xs text-slate-500">+{(task.tags?.length || 0) - 2}</span>
                      )}
                      <Avatar className="h-5 w-5 ml-1">
                        <AvatarFallback className={cn("text-[10px] font-medium", assigneeInfo?.color || "bg-slate-700", "text-white")}>
                          {task.assignee}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </td>

                {/* Status with Icon */}
                <td className="px-4 py-3">
                  <Select
                    value={task.status}
                    onValueChange={(value: TaskStatus) => onStatusChange(task.id, value)}
                  >
                    <SelectTrigger className={cn(
                      "h-8 w-full text-xs font-medium border-0 rounded-lg gap-2",
                      statusConfig.bg,
                      statusConfig.color
                    )}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border border-slate-800 shadow-2xl rounded-lg">
                      <SelectItem value="backlog" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-slate-400" />
                          Backlog
                        </div>
                      </SelectItem>
                      <SelectItem value="ready" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                        <div className="flex items-center gap-2">
                          <PenTool className="h-4 w-4 text-blue-400" />
                          Ready
                        </div>
                      </SelectItem>
                      <SelectItem value="progress" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-amber-400" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="published" className="text-sm text-slate-300 focus:bg-slate-800 focus:text-white">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          Done
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>

                {/* Volume */}
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-semibold text-white">{task.volumeDisplay}</span>
                </td>

                {/* KD */}
                <td className="px-4 py-3 text-center">
                  <span className={cn("text-sm font-semibold", getKdColor(task.kd))}>
                    {task.kd}%
                  </span>
                </td>

                {/* Due Date */}
                <td className="px-4 py-3 text-center">
                  {task.dueDate ? (
                    <span className={cn(
                      "text-sm",
                      overdue ? "text-red-400 font-semibold" : "text-slate-400"
                    )}>
                      {overdue && "⚠️ "}{formatDueDate(task.dueDate)}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-600">—</span>
                  )}
                </td>

                {/* Priority Score */}
                <td className="px-4 py-3 text-right">
                  <div className={cn(
                    "inline-flex items-center justify-center h-7 w-12 rounded-md text-sm font-bold",
                    task.priorityScore >= 90 
                      ? "bg-red-500/10 text-red-400" 
                      : task.priorityScore >= 75 
                        ? "bg-amber-500/10 text-amber-400" 
                        : "bg-slate-500/10 text-slate-400"
                  )}>
                    {task.priorityScore}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {/* Write Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className="h-8 w-8 p-0 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 rounded-lg"
                    >
                      <Link href={`/dashboard/creation/ai-writer?topic=${encodeURIComponent(task.title)}&keyword=${encodeURIComponent(task.keyword)}`}>
                        <Play className="h-4 w-4" />
                      </Link>
                    </Button>

                    {/* Edit Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(task)}
                      className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {/* More Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-slate-900 border border-slate-800 shadow-2xl rounded-lg">
                        <DropdownMenuItem 
                          className="text-sm cursor-pointer text-slate-300 focus:bg-slate-800 focus:text-white gap-2" 
                          onClick={() => onMoveToTop(task.id)}
                        >
                          <ArrowUp className="h-4 w-4" />
                          Move to Top
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <DropdownMenuItem 
                          className="text-sm cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400 gap-2" 
                          onClick={() => onDelete(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <div className="h-16 w-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-slate-500" />
          </div>
          <p className="text-base font-medium text-slate-300 mb-1">No tasks found</p>
          <p className="text-sm text-slate-500">Try adjusting your filters or add a new task</p>
        </div>
      )}
    </div>
  )
}
