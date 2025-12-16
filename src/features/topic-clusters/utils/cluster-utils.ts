// Topic Clusters Utility Functions

import type { ClusterData, RankingPotential } from "../types"

export function getRankingPotential(kd: number): RankingPotential {
  if (kd < 40) {
    return { label: "High", color: "text-emerald-400", bg: "bg-emerald-500", percent: 85 }
  }
  if (kd < 55) {
    return { label: "Medium", color: "text-amber-400", bg: "bg-amber-500", percent: 55 }
  }
  return { label: "Low", color: "text-red-400", bg: "bg-red-500", percent: 25 }
}

export function filterClusters(
  clusters: ClusterData[],
  showHighVolume: boolean,
  hideHardKD: boolean
): ClusterData[] {
  return clusters.filter((cluster) => {
    if (showHighVolume && Number.parseInt(cluster.volume.replace("K", "")) < 100) {
      return false
    }
    if (hideHardKD && cluster.kd >= 55) {
      return false
    }
    return true
  })
}

export function parseVolume(volume: string): number {
  return Number.parseInt(volume.replace("K", ""))
}
