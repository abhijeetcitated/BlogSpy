// ============================================
// CONTENT DECAY - Triage Header Component
// ============================================

import { Activity, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TriageHeaderProps {
  criticalCount: number
  totalTrafficAtRisk: number
  isAutoScheduling: boolean
  onAutoSchedule: () => void
}

export function TriageHeader({
  criticalCount,
  totalTrafficAtRisk,
  isAutoScheduling,
  onAutoSchedule,
}: TriageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6 rounded-xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 dark:from-red-950/40 dark:via-orange-950/30 dark:to-amber-950/20 border border-red-500/20 dark:border-red-900/30">
      <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
        <div className="relative shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-600 dark:text-red-400" />
          </div>
          {/* Pulse animation */}
          <div
            className="absolute inset-0 rounded-full bg-red-500/30 animate-ping"
            style={{ animationDuration: "2s" }}
          />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400">
            {criticalCount} Articles Critical
          </h1>
          <p className="text-amber-600/80 dark:text-amber-400/80 text-[11px] sm:text-xs lg:text-sm mt-0.5">
            You are risking{" "}
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              -{totalTrafficAtRisk.toLocaleString()} visits/mo
            </span>{" "}
            if not fixed.
          </p>
        </div>
      </div>
      <Button
        onClick={onAutoSchedule}
        disabled={isAutoScheduling}
        size="sm"
        className="w-auto ml-auto sm:ml-0 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white gap-1 sm:gap-2 shadow-lg shadow-amber-900/30 h-8 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base px-3 sm:px-4"
      >
        {isAutoScheduling ? (
          <>
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            <span className="hidden sm:inline">Processing...</span>
            <span className="sm:hidden">...</span>
          </>
        ) : (
          <>
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Auto-Schedule Refresh</span>
            <span className="sm:hidden">Schedule</span>
          </>
        )}
      </Button>
    </div>
  )
}
