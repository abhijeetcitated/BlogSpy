"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { generateMockCannibalizationAnalysis } from "./__mocks__/cannibalization-data"
import { sortIssues, filterIssues } from "./utils/cannibalization-utils"
import { PageHeader } from "./components/PageHeader"
import { SummaryCards } from "./components/SummaryCards"
import { Filters } from "./components/Filters"
import { IssueList } from "./components/IssueList"
import { SummaryFooter } from "./components/SummaryFooter"
import { FixIssueDialog } from "./components/FixIssueDialog"
import { ViewPagesModal } from "./components/ViewPagesModal"
import { ExportReportDialog } from "./components/ExportReportDialog"
import { DomainInputDialog } from "./components/DomainInputDialog"
import { IgnoreIssueDialog } from "./components/IgnoreIssueDialog"
import { BulkActionsDialog } from "./components/BulkActionsDialog"
import { HistoryTrendsCard, generateMockHistory } from "./components/HistoryTrendsCard"
import type { SortField, SortDirection, FilterSeverity, CannibalizationIssue } from "./types"
import { STACK_SPACING } from "@/src/styles"

// ============================================
// LOCAL STORAGE KEYS
// ============================================
const STORAGE_KEYS = {
  IGNORED_ISSUES: "cannibalization_ignored_issues",
  FIXED_ISSUES: "cannibalization_fixed_issues",
  IN_PROGRESS_ISSUES: "cannibalization_in_progress_issues",
  LAST_DOMAIN: "cannibalization_last_domain",
}

// ============================================
// COMPONENT
// ============================================
export function CannibalizationContent() {
  // Core State
  const [analysis, setAnalysis] = useState(() => generateMockCannibalizationAnalysis())
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("severity")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [filterSeverity, setFilterSeverity] = useState<FilterSeverity>("all")
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set())
  const [isScanning, setIsScanning] = useState(false)
  
  // Issue Status State
  const [ignoredIssues, setIgnoredIssues] = useState<Set<string>>(new Set())
  const [fixedIssues, setFixedIssues] = useState<Set<string>>(new Set())
  const [inProgressIssues, setInProgressIssues] = useState<Set<string>>(new Set())
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])
  
  // Dialog State
  const [fixDialogOpen, setFixDialogOpen] = useState(false)
  const [viewPagesOpen, setViewPagesOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [domainDialogOpen, setDomainDialogOpen] = useState(false)
  const [ignoreDialogOpen, setIgnoreDialogOpen] = useState(false)
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<CannibalizationIssue | null>(null)
  
  // History State
  const [history] = useState(() => generateMockHistory(7))
  const [currentDomain, setCurrentDomain] = useState("")

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedIgnored = localStorage.getItem(STORAGE_KEYS.IGNORED_ISSUES)
      const savedFixed = localStorage.getItem(STORAGE_KEYS.FIXED_ISSUES)
      const savedInProgress = localStorage.getItem(STORAGE_KEYS.IN_PROGRESS_ISSUES)
      const savedDomain = localStorage.getItem(STORAGE_KEYS.LAST_DOMAIN)
      
      if (savedIgnored) setIgnoredIssues(new Set(JSON.parse(savedIgnored)))
      if (savedFixed) setFixedIssues(new Set(JSON.parse(savedFixed)))
      if (savedInProgress) setInProgressIssues(new Set(JSON.parse(savedInProgress)))
      if (savedDomain) setCurrentDomain(savedDomain)
    } catch (e) {
      console.error("Error loading saved state:", e)
    }
  }, [])

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IGNORED_ISSUES, JSON.stringify([...ignoredIssues]))
  }, [ignoredIssues])
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FIXED_ISSUES, JSON.stringify([...fixedIssues]))
  }, [fixedIssues])
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IN_PROGRESS_ISSUES, JSON.stringify([...inProgressIssues]))
  }, [inProgressIssues])

  // Filter and sort issues (exclude ignored)
  const filteredIssues = useMemo(() => {
    const activeIssues = analysis.issues.filter(issue => !ignoredIssues.has(issue.id))
    const filtered = filterIssues(activeIssues, searchQuery, filterSeverity)
    return sortIssues(filtered, sortField, sortDirection)
  }, [analysis.issues, searchQuery, filterSeverity, sortField, sortDirection, ignoredIssues])

  // Issues with status
  const issuesWithStatus = useMemo(() => {
    return filteredIssues.map(issue => ({
      ...issue,
      status: fixedIssues.has(issue.id) 
        ? "fixed" as const 
        : inProgressIssues.has(issue.id) 
          ? "in-progress" as const 
          : "pending" as const
    }))
  }, [filteredIssues, fixedIssues, inProgressIssues])

  // Handlers
  const handleToggleExpand = useCallback((issueId: string) => {
    setExpandedIssues(prev => {
      const next = new Set(prev)
      if (next.has(issueId)) {
        next.delete(issueId)
      } else {
        next.add(issueId)
      }
      return next
    })
  }, [])

  const handleRescan = useCallback(() => {
    setIsScanning(true)
    setTimeout(() => {
      setAnalysis(generateMockCannibalizationAnalysis())
      setIsScanning(false)
    }, 2000)
  }, [])

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }, [sortField])

  // Dialog Handlers
  const handleFixNow = useCallback((issue: CannibalizationIssue) => {
    setSelectedIssue(issue)
    setFixDialogOpen(true)
  }, [])

  const handleViewPages = useCallback((issue: CannibalizationIssue) => {
    setSelectedIssue(issue)
    setViewPagesOpen(true)
  }, [])

  const handleIgnoreClick = useCallback((issue: CannibalizationIssue) => {
    setSelectedIssue(issue)
    setIgnoreDialogOpen(true)
  }, [])

  const handleIgnoreIssue = useCallback((issueId: string) => {
    setIgnoredIssues(prev => new Set([...prev, issueId]))
  }, [])

  const handleFixComplete = useCallback((issueId: string, status: "fixed" | "in-progress") => {
    if (status === "fixed") {
      setFixedIssues(prev => new Set([...prev, issueId]))
      setInProgressIssues(prev => {
        const next = new Set(prev)
        next.delete(issueId)
        return next
      })
    } else {
      setInProgressIssues(prev => new Set([...prev, issueId]))
    }
  }, [])

  const handleDomainScan = useCallback((domain: string) => {
    setCurrentDomain(domain)
    localStorage.setItem(STORAGE_KEYS.LAST_DOMAIN, domain)
    setAnalysis(generateMockCannibalizationAnalysis())
  }, [])

  const handleBulkAction = useCallback((ids: string[], action: "fix" | "ignore" | "in-progress") => {
    if (action === "fix") {
      setFixedIssues(prev => new Set([...prev, ...ids]))
      setInProgressIssues(prev => {
        const next = new Set(prev)
        ids.forEach(id => next.delete(id))
        return next
      })
    } else if (action === "ignore") {
      setIgnoredIssues(prev => new Set([...prev, ...ids]))
    } else {
      setInProgressIssues(prev => new Set([...prev, ...ids]))
    }
    setSelectedIssues([])
  }, [])

  // Calculate stats
  const activeIssuesCount = analysis.issueCount - ignoredIssues.size
  const fixedCount = fixedIssues.size
  const inProgressCount = inProgressIssues.size
  const totalTrafficLoss = filteredIssues.reduce((sum, i) => sum + i.trafficLoss, 0)

  return (
    <TooltipProvider delayDuration={200}>
      <div className={`flex-1 overflow-auto bg-background ${STACK_SPACING.default}`}>
        <PageHeader 
          isScanning={isScanning} 
          onRescan={handleRescan}
          onNewScan={() => setDomainDialogOpen(true)}
          onExport={() => setExportDialogOpen(true)}
          onBulkActions={() => setBulkActionsOpen(true)}
          currentDomain={currentDomain}
        />

        <SummaryCards 
          analysis={analysis}
          fixedCount={fixedCount}
          inProgressCount={inProgressCount}
          ignoredCount={ignoredIssues.size}
        />

        {/* History Trends Card */}
        <HistoryTrendsCard history={history} />

        <Filters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterSeverity={filterSeverity}
          onFilterChange={setFilterSeverity}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          analysis={analysis}
        />

        <IssueList
          issues={issuesWithStatus}
          expandedIssues={expandedIssues}
          onToggleExpand={handleToggleExpand}
          searchQuery={searchQuery}
          filterSeverity={filterSeverity}
          onFixNow={handleFixNow}
          onViewPages={handleViewPages}
          onIgnore={handleIgnoreClick}
          fixedIssues={fixedIssues}
          inProgressIssues={inProgressIssues}
        />

        {filteredIssues.length > 0 && (
          <SummaryFooter
            filteredCount={filteredIssues.length}
            totalCount={activeIssuesCount}
            issues={filteredIssues}
          />
        )}

        {/* Dialogs */}
        <FixIssueDialog
          open={fixDialogOpen}
          onOpenChange={setFixDialogOpen}
          issue={selectedIssue}
          onFixComplete={handleFixComplete}
        />

        <ViewPagesModal
          open={viewPagesOpen}
          onOpenChange={setViewPagesOpen}
          issue={selectedIssue}
        />

        <ExportReportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          issues={filteredIssues}
          totalIssues={analysis.issueCount}
          totalTrafficLoss={totalTrafficLoss}
        />

        <DomainInputDialog
          open={domainDialogOpen}
          onOpenChange={setDomainDialogOpen}
          onScanComplete={handleDomainScan}
        />

        <IgnoreIssueDialog
          open={ignoreDialogOpen}
          onOpenChange={setIgnoreDialogOpen}
          issue={selectedIssue}
          onIgnore={handleIgnoreIssue}
        />

        <BulkActionsDialog
          open={bulkActionsOpen}
          onOpenChange={setBulkActionsOpen}
          issues={filteredIssues}
          selectedIds={selectedIssues}
          onBulkAction={handleBulkAction}
        />
      </div>
    </TooltipProvider>
  )
}
