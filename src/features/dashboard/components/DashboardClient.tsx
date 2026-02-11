"use client"

import { useEffect, useRef, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStore } from "@/store/user-store"
import { AddProjectDialog } from "@/features/dashboard/components/AddProjectDialog"
import { CommandCenter } from "@/features/dashboard"
import { fetchStats } from "@/features/dashboard/actions/fetch-stats"
import { fetchAISuggestions } from "@/features/dashboard/actions/fetch-ai-suggestions"
import { requestAISuggestionsLiveRefresh } from "@/features/dashboard/actions/request-live-refresh"
import type { DashboardStats } from "@/features/dashboard/types/dashboard-stats"
import {
  getDemoAgenticSuggestions,
  type AgenticSuggestion,
} from "@/features/dashboard/components/command-center-data"

const pulseCards = ["Trend Spotter", "Opportunities", "Credit Health", "Rank Tracker"]
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"

export const DashboardClient = () => {
  const { activeProject, projects, setActiveProject, isLoading, hasHydrated } = useUserStore(
    useShallow((state) => ({
      activeProject: state.activeProject,
      projects: state.projects,
      setActiveProject: state.setActiveProject,
      isLoading: state.isLoading,
      hasHydrated: state.hasHydrated,
    }))
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const { executeAsync } = useAction(fetchStats)
  const { executeAsync: executeAISuggestions, isPending: suggestionsLoading } = useAction(fetchAISuggestions)
  const { executeAsync: executeLiveRefresh, isPending: liveRefreshPending } = useAction(
    requestAISuggestionsLiveRefresh
  )
  const hasProject = !!activeProject

  const [stats, setStats] = useState<DashboardStats>({
    rankCount: 0,
    avgRank: 0,
    rankDelta: 0,
    decayCount: 0,
    creditUsed: 0,
    creditTotal: 0,
    trendName: "No Trends",
    trendGrowth: 0,
    recentLogs: [],
  })

  const [suggestions, setSuggestions] = useState<AgenticSuggestion[]>([])
  const [suggestionsError, setSuggestionsError] = useState(false)
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const AUTO_REFRESH_MS = 30 * 60 * 1000 // 30 minutes

  const isBusy = isLoading || !hasHydrated

  const getDemoSuggestions = () =>
    getDemoAgenticSuggestions({ projectName: activeProject?.projectname ?? "project" })

  useEffect(() => {
    if (!hasHydrated || activeProject || projects.length === 0) return
    setActiveProject(projects[0])
  }, [activeProject, hasHydrated, projects, setActiveProject])

  useEffect(() => {
    if (!activeProject) return
    let isActive = true

    const loadStats = async () => {
      const result = await executeAsync({ projectId: activeProject.id })
      if (!isActive) return
      const data = result?.data
      if (data) {
        setStats(data)
      }
    }

    const loadSuggestions = async () => {
      try {
        const result = await executeAISuggestions({ projectId: activeProject.id })
        if (!isActive) return
        if (result?.serverError) {
          if (USE_MOCK_DATA) {
            setSuggestions(getDemoSuggestions())
            setSuggestionsError(false)
            return
          }
          console.error("[DashboardClient] fetchAISuggestions failed:", result.serverError)
          setSuggestionsError(true)
          return
        }
        const data = result?.data
        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data)
          setSuggestionsError(false)
        } else if (USE_MOCK_DATA) {
          setSuggestions(getDemoSuggestions())
          setSuggestionsError(false)
        } else if (Array.isArray(data)) {
          setSuggestions([])
          setSuggestionsError(false)
        } else {
          setSuggestionsError(true)
        }
      } catch {
        if (!isActive) return
        if (USE_MOCK_DATA) {
          setSuggestions(getDemoSuggestions())
          setSuggestionsError(false)
          return
        }
        setSuggestionsError(true)
      }
    }

    // Load stats and suggestions in parallel
    loadStats()
    loadSuggestions()

    // Auto-refresh suggestions every 30 minutes
    autoRefreshRef.current = setInterval(() => {
      loadSuggestions()
    }, AUTO_REFRESH_MS)

    return () => {
      isActive = false
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current)
        autoRefreshRef.current = null
      }
    }
  }, [activeProject, executeAsync, executeAISuggestions])

  const handleRefreshSuggestions = async () => {
    if (!activeProject) return
    try {
      const result = await executeAISuggestions({ projectId: activeProject.id })
      if (result?.serverError) {
        if (USE_MOCK_DATA) {
          setSuggestions(getDemoSuggestions())
          setSuggestionsError(false)
          return
        }
        toast.error(result.serverError)
        setSuggestionsError(true)
        return
      }
      const data = result?.data
      if (Array.isArray(data) && data.length > 0) {
        setSuggestions(data)
        setSuggestionsError(false)
      } else if (USE_MOCK_DATA) {
        setSuggestions(getDemoSuggestions())
        setSuggestionsError(false)
      } else if (Array.isArray(data)) {
        setSuggestions([])
        setSuggestionsError(false)
      } else {
        setSuggestionsError(true)
      }
    } catch {
      if (USE_MOCK_DATA) {
        setSuggestions(getDemoSuggestions())
        setSuggestionsError(false)
        return
      }
      setSuggestionsError(true)
    }
  }

  const handleLiveRefreshSuggestions = async () => {
    if (!activeProject) return

    const result = await executeLiveRefresh({ projectId: activeProject.id })

    if (result?.serverError) {
      toast.error(result.serverError)
      return
    }

    if (result?.data?.success) {
      toast.success("Live refresh queued. External signals are being processed.")
    }
  }

  if (isBusy) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pulseCards.map((card) => (
            <Card key={card} className="min-h-40 transition-shadow hover:shadow-md">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <CommandCenter
        trendSpotterLabel="Trend Spotter"
        stats={stats}
        hasProject={hasProject}
        onAddProject={() => setDialogOpen(true)}
        suggestions={suggestions}
        onRefreshSuggestions={handleRefreshSuggestions}
        onLiveRefreshSuggestions={handleLiveRefreshSuggestions}
        suggestionsLoading={suggestionsLoading}
        liveRefreshPending={liveRefreshPending}
        suggestionsError={suggestionsError}
      />
      <AddProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
