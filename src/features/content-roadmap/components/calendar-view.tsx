"use client"

// ============================================
// Calendar View Component
// ============================================

import { useState, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TaskCard, TaskStatus } from "../types"
import { TAG_COLORS } from "../types"

interface CalendarViewProps {
  tasks: TaskCard[]
  onTaskClick: (task: TaskCard) => void
  onAddTask: (date: string) => void
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: "bg-slate-500",
  ready: "bg-blue-500",
  progress: "bg-amber-500",
  published: "bg-emerald-500",
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function CalendarView({ tasks, onTaskClick, onAddTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get calendar data
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startOffset = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: { date: Date; isCurrentMonth: boolean; tasks: TaskCard[] }[] = []

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startOffset - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({
        date,
        isCurrentMonth: false,
        tasks: getTasksForDate(date),
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        tasks: getTasksForDate(date),
      })
    }

    // Next month days (fill to 42 = 6 weeks)
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date,
        isCurrentMonth: false,
        tasks: getTasksForDate(date),
      })
    }

    return days
  }, [year, month, tasks])

  function getTasksForDate(date: Date): TaskCard[] {
    const dateStr = date.toISOString().split("T")[0]
    return tasks.filter((t) => t.dueDate === dateStr)
  }

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isOverdue = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-4">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            {MONTHS[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-xs border-slate-700"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-muted-foreground bg-muted/20"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => (
          <div
            key={idx}
            className={cn(
              "min-h-[120px] p-2 border-b border-r border-border relative group",
              !day.isCurrentMonth && "bg-muted/10",
              isToday(day.date) && "bg-purple-950/20 ring-1 ring-inset ring-purple-500/50"
            )}
          >
            {/* Date Number */}
            <div className="flex items-center justify-between mb-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  !day.isCurrentMonth && "text-muted-foreground",
                  isToday(day.date) && "text-purple-400"
                )}
              >
                {day.date.getDate()}
              </span>
              {/* Add button on hover */}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onAddTask(day.date.toISOString().split("T")[0])}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Tasks */}
            <div className="space-y-1">
              {day.tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded truncate cursor-pointer transition-all hover:ring-1 hover:ring-white/20",
                    STATUS_COLORS[task.status] + "/20",
                    "text-foreground",
                    isOverdue(day.date) && task.status !== "published" && "ring-1 ring-red-500/50"
                  )}
                >
                  <div className="flex items-center gap-1">
                    <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_COLORS[task.status])} />
                    <span className="truncate">{task.title}</span>
                  </div>
                </div>
              ))}
              {day.tasks.length > 3 && (
                <div className="text-xs text-muted-foreground pl-1">
                  +{day.tasks.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/20">
        <span className="text-xs text-muted-foreground">Status:</span>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", color)} />
            <span className="text-xs capitalize text-muted-foreground">{status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
