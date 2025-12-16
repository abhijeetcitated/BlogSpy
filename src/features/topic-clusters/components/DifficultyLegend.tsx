"use client"

import { KD_DIFFICULTY_LEGEND } from "../constants"

export function DifficultyLegend() {
  return (
    <div className="hidden sm:block absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-2 sm:gap-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl px-3 sm:px-5 py-2 sm:py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg dark:shadow-zinc-950/50">
        <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">KD</span>
        <div className="w-px h-3 sm:h-4 bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex items-center gap-3 sm:gap-5">
          {KD_DIFFICULTY_LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 sm:gap-2">
              <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${item.color}`} />
              <span className="text-[10px] sm:text-xs font-medium text-zinc-700 dark:text-zinc-300">{item.label}</span>
              <span className="hidden md:inline text-[10px] text-zinc-400 dark:text-zinc-500">({item.range})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
