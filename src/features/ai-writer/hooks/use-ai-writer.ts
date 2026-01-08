"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  aiWriterService,
  creditsService,
  draftService,
  exportService,
  readabilityService,
  schemaService,
  versionHistoryService,
  type AIWriterExecuteInput,
  type AIWriterExecuteResult,
  type Draft,
  type ExportFormat,
  type ExportResult,
  type ReadabilityAnalysis,
  type VersionHistoryEntry,
} from "../services"

export type UseAIWriterOptions = {
  /** If true, automatically deducts credits on successful executions (default: true). */
  autoCharge?: boolean
}

export type UseDraftOptions = {
  draftId?: string | null
}

export function useCredits() {
  const [balance, setBalance] = useState<number>(() => creditsService.getBalance())

  const refresh = useCallback(() => {
    setBalance(creditsService.getBalance())
  }, [])

  const hasEnoughCredits = useCallback((operation: string) => {
    return creditsService.hasEnoughCredits(operation)
  }, [])

  const deductCredits = useCallback(async (operation: string) => {
    await creditsService.deductCredits(operation)
    refresh()
  }, [refresh])

  return { balance, refresh, hasEnoughCredits, deductCredits }
}

export function useAIWriter(options: UseAIWriterOptions = {}) {
  const { autoCharge = true } = options
  const credits = useCredits()

  const execute = useCallback(
    async (input: AIWriterExecuteInput): Promise<AIWriterExecuteResult> => {
      // Pre-check credits when possible.
      if (!credits.hasEnoughCredits(input.operation)) {
        return { success: false, error: "Insufficient credits" }
      }

      const res = await aiWriterService.execute(input)
      if (res.success && autoCharge) {
        await credits.deductCredits(input.operation)
      }

      return res
    },
    [autoCharge, credits]
  )

  return {
    execute,
    creditsBalance: credits.balance,
    refreshCredits: credits.refresh,
    hasEnoughCredits: credits.hasEnoughCredits,
  }
}

export function useDraft(options: UseDraftOptions = {}) {
  const externalDraftId = options.draftId ?? null

  // Internal draftId is used when the hook creates drafts itself.
  const [draftId, setDraftId] = useState<string | null>(externalDraftId)
  const [draft, setDraft] = useState<Draft | null>(null)

  const load = useCallback(
    async (id?: string) => {
      const targetId = id ?? externalDraftId ?? draftId
      if (!targetId) {
        setDraft(null)
        return null
      }
      const d = await draftService.getDraft(targetId)
      setDraft(d)
      return d
    },
    [draftId, externalDraftId]
  )

  const create = useCallback(async (input: { title: string; content: string; keyword: string }) => {
    const d = await draftService.createDraft(input)
    setDraftId(d.id)
    setDraft(d)
    return d
  }, [])

  const update = useCallback(async (patch: Partial<Pick<Draft, "title" | "content" | "keyword" | "secondaryKeywords" | "status">>) => {
    if (!draftId) return null
    const d = await draftService.updateDraft(draftId, patch)
    setDraft(d)
    return d
  }, [draftId])

  return { draftId: externalDraftId ?? draftId, draft, setDraftId, load, create, update }
}

export function useDraftList() {
  const [drafts, setDrafts] = useState<Draft[]>([])

  const refresh = useCallback(async () => {
    const list = await draftService.listDrafts()
    setDrafts(list)
    return list
  }, [])

  // Intentionally no auto-refresh effect here.
  // Some repos enforce a rule that disallows setState inside effects.
  return { drafts, refresh }
}

export function useVersionHistory(draftId?: string | null) {
  const [versions, setVersions] = useState<VersionHistoryEntry[]>([])

  const refresh = useCallback(async () => {
    if (!draftId) {
      setVersions([])
      return []
    }
    const list = await versionHistoryService.getVersions(draftId)
    setVersions(list)
    return list
  }, [draftId])

  // Intentionally no auto-refresh effect here.
  // Consumers can call refresh() when needed.

  const createVersion = useCallback(async (input: {
    draftId: string
    content: string
    title: string
    changeType?: string
    changeDescription?: string
  }) => {
    const v = await versionHistoryService.createVersion(input)
    // Keep list in sync.
    if (draftId && input.draftId === draftId) {
      setVersions((prev) => [...prev, v].sort((a, b) => a.version - b.version))
    }
    return v
  }, [draftId])

  const getVersion = useCallback(async (versionId: string) => {
    if (!draftId) return null
    return versionHistoryService.getVersion(draftId, versionId)
  }, [draftId])

  return { versions, refresh, createVersion, getVersion }
}

export function useCompetitors() {
  // Placeholder: competitor intelligence not wired for AI Writer.
  return useMemo(() => ({ competitors: [] as Array<unknown> }), [])
}

export function useExport() {
  const exportContent = useCallback(async (html: string, metadata: {
    title: string
    metaTitle: string
    metaDescription: string
    slug: string
    focusKeyword: string
    secondaryKeywords: string[]
  }, opts: { format: ExportFormat }): Promise<ExportResult> => {
    return exportService.export(html, metadata, opts)
  }, [])

  return { exportContent }
}

export function useSchema() {
  const generateArticleSchema = useCallback((input: {
    headline: string
    description: string
    datePublished: string
    keywords: string[]
    author: { name: string; url?: string }
    publisher: { name: string; logo?: string }
  }) => {
    return schemaService.generateArticleSchema(input)
  }, [])

  return { generateArticleSchema }
}

export function useReadability() {
  const analyze = useCallback((text: string): ReadabilityAnalysis => {
    return readabilityService.analyze(text)
  }, [])

  return { analyze }
}

export function useAutoSave() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const schedule = useCallback(
    (fn: () => void, delayMs: number) => {
      cancel()
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        fn()
      }, Math.max(0, Math.floor(delayMs)))
    },
    [cancel]
  )

  useEffect(() => cancel, [cancel])

  return { schedule, cancel }
}
