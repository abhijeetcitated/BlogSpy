"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  ToastNotification,
  ScanHeader,
  EmptyState,
  ScanningState,
  PageStructureColumn,
  IssuesPanel,
  NLPKeywordsPanel,
  SERPPreviewBar,
  AIFixModal,
  FeatureLinksBar,
} from "./components"
import { MOCK_PAGE_STRUCTURE, MOCK_ISSUES, MOCK_NLP_KEYWORDS } from "./__mocks__/checker-data"
import { SCAN_DURATION_MS, SCAN_INTERVAL_MS } from "./constants"
import { calculateDynamicScore } from "./utils/checker-utils"
import { useScanHistory } from "./hooks"
import type { CurrentIssue } from "./types"

export function OnPageCheckerContent() {
  // URL and scanning state
  const [url, setUrl] = useState("")
  const [targetKeyword, setTargetKeyword] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  
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

  // Show toast helper
  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  // Handle scan
  const handleScan = useCallback(() => {
    if (!url.trim()) return
    
    setIsScanning(true)
    setScanComplete(false)
    setScanProgress(0)
  }, [url])

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

  return (
    <div className="h-full flex flex-col bg-background">
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
      />

      {/* Main Content Area */}
      {!scanComplete && !isScanning && (
        <EmptyState 
          history={history}
          onSelectUrl={handleSelectFromHistory}
          onClearHistory={clearHistory}
        />
      )}
      
      {isScanning && (
        <div className="flex-1 relative">
          <ScanningState />
        </div>
      )}

      {scanComplete && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 3-Column Grid */}
          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            {/* Page Structure - Left Column */}
            <PageStructureColumn structure={MOCK_PAGE_STRUCTURE} />

            {/* Issues Panel - Middle Column */}
            <IssuesPanel issues={MOCK_ISSUES} onFixWithAI={handleFixWithAI} />

            {/* NLP Keywords - Right Column */}
            <NLPKeywordsPanel keywords={MOCK_NLP_KEYWORDS} />
          </div>

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

      {/* AI Fix Modal */}
      <AIFixModal
        open={showAIModal}
        onOpenChange={setShowAIModal}
        currentIssue={currentIssue}
        onCopySuccess={handleCopySuccess}
      />
    </div>
  )
}
