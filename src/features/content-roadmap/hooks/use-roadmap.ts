"use client"

// ============================================
// Content Roadmap Custom Hooks
// ============================================
// Production-ready hooks with:
// - Loading states
// - Error handling
// - Optimistic updates
// - Auto-refetch on mutation
// ============================================

import { useState, useCallback, useEffect, useRef } from "react"
import type { TaskCard, TaskStatus } from "../types"
import * as roadmapService from "../services/roadmap.service"

// ============================================
// Types
// ============================================

interface UseTasksState {
  tasks: TaskCard[]
  isLoading: boolean
  isRefetching: boolean
  error: string | null
}

interface MutationState {
  isLoading: boolean
  error: string | null
}

// ============================================
// Main Hook: useRoadmapTasks
// ============================================

export function useRoadmapTasks() {
  const [state, setState] = useState<UseTasksState>({
    tasks: [],
    isLoading: true,
    isRefetching: false,
    error: null,
  })
  
  const isMounted = useRef(true)

  // Fetch tasks
  const fetchTasks = useCallback(async (isRefetch = false) => {
    if (!isMounted.current) return
    
    setState((prev) => ({
      ...prev,
      isLoading: !isRefetch,
      isRefetching: isRefetch,
      error: null,
    }))

    const response = await roadmapService.fetchTasks()

    if (!isMounted.current) return

    if (response.success && response.data) {
      setState({
        tasks: response.data,
        isLoading: false,
        isRefetching: false,
        error: null,
      })
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isRefetching: false,
        error: response.error || "Failed to fetch tasks",
      }))
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    isMounted.current = true
    fetchTasks()
    
    return () => {
      isMounted.current = false
    }
  }, [fetchTasks])

  // Refetch function
  const refetch = useCallback(() => fetchTasks(true), [fetchTasks])

  // Optimistic update helper
  const optimisticUpdate = useCallback((updater: (tasks: TaskCard[]) => TaskCard[]) => {
    setState((prev) => ({
      ...prev,
      tasks: updater(prev.tasks),
    }))
  }, [])

  return {
    ...state,
    refetch,
    optimisticUpdate,
    setTasks: (tasks: TaskCard[]) => setState((prev) => ({ ...prev, tasks })),
  }
}

// ============================================
// Mutation Hook: useCreateTask
// ============================================

export function useCreateTask(onSuccess?: (task: TaskCard) => void) {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  })

  const mutate = useCallback(
    async (taskData: Omit<TaskCard, "id" | "createdAt" | "updatedAt">) => {
      setState({ isLoading: true, error: null })

      const response = await roadmapService.createTask(taskData)

      if (response.success && response.data) {
        setState({ isLoading: false, error: null })
        onSuccess?.(response.data)
        return { success: true, data: response.data }
      } else {
        setState({ isLoading: false, error: response.error || "Failed to create task" })
        return { success: false, error: response.error }
      }
    },
    [onSuccess]
  )

  return {
    ...state,
    mutate,
    reset: () => setState({ isLoading: false, error: null }),
  }
}

// ============================================
// Mutation Hook: useUpdateTask
// ============================================

export function useUpdateTask(onSuccess?: (task: TaskCard) => void) {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  })

  const mutate = useCallback(
    async (id: string, updates: Partial<TaskCard>) => {
      setState({ isLoading: true, error: null })

      const response = await roadmapService.updateTask(id, updates)

      if (response.success && response.data) {
        setState({ isLoading: false, error: null })
        onSuccess?.(response.data)
        return { success: true, data: response.data }
      } else {
        setState({ isLoading: false, error: response.error || "Failed to update task" })
        return { success: false, error: response.error }
      }
    },
    [onSuccess]
  )

  return {
    ...state,
    mutate,
    reset: () => setState({ isLoading: false, error: null }),
  }
}

// ============================================
// Mutation Hook: useDeleteTask
// ============================================

export function useDeleteTask(onSuccess?: (id: string) => void) {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  })

  const mutate = useCallback(
    async (id: string) => {
      setState({ isLoading: true, error: null })

      const response = await roadmapService.deleteTask(id)

      if (response.success) {
        setState({ isLoading: false, error: null })
        onSuccess?.(id)
        return { success: true }
      } else {
        setState({ isLoading: false, error: response.error || "Failed to delete task" })
        return { success: false, error: response.error }
      }
    },
    [onSuccess]
  )

  return {
    ...state,
    mutate,
    reset: () => setState({ isLoading: false, error: null }),
  }
}

// ============================================
// Mutation Hook: useBulkUpdateStatus
// ============================================

export function useBulkUpdateStatus(onSuccess?: (tasks: TaskCard[]) => void) {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  })

  const mutate = useCallback(
    async (ids: string[], status: TaskStatus) => {
      setState({ isLoading: true, error: null })

      const response = await roadmapService.bulkUpdateStatus(ids, status)

      if (response.success && response.data) {
        setState({ isLoading: false, error: null })
        onSuccess?.(response.data)
        return { success: true, data: response.data }
      } else {
        setState({ isLoading: false, error: response.error || "Failed to update tasks" })
        return { success: false, error: response.error }
      }
    },
    [onSuccess]
  )

  return {
    ...state,
    mutate,
    reset: () => setState({ isLoading: false, error: null }),
  }
}

// ============================================
// Mutation Hook: useBulkDelete
// ============================================

export function useBulkDelete(onSuccess?: (count: number) => void) {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  })

  const mutate = useCallback(
    async (ids: string[]) => {
      setState({ isLoading: true, error: null })

      const response = await roadmapService.bulkDeleteTasks(ids)

      if (response.success && response.data) {
        setState({ isLoading: false, error: null })
        onSuccess?.(response.data.deletedCount)
        return { success: true, data: response.data }
      } else {
        setState({ isLoading: false, error: response.error || "Failed to delete tasks" })
        return { success: false, error: response.error }
      }
    },
    [onSuccess]
  )

  return {
    ...state,
    mutate,
    reset: () => setState({ isLoading: false, error: null }),
  }
}

// ============================================
// Mutation Hook: useAutoPrioritize
// ============================================

export function useAutoPrioritize(onSuccess?: (tasks: TaskCard[]) => void) {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  })

  const mutate = useCallback(async () => {
    setState({ isLoading: true, error: null })

    const response = await roadmapService.autoPrioritizeTasks()

    if (response.success && response.data) {
      setState({ isLoading: false, error: null })
      onSuccess?.(response.data)
      return { success: true, data: response.data }
    } else {
      setState({ isLoading: false, error: response.error || "Failed to prioritize tasks" })
      return { success: false, error: response.error }
    }
  }, [onSuccess])

  return {
    ...state,
    mutate,
    reset: () => setState({ isLoading: false, error: null }),
  }
}

// ============================================
// Mutation Hook: useMoveToTop
// ============================================

export function useMoveToTop(onSuccess?: (task: TaskCard) => void) {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  })

  const mutate = useCallback(
    async (id: string) => {
      setState({ isLoading: true, error: null })

      const response = await roadmapService.moveTaskToTop(id)

      if (response.success && response.data) {
        setState({ isLoading: false, error: null })
        onSuccess?.(response.data)
        return { success: true, data: response.data }
      } else {
        setState({ isLoading: false, error: response.error || "Failed to move task" })
        return { success: false, error: response.error }
      }
    },
    [onSuccess]
  )

  return {
    ...state,
    mutate,
    reset: () => setState({ isLoading: false, error: null }),
  }
}

// ============================================
// Hook: useResetData (for testing)
// ============================================

export function useResetData(onSuccess?: () => void) {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  })

  const mutate = useCallback(async () => {
    setState({ isLoading: true, error: null })

    const response = await roadmapService.resetToMockData()

    if (response.success) {
      setState({ isLoading: false, error: null })
      onSuccess?.()
      return { success: true }
    } else {
      setState({ isLoading: false, error: response.error || "Failed to reset data" })
      return { success: false, error: response.error }
    }
  }, [onSuccess])

  return {
    ...state,
    mutate,
    reset: () => setState({ isLoading: false, error: null }),
  }
}
