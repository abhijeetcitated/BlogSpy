"use client"

import { Video, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  lastAnalyzed?: string
  onRefresh?: () => void
}

export function PageHeader({ lastAnalyzed, onRefresh }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Video className="w-6 h-6 text-red-500" />
          Video Hijack Analysis
        </h1>
        <p className="text-muted-foreground mt-1">
          Discover keywords where videos are stealing your organic clicks
        </p>
      </div>
      <div className="flex items-center gap-2">
        {lastAnalyzed && (
          <span className="text-xs text-muted-foreground">
            Last analyzed: {new Date(lastAnalyzed).toLocaleDateString()}
          </span>
        )}
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  )
}
