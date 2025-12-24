"use client"

import { cn } from "@/lib/utils"
import { type AICitationSource } from "@/types/ai-overview.types"
import { Badge } from "@/components/ui/badge"
import {
  ExternalLink,
  Clock,
  FileText,
  Video,
  MessageSquare,
  Newspaper,
  ShoppingBag,
  Book,
  Globe,
  Share2,
  Image,
  File,
  Shield,
} from "lucide-react"

// ============================================
// CITATION SOURCE CARD
// ============================================

export interface CitationSourceCardProps {
  source: AICitationSource
  className?: string
}

const contentTypeIcons = {
  article: FileText,
  video: Video,
  forum: MessageSquare,
  news: Newspaper,
  product: ShoppingBag,
  documentation: Book,
  wikipedia: Globe,
  social: Share2,
  pdf: FileText,
  image: Image,
  unknown: File,
}

export function CitationSourceCard({ source, className }: CitationSourceCardProps) {
  const Icon = contentTypeIcons[source.contentType]
  
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
      source.isWeakSource 
        ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50" 
        : "bg-card border-border hover:border-border/80",
      className
    )}>
      {/* Position & Icon */}
      <div className="flex flex-col items-center gap-1">
        <span className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
          source.isWeakSource ? "bg-amber-500/30 text-amber-600 dark:text-amber-300" : "bg-muted text-muted-foreground"
        )}>
          {source.position}
        </span>
        <Icon className={cn(
          "h-4 w-4",
          source.isWeakSource ? "text-amber-500 dark:text-amber-400" : "text-muted-foreground"
        )} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{source.title}</p>
            <p className="text-xs text-muted-foreground truncate">{source.domain}</p>
          </div>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            DA: {source.domainAuthority}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {source.contentAge}d ago
          </span>
          {source.wordCount && source.wordCount > 0 && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {source.wordCount.toLocaleString()} words
            </span>
          )}
        </div>

        {/* Weak Source Badge */}
        {source.isWeakSource && (
          <Badge variant="outline" className="mt-2 bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
            ⚠️ Weak Source - Opportunity to Outrank
          </Badge>
        )}
      </div>
    </div>
  )
}
