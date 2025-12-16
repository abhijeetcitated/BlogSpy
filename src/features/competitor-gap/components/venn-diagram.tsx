"use client"

import type { GapStats } from "../types"

// ============================================
// VENN DIAGRAM - Visual Gap Summary
// ============================================

interface VennDiagramProps {
  stats: GapStats
}

/**
 * Venn Diagram showing overlap between your site and competitors
 */
export function VennDiagram({ stats }: VennDiagramProps) {
  return (
    <div className="relative w-48 h-32 flex-shrink-0">
      {/* Your circle */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
        <span className="text-[10px] font-medium text-emerald-400 text-center leading-tight">
          You
          <br />
          {stats.strong}
        </span>
      </div>
      
      {/* Competitor circle */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
        <span className="text-[10px] font-medium text-red-400 text-center leading-tight">
          Them
          <br />
          {stats.missing}
        </span>
      </div>
      
      {/* Overlap */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-purple-500/30 border-2 border-purple-500/50 flex items-center justify-center z-10">
        <span className="text-[10px] font-medium text-purple-300 text-center leading-tight">
          Both
          <br />
          {stats.shared}
        </span>
      </div>
    </div>
  )
}
