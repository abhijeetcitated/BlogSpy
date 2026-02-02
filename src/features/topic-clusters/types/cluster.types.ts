// ============================================
// TOPIC CLUSTER TYPES
// ============================================
// Types for topic cluster feature
// Matches topic-cluster-content.tsx
// ============================================

// View Mode
export type ClusterViewMode = "graph" | "list"

// Color Mode (for visualization)
export type ClusterColorMode = "kd" | "volume" | "intent"

// Cluster Keyword
export interface ClusterKeyword {
  keyword: string
  volume: string // formatted like "5K"
}

// Cluster Data
export interface ClusterData {
  id: string
  name: string
  fullName: string
  volume: string // formatted like "120K"
  kd: number
  keywords: ClusterKeyword[]
}

// Node Types (for graph visualization)
export type NodeType = "pillar" | "cluster" | "keyword"

// Graph Node
export interface GraphNode {
  id: string
  label: string
  type: NodeType
  volume?: number
  kd?: number
  status?: "published" | "draft" | "planned"
  x?: number
  y?: number
}

// Graph Edge
export interface GraphEdge {
  source: string
  target: string
  strength?: number
}

// Graph Data
export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// Cluster Stats
export interface ClusterStats {
  totalClusters: number
  totalKeywords: number
  totalVolume: number
  avgKd: number
  coverage: number // percentage
}

// Pillar Page
export interface PillarPage {
  id: string
  title: string
  url?: string
  status: "published" | "draft" | "planned"
  clusters: ClusterData[]
  totalVolume: number
  avgKd: number
}

// Cluster Suggestion
export interface ClusterSuggestion {
  id: string
  seedKeyword: string
  suggestedPillar: string
  estimatedClusters: number
  estimatedKeywords: number
  estimatedVolume: number
  confidence: number // 0-100
}
