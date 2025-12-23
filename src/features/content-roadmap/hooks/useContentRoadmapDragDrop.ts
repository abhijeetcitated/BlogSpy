"use client"

// ============================================
// CONTENT ROADMAP - Drag & Drop Hook
// ============================================
// Handles: All drag and drop functionality for kanban board
// Supports: Mouse (desktop) + Touch (mobile/tablet)
// ============================================

import { useCallback, useRef, useEffect, useState } from "react"
import type { TaskCard, TaskStatus } from "../types"
import { useUpdateTask } from "./use-roadmap"
import { getStatusBadge } from "../utils"

interface UseContentRoadmapDragDropProps {
  draggingTask: TaskCard | null
  updateDraggingTask: (task: TaskCard | null) => void
  optimisticUpdate: (updater: (tasks: TaskCard[]) => TaskCard[]) => void
  refetch: () => void
  showNotification: (message: string) => void
}

export function useContentRoadmapDragDrop(props: UseContentRoadmapDragDropProps) {
  const {
    draggingTask,
    updateDraggingTask,
    optimisticUpdate,
    refetch,
    showNotification,
  } = props

  // ================== TOUCH STATE ==================
  const [touchDragTask, setTouchDragTask] = useState<TaskCard | null>(null)
  const [highlightedColumn, setHighlightedColumn] = useState<TaskStatus | null>(null)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)
  const touchCurrentPos = useRef<{ x: number; y: number } | null>(null)
  const dragGhostRef = useRef<HTMLDivElement | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPress = useRef(false)
  
  // Auto-scroll state for touch drag
  const autoScrollRef = useRef<number | null>(null)
  const scrollContainerRef = useRef<HTMLElement | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current)
      }
      if (dragGhostRef.current) {
        dragGhostRef.current.remove()
      }
      // Remove all column highlights
      document.querySelectorAll("[data-column-status]").forEach((el) => {
        el.classList.remove("ring-2", "ring-purple-500", "bg-purple-500/10")
      })
    }
  }, [])

  // ================== MUTATION ==================
  const updateTask = useUpdateTask((updated) => {
    optimisticUpdate((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    )
  })

  // ================== DRAG HANDLERS ==================
  const handleDragStart = useCallback((e: React.DragEvent, task: TaskCard) => {
    updateDraggingTask(task)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", task.id)
    
    // Add visual feedback
    e.dataTransfer.setDragImage(e.currentTarget as Element, 0, 0)
  }, [updateDraggingTask])

  const handleDragEnd = useCallback(() => {
    updateDraggingTask(null)
  }, [updateDraggingTask])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetStatus: TaskStatus) => {
      e.preventDefault()
      const taskId = e.dataTransfer.getData("text/plain")

      if (taskId && draggingTask && draggingTask.status !== targetStatus) {
        // Optimistic update
        optimisticUpdate((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
        )

        const result = await updateTask.mutate(taskId, { 
          status: targetStatus,
          updatedAt: new Date().toISOString()
        })
        
        if (result.success) {
          showNotification(`📋 Moved to ${getStatusBadge(targetStatus).label}`)
        } else {
          // Revert on error
          refetch()
          showNotification(`❌ ${result.error || "Failed to move task"}`)
        }
      }
      
      updateDraggingTask(null)
    },
    [draggingTask, updateTask, optimisticUpdate, refetch, showNotification, updateDraggingTask]
  )

  // ================== TOUCH HANDLERS (Mobile) ==================
  
  // Auto-scroll when dragging near edges (mobile only)
  const EDGE_THRESHOLD = 60 // pixels from edge to trigger scroll
  const SCROLL_SPEED = 8 // pixels per frame
  
  const startAutoScroll = useCallback((direction: "left" | "right") => {
    if (autoScrollRef.current) return // Already scrolling
    
    const scroll = () => {
      if (!scrollContainerRef.current) {
        // Find the kanban scroll container
        scrollContainerRef.current = document.querySelector("[data-kanban-scroll]") as HTMLElement
      }
      
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const scrollAmount = direction === "right" ? SCROLL_SPEED : -SCROLL_SPEED
        container.scrollLeft += scrollAmount
      }
      
      autoScrollRef.current = requestAnimationFrame(scroll)
    }
    
    autoScrollRef.current = requestAnimationFrame(scroll)
  }, [])
  
  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current)
      autoScrollRef.current = null
    }
  }, [])
  
  const handleEdgeScroll = useCallback((x: number) => {
    const screenWidth = window.innerWidth
    
    if (x < EDGE_THRESHOLD) {
      // Near left edge → scroll container RIGHT (show left columns)
      startAutoScroll("left")
    } else if (x > screenWidth - EDGE_THRESHOLD) {
      // Near right edge → scroll container LEFT (show right columns)
      startAutoScroll("right")
    } else {
      stopAutoScroll()
    }
  }, [startAutoScroll, stopAutoScroll])
  
  // Highlight column under touch point
  const highlightColumnUnderPoint = useCallback((x: number, y: number) => {
    const dropTarget = document.elementFromPoint(x, y)
    const columnEl = dropTarget?.closest("[data-column-status]")
    
    // Remove previous highlights
    document.querySelectorAll("[data-column-status]").forEach((el) => {
      el.classList.remove("ring-2", "ring-purple-500", "bg-purple-500/10", "scale-[1.02]")
    })
    
    if (columnEl) {
      const status = columnEl.getAttribute("data-column-status") as TaskStatus
      if (status !== touchDragTask?.status) {
        columnEl.classList.add("ring-2", "ring-purple-500", "bg-purple-500/10", "scale-[1.02]")
        if (highlightedColumn !== status) {
          setHighlightedColumn(status)
          // Light vibration on column change
          navigator.vibrate?.(10)
        }
      } else {
        setHighlightedColumn(null)
      }
    } else {
      setHighlightedColumn(null)
    }
  }, [touchDragTask, highlightedColumn])

  const clearColumnHighlights = useCallback(() => {
    document.querySelectorAll("[data-column-status]").forEach((el) => {
      el.classList.remove("ring-2", "ring-purple-500", "bg-purple-500/10", "scale-[1.02]")
    })
    setHighlightedColumn(null)
  }, [])

  const createDragGhost = useCallback((task: TaskCard, x: number, y: number) => {
    // Remove existing ghost
    if (dragGhostRef.current) {
      dragGhostRef.current.remove()
    }

    const ghost = document.createElement("div")
    ghost.className = "fixed z-[9999] pointer-events-none bg-card border-2 border-purple-500 rounded-xl p-3 shadow-2xl max-w-[180px] will-change-transform"
    ghost.style.transform = `translate(${x - 90}px, ${y - 40}px)`
    ghost.style.left = "0"
    ghost.style.top = "0"
    ghost.innerHTML = `
      <div class="text-xs font-semibold text-foreground truncate">${task.title}</div>
      <div class="text-[10px] text-muted-foreground mt-1 truncate">${task.keyword}</div>
      <div class="text-[9px] text-purple-500 mt-1 font-medium">🎯 Drop to move</div>
    `
    document.body.appendChild(ghost)
    dragGhostRef.current = ghost
  }, [])

  const moveDragGhost = useCallback((x: number, y: number) => {
    if (dragGhostRef.current) {
      // Use transform for smoother movement (GPU accelerated)
      dragGhostRef.current.style.transform = `translate(${x - 90}px, ${y - 40}px)`
    }
  }, [])

  const removeDragGhost = useCallback(() => {
    if (dragGhostRef.current) {
      dragGhostRef.current.remove()
      dragGhostRef.current = null
    }
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent, task: TaskCard) => {
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }
    isLongPress.current = false

    // Long press to initiate drag (150ms for faster response)
    longPressTimerRef.current = setTimeout(() => {
      isLongPress.current = true
      setTouchDragTask(task)
      updateDraggingTask(task)
      createDragGhost(task, touch.clientX, touch.clientY)
      
      // Strong vibrate for feedback
      navigator.vibrate?.(80)
    }, 150)
  }, [updateDraggingTask, createDragGhost])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchCurrentPos.current = { x: touch.clientX, y: touch.clientY }

    // Cancel long press if moved too much before trigger
    if (!isLongPress.current && touchStartPos.current) {
      const dx = Math.abs(touch.clientX - touchStartPos.current.x)
      const dy = Math.abs(touch.clientY - touchStartPos.current.y)
      if (dx > 8 || dy > 8) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current)
        }
      }
    }

    // Move ghost, highlight column, and auto-scroll if dragging
    if (isLongPress.current && touchDragTask) {
      e.preventDefault() // Prevent scrolling while dragging
      moveDragGhost(touch.clientX, touch.clientY)
      highlightColumnUnderPoint(touch.clientX, touch.clientY)
      // Auto-scroll when near screen edges
      handleEdgeScroll(touch.clientX)
    }
  }, [touchDragTask, moveDragGhost, highlightColumnUnderPoint, handleEdgeScroll])

  const handleTouchEnd = useCallback(async () => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    // Stop auto-scroll
    stopAutoScroll()
    
    // Clear column highlights
    clearColumnHighlights()

    // If we were dragging, find drop target
    if (isLongPress.current && touchDragTask && touchCurrentPos.current) {
      const dropTarget = document.elementFromPoint(
        touchCurrentPos.current.x,
        touchCurrentPos.current.y
      )
      
      // Find the column element
      const columnEl = dropTarget?.closest("[data-column-status]")
      if (columnEl) {
        const targetStatus = columnEl.getAttribute("data-column-status") as TaskStatus
        
        if (targetStatus && touchDragTask.status !== targetStatus) {
          // Success vibration
          navigator.vibrate?.(100)
          
          // Optimistic update
          optimisticUpdate((prev) =>
            prev.map((t) => (t.id === touchDragTask.id ? { ...t, status: targetStatus } : t))
          )

          const result = await updateTask.mutate(touchDragTask.id, { 
            status: targetStatus,
            updatedAt: new Date().toISOString()
          })
          
          if (result.success) {
            showNotification(`📋 Moved to ${getStatusBadge(targetStatus).label}`)
          } else {
            refetch()
            showNotification(`❌ ${result.error || "Failed to move task"}`)
          }
        }
      }
    }

    // Reset state
    removeDragGhost()
    setTouchDragTask(null)
    updateDraggingTask(null)
    touchStartPos.current = null
    touchCurrentPos.current = null
    isLongPress.current = false
    scrollContainerRef.current = null
  }, [touchDragTask, updateTask, optimisticUpdate, refetch, showNotification, updateDraggingTask, removeDragGhost, clearColumnHighlights, stopAutoScroll])

  // ================== HELPER FUNCTIONS ==================
  const isDragging = draggingTask !== null
  
  const isDraggingOverColumn = useCallback((columnStatus: TaskStatus) => {
    return draggingTask?.status !== columnStatus && isDragging
  }, [draggingTask, isDragging])

  const canDropInColumn = useCallback((columnStatus: TaskStatus) => {
    return draggingTask && draggingTask.status !== columnStatus
  }, [draggingTask])

  // ================== RETURN HANDLERS ==================
  return {
    // Mouse drag handlers (desktop)
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,

    // Touch drag handlers (mobile)
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    // State helpers
    isDragging,
    isDraggingOverColumn,
    canDropInColumn,
    draggingTask,
    touchDragTask,
    highlightedColumn,

    // Loading state
    isUpdating: updateTask.isLoading,
  }
}