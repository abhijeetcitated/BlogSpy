"use client"

import { useState } from "react"
import {
  Globe,
  TrendingUp,
  Calendar,
  Monitor,
  Smartphone,
  Plus,
  PenTool,
  Target,
  AlertTriangle,
  Video,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// World Map Component
function WorldMap() {
  const countries = [
    { id: "us", name: "US", x: 85, y: 55, volume: "45K", glow: true },
    { id: "uk", name: "UK", x: 195, y: 42, glow: true },
    { id: "in", name: "IN", x: 280, y: 70, volume: "20K", glow: true },
  ]

  return (
    <svg viewBox="0 0 400 180" className="w-full h-32">
      {/* Simplified world map outline */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* North America */}
      <path
        d="M40,30 Q60,25 100,35 L120,55 Q100,80 70,90 L50,70 Z"
        fill="rgba(100,116,139,0.3)"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="0.5"
      />

      {/* South America */}
      <path
        d="M90,100 Q100,95 110,105 L105,140 Q95,155 85,145 L80,120 Z"
        fill="rgba(100,116,139,0.3)"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="0.5"
      />

      {/* Europe */}
      <path
        d="M175,30 Q200,25 220,35 L225,55 Q210,65 185,60 L175,45 Z"
        fill="rgba(100,116,139,0.3)"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="0.5"
      />

      {/* Africa */}
      <path
        d="M185,70 Q205,65 220,75 L225,120 Q210,145 190,140 L180,100 Z"
        fill="rgba(100,116,139,0.3)"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="0.5"
      />

      {/* Asia */}
      <path
        d="M230,30 Q280,20 330,40 L340,80 Q310,100 260,90 L240,60 Z"
        fill="rgba(100,116,139,0.3)"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="0.5"
      />

      {/* Australia */}
      <path
        d="M310,120 Q330,115 350,125 L355,145 Q340,155 320,150 L310,135 Z"
        fill="rgba(100,116,139,0.3)"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth="0.5"
      />

      {/* Glowing dots for highlighted countries */}
      {countries.map((country) => (
        <g key={country.id}>
          <circle cx={country.x} cy={country.y} r="8" fill="rgba(16,185,129,0.2)" filter="url(#glow)" />
          <circle cx={country.x} cy={country.y} r="4" fill="#10b981" className="animate-pulse" />
        </g>
      ))}
    </svg>
  )
}

// Radar Chart Component
function RadarChart() {
  const axes = [
    { label: "Informational", value: 0.85, angle: -90 },
    { label: "Transactional", value: 0.3, angle: 0 },
    { label: "Video", value: 0.7, angle: 90 },
    { label: "News", value: 0.4, angle: 180 },
  ]

  const centerX = 80
  const centerY = 80
  const maxRadius = 60

  // Calculate polygon points
  const points = axes.map((axis, i) => {
    const angleRad = ((axis.angle - 90) * Math.PI) / 180
    const r = axis.value * maxRadius
    return {
      x: centerX + r * Math.cos(angleRad),
      y: centerY + r * Math.sin(angleRad),
    }
  })

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ")

  return (
    <svg viewBox="0 0 160 160" className="w-full h-36">
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
          <stop offset="100%" stopColor="rgba(6,182,212,0.3)" />
        </linearGradient>
      </defs>

      {/* Grid circles */}
      {[0.25, 0.5, 0.75, 1].map((scale, i) => (
        <circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={maxRadius * scale}
          fill="none"
          stroke="rgba(148,163,184,0.2)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {axes.map((axis, i) => {
        const angleRad = ((axis.angle - 90) * Math.PI) / 180
        const endX = centerX + maxRadius * Math.cos(angleRad)
        const endY = centerY + maxRadius * Math.sin(angleRad)
        return (
          <line key={i} x1={centerX} y1={centerY} x2={endX} y2={endY} stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
        )
      })}

      {/* Data polygon */}
      <polygon points={polygonPoints} fill="url(#radarFill)" stroke="#10b981" strokeWidth="2" />

      {/* Data points */}
      {points.map((point, i) => (
        <circle key={i} cx={point.x} cy={point.y} r="4" fill="#10b981" />
      ))}

      {/* Labels */}
      {axes.map((axis, i) => {
        const angleRad = ((axis.angle - 90) * Math.PI) / 180
        const labelR = maxRadius + 18
        const x = centerX + labelR * Math.cos(angleRad)
        const y = centerY + labelR * Math.sin(angleRad)
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 text-[8px]">
            {axis.label}
          </text>
        )
      })}
    </svg>
  )
}

// Seasonality Bar Chart
function SeasonalityChart() {
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
  const values = [40, 45, 50, 60, 95, 85, 70, 65, 55, 50, 45, 42]
  const maxValue = Math.max(...values)
  const peakIndex = values.indexOf(maxValue)

  return (
    <div className="flex items-end gap-1 h-24 px-2">
      {months.map((month, i) => {
        const height = (values[i] / maxValue) * 100
        const isPeak = i === peakIndex
        return (
          <div key={i} className="flex flex-col items-center flex-1">
            <div
              className={`w-full rounded-t transition-all ${
                isPeak
                  ? "bg-gradient-to-t from-amber-500 to-amber-400 shadow-lg shadow-amber-500/30"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
              style={{ height: `${height}%` }}
            />
            <span className={`text-[9px] mt-1 ${isPeak ? "text-amber-400 font-semibold" : "text-slate-500"}`}>
              {month}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Area Chart for Search Trends
function TrendAreaChart() {
  const data = [30, 35, 40, 38, 45, 50, 55, 60, 58, 65, 70, 75, 80, 85, 90]
  const width = 300
  const height = 120
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * (height - 20) - 10
    return { x, y }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28">
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(16,185,129,0.4)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0)" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((_, i) => (
        <line
          key={i}
          x1="0"
          y1={height - (i * (height - 20)) / 4 - 10}
          x2={width}
          y2={height - (i * (height - 20)) / 4 - 10}
          stroke="rgba(148,163,184,0.1)"
          strokeWidth="1"
        />
      ))}

      <path d={areaPath} fill="url(#areaGradient)" />
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

      {/* End point */}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="#10b981" />
    </svg>
  )
}

export function KeywordOverviewContent() {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("mobile")

  const serpResults = [
    {
      rank: 1,
      title: "What are AI Agents? Complete Guide 2024",
      domain: "ibm.com",
      da: 92,
      backlinks: 245,
      wordCount: 3200,
      type: "Blog",
      isWeak: false,
    },
    {
      rank: 2,
      title: "AI Agents Explained - How They Work",
      domain: "microsoft.com",
      da: 96,
      backlinks: 189,
      wordCount: 2800,
      type: "Blog",
      isWeak: false,
    },
    {
      rank: 3,
      title: "Building AI Agents with LangChain",
      domain: "langchain.com",
      da: 78,
      backlinks: 156,
      wordCount: 4100,
      type: "Blog",
      isWeak: false,
    },
    {
      rank: 4,
      title: "r/MachineLearning - AI Agents Discussion",
      domain: "reddit.com",
      da: 91,
      backlinks: 12,
      wordCount: 850,
      type: "Forum",
      isWeak: true,
    },
    {
      rank: 5,
      title: "Top 10 AI Agent Frameworks",
      domain: "towardsdatascience.com",
      da: 85,
      backlinks: 98,
      wordCount: 2400,
      type: "Blog",
      isWeak: false,
    },
    {
      rank: 6,
      title: "AI Agents vs Chatbots: Key Differences",
      domain: "forbes.com",
      da: 94,
      backlinks: 67,
      wordCount: 1800,
      type: "Blog",
      isWeak: false,
    },
    {
      rank: 7,
      title: "What is an AI Agent? - Quora",
      domain: "quora.com",
      da: 89,
      backlinks: 8,
      wordCount: 620,
      type: "Forum",
      isWeak: true,
    },
    {
      rank: 8,
      title: "Autonomous AI Agents Tutorial",
      domain: "huggingface.co",
      da: 82,
      backlinks: 134,
      wordCount: 3600,
      type: "Blog",
      isWeak: false,
    },
    {
      rank: 9,
      title: "AI Agents in Enterprise Applications",
      domain: "gartner.com",
      da: 90,
      backlinks: 78,
      wordCount: 2100,
      type: "E-commerce",
      isWeak: false,
    },
    {
      rank: 10,
      title: "The Future of AI Agents",
      domain: "wired.com",
      da: 93,
      backlinks: 45,
      wordCount: 1950,
      type: "Blog",
      isWeak: false,
    },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">AI Agents</h1>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-sm font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
              Volume: 90K
            </span>
            <span className="px-3 py-1 text-sm font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
              KD: Hard (78%)
            </span>
            <span className="px-3 py-1 text-sm font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
              CPC: $4.50
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">
            <Plus className="w-4 h-4 mr-2" />
            Add to List
          </Button>
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25">
            <PenTool className="w-4 h-4 mr-2" />
            Write Article
          </Button>
        </div>
      </div>

      {/* Bento Grid - Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {/* Global Volume Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-medium text-slate-400">Global Interest</h3>
          </div>
          <WorldMap />
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇺🇸</span>
              <span className="text-white font-semibold">45K</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🇮🇳</span>
              <span className="text-white font-semibold">20K</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🇬🇧</span>
              <span className="text-white font-semibold">10K</span>
            </div>
          </div>
        </div>

        {/* Intent Profile Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-medium text-slate-400">Intent Profile</h3>
          </div>
          <RadarChart />
          <div className="flex items-center gap-2 mt-2 px-2 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Video className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-cyan-300">High Video Intent detected</span>
          </div>
        </div>

        {/* Trend Forecast Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-medium text-slate-400">Trend Forecast</h3>
          </div>
          <SeasonalityChart />
          <div className="flex items-center gap-2 mt-3 px-2 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-300">Peak in 3 months. Publish now to rank.</span>
          </div>
        </div>
      </div>

      {/* Search Trends Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-medium text-slate-400">Search Trends</h3>
          </div>
          <div className="flex items-center bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setDeviceView("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                deviceView === "desktop" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              onClick={() => setDeviceView("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                deviceView === "mobile" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
          </div>
        </div>
        <TrendAreaChart />
        <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300">82% searches are on Mobile. Keep intro short.</span>
        </div>
      </div>

      {/* SERP X-Ray Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Top 10 Competition Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">URL</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Authority
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Backlinks
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Word Count
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {serpResults.map((result) => (
                <tr
                  key={result.rank}
                  className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                    result.isWeak ? "bg-emerald-500/5" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        result.rank <= 3
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {result.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium truncate max-w-xs">{result.title}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        {result.domain}
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-sm font-medium ${
                        result.da >= 90 ? "text-emerald-400" : result.da >= 80 ? "text-blue-400" : "text-slate-400"
                      }`}
                    >
                      {result.da}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-slate-300">{result.backlinks}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-slate-300">{result.wordCount.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        result.type === "Forum"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : result.type === "E-commerce"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {result.type}
                      {result.isWeak && " ✓ Weak"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
