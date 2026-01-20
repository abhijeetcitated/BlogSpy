"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { AIVisibilityDashboard, SetupWizard, AddKeywordModal, SetupConfigModal } from "@/src/features/ai-visibility/components"
import { runFullScan, type RunScanInput } from "@/src/features/ai-visibility/actions/run-scan"
import { addTrackedKeyword, saveVisibilityConfig, listVisibilityConfigs, getVisibilityDashboardData } from "@/src/features/ai-visibility/actions"
import type { AIVisibilityConfig, AICitation, VisibilityTrendData } from "@/src/features/ai-visibility/types"
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
import { ArrowRight, Eye, Rocket, Zap, LogIn } from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DEMO BANNER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function DemoBanner({ onSetupClick, isGuest }: { onSetupClick: () => void; isGuest?: boolean }) {
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
              {isGuest 
                ? "Sign up to track your own brand across AI platforms" 
                : "This is sample data to show you how the dashboard works"}
            </p>
          </div>
        </div>
        <Button 
          onClick={onSetupClick}
          className="bg-amber-500 hover:bg-amber-600 text-black font-medium h-9"
        >
          {isGuest ? "Sign Up Free" : "Start Tracking Your Brand"}
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
  const [configs, setConfigs] = useState<AIVisibilityConfig[]>([])
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null)
  const [dashboardCitations, setDashboardCitations] = useState<AICitation[] | null>(null)
  const [dashboardTrendData, setDashboardTrendData] = useState<VisibilityTrendData[] | null>(null)
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState<AIVisibilityConfig | null>(null)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(true)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [lastScanResult, setLastScanResult] = useState<FullScanResult | null>(null)
  const [showAddKeywordModal, setShowAddKeywordModal] = useState(false)
  const [isAddingKeyword, setIsAddingKeyword] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GUEST MODE: Check if user is logged in
  // ═══════════════════════════════════════════════════════════════════════════
  const [isGuest, setIsGuest] = useState(true) // Default to guest until we check

  const normalizeDomain = (value: string) => {
    let domain = value.trim().toLowerCase()
    domain = domain.replace(/^https?:\/\//, "")
    domain = domain.replace(/^www\./, "")
    domain = domain.split("/")[0] || ""
    domain = domain.split("?")[0] || ""
    return domain
  }

  const selectedConfig = configs.find((config) => config.id === selectedConfigId) || null

  const refreshConfigs = async (nextSelectedId?: string) => {
    const response = await listVisibilityConfigs({})
    if (response?.serverError) {
      toast.error(response.serverError)
      return null
    }

    const result = response?.data
    if (result?.success) {
      const nextConfigs = result.data || []
      setConfigs(nextConfigs)

      const preferredId = nextSelectedId || selectedConfigId
      const fallbackId = nextConfigs.find((config) => config.id === preferredId)?.id || nextConfigs[0]?.id || null
      setSelectedConfigId(fallbackId)
      return nextConfigs
    } else if (result?.error) {
      toast.error(result.error)
    }

    return null
  }

  const openConfigModal = (config: AIVisibilityConfig | null) => {
    setEditingConfig(config)
    setShowConfigModal(true)
  }

  const handleSaveConfig = async (
    configInput: Omit<AIVisibilityConfig, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    setIsSavingConfig(true)
    try {
      const response = await saveVisibilityConfig({
        ...configInput,
        configId: editingConfig?.id,
      })

      if (response?.serverError) {
        toast.error(response.serverError)
        return
      }

      const result = response?.data
      if (result?.success && result.data) {
        await refreshConfigs(result.data.id)
        setIsDemoMode(false)
        setShowConfigModal(false)
        setEditingConfig(null)
        toast.success(editingConfig ? "Project updated" : "Project added")
      } else {
        toast.error(result?.error || "Failed to save project")
      }
    } finally {
      setIsSavingConfig(false)
    }
  }

  // Check for existing config on mount
  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
          const { data: { user } } = await supabase.auth.getUser()
          if (!isMounted) return
          setIsGuest(!user)
          
          if (user) {
            const nextConfigs = await refreshConfigs()
            if (!isMounted) return
            setIsDemoMode(false)
            if (!nextConfigs || !nextConfigs.length) {
              openConfigModal(null)
            }
          } else {
            setIsDemoMode(true)
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        if (isMounted) {
          setIsGuest(true)
          setIsDemoMode(true)
        }
      } finally {
        if (isMounted) {
          setHasConfiguredProject(true)
        }
      }
    }
    
    checkAuth()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedConfigId || isGuest || isDemoMode) {
      setDashboardCitations(null)
      setDashboardTrendData(null)
      return
    }

    let isMounted = true
    setIsDashboardLoading(true)

    const loadDashboard = async () => {
      const response = await getVisibilityDashboardData({ configId: selectedConfigId })

      if (!isMounted) return

      if (response?.serverError) {
        toast.error(response.serverError)
      }

      const result = response?.data
      if (result?.success && result.data) {
        setDashboardCitations(result.data.citations)
        setDashboardTrendData(result.data.trendData)
      } else if (result?.error) {
        toast.error(result.error)
        setDashboardCitations([])
        setDashboardTrendData([])
      }

      setIsDashboardLoading(false)
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [selectedConfigId, isGuest, isDemoMode])

  // Handle setup completion
  const handleSetupComplete = async (config: { domain: string; brandName: string }) => {
    // ═══════════════════════════════════════════════════════════════════════════════════════════════
    // GUEST GATE: Require login before setup
    // ═══════════════════════════════════════════════════════════════════════════════════════════════
    if (isGuest) {
      setShowLoginModal(true)
      return
    }

    setIsLoading(true)
    try {
      const normalizedDomain = normalizeDomain(config.domain)
      const response = await saveVisibilityConfig({
        projectName: normalizedDomain,
        trackedDomain: normalizedDomain,
        brandKeywords: [config.brandName.trim()],
        competitorDomains: [],
      })

      if (response?.serverError) {
        toast.error(response.serverError)
        return
      }

      const result = response?.data
      if (result?.success && result.data) {
        await refreshConfigs(result.data.id)
        setHasConfiguredProject(true)
        setIsDemoMode(false)
        setShowSetupWizard(false)
      } else {
        toast.error(result?.error || "Failed to save tracking config")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle demo action click (Scan, Verify, etc.)
  const handleDemoActionClick = () => {
    // ═══════════════════════════════════════════════════════════════════════════════════════════════
    // GUEST GATE: Show login modal instead of setup modal for guests
    // ═══════════════════════════════════════════════════════════════════════════════════════════════
    if (isGuest) {
      setShowLoginModal(true)
      return
    }
    openConfigModal(null)
  }

  // Handle real scan when not in demo mode
  const handleScan = async (keyword: string) => {
    // ═══════════════════════════════════════════════════════════════════════════════════════════════
    // GUEST GATE: Require login to run real scans
    // ═══════════════════════════════════════════════════════════════════════════════════════════════
    if (isGuest) {
      setShowLoginModal(true)
      toast.info("Create an account to run real scans", {
        description: "Get 5 free credits when you sign up!"
      })
      return
    }

    const trimmedKeyword = keyword.trim()
    if (!trimmedKeyword) {
      toast.error("Please enter a keyword or question")
      return
    }

    // In mock mode, use default values for testing
    const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
    
    if (!isMockMode && !selectedConfig) {
      toast.error("Please add a project first")
      openConfigModal(null)
      return
    }

    if (!isMockMode && (!selectedConfig?.trackedDomain || !selectedConfig?.brandKeywords?.[0])) {
      toast.error("Please complete your project settings")
      openConfigModal(selectedConfig || null)
      return
    }

    setIsScanning(true)
    
    try {
      const scanInput: RunScanInput = {
        keyword: trimmedKeyword,
        brandName: selectedConfig?.brandKeywords?.[0] || "BlogSpy",
        targetDomain: selectedConfig?.trackedDomain || "blogspy.io",
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
    // ═══════════════════════════════════════════════════════════════════════════════════════════════
    // GUEST GATE: Require login to track keywords
    // ═══════════════════════════════════════════════════════════════════════════════════════════════
    if (isGuest) {
      setShowAddKeywordModal(false)
      setShowLoginModal(true)
      toast.info("Create an account to track keywords", {
        description: "Get 5 free credits when you sign up!"
      })
      return
    }

    if (isDemoMode) {
      toast.error("Please configure your project first to track keywords")
      setShowAddKeywordModal(false)
      setShowSetupModal(true)
      return
    }

    if (!selectedConfig) {
      toast.error("Please configure your project first")
      setShowAddKeywordModal(false)
      openConfigModal(null)
      return
    }

    setIsAddingKeyword(true)
    try {
      const response = await addTrackedKeyword({
        keyword,
        category: category || "other",
        configId: selectedConfig.id,
      })

      // Handle SafeAction response structure
      if (response?.serverError) {
        toast.error(response.serverError)
        return
      }

      const result = response?.data
      if (result?.success) {
        toast.success(`Keyword "${keyword}" added successfully!`, {
          description: "It will be checked in the next scan.",
        })
        setShowAddKeywordModal(false)
        router.refresh()
      } else {
        toast.error(result?.error || "Failed to add keyword")
      }
    } catch (error) {
      toast.error("Failed to add keyword", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsAddingKeyword(false)
    }
  }

  // Loading state while checking config
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
        <DemoBanner 
          onSetupClick={() => isGuest ? setShowLoginModal(true) : openConfigModal(null)} 
          isGuest={isGuest}
        />
      )}

      {/* Main Dashboard */}
      <AIVisibilityDashboard 
        isDemoMode={isDemoMode}
        onDemoActionClick={handleDemoActionClick}
        onScan={handleScan}
        isScanning={isScanning}
        lastScanResult={lastScanResult}
        onAddKeyword={() => setShowAddKeywordModal(true)}
        citations={dashboardCitations || undefined}
        trendData={dashboardTrendData || undefined}
        configs={configs}
        selectedConfigId={selectedConfigId}
        onSelectConfig={(configId) => setSelectedConfigId(configId)}
        onAddConfig={() => openConfigModal(null)}
        onEditConfig={(config) => openConfigModal(config)}
        reportDomain={selectedConfig?.trackedDomain || (isDemoMode ? "example.com" : undefined)}
        isLoading={isDashboardLoading}
      />

      {/* Add Keyword Modal */}
      <AddKeywordModal
        open={showAddKeywordModal}
        onClose={() => setShowAddKeywordModal(false)}
        onAdd={handleAddKeyword}
        isAdding={isAddingKeyword}
      />

      <SetupConfigModal
        open={showConfigModal}
        onClose={() => {
          setShowConfigModal(false)
          setEditingConfig(null)
        }}
        onSave={handleSaveConfig}
        existingConfig={editingConfig}
        isSaving={isSavingConfig}
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
                openConfigModal(null)
              }}
              className="w-full sm:w-auto"
            >
              Setup My Project
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════════════════════════════
          LOGIN MODAL - Shown when guests try to perform gated actions
          ═══════════════════════════════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto p-3 rounded-full bg-primary/10 mb-2">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">Create an account to continue</DialogTitle>
            <DialogDescription className="text-center">
              Sign up to run real scans, track your keywords, and monitor your AI visibility across all platforms.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">5 Free Credits on Signup</span>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowLoginModal(false)}
              className="w-full sm:w-auto"
            >
              Continue Browsing
            </Button>
            <Button 
              onClick={() => router.push("/login?redirectTo=/dashboard/ai-visibility")}
              className="w-full sm:w-auto"
            >
              Sign Up / Login
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  )
}
