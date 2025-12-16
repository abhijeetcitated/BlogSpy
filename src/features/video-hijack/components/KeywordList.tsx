"use client"

import type { VideoHijackKeyword } from "../types"
import { KeywordCard } from "./KeywordCard"

interface KeywordListProps {
  keywords: VideoHijackKeyword[]
}

export function KeywordList({ keywords }: KeywordListProps) {
  if (keywords.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No keywords match your filters. Try adjusting your search criteria.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {keywords.map((keyword) => (
        <KeywordCard key={keyword.id} keyword={keyword} />
      ))}
    </div>
  )
}
