"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

export type HighlightSettingsValue = {
  highlightNlpTerms: boolean
  highlightHeadings: boolean
  highlightLinks: boolean
}

export type HighlightSettingsProps = {
  value?: HighlightSettingsValue
  onChange?: (next: HighlightSettingsValue) => void
}

const DEFAULT_VALUE: HighlightSettingsValue = {
  highlightNlpTerms: true,
  highlightHeadings: true,
  highlightLinks: false,
}

export function HighlightSettings({ value = DEFAULT_VALUE, onChange }: HighlightSettingsProps) {
  const set = (patch: Partial<HighlightSettingsValue>) => {
    const next = { ...value, ...patch }
    onChange?.(next)
  }

  return (
    <Card className="p-3 bg-card/30 border border-border">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-foreground">Highlight Settings</div>
        <Badge variant="outline" className="text-[10px] text-muted-foreground">
          Stub
        </Badge>
      </div>

      <div className="mt-3 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-foreground">NLP Terms</div>
            <div className="text-[11px] text-muted-foreground">Highlight detected terms in editor</div>
          </div>
          <Switch
            checked={value.highlightNlpTerms}
            onCheckedChange={(checked) => set({ highlightNlpTerms: checked })}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-foreground">Headings</div>
            <div className="text-[11px] text-muted-foreground">Highlight H1/H2/H3 structure</div>
          </div>
          <Switch
            checked={value.highlightHeadings}
            onCheckedChange={(checked) => set({ highlightHeadings: checked })}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-foreground">Links</div>
            <div className="text-[11px] text-muted-foreground">Highlight internal/external links</div>
          </div>
          <Switch
            checked={value.highlightLinks}
            onCheckedChange={(checked) => set({ highlightLinks: checked })}
          />
        </div>
      </div>
    </Card>
  )
}
