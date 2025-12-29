"use client"

import { useState, useEffect } from "react"
import { AIVisibilityDashboard, SetupWizard } from "@/src/features/ai-visibility/components"
import { ErrorBoundary } from "@/components/common/error-boundary"
import { Button } from "@/components/ui/button"
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
  const [hasConfiguredProject, setHasConfiguredProject] = useState<boolean | null>(null)
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(true)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [showSetupWizard, setShowSetupWizard] = useState(false)

  // Check for existing config on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const config = JSON.parse(stored) as ProjectConfig
        setProjectConfig(config)
        setHasConfiguredProject(true)
        setIsDemoMode(false)
      } catch {
        setHasConfiguredProject(true)
        setIsDemoMode(true)
      }
    } else {
      // No config found - show demo mode
      setHasConfiguredProject(true)
      setIsDemoMode(true)
    }
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
