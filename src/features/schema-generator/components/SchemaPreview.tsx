"use client"

import { Code2, FileJson } from "lucide-react"
import { ValidationResult } from "../types"

interface SchemaPreviewProps {
  schema: string
  validation: ValidationResult | null
}

export function SchemaPreview({ schema, validation }: SchemaPreviewProps) {
  if (!schema) {
    return (
      <div className="h-100 rounded-lg bg-muted/30 border border-dashed border-border flex flex-col items-center justify-center text-center p-6">
        <div className="p-3 rounded-lg bg-muted/50 mb-3">
          <FileJson className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-muted-foreground">No schema generated yet</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Fill in the form and click "Generate Schema" to see the JSON-LD code
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <pre className="h-100 overflow-auto rounded-lg bg-card border border-border p-4 text-sm font-mono">
        <code className="text-emerald-400 whitespace-pre-wrap overflow-wrap-break-word">
          {schema}
        </code>
      </pre>

      {/* Script tag example */}
      <div className="mt-3 p-2 rounded bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground mb-1">Wrap in script tag:</p>
        <code className="text-xs text-amber-400">
          {`<script type="application/ld+json">`}
        </code>
      </div>
    </div>
  )
}
