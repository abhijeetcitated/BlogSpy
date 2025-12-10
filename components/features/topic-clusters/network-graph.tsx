"use client"

import { useEffect, useRef, useState, useMemo } from "react"

interface ClusterData {
  id: string
  name: string
  fullName: string
  volume: string
  kd: number
  keywords: { keyword: string; volume: string }[]
}

interface NetworkGraphProps {
  clusters: ClusterData[]
  selectedCluster: ClusterData | null
  onSelectCluster: (cluster: ClusterData) => void
  colorMode?: "kd" | "volume" | "intent"
  zoom?: number
}

export function NetworkGraph({
  clusters,
  selectedCluster,
  onSelectCluster,
  colorMode = "kd",
  zoom = 1,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const centerX = dimensions.width / 2
  const centerY = dimensions.height / 2
  const branchRadius = Math.min(dimensions.width, dimensions.height) * 0.32 * zoom

  // Get node color based on KD
  const getNodeColor = (kd: number) => {
    if (kd < 40) return { fill: "#10b981", stroke: "#34d399", glow: "#10b981" } // Green - Easy
    if (kd < 55) return { fill: "#f59e0b", stroke: "#fbbf24", glow: "#f59e0b" } // Yellow - Medium
    return { fill: "#ef4444", stroke: "#f87171", glow: "#ef4444" } // Red - Hard
  }

  // Calculate organic branch positions with slight randomness for natural feel
  const branchNodes = useMemo(
    () =>
      clusters.map((cluster, idx) => {
        const baseAngle = (idx * 2 * Math.PI) / clusters.length - Math.PI / 2
        // Add slight variation for organic feel
        const angleVariation = Math.sin(idx * 1.5) * 0.1
        const radiusVariation = 1 + Math.cos(idx * 2.3) * 0.08
        const angle = baseAngle + angleVariation

        return {
          ...cluster,
          x: centerX + branchRadius * radiusVariation * Math.cos(angle),
          y: centerY + branchRadius * radiusVariation * Math.sin(angle),
          angle,
          colors: getNodeColor(cluster.kd),
        }
      }),
    [clusters, centerX, centerY, branchRadius],
  )

  // Generate leaf nodes with organic spread
  const leafNodes = useMemo(
    () =>
      branchNodes.flatMap((branch, branchIdx) => {
        const leafCount = Math.min(branch.keywords.length, 5)
        const leafRadius = 55 * zoom

        return branch.keywords.slice(0, leafCount).map((kw, leafIdx) => {
          const spreadAngle = 0.6
          const baseLeafAngle = branch.angle - spreadAngle / 2 + (spreadAngle * leafIdx) / (leafCount - 1 || 1)
          // Add organic variation
          const variation = Math.sin(leafIdx * 3 + branchIdx) * 0.15
          const leafAngle = baseLeafAngle + variation
          const radiusVar = 0.85 + Math.cos(leafIdx * 2) * 0.3

          return {
            ...kw,
            branchId: branch.id,
            x: branch.x + leafRadius * radiusVar * Math.cos(leafAngle),
            y: branch.y + leafRadius * radiusVar * Math.sin(leafAngle),
          }
        })
      }),
    [branchNodes, zoom],
  )

  const isSelected = (id: string) => selectedCluster?.id === id
  const isHovered = (id: string) => hoveredNode === id

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
        style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
      >
        <defs>
          {/* Glow filters for each color */}
          <filter id="glowGreen" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feFlood floodColor="#10b981" floodOpacity="0.6" result="glowColor" />
            <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
            <feMerge>
              <feMergeNode in="softGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowYellow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feFlood floodColor="#f59e0b" floodOpacity="0.6" result="glowColor" />
            <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
            <feMerge>
              <feMergeNode in="softGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowRed" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feFlood floodColor="#ef4444" floodOpacity="0.6" result="glowColor" />
            <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
            <feMerge>
              <feMergeNode in="softGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowPurple" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" result="coloredBlur" />
            <feFlood floodColor="#8b5cf6" floodOpacity="0.8" result="glowColor" />
            <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
            <feMerge>
              <feMergeNode in="softGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowSelected" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="15" result="coloredBlur" />
            <feFlood floodColor="#a78bfa" floodOpacity="1" result="glowColor" />
            <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
            <feMerge>
              <feMergeNode in="softGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for center node */}
          <radialGradient id="centerGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </radialGradient>

          {/* Animated pulse gradient */}
          <radialGradient id="pulseGradient">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4">
              <animate attributeName="stopOpacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Connection lines from center to branches - thin glowing lines */}
        {branchNodes.map((branch) => {
          const selected = isSelected(branch.id)
          return (
            <g key={`line-${branch.id}`}>
              {/* Glow line */}
              <line
                x1={centerX}
                y1={centerY}
                x2={branch.x}
                y2={branch.y}
                stroke={selected ? "#a78bfa" : "#8b5cf6"}
                strokeWidth={selected ? "3" : "1.5"}
                strokeOpacity={selected ? "0.8" : "0.3"}
                className="transition-all duration-300"
              />
              {/* Core line */}
              <line
                x1={centerX}
                y1={centerY}
                x2={branch.x}
                y2={branch.y}
                stroke={selected ? "#c4b5fd" : "#a78bfa"}
                strokeWidth={selected ? "1.5" : "0.5"}
                strokeOpacity={selected ? "1" : "0.5"}
                className="transition-all duration-300"
              />
            </g>
          )
        })}

        {/* Connection lines from branches to leaves */}
        {leafNodes.map((leaf, idx) => {
          const branch = branchNodes.find((b) => b.id === leaf.branchId)
          if (!branch) return null
          const selected = isSelected(branch.id)
          return (
            <line
              key={`leaf-line-${idx}`}
              x1={branch.x}
              y1={branch.y}
              x2={leaf.x}
              y2={leaf.y}
              stroke={selected ? branch.colors.stroke : "#6366f1"}
              strokeWidth="1"
              strokeOpacity={selected ? "0.6" : "0.2"}
              className="transition-all duration-300"
            />
          )
        })}

        {/* Leaf nodes (tiny dots) */}
        {leafNodes.map((leaf, idx) => {
          const branch = branchNodes.find((b) => b.id === leaf.branchId)
          const selected = branch ? isSelected(branch.id) : false
          return (
            <circle
              key={`leaf-${idx}`}
              cx={leaf.x}
              cy={leaf.y}
              r={selected ? "5" : "3"}
              fill={selected && branch ? branch.colors.fill : "#6366f1"}
              fillOpacity={selected ? "0.9" : "0.4"}
              className="transition-all duration-300"
            />
          )
        })}

        {/* Branch/Cluster nodes */}
        {branchNodes.map((branch) => {
          const selected = isSelected(branch.id)
          const hovered = isHovered(branch.id)
          const glowFilter = branch.kd < 40 ? "glowGreen" : branch.kd < 55 ? "glowYellow" : "glowRed"

          return (
            <g
              key={`branch-${branch.id}`}
              className="cursor-pointer"
              onClick={() => onSelectCluster(branch)}
              onMouseEnter={() => setHoveredNode(branch.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Selection/hover outer ring with glow */}
              {(selected || hovered) && (
                <>
                  <circle
                    cx={branch.x}
                    cy={branch.y}
                    r="48"
                    fill="none"
                    stroke={branch.colors.stroke}
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    className="animate-pulse"
                  />
                  <circle cx={branch.x} cy={branch.y} r="40" fill={branch.colors.glow} fillOpacity="0.15" />
                </>
              )}

              {/* Main node circle */}
              <circle
                cx={branch.x}
                cy={branch.y}
                r={selected ? "32" : hovered ? "30" : "26"}
                fill={selected || hovered ? branch.colors.fill : "#1e293b"}
                stroke={branch.colors.stroke}
                strokeWidth={selected ? "3" : "2"}
                filter={selected || hovered ? `url(#${glowFilter})` : undefined}
                className="transition-all duration-300"
              />

              {/* Label */}
              <text
                x={branch.x}
                y={branch.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="11"
                fontWeight="600"
                className="pointer-events-none select-none"
              >
                {branch.name}
              </text>
            </g>
          )
        })}

        {/* Center Pillar Node - Large pulsing gradient */}
        <g className="cursor-default">
          {/* Outer pulsing rings */}
          <circle cx={centerX} cy={centerY} r="85" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.2">
            <animate attributeName="r" values="85;95;85" dur="3s" repeatCount="indefinite" />
            <animate attributeName="strokeOpacity" values="0.2;0.05;0.2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx={centerX} cy={centerY} r="75" fill="none" stroke="#a78bfa" strokeWidth="1" strokeOpacity="0.15">
            <animate attributeName="r" values="75;82;75" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="strokeOpacity" values="0.15;0.05;0.15" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* Glow background */}
          <circle cx={centerX} cy={centerY} r="60" fill="url(#pulseGradient)" />

          {/* Main center node */}
          <circle
            cx={centerX}
            cy={centerY}
            r="52"
            fill="url(#centerGradient)"
            stroke="#c4b5fd"
            strokeWidth="3"
            filter="url(#glowPurple)"
          />

          {/* Inner highlight */}
          <circle cx={centerX - 12} cy={centerY - 12} r="20" fill="white" fillOpacity="0.1" />

          {/* Label */}
          <text
            x={centerX}
            y={centerY - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="13"
            fontWeight="700"
            className="pointer-events-none select-none"
          >
            Digital
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="13"
            fontWeight="700"
            className="pointer-events-none select-none"
          >
            Marketing
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-5 text-xs text-slate-400 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 shadow-lg shadow-violet-500/30" />
          <span>Pillar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-400" />
          <span>Easy KD</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-amber-400" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-400" />
          <span>Hard</span>
        </div>
      </div>
    </div>
  )
}
