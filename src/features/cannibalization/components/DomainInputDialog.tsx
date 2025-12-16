"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Globe,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Server,
  Database,
  FileSearch,
  BarChart2,
} from "lucide-react"

// ============================================
// INTERFACES
// ============================================

interface DomainInputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanComplete: (domain: string) => void
}

type ScanStage = "idle" | "connecting" | "crawling" | "analyzing" | "complete" | "error"

interface ScanProgress {
  stage: ScanStage
  progress: number
  message: string
  pagesFound?: number
  issuesFound?: number
}

// ============================================
// SCAN STAGES CONFIG
// ============================================

const SCAN_STAGES: Record<ScanStage, { icon: React.ReactNode; color: string }> = {
  idle: { icon: <Globe className="h-5 w-5" />, color: "text-slate-400" },
  connecting: { icon: <Server className="h-5 w-5 animate-pulse" />, color: "text-cyan-400" },
  crawling: { icon: <FileSearch className="h-5 w-5 animate-pulse" />, color: "text-yellow-400" },
  analyzing: { icon: <Database className="h-5 w-5 animate-pulse" />, color: "text-purple-400" },
  complete: { icon: <CheckCircle2 className="h-5 w-5" />, color: "text-emerald-400" },
  error: { icon: <AlertCircle className="h-5 w-5" />, color: "text-red-400" },
}

// ============================================
// COMPONENT
// ============================================

export function DomainInputDialog({
  open,
  onOpenChange,
  onScanComplete,
}: DomainInputDialogProps) {
  const [domain, setDomain] = useState("")
  const [scanDepth, setScanDepth] = useState<"quick" | "standard" | "deep">("standard")
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    stage: "idle",
    progress: 0,
    message: "Enter your domain to start scanning",
  })

  // Validate domain
  const isValidDomain = (d: string) => {
    const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/
    return domainRegex.test(d)
  }

  // Simulate scanning process
  const handleStartScan = async () => {
    if (!domain || !isValidDomain(domain)) {
      toast.error("Please enter a valid domain")
      return
    }

    // Clean domain
    const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0]

    // Stage 1: Connecting
    setScanProgress({
      stage: "connecting",
      progress: 10,
      message: `Connecting to ${cleanDomain}...`,
    })
    await new Promise(r => setTimeout(r, 800))

    // Stage 2: Crawling
    setScanProgress({
      stage: "crawling",
      progress: 30,
      message: "Discovering pages...",
      pagesFound: 0,
    })

    // Simulate page discovery
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 400))
      setScanProgress(prev => ({
        ...prev,
        progress: 30 + (i * 10),
        pagesFound: (prev.pagesFound || 0) + Math.floor(Math.random() * 20) + 10,
      }))
    }

    // Stage 3: Analyzing
    setScanProgress({
      stage: "analyzing",
      progress: 80,
      message: "Analyzing keyword overlaps...",
      pagesFound: 127,
      issuesFound: 0,
    })

    // Simulate analysis
    for (let i = 0; i < 3; i++) {
      await new Promise(r => setTimeout(r, 600))
      setScanProgress(prev => ({
        ...prev,
        progress: 80 + (i * 5),
        issuesFound: (prev.issuesFound || 0) + Math.floor(Math.random() * 5) + 3,
      }))
    }

    // Stage 4: Complete
    setScanProgress({
      stage: "complete",
      progress: 100,
      message: "Scan complete!",
      pagesFound: 127,
      issuesFound: 23,
    })

    await new Promise(r => setTimeout(r, 1000))
    
    toast.success(`Found 23 cannibalization issues on ${cleanDomain}`)
    onScanComplete(cleanDomain)
    onOpenChange(false)

    // Reset state
    setScanProgress({
      stage: "idle",
      progress: 0,
      message: "Enter your domain to start scanning",
    })
  }

  const isScanning = scanProgress.stage !== "idle" && scanProgress.stage !== "error"
  const currentStage = SCAN_STAGES[scanProgress.stage]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Search className="h-5 w-5 text-cyan-400" />
            Analyze Domain
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter your website domain to detect cannibalization issues
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Domain Input */}
          <div className="space-y-2">
            <Label className="text-slate-300">Website Domain</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                disabled={isScanning}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            {domain && !isValidDomain(domain) && (
              <p className="text-xs text-red-400">Please enter a valid domain</p>
            )}
          </div>

          {/* Scan Depth */}
          <div className="space-y-2">
            <Label className="text-slate-300">Scan Depth</Label>
            <Select
              value={scanDepth}
              onValueChange={(v) => setScanDepth(v as typeof scanDepth)}
              disabled={isScanning}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="quick" className="text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">⚡</span>
                    Quick Scan (Top 50 pages)
                  </div>
                </SelectItem>
                <SelectItem value="standard" className="text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">🔍</span>
                    Standard (Top 200 pages)
                  </div>
                </SelectItem>
                <SelectItem value="deep" className="text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">🌐</span>
                    Deep Scan (All indexed pages)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {scanDepth === "quick" && "Fast scan focusing on your top-performing pages"}
              {scanDepth === "standard" && "Balanced scan covering most important content"}
              {scanDepth === "deep" && "Comprehensive scan of all indexed pages (may take longer)"}
            </p>
          </div>

          {/* Progress Section */}
          {isScanning && (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-4">
              {/* Current Stage */}
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-slate-800", currentStage.color)}>
                  {currentStage.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{scanProgress.message}</p>
                  <p className="text-xs text-slate-500 capitalize">{scanProgress.stage}...</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={scanProgress.progress} className="h-2 bg-slate-700" />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{scanProgress.progress}% complete</span>
                  {scanProgress.pagesFound && (
                    <span>{scanProgress.pagesFound} pages found</span>
                  )}
                </div>
              </div>

              {/* Stats */}
              {scanProgress.issuesFound !== undefined && (
                <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-700">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{scanProgress.pagesFound}</p>
                    <p className="text-xs text-slate-500">Pages Analyzed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-400">{scanProgress.issuesFound}</p>
                    <p className="text-xs text-slate-500">Issues Found</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          {!isScanning && (
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-cyan-400 mb-1">What we analyze</h4>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Pages ranking for the same keywords</li>
                    <li>• Title and meta description overlap</li>
                    <li>• Content similarity between pages</li>
                    <li>• Ranking fluctuations and traffic impact</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-slate-800 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isScanning}
            className="border-slate-700 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartScan}
            disabled={isScanning || !domain || !isValidDomain(domain)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <BarChart2 className="h-4 w-4 mr-2" />
                Start Analysis
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
