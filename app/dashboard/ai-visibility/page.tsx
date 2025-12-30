"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AIVisibilityDashboard, SetupWizard, AddKeywordModal } from "@/src/features/ai-visibility/components"
import { runFullScan, type RunScanInput, type RunScanResult } from "@/src/features/ai-visibility/actions/run-scan"
import { addTrackedKeyword } from "@/src/features/ai-visibility/actions"
import { ErrorBoundary } from "@/components/common/error-boundary"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { FullScanResult } from "@/src/features/ai-visibility/services/scan.service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowRight, Eye, Rocket, Zap } from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface ProjectConfig {
  domain: string
  brandName: string
  createdAt: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE KEY
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = "blogspy_ai_visibility_config"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DEMO BANNER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function DemoBanner({ onSetupClick }: { onSetupClick: () => void }) {
  return (
    <div className="bg-linear-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/30 rounded-lg p-3 sm:p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Eye className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              👀 Viewing Demo Data for &quot;Example Inc&quot;
            </p>
            <p className="text-xs text-muted-foreground">
              This is sample data to show you how the dashboard works
            </p>
          </div>
        </div>
        <Button 
          onClick={onSetupClick}
          className="bg-amber-500 hover:bg-amber-600 text-black font-medium h-9"
        >
          Start Tracking Your Brand
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export default function AIVisibilityPage() {
  const router = useRouter()
  const [hasConfiguredProject, setHasConfiguredProject] = useState<boolean | null>(null)
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(true)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanKeyword, setScanKeyword] = useState("best seo tools 2025") // Default keyword
  const [lastScanResult, setLastScanResult] = useState<FullScanResult | null>(null)
  const [showAddKeywordModal, setShowAddKeywordModal] = useState(false)
  const [isAddingKeyword, setIsAddingKeyword] = useState(false)

  // Check for existing config on mount
  // DEV MODE: Always reset on page load for easy testing
  useEffect(() => {
    // Clear storage on every reload for testing
    localStorage.removeItem(STORAGE_KEY)
    
    // Always start fresh in demo mode
    setHasConfiguredProject(true)
    setIsDemoMode(true)
    setProjectConfig(null)
  }, [])

  // Handle setup completion
  const handleSetupComplete = (config: { domain: string; brandName: string }) => {
    setIsLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const fullConfig: ProjectConfig = {
        ...config,
        createdAt: new Date().toISOString(),
      }
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullConfig))
      
      setProjectConfig(fullConfig)
      setHasConfiguredProject(true)
      setIsDemoMode(false)
      setShowSetupWizard(false)
      setIsLoading(false)
    }, 1500)
  }

  // Handle demo action click (Scan, Verify, etc.)
  const handleDemoActionClick = () => {
    setShowSetupModal(true)
  }

  // Handle real scan when not in demo mode
  const handleScan = async () => {
    // In mock mode, use default values for testing
    const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
    
    if (!isMockMode && !projectConfig) {
      toast.error("Please configure your project first")
      setShowSetupModal(true)
      return
    }

    setIsScanning(true)
    
    try {
      const scanInput: RunScanInput = {
        keyword: scanKeyword,
        brandName: projectConfig?.brandName || "BlogSpy",
        brandDomain: projectConfig?.domain || "blogspy.io",
      }

      const result = await runFullScan(scanInput)

      if (result.success && result.data) {
        // Store scan result in state
        setLastScanResult(result.data)
        
        toast.success(
          `Scan complete! Visible on ${result.data.visiblePlatforms}/${result.data.totalPlatforms} platforms`,
          {
            description: `Used ${result.creditsUsed} credits. Overall score: ${result.data.overallScore}%`,
          }
        )
        
        // Refresh the page to get fresh data
        router.refresh()
      } else {
        toast.error(result.error || "Scan failed", {
          description: result.creditsUsed > 0 ? `Credits were refunded.` : undefined,
        })
      }
    } catch (error) {
      toast.error("Failed to run scan", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsScanning(false)
    }
  }

  // Handle adding a new keyword to track
  const handleAddKeyword = async (keyword: string, category?: string) => {
    if (isDemoMode) {
      toast.error("Please configure your project first to track keywords")
      setShowAddKeywordModal(false)
      setShowSetupModal(true)
      return
    }

    setIsAddingKeyword(true)
    try {
      const result = await addTrackedKeyword({
        keyword,
        category: category || "other",
      })

      if (result.success) {
        toast.success(`Keyword "${keyword}" added successfully!`, {
          description: "It will be checked in the next scan.",
        })
        setShowAddKeywordModal(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to add keyword")
      }
    } catch (error) {
      toast.error("Failed to add keyword", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsAddingKeyword(false)
    }
  }

  // Loading state while checking localStorage
  if (hasConfiguredProject === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show SetupWizard if user clicked "Start Tracking"
  if (showSetupWizard) {
    return (
      <ErrorBoundary>
        <SetupWizard onComplete={handleSetupComplete} isLoading={isLoading} />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <DemoBanner onSetupClick={() => setShowSetupWizard(true)} />
      )}

      {/* Main Dashboard */}
      <AIVisibilityDashboard 
        isDemoMode={isDemoMode}
        onDemoActionClick={handleDemoActionClick}
        onScan={handleScan}
        isScanning={isScanning}
        lastScanResult={lastScanResult}
        onAddKeyword={() => setShowAddKeywordModal(true)}
      />

      {/* Add Keyword Modal */}
      <AddKeywordModal
        open={showAddKeywordModal}
        onClose={() => setShowAddKeywordModal(false)}
        onAdd={handleAddKeyword}
        isAdding={isAddingKeyword}
      />

      {/* Setup Prompt Modal */}
      <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto p-3 rounded-full bg-primary/10 mb-2">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">Ready to track your real brand?</DialogTitle>
            <DialogDescription className="text-center">
              Setup your project to get <span className="font-semibold text-primary">5 Free Credits</span> and start monitoring your AI visibility across ChatGPT, Claude, Perplexity & more.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">5 Free Credits</span>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSetupModal(false)}
              className="w-full sm:w-auto"
            >
              Continue Demo
            </Button>
            <Button 
              onClick={() => {
                setShowSetupModal(false)
                setShowSetupWizard(true)
              }}
              className="w-full sm:w-auto"
            >
              Setup My Project
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  )
}
