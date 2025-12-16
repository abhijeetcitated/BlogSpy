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
    <div className="border-t border-border bg-card/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-medium text-foreground">SERP Preview</span>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setPreviewDevice("desktop")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors",
              previewDevice === "desktop"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
            Desktop
          </button>
          <button
            onClick={() => setPreviewDevice("mobile")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors",
              previewDevice === "mobile"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </button>
        </div>
      </div>

      {/* Google-style preview */}
      <div
        className={cn(
          "bg-white dark:bg-zinc-900 rounded-lg p-4 mx-auto transition-all duration-300",
          previewDevice === "desktop" ? "max-w-2xl" : "max-w-sm"
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-linear-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
            <span className="text-xs text-white font-bold">B</span>
          </div>
          <div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{url}</p>
          </div>
        </div>
        <h3 className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-1 hover:underline cursor-pointer">
          {title}
        </h3>
        <p
          className={cn(
            "text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2",
            previewDevice === "mobile" && "text-xs"
          )}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
