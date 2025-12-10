"use client"

import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  return (
    <div className="p-4 space-y-2 overflow-auto h-full">
      {clusters.map((cluster) => {
        const isSelected = selectedCluster?.id === cluster.id
        return (
          <div
            key={cluster.id}
            onClick={() => onSelectCluster(cluster)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              isSelected
                ? "bg-violet-950/50 border-violet-500/50"
                : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isSelected ? "bg-gradient-to-r from-violet-500 to-indigo-500" : "bg-violet-700"
                  }`}
                />
                <h3 className="font-medium text-foreground">{cluster.fullName}</h3>
              </div>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  isSelected ? "text-violet-400 rotate-90" : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="flex items-center gap-4 ml-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Volume:</span>
                <span className="text-sm font-medium text-emerald-400">{cluster.volume}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">KD:</span>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    cluster.kd < 40
                      ? "border-emerald-500/50 text-emerald-400"
                      : cluster.kd < 60
                        ? "border-amber-500/50 text-amber-400"
                        : "border-red-500/50 text-red-400"
                  }`}
                >
                  {cluster.kd}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Keywords:</span>
                <span className="text-sm text-foreground">{cluster.keywords.length}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
