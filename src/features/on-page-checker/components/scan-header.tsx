"use client"

import { Search, Zap, Loader2, Target, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getScoreInfo, getScoreGradientColor, calculateRemainingTime } from "../utils/checker-utils"
import { URLValidator } from "./url-validator"

interface ScanHeaderProps {
  url: string
  onUrlChange: (url: string) => void
  targetKeyword: string
  onTargetKeywordChange: (keyword: string) => void
  isScanning: boolean
  scanComplete: boolean
  scanProgress: number
  score: number
  errorCount: number
  warningCount: number
  onScan: () => void
  onExport?: () => void
  urlError?: string
  urlInputRef?: React.RefObject<HTMLInputElement | null>
}

export function ScanHeader({
  url,
  onUrlChange,
  targetKeyword,
  onTargetKeywordChange,
  isScanning,
  scanComplete,
  scanProgress,
  score,
  errorCount,
  warningCount,
  onScan,
  onExport,
  urlError,
  urlInputRef,
}: ScanHeaderProps) {
  const scoreInfo = getScoreInfo(score)
  const gradientColors = getScoreGradientColor(score)

  return (
    <div className="border-b border-border bg-card/50 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
        {/* URL Input and Target Keyword */}
        <div className="flex-1 lg:max-w-2xl">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* URL Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={urlInputRef}
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="Enter URL to audit (e.g., https://myblog.com/seo-guide)"
                className="pl-10 bg-muted/50 border-border h-11"
                disabled={isScanning}
                aria-label="Enter website URL to analyze"
                aria-invalid={!!urlError}
                aria-describedby={urlError ? "url-error" : undefined}
              />
              <URLValidator url={url} error={urlError} />
            </div>
            {/* Target Keyword Input */}
            <div className="relative sm:w-64">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={targetKeyword}
                onChange={(e) => onTargetKeywordChange(e.target.value)}
                placeholder="Target keyword (optional)"
                className="pl-10 bg-muted/50 border-border h-11"
                disabled={isScanning}
              />
            </div>
            <Button
              onClick={onScan}
              disabled={isScanning}
              className="h-11 px-4 sm:px-6 w-auto self-start sm:self-auto bg-linear-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-medium shadow-lg shadow-cyan-500/20"
              aria-label={isScanning ? "Scanning in progress" : "Run SEO scan"}
              aria-busy={isScanning}
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning... ({calculateRemainingTime(scanProgress, 3)}s)
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Scan
                </>
              )}
            </Button>
          </div>
          
          {/* Progress Bar */}
          {isScanning && (
            <div className="mt-3">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-cyan-500 to-emerald-500 transition-all duration-100 ease-linear"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Analyzing page structure, meta tags, and content...
              </p>
            </div>
          )}
        </div>

        {/* Health Score Gauge */}
        {scanComplete && (
          <div className="flex items-center gap-3 sm:gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className={`relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-card shadow-xl ${scoreInfo.glow} shrink-0`}>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 264} 264`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={gradientColors.start} />
                    <stop offset="100%" stopColor={gradientColors.end} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl sm:text-2xl lg:text-3xl font-bold ${scoreInfo.color}`}>{score}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className={`text-sm sm:text-base lg:text-lg font-semibold ${scoreInfo.color} truncate`}>{scoreInfo.message}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{errorCount} errors, {warningCount} warnings</p>
              {onExport && (
                <button
                  onClick={onExport}
                  className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Export scan report as JSON"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Report
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
