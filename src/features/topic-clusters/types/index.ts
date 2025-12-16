// Topic Clusters Types

export type ViewMode = "graph" | "list"
export type ColorMode = "kd" | "volume" | "intent"

export interface ClusterKeyword {
  keyword: string
  volume: string
}

export interface ClusterData {
  id: string
  name: string
  fullName: string
  volume: string
  kd: number
  keywords: ClusterKeyword[]
}

export interface RankingPotential {
  label: string
  color: string
  bg: string
  percent: number
}
