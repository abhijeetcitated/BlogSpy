"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import {
  Zap,
  Lightbulb,
  PenLine,
  Flame,
  CheckCircle2,
  LayoutGrid,
  List,
  GripVertical,
  Play,
  FileText,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowUp,
  ChevronDown,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
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

// ============================================
// TYPES
// ============================================
type ViewMode = "board" | "list"
type TaskStatus = "backlog" | "ready" | "progress" | "published"

interface TaskCard {
  id: string
  title: string
  keyword: string
  volume: number // Changed to number for calculations
  volumeDisplay: string // For display purposes
  kd: number
  priorityScore: number
  assignee: string
  status: TaskStatus
}

// ============================================
// MOCK DATA
// ============================================
const initialTasks: TaskCard[] = [
  {
    id: "1",
    title: "How to use AI for SEO",
    keyword: "ai seo tools",
    volume: 12000,
    volumeDisplay: "12k",
    kd: 45,
    priorityScore: 98,
    assignee: "JD",
    status: "backlog",
  },
  {
    id: "2",
    title: "Best keyword research strategies",
    keyword: "keyword research",
    volume: 8500,
    volumeDisplay: "8.5k",
    kd: 52,
    priorityScore: 92,
    assignee: "AM",
    status: "backlog",
  },
  {
    id: "3",
    title: "Technical SEO checklist 2025",
    keyword: "technical seo",
    volume: 6200,
    volumeDisplay: "6.2k",
    kd: 38,
    priorityScore: 88,
    assignee: "JD",
    status: "backlog",
  },
  {
    id: "4",
    title: "Link building guide for beginners",
    keyword: "link building",
    volume: 5800,
    volumeDisplay: "5.8k",
    kd: 61,
    priorityScore: 75,
    assignee: "SK",
    status: "backlog",
  },
  {
    id: "5",
    title: "Content optimization tips",
    keyword: "seo content",
    volume: 4100,
    volumeDisplay: "4.1k",
    kd: 33,
    priorityScore: 82,
    assignee: "AM",
    status: "ready",
  },
  {
    id: "6",
    title: "Local SEO strategies",
    keyword: "local seo",
    volume: 9300,
    volumeDisplay: "9.3k",
    kd: 47,
    priorityScore: 85,
    assignee: "JD",
    status: "ready",
  },
  {
    id: "7",
    title: "SEO for e-commerce sites",
    keyword: "ecommerce seo",
    volume: 7200,
    volumeDisplay: "7.2k",
    kd: 55,
    priorityScore: 79,
    assignee: "SK",
    status: "ready",
  },
  {
    id: "8",
    title: "Voice search optimization",
    keyword: "voice search seo",
    volume: 3400,
    volumeDisplay: "3.4k",
    kd: 29,
    priorityScore: 71,
    assignee: "AM",
    status: "progress",
  },
  {
    id: "9",
    title: "Mobile SEO best practices",
    keyword: "mobile seo",
    volume: 5100,
    volumeDisplay: "5.1k",
    kd: 41,
    priorityScore: 77,
    assignee: "JD",
    status: "progress",
  },
  {
    id: "10",
    title: "Complete SEO audit guide",
    keyword: "seo audit",
    volume: 11000,
    volumeDisplay: "11k",
    kd: 58,
    priorityScore: 94,
    assignee: "SK",
    status: "published",
  },
  {
    id: "11",
    title: "On-page SEO fundamentals",
    keyword: "on-page seo",
    volume: 15000,
    volumeDisplay: "15k",
    kd: 62,
    priorityScore: 91,
    assignee: "JD",
    status: "published",
  },
  {
    id: "12",
    title: "Backlink analysis tutorial",
    keyword: "backlink analysis",
    volume: 4800,
    volumeDisplay: "4.8k",
    kd: 44,
    priorityScore: 73,
    assignee: "AM",
    status: "published",
  },
]

const columns = [
  {
    id: "backlog" as TaskStatus,
    title: "Ideas / Backlog",
    icon: Lightbulb,
    color: "text-slate-400",
    borderColor: "border-slate-700",
    bgColor: "bg-slate-800/30",
  },
  {
    id: "ready" as TaskStatus,
    title: "Ready to Write",
    icon: PenLine,
    color: "text-blue-400",
    borderColor: "border-blue-900/50",
    bgColor: "bg-blue-950/20",
  },
  {
    id: "progress" as TaskStatus,
    title: "In Progress",
    icon: Flame,
    color: "text-amber-400",
    borderColor: "border-amber-900/50",
    bgColor: "bg-amber-950/20",
  },
  {
    id: "published" as TaskStatus,
    title: "Published",
    icon: CheckCircle2,
    color: "text-emerald-400",
    borderColor: "border-emerald-900/50",
    bgColor: "bg-emerald-950/20",
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================
const getPriorityColor = (score: number) => {
  if (score >= 90) return "bg-red-500/20 text-red-400 border-red-500/30"
  if (score >= 75) return "bg-amber-500/20 text-amber-400 border-amber-500/30"
  return "bg-slate-500/20 text-slate-400 border-slate-500/30"
}

const getKdColor = (kd: number) => {
  if (kd <= 30) return "text-emerald-400"
  if (kd <= 50) return "text-amber-400"
  return "text-red-400"
}

const getKdDotColor = (kd: number) => {
  if (kd <= 30) return "bg-emerald-500"
  if (kd <= 50) return "bg-amber-500"
  return "bg-red-500"
}

const getStatusBadge = (status: TaskStatus) => {
  const styles = {
    backlog: "bg-slate-700 text-slate-300",
    ready: "bg-blue-900/50 text-blue-300",
    progress: "bg-amber-900/50 text-amber-300",
    published: "bg-emerald-900/50 text-emerald-300",
  }
  const labels = {
    backlog: "Backlog",
    ready: "Ready",
    progress: "In Progress",
    published: "Published",
  }
  return { style: styles[status], label: labels[status] }
}

// ============================================
// SMART TASK CARD COMPONENT
// ============================================
interface SmartTaskCardProps {
  task: TaskCard
  onDelete: (id: string) => void
  onMoveToTop: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  isDragging?: boolean
  onDragStart: (e: React.DragEvent, task: TaskCard) => void
  onDragEnd: (e: React.DragEvent) => void
}

function SmartTaskCard({
  task,
  onDelete,
  onMoveToTop,
  onStatusChange,
  isDragging,
  onDragStart,
  onDragEnd,
}: SmartTaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-black/20",
        isDragging && "opacity-50 scale-95"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
              "hover:bg-slate-700"
            )}
          >
            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-slate-900 border-slate-700">
          <DropdownMenuItem className="text-sm cursor-pointer hover:bg-slate-800">
            <Pencil className="h-3.5 w-3.5 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-sm cursor-pointer hover:bg-slate-800"
            onClick={() => onMoveToTop(task.id)}
          >
            <ArrowUp className="h-3.5 w-3.5 mr-2" />
            Move to Top
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem
            className="text-sm cursor-pointer text-red-400 hover:bg-red-950/50 hover:text-red-400"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Grip Handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Card Content */}
      <div className="pl-4 pr-6">
        <h4 className="text-sm font-medium text-foreground mb-2 leading-tight line-clamp-2">
          {task.title}
        </h4>

        {/* Keyword Badge */}
        <Badge
          variant="secondary"
          className="mb-2 text-xs font-normal bg-slate-800 text-slate-300 hover:bg-slate-700"
        >
          {task.keyword}
        </Badge>

        {/* Metrics */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span>
            Vol: <span className="text-foreground font-medium">{task.volumeDisplay}</span>
          </span>
          <span>
            KD: <span className={cn("font-medium", getKdColor(task.kd))}>{task.kd}%</span>
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-slate-700 text-slate-300">
              {task.assignee}
            </AvatarFallback>
          </Avatar>

          {/* Write Button */}
          <Button
            size="sm"
            variant="ghost"
            asChild
            className={cn(
              "h-7 px-2 gap-1 text-xs transition-all",
              isHovered
                ? "opacity-100 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                : "opacity-0"
            )}
          >
            <Link
              href={`/dashboard/creation/ai-writer?topic=${encodeURIComponent(task.title)}&keyword=${encodeURIComponent(task.keyword)}`}
            >
              <Play className="h-3 w-3" />
              Write
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// KANBAN COLUMN COMPONENT
// ============================================
interface KanbanColumnProps {
  column: (typeof columns)[0]
  items: TaskCard[]
  onDelete: (id: string) => void
  onMoveToTop: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onDragStart: (e: React.DragEvent, task: TaskCard) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: TaskStatus) => void
  draggingTask: TaskCard | null
}

function KanbanColumn({
  column,
  items,
  onDelete,
  onMoveToTop,
  onStatusChange,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  draggingTask,
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
    <div className={cn("flex flex-col min-w-[280px] w-[280px]")}>
      {/* Column Header */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-t-lg border-b-2",
          column.bgColor,
          column.borderColor
        )}
      >
        <Icon className={cn("h-4 w-4", column.color)} />
        <span className="text-sm font-medium text-foreground">{column.title}</span>
        <Badge
          variant="secondary"
          className={cn(
            "ml-auto h-5 min-w-[20px] flex items-center justify-center text-xs",
            column.id === "backlog" && "bg-slate-700 text-slate-300",
            column.id === "ready" && "bg-blue-900/50 text-blue-300",
            column.id === "progress" && "bg-amber-900/50 text-amber-300",
            column.id === "published" && "bg-emerald-900/50 text-emerald-300"
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
          "flex-1 p-2 space-y-3 rounded-b-lg border border-t-0 min-h-[400px] overflow-y-auto transition-all",
          column.borderColor,
          column.bgColor,
          isDragOver && "ring-2 ring-purple-500/50 bg-purple-950/10"
        )}
      >
        {items.map((task) => (
          <SmartTaskCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            onMoveToTop={onMoveToTop}
            onStatusChange={onStatusChange}
            isDragging={draggingTask?.id === task.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        {/* Empty state / Drop hint */}
        {items.length === 0 && (
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-700 rounded-lg text-sm text-muted-foreground">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// LIST VIEW COMPONENT
// ============================================
interface ListViewProps {
  items: TaskCard[]
  onDelete: (id: string) => void
  onMoveToTop: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}

function ListView({ items, onDelete, onMoveToTop, onStatusChange }: ListViewProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
              Title
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
              Keyword
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
              Status
            </th>
            <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
              Volume
            </th>
            <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">
              KD
            </th>
            <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
              Priority
            </th>
            <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">
              Assignee
            </th>
            <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((task) => {
            const statusBadge = getStatusBadge(task.status)
            return (
              <tr
                key={task.id}
                className="border-b border-border hover:bg-muted/20 transition-colors group"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{task.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="secondary"
                    className="text-xs font-normal bg-slate-800 text-slate-300"
                  >
                    {task.keyword}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={task.status}
                    onValueChange={(value: TaskStatus) => onStatusChange(task.id, value)}
                  >
                    <SelectTrigger className="h-7 w-[120px] text-xs bg-transparent border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="backlog" className="text-xs">
                        Backlog
                      </SelectItem>
                      <SelectItem value="ready" className="text-xs">
                        Ready
                      </SelectItem>
                      <SelectItem value="progress" className="text-xs">
                        In Progress
                      </SelectItem>
                      <SelectItem value="published" className="text-xs">
                        Published
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-right text-sm text-foreground">
                  {task.volumeDisplay}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", getKdDotColor(task.kd))} />
                    <span className={cn("text-sm font-medium", getKdColor(task.kd))}>
                      {task.kd}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      "text-sm font-semibold flex items-center justify-end gap-1",
                      task.priorityScore >= 90
                        ? "text-red-400"
                        : task.priorityScore >= 75
                          ? "text-amber-400"
                          : "text-slate-400"
                    )}
                  >
                    {task.priorityScore >= 90 && <Flame className="h-3 w-3" />}
                    {task.priorityScore}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-slate-700 text-slate-300">
                        {task.assignee}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className="h-7 px-2 gap-1 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <Link
                        href={`/dashboard/creation/ai-writer?topic=${encodeURIComponent(task.title)}&keyword=${encodeURIComponent(task.keyword)}`}
                      >
                        <Zap className="h-3 w-3" />
                        Write
                      </Link>
                    </Button>

                    {/* 3-Dot Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-slate-700"
                        >
                          <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-40 bg-slate-900 border-slate-700"
                      >
                        <DropdownMenuItem className="text-sm cursor-pointer hover:bg-slate-800">
                          <Pencil className="h-3.5 w-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-sm cursor-pointer hover:bg-slate-800"
                          onClick={() => onMoveToTop(task.id)}
                        >
                          <ArrowUp className="h-3.5 w-3.5 mr-2" />
                          Move to Top
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem
                          className="text-sm cursor-pointer text-red-400 hover:bg-red-950/50 hover:text-red-400"
                          onClick={() => onDelete(task.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
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

      {items.length === 0 && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          <Search className="h-5 w-5 mr-2" />
          No tasks match your search
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export function ContentRoadmapContent() {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>("board")
  const [tasks, setTasks] = useState<TaskCard[]>(initialTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [draggingTask, setDraggingTask] = useState<TaskCard | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Computed values
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks
    const query = searchQuery.toLowerCase()
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.keyword.toLowerCase().includes(query) ||
        task.assignee.toLowerCase().includes(query)
    )
  }, [tasks, searchQuery])

  const plannedCount = tasks.filter((t) => t.status === "backlog" || t.status === "ready").length
  const inProgressCount = tasks.filter((t) => t.status === "progress").length
  const totalPotential = useMemo(() => {
    const total = tasks.reduce((sum, t) => sum + t.volume, 0)
    return total >= 1000 ? `${Math.round(total / 1000)}k` : total.toString()
  }, [tasks])

  const getTasksByStatus = useCallback(
    (status: TaskStatus) =>
      filteredTasks
        .filter((t) => t.status === status)
        .sort((a, b) => b.priorityScore - a.priorityScore),
    [filteredTasks]
  )

  // Toast helper
  const showNotification = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Handlers
  const handleDelete = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    showNotification("Task deleted")
  }, [])

  const handleMoveToTop = useCallback((id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id)
      if (!task) return prev
      // Give highest priority in its status group
      const maxPriority = Math.max(...prev.filter((t) => t.status === task.status).map((t) => t.priorityScore))
      return prev.map((t) => (t.id === id ? { ...t, priorityScore: maxPriority + 1 } : t))
    })
    showNotification("Task moved to top")
  }, [])

  const handleStatusChange = useCallback((id: string, newStatus: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
  }, [])

  const handleAutoPrioritize = useCallback(() => {
    setTasks((prev) =>
      prev.map((task) => {
        // Calculate new priority score: (Volume / KD) normalized
        const rawScore = task.kd > 0 ? task.volume / task.kd : task.volume
        const normalizedScore = Math.min(99, Math.max(50, Math.round(rawScore / 100)))
        return { ...task, priorityScore: normalizedScore }
      })
    )
    showNotification("Roadmap Optimized ⚡")
  }, [])

  // Drag and Drop handlers
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
        showNotification(`Moved to ${getStatusBadge(targetStatus).label}`)
      }
      setDraggingTask(null)
    },
    [draggingTask]
  )

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
        <div className="flex flex-col gap-4">
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">Content Roadmap</h1>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64 bg-slate-800/50 border-slate-700 focus:border-purple-500 placeholder:text-slate-500"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-3 gap-1.5 text-xs",
                    viewMode === "board" && "bg-background shadow-sm"
                  )}
                  onClick={() => setViewMode("board")}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Board
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-3 gap-1.5 text-xs",
                    viewMode === "list" && "bg-background shadow-sm"
                  )}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </Button>
              </div>

              {/* Auto-Prioritize Button */}
              <Button
                onClick={handleAutoPrioritize}
                className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
              >
                <Zap className="h-4 w-4" />
                Auto-Prioritize
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Planned:</span>
              <span className="text-sm font-semibold text-foreground">{plannedCount} Articles</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
              <Flame className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-muted-foreground">In Progress:</span>
              <span className="text-sm font-semibold text-foreground">{inProgressCount}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Traffic Potential:</span>
              <span className="text-sm font-semibold text-emerald-400">+{totalPotential}/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === "board" ? (
          <div className="flex gap-4 h-full min-w-max pb-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                items={getTasksByStatus(column.id)}
                onDelete={handleDelete}
                onMoveToTop={handleMoveToTop}
                onStatusChange={handleStatusChange}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                draggingTask={draggingTask}
              />
            ))}
          </div>
        ) : (
          <ListView
            items={filteredTasks.sort((a, b) => b.priorityScore - a.priorityScore)}
            onDelete={handleDelete}
            onMoveToTop={handleMoveToTop}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-foreground">{toastMessage}</span>
          </div>
        </div>
      )}
    </main>
  )
}