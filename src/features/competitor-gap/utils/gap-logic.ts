// ============================================
// COMPETITOR GAP - Core Logic
// ============================================

export type GapClassification = "missing" | "weak" | "strong" | "shared"

export function classifyGap(
  myRank: number | null | undefined,
  compRanks: Array<number | null | undefined>
): GapClassification {
  const myRankValue = Number.isFinite(myRank) ? Number(myRank) : null
  const validCompRanks = compRanks
    .map((rank) => (Number.isFinite(rank) ? Number(rank) : null))
    .filter((rank): rank is number => rank !== null)
  const bestCompRank = validCompRanks.length > 0 ? Math.min(...validCompRanks) : null

  if (myRankValue === null && bestCompRank !== null && bestCompRank <= 20) {
    return "missing"
  }

  if (myRankValue !== null && bestCompRank !== null) {
    if (myRankValue > bestCompRank + 5) {
      return "weak"
    }

    if (myRankValue < bestCompRank - 5) {
      return "strong"
    }
  }

  return "shared"
}

export function calculateTrafficPotential(volume: number, rank: number | null | undefined): number {
  const rankValue = Number.isFinite(rank) ? Number(rank) : null
  if (rankValue === null) return 0

  const ctrMap: Record<number, number> = {
    1: 0.30,
    2: 0.18,
    3: 0.12,
    4: 0.08,
    5: 0.06,
    6: 0.05,
    7: 0.04,
    8: 0.03,
    9: 0.025,
    10: 0.02,
  }

  const ctr = ctrMap[rankValue as keyof typeof ctrMap] ?? 0.01
  return Math.max(0, Math.round(volume * ctr))
}

export function calculateOpportunityScore(volume: number, kd: number): number {
  const safeVolume = Number.isFinite(volume) ? Math.max(0, Number(volume)) : 0
  const safeKd = Number.isFinite(kd) ? Math.max(0, Math.min(100, Number(kd))) : 0
  const kdWeight = Math.max(0, Math.min(1, 1 - safeKd / 100))
  return Math.round(safeVolume * kdWeight)
}
