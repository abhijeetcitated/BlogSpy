"use client"

import { Type, ImageIcon, Link2, FileText, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTagClasses } from "../utils/checker-utils"
import type { PageStructureItem } from "../types"

interface PageStructureColumnProps {
  structure: PageStructureItem[]
}

function getTagIcon(tag: string) {
  switch (tag) {
    case "H1":
    case "H2":
    case "H3":
      return <Type className="h-3.5 w-3.5" />
    case "IMG":
      return <ImageIcon className="h-3.5 w-3.5" />
    case "A":
      return <Link2 className="h-3.5 w-3.5" />
    default:
      return <FileText className="h-3.5 w-3.5" />
  }
}

function getStatusIcon(status: "good" | "error" | "warning") {
  switch (status) {
    case "good":
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
    case "error":
      return <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
    case "warning":
      return <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
  }
}

export function PageStructureColumn({ structure }: PageStructureColumnProps) {
  return (
    <div className="col-span-3 border-r border-border bg-card/30 overflow-y-auto">
      <div className="p-2 sm:p-3 md:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-600 dark:text-cyan-400" />
          Page Structure
        </h3>
        <div className="space-y-0.5 sm:space-y-1">
          {structure.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 sm:gap-2 py-2 sm:py-1.5 px-1.5 sm:px-2 rounded-md hover:bg-muted/50 active:bg-muted transition-colors group touch-manipulation min-h-[44px] sm:min-h-0"
            >
              <div className="flex items-center gap-1">
                <div className="w-2 sm:w-3 h-px bg-muted-foreground/30" />
                <div
                  className={cn(
                    "flex items-center justify-center w-7 h-7 sm:w-6 sm:h-6 rounded text-xs font-mono font-medium shrink-0",
                    getTagClasses(item.tag)
                  )}
                >
                  {getTagIcon(item.tag)}
                </div>
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground truncate flex-1 font-mono">
                {item.content}
              </span>
              <div className="shrink-0">
                {getStatusIcon(item.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
