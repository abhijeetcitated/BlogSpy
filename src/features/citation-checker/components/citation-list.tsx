"use client"

import { QuoteIcon } from "@/components/icons/platform-icons"
import { Card, CardContent } from "@/components/ui/card"
import { CitationCard } from "./citation-card"
import type { Citation } from "../types"

interface CitationListProps {
  citations: Citation[]
  domain: string
}

export function CitationList({ citations, domain }: CitationListProps) {
  if (citations.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-8 text-center">
          <QuoteIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-medium text-foreground">No keywords found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or search query
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {citations.map((citation) => (
        <CitationCard key={citation.id} citation={citation} domain={domain} />
      ))}
    </div>
  )
}
