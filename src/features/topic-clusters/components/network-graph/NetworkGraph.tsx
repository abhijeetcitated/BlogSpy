// ============================================
// NETWORK GRAPH - Main Component (Refactored)
// ============================================

"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { SvgDefs } from "./svg-defs"
import { CenterPillarNode } from "./center-pillar-node"
import { getNodeColor, type ClusterData, type BranchNode, type LeafNode } from "./types"

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

  // Calculate organic branch positions with slight randomness for natural feel
  const branchNodes = useMemo<BranchNode[]>(
    () =>
      clusters.map((cluster, idx) => {
        const baseAngle = (idx * 2 * Math.PI) / clusters.length - Math.PI / 2
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
  const leafNodes = useMemo<LeafNode[]>(
    () =>
      branchNodes.flatMap((branch, branchIdx) => {
        const leafCount = Math.min(branch.keywords.length, 5)
        const leafRadius = 55 * zoom

        return branch.keywords.slice(0, leafCount).map((kw, leafIdx) => {
          const spreadAngle = 0.6
          const baseLeafAngle = branch.angle - spreadAngle / 2 + (spreadAngle * leafIdx) / (leafCount - 1 || 1)
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
        <SvgDefs />

        {/* Connection lines from center to branches */}
        {branchNodes.map((branch) => {
          const selected = isSelected(branch.id)
          return (
            <g key={`line-${branch.id}`}>
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

        {/* Center Pillar Node */}
        <CenterPillarNode centerX={centerX} centerY={centerY} />
      </svg>
    </div>
  )
}
