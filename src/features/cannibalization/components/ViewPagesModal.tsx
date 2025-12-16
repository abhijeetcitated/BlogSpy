"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Calendar,
  Eye,
  MousePointer,
  Trophy,
  Target,
  ArrowUpDown,
  Link as LinkIcon,
  FileText,
  BarChart2,
} from "lucide-react"
import type { CannibalizationIssue, CannibalizingPage } from "../types"

// ============================================
// INTERFACES
// ============================================

interface ViewPagesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issue: CannibalizationIssue | null
}

interface MetricRowProps {
  label: string
  icon: React.ReactNode
  pages: CannibalizingPage[]
  getValueFn: (page: CannibalizingPage) => string | number
  highlightBest?: boolean
  getBestFn?: (pages: CannibalizingPage[]) => number // returns index of best
}

// ============================================
// METRIC ROW COMPONENT
// ============================================

function MetricRow({ label, icon, pages, getValueFn, highlightBest = true, getBestFn }: MetricRowProps) {
  const bestIndex = getBestFn ? getBestFn(pages) : -1

  return (
    <div className="grid grid-cols-[140px_1fr_1fr] gap-4 py-3 border-b border-slate-800 items-center">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {pages.map((page, index) => (
        <div
          key={page.url}
          className={cn(
            "text-sm font-medium",
            highlightBest && index === bestIndex
              ? "text-emerald-400"
              : "text-white"
          )}
        >
          {getValueFn(page)}
          {highlightBest && index === bestIndex && (
            <Trophy className="h-3 w-3 inline-block ml-1 text-yellow-500" />
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================
// COMPONENT
// ============================================

export function ViewPagesModal({ open, onOpenChange, issue }: ViewPagesModalProps) {
  const [activeTab, setActiveTab] = useState("comparison")

  if (!issue) return null

  const pages = issue.pages.slice(0, 2) // Compare first two pages

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <BarChart2 className="h-5 w-5 text-cyan-400" />
            Compare Pages: {issue.keyword}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Side-by-side comparison of competing pages
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="comparison" className="data-[state=active]:bg-cyan-600">
              Metrics
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-cyan-600">
              Content Preview
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-cyan-600">
              Rankings Timeline
            </TabsTrigger>
          </TabsList>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[500px] pr-4">
              {/* Page Headers */}
              <div className="grid grid-cols-[140px_1fr_1fr] gap-4 pb-4 border-b border-slate-700 mb-2">
                <div className="text-xs text-slate-500 uppercase tracking-wider">
                  Metric
                </div>
                {pages.map((page, index) => (
                  <div key={page.url}>
                    <div className="flex items-center gap-2 mb-2">
                      {index === 0 ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400">Primary</Badge>
                      ) : (
                        <Badge className="bg-orange-500/20 text-orange-400">Competing</Badge>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-white truncate mb-1">
                      {page.title}
                    </h4>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 truncate"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {page.url.replace(/https?:\/\//, '').slice(0, 40)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>

              {/* Metrics */}
              <div className="space-y-0">
                <MetricRow
                  label="Position"
                  icon={<Target className="h-4 w-4" />}
                  pages={pages}
                  getValueFn={(p) => `#${p.currentRank || 'N/A'}`}
                  getBestFn={(ps) => ps.findIndex(p => (p.currentRank || 100) === Math.min(...ps.map(x => x.currentRank || 100)))}
                />
                <MetricRow
                  label="Traffic"
                  icon={<TrendingUp className="h-4 w-4" />}
                  pages={pages}
                  getValueFn={(p) => `${p.traffic.toLocaleString()}/mo`}
                  getBestFn={(ps) => ps.findIndex(p => p.traffic === Math.max(...ps.map(x => x.traffic)))}
                />
                <MetricRow
                  label="Impressions"
                  icon={<Eye className="h-4 w-4" />}
                  pages={pages}
                  getValueFn={(p) => (p.traffic * 10).toLocaleString()}
                  getBestFn={(ps) => ps.findIndex(p => (p.traffic * 10) === Math.max(...ps.map(x => x.traffic * 10)))}
                />
                <MetricRow
                  label="Clicks"
                  icon={<MousePointer className="h-4 w-4" />}
                  pages={pages}
                  getValueFn={(p) => p.traffic.toLocaleString()}
                  getBestFn={(ps) => ps.findIndex(p => p.traffic === Math.max(...ps.map(x => x.traffic)))}
                />
                <MetricRow
                  label="CTR"
                  icon={<BarChart2 className="h-4 w-4" />}
                  pages={pages}
                  getValueFn={(p) => `${((p.traffic / (p.traffic * 10 || 1)) * 100).toFixed(1)}%`}
                  getBestFn={(ps) => ps.findIndex(p => (p.traffic / (p.traffic * 10 || 1)) === Math.max(...ps.map(x => x.traffic / (x.traffic * 10 || 1))))}
                />
                <MetricRow
                  label="Word Count"
                  icon={<FileText className="h-4 w-4" />}
                  pages={pages}
                  getValueFn={(p) => p.wordCount?.toLocaleString() || 'N/A'}
                  getBestFn={(ps) => ps.findIndex(p => (p.wordCount || 0) === Math.max(...ps.map(x => x.wordCount || 0)))}
                />
                <MetricRow
                  label="Last Updated"
                  icon={<Calendar className="h-4 w-4" />}
                  pages={pages}
                  getValueFn={(p) => p.lastUpdated ? new Date(p.lastUpdated).toLocaleDateString() : 'N/A'}
                  getBestFn={(ps) => ps.findIndex(p => {
                    if (!p.lastUpdated) return false
                    const dates = ps.map(x => x.lastUpdated ? new Date(x.lastUpdated).getTime() : 0)
                    return new Date(p.lastUpdated).getTime() === Math.max(...dates)
                  })}
                />
              </div>

              {/* Winner Summary */}
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <h4 className="text-sm font-semibold text-white">Recommendation</h4>
                </div>
                <p className="text-sm text-slate-300">
                  <strong className="text-emerald-400">{pages[0].title}</strong> should be the primary page. 
                  It has a better position (#{pages[0].currentRank || 'N/A'}) and receives more organic traffic.
                </p>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Content Preview Tab */}
          <TabsContent value="content" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[500px]">
              <div className="grid grid-cols-2 gap-4">
                {pages.map((page, index) => (
                  <div key={page.url} className="space-y-4">
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        {index === 0 ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400">Primary</Badge>
                        ) : (
                          <Badge className="bg-orange-500/20 text-orange-400">Competing</Badge>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-white mb-1">{page.title}</h4>
                      <p className="text-xs text-slate-400">
                        {page.wordCount?.toLocaleString() || '~1,500'} words • Last updated: {
                          page.lastUpdated 
                            ? new Date(page.lastUpdated).toLocaleDateString() 
                            : 'Unknown'
                        }
                      </p>
                    </div>

                    {/* Content Snippet */}
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <h5 className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                        Title Tag
                      </h5>
                      <p className="text-sm text-cyan-400 mb-4">{page.title}</p>

                      <h5 className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                        Meta Description
                      </h5>
                      <p className="text-sm text-slate-300 mb-4">
                        Learn everything about {issue.keyword} in this comprehensive guide. Discover best practices and strategies.
                      </p>

                      <h5 className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                        Content Preview
                      </h5>
                      <p className="text-sm text-slate-400 line-clamp-6">
                        {`This comprehensive guide covers everything you need to know about ${issue.keyword}. Learn the best practices, tips, and strategies to optimize your approach and achieve better results...`}
                      </p>
                    </div>

                    {/* H1/H2 Structure */}
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <h5 className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                        Header Structure
                      </h5>
                      <div className="space-y-1">
                        <p className="text-sm text-white">
                          H1: {page.title}
                        </p>
                        <p className="text-sm text-slate-400 pl-4">
                          H2: What is {issue.keyword}?
                        </p>
                        <p className="text-sm text-slate-400 pl-4">
                          H2: Benefits of {issue.keyword}
                        </p>
                        <p className="text-sm text-slate-400 pl-4">
                          H2: How to Get Started
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="flex-1 overflow-hidden mt-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 h-[500px] flex flex-col">
              <h4 className="text-sm font-medium text-white mb-4">
                Position History (Last 30 Days)
              </h4>
              
              {/* Mini Chart Visualization */}
              <div className="flex-1 relative">
                <div className="absolute inset-0 flex items-end gap-0.5 p-4">
                  {/* Simulated bar chart for rankings */}
                  {Array.from({ length: 30 }).map((_, i) => {
                    const height1 = 20 + Math.random() * 60
                    const height2 = 15 + Math.random() * 65
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex-1 w-full flex gap-0.5 items-end">
                          <div 
                            className="flex-1 bg-emerald-500/60 rounded-t"
                            style={{ height: `${height1}%` }}
                          />
                          <div 
                            className="flex-1 bg-orange-500/60 rounded-t"
                            style={{ height: `${height2}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between text-xs text-slate-500">
                  <span>#1</span>
                  <span>#5</span>
                  <span>#10</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500/60" />
                  <span className="text-sm text-slate-300">{pages[0].title.slice(0, 20)}...</span>
                </div>
                {pages[1] && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-500/60" />
                    <span className="text-sm text-slate-300">{pages[1].title.slice(0, 20)}...</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-4">
                Both pages frequently swap positions, indicating cannibalization. The primary page should consistently outrank the secondary.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 text-slate-300"
          >
            Close
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Export Comparison
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
