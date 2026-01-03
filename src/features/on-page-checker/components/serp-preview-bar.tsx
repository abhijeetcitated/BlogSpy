"use client"

import { useState } from "react"
import { Eye, Monitor, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PreviewDevice } from "../types"

interface SERPPreviewBarProps {
  url: string
  title: string
  description: string
}

export function SERPPreviewBar({ url, title, description }: SERPPreviewBarProps) {
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop")

  return (
    <div className="border-t border-border bg-card/50 p-2 sm:p-3 md:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-cyan-400" />
          <span className="text-xs sm:text-sm font-medium text-foreground">SERP Preview</span>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/50 rounded-lg p-0.5 sm:p-1">
          <button
            onClick={() => setPreviewDevice("desktop")}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs transition-colors touch-manipulation min-h-[36px]",
              previewDevice === "desktop"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground active:scale-95"
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Desktop</span>
          </button>
          <button
            onClick={() => setPreviewDevice("mobile")}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs transition-colors touch-manipulation min-h-[36px]",
              previewDevice === "mobile"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground active:scale-95"
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Mobile</span>
          </button>
        </div>
      </div>

      {/* Google-style preview */}
      <div
        className={cn(
          "bg-white dark:bg-zinc-900 rounded-lg p-3 sm:p-4 mx-auto transition-all duration-300",
          previewDevice === "desktop" ? "max-w-2xl" : "max-w-sm"
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-linear-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shrink-0">
            <span className="text-[10px] sm:text-xs text-white font-bold">B</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 truncate">{url}</p>
          </div>
        </div>
        <h3 className="text-base sm:text-lg text-blue-600 dark:text-blue-400 font-medium mb-1 hover:underline cursor-pointer line-clamp-2">
          {title}
        </h3>
        <p
          className={cn(
            "text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2",
            previewDevice === "mobile" && "text-[11px] sm:text-xs"
          )}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
