"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export type NLPTerm = {
  term: string
  used: boolean
  importance?: "primary" | "secondary"
}

export type NLPTermsPanelProps = {
  terms?: NLPTerm[]
  title?: string
}

export function NLPTermsPanel({
  terms = [],
  title = "NLP Terms",
}: NLPTermsPanelProps) {
  const usedCount = terms.reduce((acc, t) => (t.used ? acc + 1 : acc), 0)

  return (
    <Card className="p-3 bg-card/30 border border-border">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <Badge variant="outline" className="text-[10px] text-muted-foreground">
          {usedCount}/{terms.length} used
        </Badge>
      </div>

      {terms.length === 0 ? (
        <div className="mt-2 text-xs text-muted-foreground">No NLP terms available.</div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {terms.map((t, idx) => (
            <Badge
              // idx acceptable: deterministic display list with no stable IDs in stub
              key={`${t.term}_${idx}`}
              variant="outline"
              className={
                t.used
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-muted/40 border-border text-muted-foreground"
              }
              title={t.importance ? `Importance: ${t.importance}` : undefined}
            >
              {t.term}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  )
}
