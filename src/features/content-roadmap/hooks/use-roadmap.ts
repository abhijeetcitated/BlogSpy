"use client"

// ============================================
// CONTENT ROADMAP - Data + Mutations (Local Mock)
// ============================================
// This feature is currently frontend-only (no backend wired).
// Other hooks/components expect a stable set of exports from this module.
//
// Design goals:
// - Deterministic, build-safe exports (no empty module).
// - Lightweight state + mutation helpers optimized for low RAM.
// - No side-effectful network calls; uses mock data from __mocks__.
// ============================================

import { useCallback, useMemo, useState } from "react"
import type { TaskCard, TaskStatus } from "../types"
import { INITIAL_TASKS } from "../__mocks__/task-data"
import { calculateAutoPriority } from "../utils"

export type MutationResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string }

function nowIso() {
  return new Date().toISOString()
}

function newId() {
  // Deterministic enough for UI usage, avoids heavy UUID deps.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeTaskForCreate(
  task: Omit<TaskCard, "id" | "createdAt" | "updatedAt">
): TaskCard {
  const ts = nowIso()
  return {
    ...task,
    id: newId(),
    createdAt: ts,
    updatedAt: ts,
  }
}

function applyUpdate(task: TaskCard, patch: Partial<TaskCard>): TaskCard {
  return {
    ...task,
    ...patch,
    updatedAt: patch.updatedAt ?? nowIso(),
  }
}

// ============================================
// Query hook
// ============================================

export function useRoadmapTasks() {
  const initial = useMemo(() => INITIAL_TASKS, [])
  const [tasks, setTasks] = useState<TaskCard[]>(initial)

  // Frontend-only: keep flags but stable.
  const [isLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const optimisticUpdate = useCallback(
    (updater: (tasks: TaskCard[]) => TaskCard[]) => {
      setTasks((prev) => updater(prev))
    },
    []
  )

  const refetch = useCallback(() => {
    // No backend: simulate refetch; clear error.
    setIsRefetching(true)
    setError(null)
    // microtask keeps UI consistent without real delay.
    Promise.resolve().then(() => setIsRefetching(false))
  }, [])

  return {
    tasks,
    setTasks,
    isLoading,
    isRefetching,
    error,
    refetch,
    optimisticUpdate,
  }
}

// ============================================
// Mutation hooks (compatible with callers)
// ============================================

function useMutationState() {
  const [isLoading, setIsLoading] = useState(false)
  return { isLoading, setIsLoading }
}

export function useCreateTask(onSuccess?: (created: TaskCard) => void) {
  const { isLoading, setIsLoading } = useMutationState()

  const mutate = useCallback(
    async (
      task: Omit<TaskCard, "id" | "createdAt" | "updatedAt">
    ): Promise<MutationResult<TaskCard>> => {
      setIsLoading(true)
      try {
        const created = normalizeTaskForCreate(task)
        onSuccess?.(created)
        return { success: true, data: created }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create task"
        return { success: false, error: msg }
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess, setIsLoading]
  )

  return { mutate, isLoading }
}

export function useUpdateTask(onSuccess?: (updated: TaskCard) => void) {
  const { isLoading, setIsLoading } = useMutationState()

  const mutate = useCallback(
    async (id: string, patch: Partial<TaskCard>): Promise<MutationResult<TaskCard>> => {
      setIsLoading(true)
      try {
        // Caller already performed optimistic update; just synthesize updated value.
        const EMPTY_TAGS = [] as TaskCard["tags"]
        const EMPTY_COMMENTS = [] as TaskCard["comments"]

        const updated: TaskCard = applyUpdate(
          {
            // minimal placeholder; onSuccess consumer uses fields by id
            id,
            title: patch.title ?? "",
            keyword: patch.keyword ?? "",
            volume: patch.volume ?? 0,
            volumeDisplay: patch.volumeDisplay ?? "0",
            kd: patch.kd ?? 0,
            priorityScore: patch.priorityScore ?? 0,
            assignee: patch.assignee ?? "ME",
            status: (patch.status as TaskStatus) ?? "backlog",
            tags: patch.tags ?? EMPTY_TAGS,
            comments: patch.comments ?? EMPTY_COMMENTS,
            progress: patch.progress ?? 0,
            dueDate: patch.dueDate,
            wordCount: patch.wordCount,
            targetWordCount: patch.targetWordCount,
            notes: patch.notes,
            createdAt: patch.createdAt ?? nowIso(),
            updatedAt: patch.updatedAt ?? nowIso(),
          },
          patch
        )

        onSuccess?.(updated)
        return { success: true, data: updated }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update task"
        return { success: false, error: msg }
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess, setIsLoading]
  )

  return { mutate, isLoading }
}

export function useDeleteTask(onSuccess?: (id: string) => void) {
  const { isLoading, setIsLoading } = useMutationState()

  const mutate = useCallback(
    async (id: string): Promise<MutationResult> => {
      setIsLoading(true)
      try {
        onSuccess?.(id)
        return { success: true }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to delete task"
        return { success: false, error: msg }
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess, setIsLoading]
  )

  return { mutate, isLoading }
}

export function useBulkUpdateStatus(onSuccess?: () => void) {
  const { isLoading, setIsLoading } = useMutationState()

  const mutate = useCallback(
    async (_ids: string[], _status: TaskStatus): Promise<MutationResult> => {
      setIsLoading(true)
      try {
        onSuccess?.()
        return { success: true }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update tasks"
        return { success: false, error: msg }
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess, setIsLoading]
  )

  return { mutate, isLoading }
}

export function useBulkDelete(onSuccess?: () => void) {
  const { isLoading, setIsLoading } = useMutationState()

  const mutate = useCallback(
    async (_ids: string[]): Promise<MutationResult> => {
      setIsLoading(true)
      try {
        onSuccess?.()
        return { success: true }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to delete tasks"
        return { success: false, error: msg }
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess, setIsLoading]
  )

  return { mutate, isLoading }
}

export function useAutoPrioritize(onSuccess?: (updatedTasks: TaskCard[]) => void) {
  const { isLoading, setIsLoading } = useMutationState()

  const mutate = useCallback(async (): Promise<MutationResult<TaskCard[]>> => {
    setIsLoading(true)
    try {
      // Caller supplies optimisticUpdate; we just compute new priority scores.
      const ts = nowIso()
      const updated = INITIAL_TASKS
        .map((t) => ({ ...t, priorityScore: calculateAutoPriority(t), updatedAt: ts }))
        .sort((a, b) => b.priorityScore - a.priorityScore)

      onSuccess?.(updated)
      return { success: true, data: updated }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to auto-prioritize"
      return { success: false, error: msg }
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess, setIsLoading])

  return { mutate, isLoading }
}

export function useMoveToTop(onSuccess?: (updated: TaskCard) => void) {
  const { isLoading, setIsLoading } = useMutationState()

  const mutate = useCallback(
    async (id: string): Promise<MutationResult<TaskCard>> => {
      setIsLoading(true)
      try {
        // Caller will do optimistic update; we just return an updated timestamp.
        const updated: TaskCard = {
          id,
          title: "",
          keyword: "",
          volume: 0,
          volumeDisplay: "0",
          kd: 0,
          priorityScore: 0,
          assignee: "ME",
          status: "backlog",
          tags: [],
          comments: [],
          progress: 0,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        }
        onSuccess?.(updated)
        return { success: true, data: updated }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to move task"
        return { success: false, error: msg }
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess, setIsLoading]
  )

  return { mutate, isLoading }
}

export function useResetData(onSuccess?: () => void) {
  const { isLoading, setIsLoading } = useMutationState()

  const mutate = useCallback(async (): Promise<MutationResult> => {
    setIsLoading(true)
    try {
      onSuccess?.()
      return { success: true }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to reset data"
      return { success: false, error: msg }
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess, setIsLoading])

  return { mutate, isLoading }
}

// ============================================
// Note
// ============================================
// This module intentionally does not mutate shared state directly.
// Callers provide optimistic state updates + refetch semantics.
// When backend wiring happens, replace internals without changing exports.
