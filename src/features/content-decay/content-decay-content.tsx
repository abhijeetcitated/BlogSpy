"use client"

// ============================================
// CONTENT DECAY - Main Component
// ============================================
// Full featured content decay monitoring page
// ============================================

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"

// Feature imports
import type { DecayArticle, DecayAlert, AlertPreferences, DecayReason, DecayStatus, SortField, SortDirection } from "./types"
import { DEFAULT_ALERT_PREFS } from "./constants"
import { MOCK_DECAY_DATA, RECOVERED_ARTICLES, MOCK_ALERTS } from "./__mocks__"
import {
  generateMatrixPoints,
  filterCriticalArticles,
  filterWatchArticles,
  calculateTotalTrafficAtRisk,
  filterArticles,
  sortArticles,
} from "./utils"
import {
  TriageHeader,
  AlertCenter,
  DecayMatrix,
  RevivalQueue,
  WatchList,
  RecoveredSection,
  ToastNotification,
  Filters,
  DecayHistoryTrendsCard,
  generateMockDecayHistory,
  SummaryCards,
  BulkActions,
  ExportDialog,
  ArticleDetailModal,
  GSCConnectionPrompt,
} from "./components"

// ============================================
// LOCAL STORAGE KEYS
// ============================================
const STORAGE_KEYS = {
  IGNORED_ARTICLES: "content_decay_ignored_articles",
  FIXED_ARTICLES: "content_decay_fixed_articles",
  FILTER_REASON: "content_decay_filter_reason",
  FILTER_STATUS: "content_decay_filter_status",
  SORT_FIELD: "content_decay_sort_field",
  SORT_DIRECTION: "content_decay_sort_direction",
  GSC_PROMPT_DISMISSED: "content_decay_gsc_prompt_dismissed",
}

export function ContentDecayContent() {
  const router = useRouter()

  // GSC Connection state
  const [showGSCPrompt, setShowGSCPrompt] = useState(true)
  const [isGSCConnected] = useState(false) // TODO: Replace with real GSC connection check

  // Check if user dismissed the prompt before
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEYS.GSC_PROMPT_DISMISSED)
    if (dismissed === 'true') {
      setShowGSCPrompt(false)
    }
  }, [])

  const handleDismissGSCPrompt = useCallback(() => {
    setShowGSCPrompt(false)
    localStorage.setItem(STORAGE_KEYS.GSC_PROMPT_DISMISSED, 'true')
  }, [])

  // Core states
  const [articles] = useState<DecayArticle[]>(MOCK_DECAY_DATA)
  const [revivingIds, setRevivingIds] = useState<Set<string>>(new Set())
  const [scheduledIds, setScheduledIds] = useState<Set<string>>(new Set())
  const [isAutoScheduling, setIsAutoScheduling] = useState(false)

  // Filter & Sort states
  const [searchQuery, setSearchQuery] = useState("")
  const [filterReason, setFilterReason] = useState<DecayReason | "all">("all")
  const [filterStatus, setFilterStatus] = useState<DecayStatus | "all">("all")
  const [sortField, setSortField] = useState<SortField>("trafficLoss")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Issue Status State (localStorage persisted)
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set())
  const [fixedIds, setFixedIds] = useState<Set<string>>(new Set())

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // History state
  const [history] = useState(() => generateMockDecayHistory(7))

  // UI states
  const [highlightedArticleId, setHighlightedArticleId] = useState<string | null>(null)

  // Article Detail Modal state
  const [selectedArticle, setSelectedArticle] = useState<DecayArticle | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Alert states
  const [alerts, setAlerts] = useState<DecayAlert[]>(MOCK_ALERTS)
  const [alertPrefs, setAlertPrefs] = useState<AlertPreferences>(DEFAULT_ALERT_PREFS)
  const [showAlertPanel, setShowAlertPanel] = useState(false)

  // Refs for scrolling
  const articleRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedIgnored = localStorage.getItem(STORAGE_KEYS.IGNORED_ARTICLES)
      const savedFixed = localStorage.getItem(STORAGE_KEYS.FIXED_ARTICLES)
      
      if (savedIgnored) setIgnoredIds(new Set(JSON.parse(savedIgnored)))
      if (savedFixed) setFixedIds(new Set(JSON.parse(savedFixed)))
    } catch (e) {
      console.error("Error loading saved state:", e)
    }
  }, [])

  // Save ignored articles to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IGNORED_ARTICLES, JSON.stringify([...ignoredIds]))
  }, [ignoredIds])

  // Save fixed articles to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FIXED_ARTICLES, JSON.stringify([...fixedIds]))
  }, [fixedIds])

  // Filtered and sorted articles
  const filteredArticles = useMemo(() => {
    const filtered = filterArticles(articles, searchQuery, filterReason, filterStatus, ignoredIds, fixedIds)
    return sortArticles(filtered, sortField, sortDirection)
  }, [articles, searchQuery, filterReason, filterStatus, ignoredIds, fixedIds, sortField, sortDirection])

  // Active articles (not ignored or fixed) for the queues
  const activeArticles = useMemo(() => {
    return articles.filter(a => !ignoredIds.has(a.id) && !fixedIds.has(a.id))
  }, [articles, ignoredIds, fixedIds])

  // Computed data
  const criticalArticles = useMemo(
    () => filterCriticalArticles(activeArticles),
    [activeArticles]
  )

  const watchArticles = useMemo(
    () => filterWatchArticles(activeArticles),
    [activeArticles]
  )

  const matrixPoints = useMemo(
    () => generateMatrixPoints(activeArticles),
    [activeArticles]
  )

  const totalTrafficAtRisk = useMemo(
    () => calculateTotalTrafficAtRisk(activeArticles),
    [activeArticles]
  )

  const unreadAlertsCount = useMemo(
    () => alerts.filter((a) => !a.actionTaken).length,
    [alerts]
  )

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery !== "" || filterReason !== "all" || filterStatus !== "all"
  }, [searchQuery, filterReason, filterStatus])

  // Toast helper
  const showNotification = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setFilterReason("all")
    setFilterStatus("all")
  }, [])

  // Handle sort change
  const handleSortChange = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }, [sortField])

  // Handle "Revive with AI" click
  const handleReviveWithAI = useCallback(
    async (articleId: string) => {
      setRevivingIds((prev) => new Set([...prev, articleId]))

      // Simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Navigate to AI Writer with revival mode
      router.push(`/dashboard/creation/ai-writer?mode=revival&articleId=${articleId}`)
    },
    [router]
  )

  // Handle "Schedule" click for watch list items
  const handleSchedule = useCallback(
    (articleId: string) => {
      setScheduledIds((prev) => new Set([...prev, articleId]))
      showNotification("Article added to content calendar 📅")
    },
    [showNotification]
  )

  // Handle "Mark as Fixed" for articles
  const handleMarkFixed = useCallback(
    (articleId: string) => {
      setFixedIds((prev) => new Set([...prev, articleId]))
      showNotification("Article marked as fixed ✅")
    },
    [showNotification]
  )

  // Handle "Ignore" for articles
  const handleIgnore = useCallback(
    (articleId: string) => {
      setIgnoredIds((prev) => new Set([...prev, articleId]))
      showNotification("Article ignored 👁️‍🗨️")
    },
    [showNotification]
  )

  // Handle "Undo Fixed" for articles
  const handleUndoFixed = useCallback(
    (articleId: string) => {
      setFixedIds((prev) => {
        const next = new Set(prev)
        next.delete(articleId)
        return next
      })
      showNotification("Article restored to queue")
    },
    [showNotification]
  )

  // Handle "Undo Ignore" for articles
  const handleUndoIgnore = useCallback(
    (articleId: string) => {
      setIgnoredIds((prev) => {
        const next = new Set(prev)
        next.delete(articleId)
        return next
      })
      showNotification("Article restored to queue")
    },
    [showNotification]
  )

  // Bulk Selection Handlers
  const handleSelectAll = useCallback(() => {
    const allIds = activeArticles.map(a => a.id)
    setSelectedIds(new Set(allIds))
  }, [activeArticles])

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleBulkMarkFixed = useCallback((ids: string[]) => {
    setFixedIds(prev => new Set([...prev, ...ids]))
    showNotification(`${ids.length} articles marked as fixed ✅`)
  }, [showNotification])

  const handleBulkIgnore = useCallback((ids: string[]) => {
    setIgnoredIds(prev => new Set([...prev, ...ids]))
    showNotification(`${ids.length} articles ignored 👁️‍🗨️`)
  }, [showNotification])

  // Handle "Auto-Schedule Refresh" for all critical articles
  const handleAutoScheduleAll = useCallback(async () => {
    setIsAutoScheduling(true)

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mark all critical articles as scheduled
    const criticalIds = criticalArticles.map((a) => a.id)
    setScheduledIds((prev) => new Set([...prev, ...criticalIds]))

    setIsAutoScheduling(false)
    showNotification(`${criticalArticles.length} Critical Articles added to roadmap ✅`)
  }, [criticalArticles, showNotification])

  // Handle matrix dot click - scroll to and highlight article
  const handleMatrixDotClick = useCallback((articleId: string) => {
    setHighlightedArticleId(articleId)

    // Scroll to the article
    const articleRef = articleRefs.current.get(articleId)
    if (articleRef) {
      articleRef.scrollIntoView({ behavior: "smooth", block: "center" })
    }

    // Remove highlight after 3 seconds
    setTimeout(() => setHighlightedArticleId(null), 3000)
  }, [])

  // Handle opening article detail modal
  const handleOpenArticleDetail = useCallback((articleId: string) => {
    const article = articles.find(a => a.id === articleId)
    if (article) {
      setSelectedArticle(article)
      setIsDetailModalOpen(true)
    }
  }, [articles])

  // Close article detail modal
  const handleCloseArticleDetail = useCallback(() => {
    setIsDetailModalOpen(false)
    setSelectedArticle(null)
  }, [])

  // Set article ref helper
  const setArticleRef = useCallback(
    (articleId: string, el: HTMLDivElement | null) => {
      if (el) {
        articleRefs.current.set(articleId, el)
      }
    },
    []
  )

  // Dismiss alert
  const handleDismissAlert = useCallback(
    (alertId: string) => {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId))
      showNotification("Alert dismissed")
    },
    [showNotification]
  )

  // Mark alert as actioned
  const handleMarkActioned = useCallback(
    (alertId: string) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, actionTaken: true } : a))
      )
      showNotification("Marked as actioned ✓")
    },
    [showNotification]
  )

  // View article from alert
  const handleViewArticle = useCallback(
    (alertId: string, articleId: string) => {
      handleMatrixDotClick(articleId)
      handleMarkActioned(alertId)
    },
    [handleMatrixDotClick, handleMarkActioned]
  )

  // Toggle alert preference
  const toggleAlertPref = useCallback((key: keyof AlertPreferences) => {
    setAlertPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  // Show GSC connection prompt if not connected and not dismissed
  if (!isGSCConnected && showGSCPrompt) {
    return <GSCConnectionPrompt onContinueWithDemo={handleDismissGSCPrompt} />
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex-1 space-y-4 sm:space-y-6 overflow-auto">
        {/* Triage Header */}
        <TriageHeader
          criticalCount={criticalArticles.length}
          totalTrafficAtRisk={totalTrafficAtRisk}
          isAutoScheduling={isAutoScheduling}
          onAutoSchedule={handleAutoScheduleAll}
        />

        {/* Summary Stats */}
        <SummaryCards
          criticalCount={criticalArticles.length}
          watchCount={watchArticles.length}
          trafficAtRisk={totalTrafficAtRisk}
          fixedCount={fixedIds.size}
          recoveredCount={RECOVERED_ARTICLES.length}
        />

        {/* Decay Alert Center */}
        <AlertCenter
          alerts={alerts}
          alertPrefs={alertPrefs}
          showAlertPanel={showAlertPanel}
          unreadCount={unreadAlertsCount}
          onTogglePanel={() => setShowAlertPanel(!showAlertPanel)}
          onTogglePref={toggleAlertPref}
          onDismissAlert={handleDismissAlert}
          onMarkActioned={handleMarkActioned}
          onViewArticle={handleViewArticle}
        />

        {/* Filters & Bulk Actions */}
        <div className="space-y-3">
          <Filters
            searchQuery={searchQuery}
            filterReason={filterReason}
            filterStatus={filterStatus}
            sortField={sortField}
            sortDirection={sortDirection}
            onSearchChange={setSearchQuery}
            onFilterReasonChange={setFilterReason}
            onFilterStatusChange={setFilterStatus}
            onSortChange={handleSortChange}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
            resultCount={filteredArticles.length}
            totalCount={articles.length}
          />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <BulkActions
              articles={activeArticles}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onToggleSelect={handleToggleSelect}
              onBulkMarkFixed={handleBulkMarkFixed}
              onBulkIgnore={handleBulkIgnore}
            />
            
            <ExportDialog
              allArticles={articles}
              filteredArticles={filteredArticles}
              selectedIds={selectedIds}
            />
          </div>
        </div>

        {/* Decay Matrix */}
        <DecayMatrix
          matrixPoints={matrixPoints}
          articles={activeArticles}
          highlightedArticleId={highlightedArticleId}
          onDotClick={handleMatrixDotClick}
        />

        {/* Revival Queue - Critical Articles */}
        <RevivalQueue
          articles={criticalArticles}
          revivingIds={revivingIds}
          scheduledIds={scheduledIds}
          highlightedArticleId={highlightedArticleId}
          onReviveWithAI={handleReviveWithAI}
          onMarkFixed={handleMarkFixed}
          onIgnore={handleIgnore}
          onViewDetails={handleOpenArticleDetail}
          setArticleRef={setArticleRef}
        />

        {/* Watch List - Warning Articles */}
        <WatchList
          articles={watchArticles}
          scheduledIds={scheduledIds}
          highlightedArticleId={highlightedArticleId}
          onSchedule={handleSchedule}
          onMarkFixed={handleMarkFixed}
          onIgnore={handleIgnore}
          onViewDetails={handleOpenArticleDetail}
          setArticleRef={setArticleRef}
        />

        {/* History Trends Chart */}
        <DecayHistoryTrendsCard history={history} />

        {/* Recovered Section */}
        <RecoveredSection articles={RECOVERED_ARTICLES} />

        {/* Toast Notification */}
        <ToastNotification show={showToast} message={toastMessage} />

        {/* Article Detail Modal */}
        <ArticleDetailModal
          article={selectedArticle}
          isOpen={isDetailModalOpen}
          onClose={handleCloseArticleDetail}
          onReviveWithAI={handleReviveWithAI}
          onMarkFixed={handleMarkFixed}
          onIgnore={handleIgnore}
          isReviving={selectedArticle ? revivingIds.has(selectedArticle.id) : false}
        />
      </div>
    </TooltipProvider>
  )
}
