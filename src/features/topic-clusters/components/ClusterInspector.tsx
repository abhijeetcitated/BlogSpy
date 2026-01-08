"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ClusterData } from "../types"
import { getRankingPotential } from "../utils/cluster-utils"

// Inline SVG Icons
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
)
const PenLineIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
)
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>
)
const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
)
const NetworkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
)
const CheckIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
)
const CopyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
)

interface ClusterInspectorProps {
  cluster: ClusterData
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export function ClusterInspector({ cluster, isOpen, onClose, onOpen }: ClusterInspectorProps) {
  const router = useRouter()
  const [isAddingToRoadmap, setIsAddingToRoadmap] = useState(false)
  const [isAddedToRoadmap, setIsAddedToRoadmap] = useState(false)
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null)
  
  const potential = getRankingPotential(cluster.kd)

  const handleAddToRoadmap = () => {
    setIsAddingToRoadmap(true)
    // Simulate API call
    setTimeout(() => {
      setIsAddingToRoadmap(false)
      setIsAddedToRoadmap(true)
      // Reset after 2 seconds
      setTimeout(() => setIsAddedToRoadmap(false), 2000)
    }, 1000)
  }

  const handleCopyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword)
    setCopiedKeyword(keyword)
    setTimeout(() => setCopiedKeyword(null), 1500)
  }
  
  // Navigate to AI Writer with cluster context
  const handleWriteContent = (keyword: string, volume: number, isPillar: boolean = false) => {
    const params = new URLSearchParams({
      source: "topic-clusters",
      keyword: keyword,
      volume: String(volume),
      difficulty: String(cluster.kd),
      type: isPillar ? "pillar" : "cluster",
      parent_pillar: cluster.name, // Parent cluster name
    })
    router.push(`/ai-writer?${params.toString()}`)
  }

  if (!isOpen) {
    return (
      <button
        onClick={onOpen}
        className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 md:right-6 z-20 p-2.5 sm:p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        title="Open Cluster Inspector"
      >
        <NetworkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    )
  }

  return (
    <div className="absolute inset-x-2 bottom-2 top-auto h-[55vh] sm:inset-auto sm:top-3 sm:bottom-3 sm:right-3 md:top-4 md:bottom-4 md:right-6 z-20 sm:w-[300px] md:w-[320px] lg:w-[340px] transition-all duration-300 ease-out">
      <div className="h-full flex flex-col bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-3 sm:p-3.5 md:p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2 h-2 rounded-full bg-linear-to-r from-violet-600 to-violet-500 animate-pulse" />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Cluster Inspector</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Close Panel"
            >
              <XIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-0.5">{cluster.name}</h2>
          <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">{cluster.fullName}</p>
        </div>

        {/* Metrics */}
        <div className="p-3 sm:p-3.5 md:p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-center border border-zinc-200 dark:border-zinc-700">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{cluster.volume}</span>
              <p className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 uppercase tracking-wider">Volume</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-center border border-zinc-200 dark:border-zinc-700">
              <span className={`text-lg sm:text-xl md:text-2xl font-bold ${
                cluster.kd <= 30 ? 'text-emerald-600 dark:text-emerald-400' : cluster.kd <= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
              }`}>{cluster.kd}%</span>
              <p className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 uppercase tracking-wider">KD</p>
            </div>
          </div>
        </div>

        {/* Ranking Potential */}
        <div className="px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Ranking Potential</span>
            <span className={`text-[10px] sm:text-xs font-bold ${potential.color}`}>{potential.label}</span>
          </div>
          <div className="h-2 sm:h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
            <div
              className={`h-full rounded-full transition-all duration-700 ${potential.bg}`}
              style={{ width: `${potential.percent}%` }}
            />
          </div>
        </div>

        {/* Keywords */}
        <div className="flex-1 p-3 sm:p-3.5 md:p-4 overflow-auto min-h-0">
          <div className="flex items-center justify-between mb-2 sm:mb-2.5">
            <span className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Keywords</span>
            <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 h-4 sm:h-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {cluster.keywords.length}
            </Badge>
          </div>
          <div className="space-y-1 sm:space-y-1.5">
            {cluster.keywords.map((kw) => (
              <div
                key={kw.keyword}
                className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] sm:text-xs text-zinc-900 dark:text-white truncate block font-medium">{kw.keyword}</span>
                  <span className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400">{kw.volume} monthly</span>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleCopyKeyword(kw.keyword)}
                    className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-violet-100 dark:bg-violet-500/20 hover:bg-violet-200 dark:hover:bg-violet-500/30 text-violet-600 dark:text-violet-400 transition-all"
                    title="Copy keyword"
                  >
                    {copiedKeyword === kw.keyword ? (
                      <CheckIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    ) : (
                      <CopyIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleWriteContent(kw.keyword, parseInt(kw.volume) || 0)}
                    className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-violet-100 dark:bg-violet-500/20 hover:bg-violet-200 dark:hover:bg-violet-500/30 text-violet-600 dark:text-violet-400 transition-all"
                    title="Write content"
                  >
                    <PenLineIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="p-2.5 sm:p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 shrink-0">
          <Button 
            onClick={handleAddToRoadmap}
            disabled={isAddingToRoadmap || isAddedToRoadmap}
            className={`w-full h-8 sm:h-9 md:h-10 font-semibold shadow-md transition-all text-[10px] sm:text-xs text-white ${
              isAddedToRoadmap 
                ? "bg-emerald-600 hover:bg-emerald-600 shadow-emerald-500/25" 
                : "bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 shadow-violet-500/25 hover:shadow-violet-500/40"
            }`}
          >
            {isAddingToRoadmap ? (
              <>
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Adding...
              </>
            ) : isAddedToRoadmap ? (
              <>
                <CheckIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                Added!
              </>
            ) : (
              <>
                <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                Add to Roadmap
                <ArrowRightIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
