"use client"

import { useState } from "react"
import {
  Network,
  List,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  PenLine,
  ArrowRight,
  Sparkles,
  X,
  Eye,
  EyeOff,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { NetworkGraph } from "@/components/network-graph"
import { ClusterListView } from "@/components/cluster-list-view"

type ViewMode = "graph" | "list"
type ColorMode = "kd" | "volume" | "intent"

interface ClusterData {
  id: string
  name: string
  fullName: string
  volume: string
  kd: number
  keywords: { keyword: string; volume: string }[]
}

const mockClusters: ClusterData[] = [
  {
    id: "seo",
    name: "SEO",
    fullName: "Search Engine Optimization",
    volume: "120K",
    kd: 45,
    keywords: [
      { keyword: "best seo tools", volume: "5K" },
      { keyword: "seo strategy guide", volume: "3.2K" },
      { keyword: "on-page seo checklist", volume: "2.8K" },
      { keyword: "technical seo audit", volume: "1.9K" },
      { keyword: "seo for beginners", volume: "4.5K" },
      { keyword: "local seo tips", volume: "2.1K" },
    ],
  },
  {
    id: "social",
    name: "Social Media",
    fullName: "Social Media Marketing",
    volume: "180K",
    kd: 38,
    keywords: [
      { keyword: "social media strategy", volume: "8K" },
      { keyword: "instagram marketing", volume: "6.5K" },
      { keyword: "linkedin for business", volume: "4.2K" },
      { keyword: "social media tools", volume: "3.8K" },
      { keyword: "content calendar", volume: "5.1K" },
    ],
  },
  {
    id: "email",
    name: "Email Marketing",
    fullName: "Email Marketing Automation",
    volume: "95K",
    kd: 52,
    keywords: [
      { keyword: "email marketing software", volume: "7K" },
      { keyword: "email automation", volume: "4.8K" },
      { keyword: "newsletter templates", volume: "3.5K" },
      { keyword: "email subject lines", volume: "2.9K" },
      { keyword: "drip campaigns", volume: "2.2K" },
    ],
  },
  {
    id: "content",
    name: "Content Strategy",
    fullName: "Content Marketing Strategy",
    volume: "55K",
    kd: 41,
    keywords: [
      { keyword: "content marketing", volume: "9K" },
      { keyword: "blog writing tips", volume: "3.2K" },
      { keyword: "content calendar template", volume: "2.8K" },
      { keyword: "storytelling in marketing", volume: "1.5K" },
    ],
  },
  {
    id: "ppc",
    name: "PPC",
    fullName: "Pay-Per-Click Advertising",
    volume: "88K",
    kd: 62,
    keywords: [
      { keyword: "google ads tips", volume: "6K" },
      { keyword: "ppc campaign setup", volume: "3.1K" },
      { keyword: "ad copywriting", volume: "2.4K" },
      { keyword: "landing page optimization", volume: "4.2K" },
    ],
  },
  {
    id: "analytics",
    name: "Analytics",
    fullName: "Marketing Analytics",
    volume: "72K",
    kd: 35,
    keywords: [
      { keyword: "google analytics setup", volume: "5.5K" },
      { keyword: "marketing metrics", volume: "2.8K" },
      { keyword: "conversion tracking", volume: "3.2K" },
      { keyword: "data visualization", volume: "4.1K" },
    ],
  },
]

export function TopicClusterContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isGenerated, setIsGenerated] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("graph")
  const [selectedCluster, setSelectedCluster] = useState<ClusterData | null>(mockClusters[0])
  const [zoom, setZoom] = useState(1)
  const [showHighVolume, setShowHighVolume] = useState(false)
  const [hideHardKD, setHideHardKD] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const handleGenerate = () => {
    setIsGenerated(true)
    setSelectedCluster(mockClusters[0])
  }

  const handleSelectCluster = (cluster: ClusterData) => {
    setSelectedCluster(cluster)
    setIsPanelOpen(true)
  }

  const getRankingPotential = (kd: number) => {
    if (kd < 40) return { label: "High", color: "text-emerald-400", bg: "bg-emerald-500", percent: 85 }
    if (kd < 55) return { label: "Medium", color: "text-amber-400", bg: "bg-amber-500", percent: 55 }
    return { label: "Low", color: "text-red-400", bg: "bg-red-500", percent: 25 }
  }

  const filteredClusters = mockClusters.filter((cluster) => {
    if (showHighVolume && Number.parseInt(cluster.volume.replace("K", "")) < 100) return false
    if (hideHardKD && cluster.kd >= 55) return false
    return true
  })

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep space background with engineering grid */}
      <div
        className="absolute inset-0 bg-slate-950"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient glow effects - larger and more dramatic */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-indigo-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Graph Canvas - Full Screen */}
      <div className="absolute inset-0">
        {!isGenerated ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mb-6 animate-pulse">
              <Network className="h-12 w-12 text-violet-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-3">Enter a topic to explore</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Discover content cluster opportunities with our AI-powered knowledge graph.
            </p>
          </div>
        ) : viewMode === "graph" ? (
          <NetworkGraph
            clusters={filteredClusters}
            selectedCluster={selectedCluster}
            onSelectCluster={handleSelectCluster}
            colorMode="kd"
            zoom={zoom}
          />
        ) : (
          <div className="p-6">
            <ClusterListView
              clusters={filteredClusters}
              selectedCluster={selectedCluster}
              onSelectCluster={handleSelectCluster}
            />
          </div>
        )}
      </div>

      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex items-center justify-between gap-4 bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-3 shadow-2xl">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search graph..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-slate-800/50 border-slate-700/50 focus:border-violet-500 focus:ring-violet-500/20 placeholder:text-slate-500 text-sm"
            />
          </div>

          {/* Filter Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHighVolume(!showHighVolume)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                showHighVolume
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              High Volume
            </button>
            <button
              onClick={() => setHideHardKD(!hideHardKD)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                hideHardKD
                  ? "bg-red-500/20 border-red-500/50 text-red-400"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200"
              }`}
            >
              <EyeOff className="h-3.5 w-3.5" />
              Hide Hard KD
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
            <button
              onClick={() => setViewMode("graph")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "graph"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              Graph
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "list"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            className="h-9 px-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Strategy
          </Button>
        </div>
      </div>

      {isGenerated && viewMode === "graph" && (
        <div className="absolute bottom-6 left-6 z-20">
          <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-xl rounded-xl p-1.5 border border-slate-700/50 shadow-2xl">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
              className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
              className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-slate-700 mx-1" />
            <button
              onClick={() => setZoom(1)}
              className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Fit to Screen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-slate-700 mx-1" />
            <span className="px-3 text-xs text-slate-400 font-mono">{Math.round(zoom * 100)}%</span>
          </div>
        </div>
      )}

      {isGenerated && viewMode === "graph" && (
        <div className="absolute bottom-6 right-6 z-20">
          <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl px-4 py-3 rounded-xl border border-slate-700/50 shadow-2xl">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Difficulty</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                <span className="text-xs text-slate-400">Easy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                <span className="text-xs text-slate-400">Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                <span className="text-xs text-slate-400">Hard</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isGenerated && selectedCluster && (
        <div
          className={`absolute top-20 bottom-6 right-6 z-20 transition-all duration-300 ease-out ${
            isPanelOpen ? "w-[340px] opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-8"
          }`}
        >
          <div className="h-full flex flex-col bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 animate-pulse" />
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Cluster Inspector</span>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{selectedCluster.name}</h2>
              <p className="text-sm text-slate-400">{selectedCluster.fullName}</p>
            </div>

            {/* Big Bold Metrics */}
            <div className="p-5 border-b border-slate-700/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <span className="text-3xl font-bold text-emerald-400">{selectedCluster.volume}</span>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Volume</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <span className="text-3xl font-bold text-white">{selectedCluster.kd}%</span>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">KD</p>
                </div>
              </div>
            </div>

            {/* Ranking Potential Meter */}
            <div className="px-5 py-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Ranking Potential</span>
                <span className={`text-sm font-bold ${getRankingPotential(selectedCluster.kd).color}`}>
                  {getRankingPotential(selectedCluster.kd).label}
                </span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getRankingPotential(selectedCluster.kd).bg}`}
                  style={{ width: `${getRankingPotential(selectedCluster.kd).percent}%` }}
                />
              </div>
            </div>

            {/* Keyword List - Scrollable */}
            <div className="flex-1 p-5 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Keywords</span>
                <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-300 px-2">
                  {selectedCluster.keywords.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {selectedCluster.keywords.map((kw, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-slate-200 truncate block font-medium">{kw.keyword}</span>
                      <span className="text-xs text-slate-500">{kw.volume} monthly</span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 transition-all">
                      <PenLine className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky Action Button */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
              <Button className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                Add Cluster to Roadmap
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Panel Toggle - When panel is closed */}
      {isGenerated && selectedCluster && !isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute top-1/2 -translate-y-1/2 right-6 z-20 p-3 bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl text-slate-400 hover:text-white transition-colors"
        >
          <Network className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
