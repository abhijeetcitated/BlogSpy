"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { PageStructureColumn } from "./page-structure-column"
import { IssuesPanel } from "./issues-panel"
import { NLPKeywordsPanel } from "./nlp-keywords-panel"
import { cn } from "@/lib/utils"
import type { PageStructureItem, IssuesData, NLPKeyword, CurrentIssue } from "../types"

interface MobileTabsLayoutProps {
  structure: PageStructureItem[]
  issues: IssuesData
  keywords: NLPKeyword[]
  onFixWithAI: (issue: CurrentIssue) => void
}

type TabType = "structure" | "issues" | "keywords"

export function MobileTabsLayout({ structure, issues, keywords, onFixWithAI }: MobileTabsLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>("issues")

  const tabs = [
    { id: "structure" as const, label: "Structure", count: structure.length },
    { id: "issues" as const, label: "Issues", count: issues.errors.length + issues.warnings.length },
    { id: "keywords" as const, label: "Keywords", count: keywords.length },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile Tabs */}
      <div className="flex gap-2 p-4 border-b border-border bg-card/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 p-3 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                : "bg-muted/30 border border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "structure" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <PageStructureColumn structure={structure} />
          </div>
        )}
        {activeTab === "issues" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <IssuesPanel issues={issues} onFixWithAI={onFixWithAI} />
          </div>
        )}
        {activeTab === "keywords" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <NLPKeywordsPanel keywords={keywords} />
          </div>
        )}
      </div>
    </div>
  )
}
