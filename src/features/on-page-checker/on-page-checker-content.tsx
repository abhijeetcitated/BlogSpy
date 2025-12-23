"use client"

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react"
import {
  ToastNotification,
  ScanHeader,
  EmptyState,
  ScanningState,
  ErrorState,
  PageStructureColumn,
  IssuesPanel,
  NLPKeywordsPanel,
  SERPPreviewBar,
  FeatureLinksBar,
  MobileTabsLayout,
} from "./components"
import { MOCK_PAGE_STRUCTURE, MOCK_ISSUES, MOCK_NLP_KEYWORDS } from "./__mocks__/checker-data"
import { SCAN_DURATION_MS, SCAN_INTERVAL_MS } from "./constants"
import { calculateDynamicScore, validateURL } from "./utils/checker-utils"
import { useScanHistory, useKeyboardShortcuts } from "./hooks"
import { useIsMobile } from "@/hooks"
import type { CurrentIssue } from "./types"
import { useRef } from "react"

// Lazy load heavy AIFixModal component
const AIFixModal = lazy(() => 
  import("./components/ai-fix-modal").then(mod => ({ default: mod.AIFixModal }))
)

export function OnPageCheckerContent() {
  // Refs for keyboard shortcuts
  const urlInputRef = useRef<HTMLInputElement>(null)
  // URL and scanning state
  const [url, setUrl] = useState("")
  const [targetKeyword, setTargetKeyword] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanError, setScanError] = useState<string | null>(null)
  
  // Dynamic score based on issues
  const score = useMemo(() => calculateDynamicScore(MOCK_ISSUES), [])

  // Scan history
  const { history, addScan, clearHistory } = useScanHistory()
  
  // AI Fix modal state
  const [showAIModal, setShowAIModal] = useState(false)
  const [currentIssue, setCurrentIssue] = useState<CurrentIssue | null>(null)
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Mobile responsive
  const isMobile = useIsMobile()
  
  // URL validation
  const urlValidation = useMemo(() => validateURL(url), [url])

  // Clean up toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  // Show toast helper with proper cleanup
  const showToastMessage = useCallback((message: string) => {
    // Clear existing timeout to prevent memory leak
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    setToastMessage(message)
    setShowToast(true)
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false)
      toastTimeoutRef.current = null
    }, 3000)
  }, [])

  // Handle scan
  const handleScan = useCallback(() => {
    // Validate URL before scanning
    const validation = validateURL(url)
    if (!validation.valid) {
      showToastMessage(validation.error || "Invalid URL")
      return
    }
    
    setIsScanning(true)
    setScanComplete(false)
    setScanProgress(0)
    setScanError(null)
  }, [url, showToastMessage])
  
  // Handle retry after error
  const handleRetry = useCallback(() => {
    setScanError(null)
    handleScan()
  }, [handleScan])

  // Handle selecting URL from history
  const handleSelectFromHistory = useCallback((historyUrl: string, historyKeyword: string) => {
    setUrl(historyUrl)
    setTargetKeyword(historyKeyword)
  }, [])

  // Scan progress effect
  useEffect(() => {
    if (!isScanning) return

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          setScanComplete(true)
          // Add to history when scan completes
          addScan({
            url,
            targetKeyword,
            score,
            errorCount: MOCK_ISSUES.errors.length,
            warningCount: MOCK_ISSUES.warnings.length,
            passedCount: MOCK_ISSUES.passed.length,
          })
          return 100
        }
        return prev + (100 / (SCAN_DURATION_MS / SCAN_INTERVAL_MS))
      })
    }, SCAN_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isScanning, url, targetKeyword, score, addScan])

  // Handle Fix with AI click
  const handleFixWithAI = useCallback((issue: CurrentIssue) => {
    setCurrentIssue(issue)
    setShowAIModal(true)
  }, [])

  // Handle export report as JSON
  const handleExport = useCallback(() => {
    const report = {
      url,
      targetKeyword,
      score,
      timestamp: new Date().toISOString(),
      summary: {
        errors: MOCK_ISSUES.errors.length,
        warnings: MOCK_ISSUES.warnings.length,
        passed: MOCK_ISSUES.passed.length,
      },
      issues: MOCK_ISSUES,
      pageStructure: MOCK_PAGE_STRUCTURE,
      nlpKeywords: MOCK_NLP_KEYWORDS,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = `seo-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)
    
    showToastMessage("Report downloaded!")
  }, [url, targetKeyword, score, showToastMessage])

  // Handle copy success
  const handleCopySuccess = useCallback(() => {
    showToastMessage("Fix copied to clipboard!")
  }, [showToastMessage])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onFocusSearch: () => urlInputRef.current?.focus(),
    onScan: () => !isScanning && handleScan(),
    onExport: () => scanComplete && handleExport(),
    onCloseModal: () => setShowAIModal(false),
  })

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Screen Reader Announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {isScanning && `Scan in progress. ${scanProgress}% complete.`}
        {scanComplete && !scanError && `Scan complete. Your SEO score is ${score} out of 100. ${MOCK_ISSUES.errors.length} errors found, ${MOCK_ISSUES.warnings.length} warnings found.`}
        {scanError && `Scan failed: ${scanError}`}
      </div>
      
      {/* Toast Notification */}
      <ToastNotification message={toastMessage} show={showToast} />

      {/* Header with URL input and score */}
      <ScanHeader
        url={url}
        onUrlChange={setUrl}
        targetKeyword={targetKeyword}
        onTargetKeywordChange={setTargetKeyword}
        isScanning={isScanning}
        scanComplete={scanComplete}
        scanProgress={scanProgress}
        score={score}
        errorCount={MOCK_ISSUES.errors.length}
        warningCount={MOCK_ISSUES.warnings.length}
        onScan={handleScan}
        onExport={scanComplete ? handleExport : undefined}
        urlError={!urlValidation.valid ? urlValidation.error : undefined}
        urlInputRef={urlInputRef}
      />

      {/* Main Content Area */}
      {!scanComplete && !isScanning && !scanError && (
        <EmptyState 
          history={history}
          onSelectUrl={handleSelectFromHistory}
          onClearHistory={clearHistory}
        />
      )}
      
      {isScanning && (
        <div className="flex-1 relative">
          <ScanningState progress={scanProgress} />
        </div>
      )}
      
      {scanError && (
        <ErrorState error={scanError} onRetry={handleRetry} />
      )}

      {scanComplete && !scanError && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile: Tabs Layout | Desktop: 3-Column Grid */}
          {isMobile ? (
            <MobileTabsLayout
              structure={MOCK_PAGE_STRUCTURE}
              issues={MOCK_ISSUES}
              keywords={MOCK_NLP_KEYWORDS}
              onFixWithAI={handleFixWithAI}
            />
          ) : (
            <div className="flex-1 grid grid-cols-12 overflow-hidden">
              {/* Page Structure - Left Column */}
              <PageStructureColumn structure={MOCK_PAGE_STRUCTURE} />

              {/* Issues Panel - Middle Column */}
              <IssuesPanel issues={MOCK_ISSUES} onFixWithAI={handleFixWithAI} />

              {/* NLP Keywords - Right Column */}
              <NLPKeywordsPanel keywords={MOCK_NLP_KEYWORDS} />
            </div>
          )}

          {/* SERP Preview Bar */}
          <SERPPreviewBar
            url={url || "myblog.com/seo-guide"}
            title="Complete SEO Guide 2024 - Best Practices & Tips"
            description="Learn everything about SEO in 2024. This comprehensive guide covers on-page optimization, technical SEO, content strategy, and more to help you rank higher."
          />

          {/* Feature Links Bar */}
          <FeatureLinksBar targetKeyword={targetKeyword} />
        </div>
      )}

      {/* AI Fix Modal - Lazy Loaded */}
      {showAIModal && (
        <Suspense fallback={null}>
          <AIFixModal
            open={showAIModal}
            onOpenChange={setShowAIModal}
            currentIssue={currentIssue}
            onCopySuccess={handleCopySuccess}
          />
        </Suspense>
      )}
    </div>
  )
}
