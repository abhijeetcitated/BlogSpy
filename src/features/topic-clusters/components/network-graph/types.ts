// ============================================
// NETWORK GRAPH - Types
// ============================================

export interface ClusterData {
  id: string
  name: string
  fullName: string
  volume: string
  kd: number
  keywords: { keyword: string; volume: string }[]
}

export interface NodeColors {
  fill: string
  stroke: string
  glow: string
}

export interface BranchNode extends ClusterData {
  x: number
  y: number
  angle: number
  colors: NodeColors
}

export interface LeafNode {
  keyword: string
  volume: string
  branchId: string
  x: number
  y: number
}

// Get node color based on KD (0-30 Easy, 31-60 Medium, 61+ Hard)
export function getNodeColor(kd: number): NodeColors {
  if (kd <= 30) return { fill: "#10b981", stroke: "#34d399", glow: "#10b981" } // Green - Easy
  if (kd <= 60) return { fill: "#f59e0b", stroke: "#fbbf24", glow: "#f59e0b" } // Amber - Medium
  return { fill: "#ef4444", stroke: "#f87171", glow: "#ef4444" } // Red - Hard
}
