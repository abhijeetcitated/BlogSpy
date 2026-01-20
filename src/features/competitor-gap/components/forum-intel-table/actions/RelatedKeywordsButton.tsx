"use client"

import { Key, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { RelatedKeyword } from "../../../types"

interface RelatedKeywordsButtonProps {
  keywords: RelatedKeyword[]
  onCopyAll: () => void
}

export function RelatedKeywordsButton({ keywords, onCopyAll }: RelatedKeywordsButtonProps) {
  if (!keywords.length) return <div className="w-8" />

  const formatVolume = (vol: number) => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`
    return vol.toString()
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-lg bg-slate-500/10 dark:bg-slate-500/15 border border-slate-500/30 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20"
        >
          <Key className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-slate-500/15">
              <Key className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="font-semibold text-sm text-slate-600 dark:text-slate-400">Related Keywords</span>
          </div>
          <div className="space-y-1.5">
            {keywords.slice(0, 5).map((kw, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-muted rounded-md px-2 py-1.5">
                <span className="text-foreground font-medium">{kw.keyword}</span>
                <span className="text-muted-foreground ml-3 text-[10px]">
                  {formatVolume(kw.volume)}
                </span>
              </div>
            ))}
          </div>
          <Button 
            size="sm" 
            className="w-full h-7 text-xs bg-slate-600 hover:bg-slate-700 text-white"
            onClick={onCopyAll}
          >
            <Copy className="w-3 h-3 mr-1.5" />
            Copy All Keywords
          </Button>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
