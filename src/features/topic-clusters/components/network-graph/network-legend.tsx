// ============================================
// NETWORK GRAPH - Legend Component
// ============================================

export function NetworkLegend() {
  return (
    <div className="hidden sm:flex absolute bottom-2 sm:bottom-4 left-2 sm:left-4 items-center gap-3 sm:gap-5 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-linear-to-br from-violet-400 to-indigo-500 shadow-lg shadow-violet-500/30" />
        <span>Pillar</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-emerald-400" />
        <span>Easy</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 border-2 border-amber-400" />
        <span>Medium</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border-2 border-red-400" />
        <span>Hard</span>
      </div>
    </div>
  )
}
