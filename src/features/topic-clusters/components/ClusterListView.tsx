"use client"

import { Badge } from "@/components/ui/badge"
import { ChevronDownIcon } from "@/components/icons/platform-icons"

interface ClusterData {
  id: string
  name: string
  fullName: string
  volume: string
  kd: number
  keywords: { keyword: string; volume: string }[]
}

interface ClusterListViewProps {
  clusters: ClusterData[]
  selectedCluster: ClusterData | null
  onSelectCluster: (cluster: ClusterData) => void
}

export function ClusterListView({ clusters, selectedCluster, onSelectCluster }: ClusterListViewProps) {
  if (clusters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 sm:py-12 px-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3 sm:mb-4">
          <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-8 sm:w-8 text-zinc-400 dark:text-zinc-500" fill="currentColor">
            <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-zinc-900 dark:text-white mb-1 sm:mb-2">No Clusters Found</h3>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-xs">
          Try adjusting your filters or search query to see more clusters.
        </p>
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-2 overflow-auto h-full">
      {clusters.map((cluster) => {
        const isSelected = selectedCluster?.id === cluster.id
        const kdColor = cluster.kd <= 30 ? 'emerald' : cluster.kd <= 60 ? 'amber' : 'red'
        
        return (
          <div
            key={cluster.id}
            onClick={() => onSelectCluster(cluster)}
            className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${
              isSelected
                ? "bg-violet-50 dark:bg-violet-500/10 border-violet-300 dark:border-violet-500/50 shadow-sm"
                : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 transition-all ${
                    isSelected 
                      ? "bg-linear-to-r from-violet-600 to-violet-500 shadow-lg shadow-violet-500/30" 
                      : `bg-${kdColor}-500`
                  }`}
                />
                <h3 className="text-sm sm:text-base font-medium text-zinc-900 dark:text-white truncate">{cluster.fullName}</h3>
              </div>
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isSelected ? "text-violet-600 dark:text-violet-400 -rotate-90" : "text-zinc-400 dark:text-zinc-500"
                }`}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 ml-4 sm:ml-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Vol:</span>
                <span className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">{cluster.volume}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">KD:</span>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    cluster.kd <= 30
                      ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                      : cluster.kd <= 60
                        ? "border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10"
                        : "border-red-500/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10"
                  }`}
                >
                  {cluster.kd}%
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Keywords:</span>
                <Badge variant="secondary" className="text-[10px] sm:text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {cluster.keywords.length}
                </Badge>
              </div>
            </div>
            
            {/* Show keywords preview when selected */}
            {isSelected && cluster.keywords.length > 0 && (
              <div className="mt-2 sm:mt-3 ml-4 sm:ml-6 pt-2 sm:pt-3 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {cluster.keywords.slice(0, 3).map((kw, idx) => (
                    <span key={idx} className="text-[10px] sm:text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-zinc-200 dark:border-zinc-700 truncate max-w-[120px] sm:max-w-none">
                      {kw.keyword}
                    </span>
                  ))}
                  {cluster.keywords.length > 3 && (
                    <span className="text-[10px] sm:text-xs text-violet-600 dark:text-violet-400 px-1.5 sm:px-2 py-0.5 sm:py-1">
                      +{cluster.keywords.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
