"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkline, KDRing } from "@/components/charts"
import {
  Plus,
  Video,
  FileText,
  ImageIcon,
  Star,
  ShoppingCart,
  HelpCircle,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  Pencil,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface Keyword {
  id: number
  keyword: string
  intent: ("I" | "C" | "T" | "N")[] // Changed to array for multi-intent
  volume: number
  trend: number[]
  weakSpot: { type: "reddit" | "quora" | null; rank?: number }
  kd: number
  cpc: number
  serpFeatures: string[]
}

export interface KeywordTableProps {
  keywords?: Keyword[]
}

const keywords: Keyword[] = [
  {
    id: 1,
    keyword: "best ai tools 2024",
    intent: ["C", "I"], // Hybrid intent
    volume: 74500,
    trend: [20, 35, 28, 45, 52, 58, 65, 72, 80, 85, 90, 95],
    weakSpot: { type: "reddit", rank: 7 },
    kd: 42,
    cpc: 4.2,
    serpFeatures: ["video", "snippet"],
  },
  {
    id: 2,
    keyword: "ai writing tools free",
    intent: ["T"],
    volume: 33200,
    trend: [30, 35, 40, 45, 50, 55, 58, 62, 65, 70, 72, 75],
    weakSpot: { type: "quora", rank: 5 },
    kd: 35,
    cpc: 2.8,
    serpFeatures: ["snippet", "faq"],
  },
  {
    id: 3,
    keyword: "chatgpt alternatives",
    intent: ["C", "T"], // Hybrid intent
    volume: 28100,
    trend: [15, 25, 40, 55, 60, 58, 55, 52, 50, 48, 45, 42],
    weakSpot: { type: null },
    kd: 58,
    cpc: 3.5,
    serpFeatures: ["shopping"],
  },
  {
    id: 4,
    keyword: "what is generative ai",
    intent: ["I"],
    volume: 22400,
    trend: [25, 30, 35, 40, 45, 48, 52, 55, 58, 60, 62, 65],
    weakSpot: { type: "reddit", rank: 9 },
    kd: 28,
    cpc: 1.9,
    serpFeatures: ["snippet", "faq"],
  },
  {
    id: 5,
    keyword: "ai image generator",
    intent: ["T"],
    volume: 165000,
    trend: [40, 50, 60, 70, 75, 80, 82, 85, 88, 90, 92, 95],
    weakSpot: { type: null },
    kd: 62,
    cpc: 3.2,
    serpFeatures: ["video", "image"],
  },
  {
    id: 6,
    keyword: "best ai for coding",
    intent: ["C", "I"], // Hybrid intent
    volume: 18700,
    trend: [10, 15, 22, 30, 38, 45, 52, 58, 65, 70, 75, 80],
    weakSpot: { type: "quora", rank: 8 },
    kd: 45,
    cpc: 5.5,
    serpFeatures: ["reviews"],
  },
  {
    id: 7,
    keyword: "ai tools for business",
    intent: ["C"],
    volume: 14200,
    trend: [35, 38, 42, 45, 48, 50, 52, 55, 58, 60, 62, 65],
    weakSpot: { type: "reddit", rank: 6 },
    kd: 52,
    cpc: 6.8,
    serpFeatures: ["reviews", "shopping"],
  },
  {
    id: 8,
    keyword: "claude vs chatgpt",
    intent: ["C"],
    volume: 12100,
    trend: [5, 10, 18, 28, 40, 55, 65, 72, 78, 82, 85, 88],
    weakSpot: { type: null },
    kd: 38,
    cpc: 4.2,
    serpFeatures: ["video", "reviews"],
  },
  {
    id: 9,
    keyword: "ai productivity tools",
    intent: ["C", "T"], // Hybrid intent
    volume: 9800,
    trend: [20, 25, 30, 35, 40, 45, 50, 55, 58, 62, 65, 68],
    weakSpot: { type: "reddit", rank: 4 },
    kd: 32,
    cpc: 3.8,
    serpFeatures: ["snippet"],
  },
  {
    id: 10,
    keyword: "ai content generator",
    intent: ["T"],
    volume: 8400,
    trend: [30, 35, 38, 42, 45, 48, 50, 52, 55, 58, 60, 62],
    weakSpot: { type: null },
    kd: 55,
    cpc: 4.8,
    serpFeatures: ["reviews"],
  },
  {
    id: 11,
    keyword: "free ai tools online",
    intent: ["T", "I"], // Hybrid intent
    volume: 7200,
    trend: [40, 45, 48, 52, 55, 58, 60, 62, 65, 68, 70, 72],
    weakSpot: { type: "quora", rank: 3 },
    kd: 25,
    cpc: 1.5,
    serpFeatures: ["video", "snippet"],
  },
  {
    id: 12,
    keyword: "ai seo tools",
    intent: ["C"],
    volume: 6100,
    trend: [15, 20, 28, 35, 42, 48, 55, 60, 65, 70, 75, 80],
    weakSpot: { type: "reddit", rank: 10 },
    kd: 48,
    cpc: 7.2,
    serpFeatures: ["shopping", "reviews"],
  },
]

const intentConfig: Record<string, { color: string; label: string; tooltip: string }> = {
  I: { color: "bg-blue-500/15 text-blue-400 border-blue-500/30", label: "I", tooltip: "Informational" },
  C: { color: "bg-purple-500/15 text-purple-400 border-purple-500/30", label: "C", tooltip: "Commercial" },
  T: { color: "bg-green-500/15 text-green-400 border-green-500/30", label: "T", tooltip: "Transactional" },
  N: { color: "bg-amber-500/15 text-amber-400 border-amber-500/30", label: "N", tooltip: "Navigational" },
}

const serpIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  video: { icon: <Video className="h-3.5 w-3.5" />, label: "Video" },
  snippet: { icon: <FileText className="h-3.5 w-3.5" />, label: "Featured Snippet" },
  image: { icon: <ImageIcon className="h-3.5 w-3.5" />, label: "Image Pack" },
  reviews: { icon: <Star className="h-3.5 w-3.5" />, label: "Reviews" },
  shopping: { icon: <ShoppingCart className="h-3.5 w-3.5" />, label: "Shopping Results" },
  faq: { icon: <HelpCircle className="h-3.5 w-3.5" />, label: "FAQ" },
}

type SortField = "volume" | "kd" | "cpc" | "trend" | null
type SortDirection = "asc" | "desc"

// Default keywords data for when no keywords prop is provided
const defaultKeywords: Keyword[] = keywords

export function KeywordTable({ keywords: keywordsProp }: KeywordTableProps) {
  // Use provided keywords or fall back to default
  const data = keywordsProp ?? defaultKeywords
  
  const [page, setPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(data.map((k) => k.id)))
    }
    setSelectAll(!selectAll)
  }

  const handleSelectRow = (id: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
    setSelectAll(newSelected.size === data.length)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedKeywords = [...data].sort((a, b) => {
    if (!sortField) return 0

    let comparison = 0
    switch (sortField) {
      case "volume":
        comparison = a.volume - b.volume
        break
      case "kd":
        comparison = a.kd - b.kd
        break
      case "cpc":
        comparison = a.cpc - b.cpc
        break
      case "trend":
        // Sort by trend direction (last value vs first value)
        const aTrend = a.trend[a.trend.length - 1] - a.trend[0]
        const bTrend = b.trend[b.trend.length - 1] - b.trend[0]
        comparison = aTrend - bTrend
        break
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="border-b border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-30 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-[40px] sticky left-0 bg-muted/95 backdrop-blur z-40">
                  <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Select all" />
                </TableHead>
                <TableHead className="w-[260px] sticky left-[40px] bg-muted/95 backdrop-blur z-40">Keyword</TableHead>
                <TableHead className="w-[70px] text-center">Intent</TableHead>
                <TableHead className="w-[100px] text-right">
                  <button
                    onClick={() => handleSort("volume")}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Volume
                    <SortIcon field="volume" />
                  </button>
                </TableHead>
                <TableHead className="w-[80px] text-center">
                  <button
                    onClick={() => handleSort("trend")}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Trend
                    <SortIcon field="trend" />
                  </button>
                </TableHead>
                <TableHead className="w-[120px] text-center">Weak Spot</TableHead>
                <TableHead className="w-[60px] text-center">
                  <button
                    onClick={() => handleSort("kd")}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    KD %
                    <SortIcon field="kd" />
                  </button>
                </TableHead>
                <TableHead className="w-[70px] text-right">
                  <button
                    onClick={() => handleSort("cpc")}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    CPC
                    <SortIcon field="cpc" />
                  </button>
                </TableHead>
                <TableHead className="w-[100px]">SERP</TableHead>
                <TableHead className="w-[100px] text-right">
                  <div className="flex items-center justify-end gap-2">
                    Actions
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            // Export logic will go here
                            console.log("Exporting to CSV...")
                          }}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Export to CSV</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedKeywords.map((item, index) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "border-border hover:bg-muted/50 transition-colors",
                    index % 2 === 1 && "bg-muted/20",
                    selectedRows.has(item.id) && "bg-primary/5 hover:bg-primary/10",
                  )}
                >
                  <TableCell
                    className={cn(
                      "sticky left-0 z-10",
                      index % 2 === 1 ? "bg-muted/20" : "bg-card",
                      selectedRows.has(item.id) && "bg-primary/5",
                    )}
                  >
                    <Checkbox
                      checked={selectedRows.has(item.id)}
                      onCheckedChange={() => handleSelectRow(item.id)}
                      aria-label={`Select ${item.keyword}`}
                    />
                  </TableCell>

                  <TableCell
                    className={cn(
                      "font-medium text-foreground sticky left-[40px] z-10",
                      index % 2 === 1 ? "bg-muted/20" : "bg-card",
                      selectedRows.has(item.id) && "bg-primary/5",
                    )}
                  >
                    <div className="flex items-center gap-2 group">
                      <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all shrink-0">
                        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <Link
                        href={`/dashboard/research/overview/${encodeURIComponent(item.keyword)}`}
                        className="text-sm font-semibold truncate hover:text-primary transition-colors"
                      >
                        {item.keyword}
                      </Link>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {item.intent.map((int, idx) => (
                        <Tooltip key={int + idx}>
                          <TooltipTrigger asChild>
                            <span
                              className={cn(
                                "inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-semibold border cursor-default",
                                intentConfig[int].color,
                              )}
                            >
                              {intentConfig[int].label}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {intentConfig[int].tooltip}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="text-right font-mono text-sm tabular-nums">
                    {item.volume.toLocaleString()}
                  </TableCell>

                  <TableCell className="text-center">
                    <Sparkline data={item.trend} />
                  </TableCell>

                  <TableCell className="text-center">
                    {item.weakSpot.type ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium cursor-default",
                              "bg-green-500/15 text-green-400 border border-green-500/30",
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Forum Found
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {item.weakSpot.type === "reddit" ? "Reddit" : "Quora"} ranks #{item.weakSpot.rank} - Easy to
                          outrank!
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground/50 text-xs">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <KDRing value={item.kd} />
                    </div>
                  </TableCell>

                  <TableCell className="text-right font-mono text-sm tabular-nums">${item.cpc.toFixed(2)}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {item.serpFeatures.map((feature) => (
                        <Tooltip key={feature}>
                          <TooltipTrigger asChild>
                            <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">
                              {serpIcons[feature]?.icon}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {serpIcons[feature]?.label}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2.5 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary">
                        <Link href={`/dashboard/research/overview/${encodeURIComponent(item.keyword)}`}>
                          <Eye className="h-3 w-3" />
                          Analyze
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2.5 text-xs gap-1.5 hover:bg-emerald-500/10 hover:text-emerald-400">
                        <Link href={`/dashboard/creation/ai-writer?topic=${encodeURIComponent(item.keyword)}`}>
                          <Pencil className="h-3 w-3" />
                          Write
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-3 border-t border-border bg-muted/20">
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-mono">Showing {data.length} keywords</span>
            {selectedRows.size > 0 && (
              <span className="text-xs text-primary font-medium">{selectedRows.size} selected</span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} className="gap-2 h-8 text-xs">
            Load More
            <span className="text-muted-foreground">(Page {page})</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
