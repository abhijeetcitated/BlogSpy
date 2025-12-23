"use client"

import { Sparkles, Pencil, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface AITipButtonProps {
  tip?: string
  onWrite: () => void
}

export function AITipButton({ tip, onWrite }: AITipButtonProps) {
  if (!tip) return <div className="w-8" />
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-lg bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/15">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-semibold text-sm text-purple-600 dark:text-purple-400">AI Suggestion</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {tip}
          </p>
          <div className="flex gap-2 pt-1">
            <Button 
              size="sm" 
              className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
              onClick={onWrite}
            >
              <Pencil className="w-3 h-3 mr-1.5" />
              Write Article
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs"
              onClick={() => {
                navigator.clipboard.writeText(tip)
                toast.success("✓ Copied to Clipboard", { 
                  description: "AI tip copied",
                  duration: 2000,
                })
              }}
            >
              <Copy className="w-3 h-3 mr-1.5" />
              Copy
            </Button>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
