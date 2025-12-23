// ============================================
// AI WRITER - Outline Tab Content
// ============================================

"use client"

import type { EditorStats } from "../types"

interface OutlineTabProps {
  editorStats: EditorStats
  title: string
}

export function OutlineTab({ editorStats, title }: OutlineTabProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 m-0">
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground mb-3">Document Outline</h3>
        <div className="space-y-2 text-sm">
          {/* Dynamically generated from editor content */}
          {editorStats.headingCount.h1 > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <span className="text-emerald-400 font-mono text-xs">H1</span>
              <span className="text-foreground truncate">{title}</span>
            </div>
          )}
          {editorStats.headingCount.h2 > 0 && (
            <>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 ml-4">
                <span className="text-cyan-400 font-mono text-xs">H2</span>
                <span className="text-muted-foreground">What Are AI Agents?</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 ml-4">
                <span className="text-cyan-400 font-mono text-xs">H2</span>
                <span className="text-muted-foreground">Key Use Cases</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 ml-4 opacity-50 cursor-pointer">
            <span className="text-yellow-400 font-mono text-xs">+</span>
            <span className="text-muted-foreground italic">Add section...</span>
          </div>
        </div>

        {/* Outline Stats */}
        <div className="mt-6 p-3 rounded-lg bg-muted/30 border border-border">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-emerald-400">
                {editorStats.headingCount.h1}
              </p>
              <p className="text-xs text-muted-foreground">H1</p>
            </div>
            <div>
              <p className="text-lg font-bold text-cyan-400">
                {editorStats.headingCount.h2}
              </p>
              <p className="text-xs text-muted-foreground">H2</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-400">
                {editorStats.headingCount.h3}
              </p>
              <p className="text-xs text-muted-foreground">H3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
