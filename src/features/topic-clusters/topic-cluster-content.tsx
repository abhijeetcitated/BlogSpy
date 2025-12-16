"use client"

import { useState, useMemo } from "react"
import type { ClusterData } from "./types"
import { MOCK_CLUSTERS } from "./constants"
import { filterClusters, getRankingPotential } from "./utils/cluster-utils"

// Circular Score
function CircularScore({ score }: { score: number }) {
  const radius = 36
  const strokeWidth = 6
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="88" height="88" className="transform -rotate-90">
          <circle cx="44" cy="44" r={radius} stroke="#27272a" strokeWidth={strokeWidth} fill="none" />
          <circle cx="44" cy="44" r={radius} stroke="#f97316" strokeWidth={strokeWidth} fill="none"
            strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}</span>
        </div>
      </div>
      <span className="text-[10px] text-zinc-500 mt-1">Cluster Score</span>
    </div>
  )
}

// Stat Card
function StatCard({ value, label, color = "white" }: { value: string | number; label: string; color?: string }) {
  const colorClass = color === "orange" ? "text-orange-500" : color === "green" ? "text-emerald-400" : color === "amber" ? "text-amber-400" : "text-white"
  return (
    <div className="text-center px-3 py-2">
      <div className={`text-lg sm:text-xl font-bold ${colorClass}`}>{value}</div>
      <div className="text-[10px] text-zinc-500 uppercase">{label}</div>
    </div>
  )
}

// Cluster Card
function ClusterCard({ cluster, isSelected, onClick }: { cluster: ClusterData; isSelected: boolean; onClick: () => void }) {
  const kdColor = cluster.kd <= 30 ? "bg-emerald-500" : cluster.kd <= 60 ? "bg-amber-500" : "bg-red-500"
  const kdLabel = cluster.kd <= 30 ? "Easy" : cluster.kd <= 60 ? "Medium" : "Hard"
  const potential = getRankingPotential(cluster.kd)
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isSelected 
          ? 'bg-zinc-800 border-orange-500/50 ring-1 ring-orange-500/20' 
          : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{cluster.name}</h3>
          <p className="text-xs text-zinc-500 truncate mt-0.5">{cluster.fullName}</p>
        </div>
        <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-medium ${kdColor} text-white`}>
          {kdLabel}
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
          <div className="text-sm font-bold text-white">{cluster.keywords.length}</div>
          <div className="text-[9px] text-zinc-500">Keywords</div>
        </div>
        <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
          <div className="text-sm font-bold text-emerald-400">{cluster.volume}</div>
          <div className="text-[9px] text-zinc-500">Volume</div>
        </div>
        <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
          <div className={`text-sm font-bold ${cluster.kd <= 30 ? 'text-emerald-400' : cluster.kd <= 60 ? 'text-amber-400' : 'text-red-400'}`}>
            {cluster.kd}%
          </div>
          <div className="text-[9px] text-zinc-500">KD</div>
        </div>
        <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
          <div className={`text-sm font-bold ${potential.color}`}>{potential.label}</div>
          <div className="text-[9px] text-zinc-500">Potential</div>
        </div>
      </div>
    </button>
  )
}

export function TopicClusterContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCluster, setSelectedCluster] = useState<ClusterData | null>(MOCK_CLUSTERS[0])
  const [showHighVolume, setShowHighVolume] = useState(false)
  const [hideHardKD, setHideHardKD] = useState(false)

  const filteredClusters = useMemo(() => {
    const baseFiltered = filterClusters(MOCK_CLUSTERS, showHighVolume, hideHardKD)
    if (!searchQuery.trim()) return baseFiltered
    const query = searchQuery.toLowerCase()
    return baseFiltered.filter(cluster => 
      cluster.name.toLowerCase().includes(query) || cluster.fullName.toLowerCase().includes(query)
    )
  }, [showHighVolume, hideHardKD, searchQuery])

  const stats = useMemo(() => {
    const clusters = filteredClusters
    const totalKeywords = clusters.reduce((sum, c) => sum + c.keywords.length, 0)
    const totalVolume = clusters.reduce((sum, c) => parseFloat(c.volume.replace('K', '')) + sum, 0)
    const avgKd = clusters.length > 0 ? Math.round(clusters.reduce((sum, c) => sum + c.kd, 0) / clusters.length) : 0
    const easyCount = clusters.filter(c => c.kd <= 30).length
    const mediumCount = clusters.filter(c => c.kd > 30 && c.kd <= 60).length
    const hardCount = clusters.filter(c => c.kd > 60).length
    const score = Math.round((easyCount * 100 + mediumCount * 60 + hardCount * 20) / Math.max(clusters.length, 1))
    return { totalKeywords, totalVolume: `${Math.round(totalVolume)}K`, avgKd, easyCount, mediumCount, hardCount, score }
  }, [filteredClusters])

  const selectedPotential = selectedCluster ? getRankingPotential(selectedCluster.kd) : null

  return (
    <div className="h-full flex flex-col bg-zinc-950 overflow-hidden">
      {/* Header Stats */}
      <div className="shrink-0 p-4 sm:p-6 border-b border-zinc-800">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
          {/* Score + Stats */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 lg:pb-0">
            <CircularScore score={stats.score} />
            <div className="flex items-center gap-2 sm:gap-4">
              <StatCard value={filteredClusters.length} label="Clusters" />
              <StatCard value={stats.totalKeywords} label="Keywords" />
              <StatCard value={stats.totalVolume} label="Volume" color="green" />
              <StatCard value={`${stats.avgKd}%`} label="Avg KD" color="orange" />
            </div>
          </div>
          
          {/* Opportunities */}
          <div className="flex items-center gap-2 lg:ml-auto">
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {stats.easyCount} Easy
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {stats.mediumCount} Medium
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
              {stats.hardCount} Hard
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="shrink-0 p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search clusters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHighVolume(!showHighVolume)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              showHighVolume ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            High Volume
          </button>
          <button
            onClick={() => setHideHardKD(!hideHardKD)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              hideHardKD ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Hide Hard KD
          </button>
          <span className="px-3 py-2 bg-zinc-800 rounded-lg text-xs text-zinc-400">
            {filteredClusters.length} clusters
          </span>
        </div>
      </div>

      {/* Main Content - 2 Column */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Clusters Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredClusters.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                isSelected={selectedCluster?.id === cluster.id}
                onClick={() => setSelectedCluster(cluster)}
              />
            ))}
          </div>
          
          {filteredClusters.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-1">No clusters found</h3>
              <p className="text-sm text-zinc-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Selected Cluster Panel */}
        {selectedCluster && (
          <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-900/30 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Selected</span>
                <button onClick={() => setSelectedCluster(null)} className="text-zinc-500 hover:text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              <h2 className="text-xl font-bold text-white">{selectedCluster.name}</h2>
              <p className="text-xs text-zinc-500 mt-1">{selectedCluster.fullName}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 p-4 border-b border-zinc-800">
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">{selectedCluster.keywords.length}</div>
                <div className="text-[10px] text-zinc-500">Keywords</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-emerald-400">{selectedCluster.volume}</div>
                <div className="text-[10px] text-zinc-500">Volume</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold ${selectedCluster.kd <= 30 ? 'text-emerald-400' : selectedCluster.kd <= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {selectedCluster.kd}%
                </div>
                <div className="text-[10px] text-zinc-500">Difficulty</div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className={`text-xl font-bold ${selectedPotential?.color}`}>{selectedPotential?.label}</div>
                <div className="text-[10px] text-zinc-500">Potential</div>
              </div>
            </div>

            {/* Keywords */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase">Keywords ({selectedCluster.keywords.length})</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {selectedCluster.keywords.map((kw, idx) => (
                  <div key={idx} className="px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <div className="text-sm text-white">{kw.keyword}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{kw.volume} vol</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="p-4 border-t border-zinc-800">
              <button className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add to Roadmap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
