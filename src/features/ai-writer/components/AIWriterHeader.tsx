/**
 * AIWriterHeader - Header Component for AI Writer
 * 
 * This component handles:
 * - Desktop & Mobile header layouts
 * - Live stats display (words, headings, images, reading time)
 * - Save status indicator
 * - SEO score display
 * - Export dropdown menu
 * - Checkpoint button
 * - AI Tools panel integration
 * 
 * Industry Standard: Single Responsibility Principle
 */

"use client"

import React from "react"
import { 
  ChevronLeft, 
  FileText, 
  Hash, 
  ImageIcon, 
  Clock,
  Loader2,
  CheckCircle2,
  History,
  Rocket,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { SEOScoreGauge } from "../components/seo-score-gauge"
import { AIToolsPanel } from "../components/ai-tools-panel"
import type { EditorStats, WriterContext } from "../types"

// Local ReadabilityScore type to match original usage
interface ReadabilityScoreLocal {
  fleschKincaid: number
  gradeLevel: string
  readingTime: number
  issues: string[]
}

// ============================================
// TYPES
// ============================================

export interface AIWriterHeaderProps {
  // Context
  writerContext: WriterContext | null
  
  // Editor Stats
  editorStats: EditorStats
  readabilityScore: ReadabilityScoreLocal | null
  seoScore: number
  
  // Save State
  isSaving: boolean
  hasUnsavedChanges: boolean
  lastSaved: Date | null
  
  // Export State
  isExporting: boolean
  showExportMenu: boolean
  setShowExportMenu: (show: boolean) => void
  
  // Target Keyword
  targetKeyword: string
  
  // Handlers
  onBack: () => void
  onExport: (format: 'html' | 'markdown' | 'wordpress' | 'json') => void
  onSaveVersion: () => void
}

// ============================================
// COMPONENT
// ============================================

export function AIWriterHeader({
  writerContext,
  editorStats,
  readabilityScore,
  seoScore,
  isSaving,
  hasUnsavedChanges,
  lastSaved,
  isExporting,
  showExportMenu,
  setShowExportMenu,
  targetKeyword,
  onBack,
  onExport,
  onSaveVersion,
}: AIWriterHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-border/50 bg-background/95 backdrop-blur-xl shadow-sm min-w-0 overflow-x-auto">
      {/* Left Section: Navigation & Title */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="gap-1 sm:gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 px-1.5 sm:px-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">
            {writerContext?.source && writerContext.source !== "direct" 
              ? `Back to ${writerContext.source.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}`
              : "Back"
            }
          </span>
        </Button>
      </div>

      {/* Center Section: Live Stats */}
      <LiveStatsDisplay 
        editorStats={editorStats} 
        readabilityScore={readabilityScore} 
      />

      {/* Right Section: Actions - Desktop (Full) */}
      <DesktopActions
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSaved={lastSaved}
        seoScore={seoScore}
        editorStats={editorStats}
        targetKeyword={targetKeyword}
        isExporting={isExporting}
        showExportMenu={showExportMenu}
        setShowExportMenu={setShowExportMenu}
        onExport={onExport}
        onSaveVersion={onSaveVersion}
      />
      
      {/* Right Section: Mobile Only - Saved, SEO, Export */}
      <MobileActions
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSaved={lastSaved}
        seoScore={seoScore}
        isExporting={isExporting}
        showExportMenu={showExportMenu}
        setShowExportMenu={setShowExportMenu}
      />
    </header>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface LiveStatsDisplayProps {
  editorStats: EditorStats
  readabilityScore: ReadabilityScoreLocal | null
}

function LiveStatsDisplay({ editorStats, readabilityScore }: LiveStatsDisplayProps) {
  return (
    <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted/40 border border-border/50">
      <div className="flex items-center gap-1.5 px-2">
        <FileText className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-xs font-medium text-foreground">{editorStats.wordCount.toLocaleString()}</span>
        <span className="text-[10px] text-muted-foreground">words</span>
      </div>
      <div className="h-3 w-px bg-border/60" />
      <div className="flex items-center gap-1.5 px-2">
        <Hash className="h-3.5 w-3.5 text-purple-500" />
        <span className="text-xs font-medium text-foreground">
          {editorStats.headingCount.h1 + editorStats.headingCount.h2 + editorStats.headingCount.h3}
        </span>
        <span className="text-[10px] text-muted-foreground">headings</span>
      </div>
      <div className="h-3 w-px bg-border/60" />
      <div className="flex items-center gap-1.5 px-2">
        <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-xs font-medium text-foreground">{editorStats.imageCount}</span>
        <span className="text-[10px] text-muted-foreground">images</span>
      </div>
      {readabilityScore && (
        <>
          <div className="h-3 w-px bg-border/60" />
          <div className="flex items-center gap-1.5 px-2">
            <Clock className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-xs font-medium text-foreground">{readabilityScore.readingTime}</span>
            <span className="text-[10px] text-muted-foreground">min</span>
          </div>
        </>
      )}
    </div>
  )
}

interface DesktopActionsProps {
  isSaving: boolean
  hasUnsavedChanges: boolean
  lastSaved: Date | null
  seoScore: number
  editorStats: EditorStats
  targetKeyword: string
  isExporting: boolean
  showExportMenu: boolean
  setShowExportMenu: (show: boolean) => void
  onExport: (format: 'html' | 'markdown' | 'wordpress' | 'json') => void
  onSaveVersion: () => void
}

function DesktopActions({
  isSaving,
  hasUnsavedChanges,
  lastSaved,
  seoScore,
  editorStats,
  targetKeyword,
  isExporting,
  showExportMenu,
  setShowExportMenu,
  onExport,
  onSaveVersion,
}: DesktopActionsProps) {
  return (
    <div className="hidden lg:flex items-center gap-3 shrink-0">
      {/* Save Status Indicator */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center justify-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-colors",
              isSaving 
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                : hasUnsavedChanges 
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            )}>
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Unsaved</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Saved</span>
                </>
              ) : null}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {lastSaved 
              ? `Last saved: ${lastSaved.toLocaleTimeString()}`
              : 'Not saved yet'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* SEO Score */}
      <SEOScoreGauge score={seoScore} />
      
      {/* AI Tools Panel Button */}
      <AIToolsPanel 
        content={editorStats.content}
        targetKeyword={targetKeyword}
        onToolSelect={(toolId: string) => console.log('Selected tool:', toolId)}
      />
      
      {/* Checkpoint Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveVersion}
              className="h-8 gap-1.5 px-3"
            >
              <History className="h-4 w-4 text-purple-500" />
              <span className="text-xs">Checkpoint</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Create Version Checkpoint</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Export Button with Dropdown */}
      <ExportDropdown
        isExporting={isExporting}
        showExportMenu={showExportMenu}
        setShowExportMenu={setShowExportMenu}
        onExport={onExport}
        size="desktop"
      />
    </div>
  )
}

interface MobileActionsProps {
  isSaving: boolean
  hasUnsavedChanges: boolean
  lastSaved: Date | null
  seoScore: number
  isExporting: boolean
  showExportMenu: boolean
  setShowExportMenu: (show: boolean) => void
}

function MobileActions({
  isSaving,
  hasUnsavedChanges,
  lastSaved,
  seoScore,
  isExporting,
  showExportMenu,
  setShowExportMenu,
}: MobileActionsProps) {
  return (
    <div className="flex lg:hidden items-center gap-4 shrink-0">
      {/* Save Status - Mobile */}
      <div className={cn(
        "flex items-center justify-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-medium",
        isSaving 
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
          : hasUnsavedChanges 
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      )}>
        {isSaving ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : hasUnsavedChanges ? (
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        ) : lastSaved ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : null}
      </div>
      
      {/* SEO Score - Mobile */}
      <SEOScoreGauge score={seoScore} />
      
      {/* Export Button - Mobile */}
      <div className="relative">
        <Button
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={isExporting}
          size="sm"
          className="h-7 gap-1.5 px-2.5 bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-md shadow-emerald-500/20 border-0"
        >
          {isExporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Rocket className="h-3.5 w-3.5" />
          )}
          <span className="text-xs">Export</span>
        </Button>
      </div>
    </div>
  )
}

interface ExportDropdownProps {
  isExporting: boolean
  showExportMenu: boolean
  setShowExportMenu: (show: boolean) => void
  onExport: (format: 'html' | 'markdown' | 'wordpress' | 'json') => void
  size: 'desktop' | 'mobile'
}

function ExportDropdown({
  isExporting,
  showExportMenu,
  setShowExportMenu,
  onExport,
  size,
}: ExportDropdownProps) {
  const handleExport = (format: 'html' | 'markdown' | 'wordpress' | 'json') => {
    setShowExportMenu(false)
    onExport(format)
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowExportMenu(!showExportMenu)}
        disabled={isExporting}
        size="sm"
        className={cn(
          "bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-md shadow-emerald-500/20 border-0",
          size === "desktop" ? "h-8 gap-1.5 px-3" : "h-7 gap-1.5 px-2.5"
        )}
      >
        {isExporting ? (
          <Loader2 className={cn("animate-spin", size === "desktop" ? "h-4 w-4" : "h-3.5 w-3.5")} />
        ) : (
          <Rocket className={size === "desktop" ? "h-4 w-4" : "h-3.5 w-3.5"} />
        )}
        <span>Export</span>
      </Button>
      
      {showExportMenu && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-popover/95 backdrop-blur-lg border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-1">
            <button
              onClick={() => handleExport('html')}
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-lg flex items-center gap-2.5 transition-colors"
            >
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Copy HTML</p>
                <p className="text-[10px] text-muted-foreground">Copy to clipboard</p>
              </div>
            </button>
            <button
              onClick={() => handleExport('markdown')}
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-lg flex items-center gap-2.5 transition-colors"
            >
              <div className="p-1.5 rounded-md bg-purple-500/10">
                <Download className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">Markdown</p>
                <p className="text-[10px] text-muted-foreground">Download .md file</p>
              </div>
            </button>
            <button
              onClick={() => handleExport('wordpress')}
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-lg flex items-center gap-2.5 transition-colors"
            >
              <div className="p-1.5 rounded-md bg-cyan-500/10">
                <Download className="h-4 w-4 text-cyan-500" />
              </div>
              <div>
                <p className="font-medium">WordPress</p>
                <p className="text-[10px] text-muted-foreground">Export JSON format</p>
              </div>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-lg flex items-center gap-2.5 transition-colors"
            >
              <div className="p-1.5 rounded-md bg-emerald-500/10">
                <Download className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium">JSON Data</p>
                <p className="text-[10px] text-muted-foreground">Full article data</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIWriterHeader
